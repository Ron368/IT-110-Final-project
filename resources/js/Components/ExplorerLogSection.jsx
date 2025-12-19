import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

function splitLines(text) {
    return (text ?? '')
        .split(/\r\n|\r|\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
}

function normalizeMealDbDetail(payload) {
    const m = payload?.meals?.[0];
    if (!m) return null;

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = String(m[`strIngredient${i}`] ?? '').trim();
        const mea = String(m[`strMeasure${i}`] ?? '').trim();
        if (!ing) continue;
        ingredients.push(`${mea ? `${mea} ` : ''}${ing}`.trim());
    }

    return {
        source: 'mealdb',
        recipe: {
            id: String(m.idMeal),
            title: m.strMeal,
            description: `${m.strArea || ''}${m.strArea && m.strCategory ? ' • ' : ''}${m.strCategory || ''}`.trim(),
            ingredients: ingredients.join('\n'),
            instructions: m.strInstructions || '',
            image: m.strMealThumb || null,
        },
        // local-only fields (favorites/reviews) stay empty until imported
        isFavorited: false,
        averageRating: null,
        userReview: null,
        reviews: [],
    };
}

export default function ExplorerLogSection() {
    const user = usePage().props.auth.user;

    const [q, setQ] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const searchCache = useRef(new Map());
    const searchAbort = useRef(null);

    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [uiError, setUiError] = useState('');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        recipe_id: '',
        rating: 5,
        body: '',
    });

    const ingredients = useMemo(() => splitLines(detail?.recipe?.ingredients), [detail?.recipe?.ingredients]);
    const instructions = useMemo(() => splitLines(detail?.recipe?.instructions), [detail?.recipe?.instructions]);

    useEffect(() => {
        if (uiError) {
            window?.alert?.(uiError);
        }
    }, [uiError]);

    useEffect(() => {
        return () => {
            searchAbort.current?.abort();
        };
    }, []);

    async function runSearch(e) {
        e?.preventDefault?.();
        setUiError('');

        const query = q.trim();
        if (query.length < 2) {
            setResults([]);
            setSelectedId(null);
            setDetail(null);
            return;
        }

        const cacheKey = query.toLowerCase();
        const cached = searchCache.current.get(cacheKey);
        if (cached) {
            setResults(cached.results);
        }

        if (searchAbort.current) {
            searchAbort.current.abort();
        }

        const controller = new AbortController();
        searchAbort.current = controller;

        setSearching(true);
        try {
            const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            });
            if (!res.ok) throw new Error(`Search failed (${res.status})`);
            const json = await res.json();

            const clean = (Array.isArray(json?.data) ? json.data : [])
                .filter((x) => x && typeof x === 'object')
                .filter((x) => (x.source === 'mealdb' || x.source === 'local') && x.id);

            setResults(clean);
            searchCache.current.set(cacheKey, {
                results: clean,
                cachedAt: Date.now(),
            });
        } catch (err) {
            if (err?.name === 'AbortError') {
                return;
            }
            setUiError(err?.message || 'Failed to search recipes.');
        } finally {
            if (searchAbort.current === controller) {
                searchAbort.current = null;
            }
            setSearching(false);
        }
    }

    async function loadRecipe(item) {
        setUiError('');

        // Guard: prevents /api/recipes/undefined
        if (!item || !item.id) {
            setUiError('Invalid recipe selection.');
            return;
        }

        const source = item.source === 'mealdb' ? 'mealdb' : 'local';
        const id = String(item.id);

        setSelectedId(`${source}:${id}`);
        setDetail(null);
        setDetailLoading(true);

        try {
            if (source === 'mealdb') {
                const res = await fetch(`/api/mealdb/meal/${encodeURIComponent(id)}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) throw new Error(`Recipe load failed (${res.status})`);
                const json = await res.json();
                const normalized = normalizeMealDbDetail(json);
                setDetail(normalized);
                return;
            }

            const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error(`Recipe load failed (${res.status})`);
            const json = await res.json();
            json.source = 'local';
            setDetail(json);

            clearErrors();
            setData({
                recipe_id: String(json?.recipe?.id ?? ''),
                rating: json?.userReview?.rating ?? 5,
                body: json?.userReview?.body ?? '',
            });
        } catch (err) {
            setUiError(err?.message || 'Failed to load recipe.');
        } finally {
            setDetailLoading(false);
        }
    }

    function refreshSelected() {
        if (!selectedId) return;
        const [source, ...rest] = selectedId.split(':');
        const id = rest.join(':');
        if (!source || !id) return;
        loadRecipe({ source, id });
    }

    function toggleFavorite() {
        if (!detail?.recipe?.id) return;

        // Prevent 404: MealDB ids are not local recipe ids
        if (detail?.source !== 'local') {
            setUiError('Add this MealDB recipe to your journal first to enable favorites.');
            return;
        }

        const id = detail.recipe.id;

        if (!user) {
            setUiError('Please sign in to save favorites.');
            return;
        }

        if (detail.isFavorited) {
            router.delete(`/recipes/${id}/favorite`, {
                preserveScroll: true,
                onSuccess: refreshSelected,
            });
        } else {
            router.post(`/recipes/${id}/favorite`, {}, {
                preserveScroll: true,
                onSuccess: refreshSelected,
            });
        }
    }

    function submitReview(e) {
        e.preventDefault();
        setUiError('');

        if (!detail?.recipe?.id) return;

        // Prevent 404: reviews must reference local recipes
        if (detail?.source !== 'local') {
            setUiError('Add this MealDB recipe to your journal first to enable reviews.');
            return;
        }

        if (!user) {
            setUiError('Please sign in to leave a review.');
            return;
        }

        const hasExisting = !!detail?.userReview?.id;

        if (hasExisting) {
            put(`/reviews/${detail.userReview.id}`, {
                preserveScroll: true,
                onSuccess: () => refreshSelected(),
            });
        } else {
            post(`/recipes/${detail.recipe.id}/review`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset('body');
                    refreshSelected();
                },
            });
        }
    }

    function deleteMyReview() {
        if (detail?.source !== 'local') return;
        if (!detail?.userReview?.id) return;

        destroy(`/reviews/${detail.userReview.id}`, {
            preserveScroll: true,
            onSuccess: () => refreshSelected(),
        });
    }

    async function importMealDbToLocal(e) {
        e?.preventDefault?.();

        if (detail?.source !== 'mealdb') return;

        setUiError('');

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const res = await fetch(`/api/recipes/import/mealdb/${encodeURIComponent(detail.recipe.id)}`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
                },
            });

            if (!res.ok) {
                let msg = `Import failed (${res.status})`;
                try {
                    const j = await res.json();
                    if (j?.message) msg = j.message;
                } catch {
                    // ignore json parse
                }
                throw new Error(msg);
            }

            const json = await res.json();
            await loadRecipe({ source: 'local', id: String(json.recipe_id) });
        } catch (err) {
            setUiError(err?.message || 'Failed to import recipe.');
        }
    }

    useEffect(() => {
        // Auto-open first search hit (safe)
        if (!selectedId && results.length > 0) {
            loadRecipe(results[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results, selectedId]);

    return (
        <section id="explorer-log" className="w-full bg-[#FFF8F0] pb-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* “Desk” + journal wrapper */}
                <div className="relative mt-10 overflow-hidden rounded-3xl border border-orange-200 bg-stone-100 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.6)]">
                    {/* subtle “desk” vignette */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06),transparent_55%)]" />
                    {/* faux page crease */}
                    <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-orange-200/70 sm:block" />

                    <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-2">
                        {/* LEFT PAGE: Search + results */}
                        <div className="p-6 sm:p-8">
                            <div className="flex items-baseline justify-between gap-4">
                                <div>
                                    <h3
                                        className="text-7xl font-extrabold text-gray-900"
                                        style={{ fontFamily: "'Dancing Script', cursive" }}
                                    >
                                        Explorer Log
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Search your saved recipes and open an entry.
                                    </p>
                                </div>

                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700/80">
                                    Capy &amp; Co.
                                </div>
                            </div>

                            <form onSubmit={runSearch} className="mt-5">
                                <div className="flex overflow-hidden rounded-full border border-orange-200 bg-white shadow-sm">
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search title, ingredients, instructions…"
                                        className="w-full bg-transparent px-5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                                        minLength={2}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition"
                                        disabled={searching}
                                    >
                                        {searching ? 'Searching…' : 'Search'}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Tip: try “chicken”, “rice”, “tomato”…
                                </p>
                            </form>

                            {/* Results list */}
                            <div className="mt-6 space-y-3">
                                {results.map((r) => {
                                    const key = `${r.source}:${r.id}`;
                                    const active = key === selectedId;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => loadRecipe(r)}
                                            className={
                                                `w-full text-left rounded-2xl border px-4 py-3 transition ` +
                                                (active
                                                    ? 'border-orange-400 bg-orange-50 shadow-sm'
                                                    : 'border-orange-200/70 bg-white/70 hover:bg-white')
                                            }
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {r.title}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-600">
                                                        {r.source === 'mealdb' ? 'MealDB' : 'Journal'} {r.reviews_count ? `· ${r.reviews_count} review(s)` : ''}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold text-orange-700/80">
                                                    Open
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT PAGE: Recipe detail + CRUD */}
                        <div className="p-6 sm:p-8">
                            {!detail && !detailLoading && (
                                <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-6 text-sm text-gray-600">
                                    Choose a recipe entry to view details.
                                </div>
                            )}

                            {detailLoading && (
                                <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-6 text-sm text-gray-600">
                                    Opening the journal…
                                </div>
                            )}

                            {detail?.recipe && (
                                <>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h4 className="text-xl font-extrabold text-gray-900">
                                                {detail.recipe.title}
                                            </h4>
                                            <div className="mt-1 text-sm text-gray-600">
                                                {detail.averageRating !== null ? `★ ${detail.averageRating.toFixed(1)}/5` : 'No ratings yet'} · {detail.reviews?.length ?? 0} review{(detail.reviews?.length ?? 0) === 1 ? '' : 's'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {!user ? (
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition"
                                                >
                                                    Sign in
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={toggleFavorite}
                                                    className={
                                                        `rounded-full px-4 py-2 text-sm font-semibold transition border ` +
                                                        (detail.isFavorited
                                                            ? 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                            : 'border-orange-200 bg-orange-500 text-white hover:bg-orange-600')
                                                    }
                                                >
                                                    {detail.isFavorited ? 'Remove favorite' : 'Save to favorites'}
                                                </button>
                                            )}

                                            <Link
                                                href="/dashboard"
                                                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                                            >
                                                Go to my cookbook
                                            </Link>
                                        </div>
                                    </div>

                                    {detail.recipe.image && (
                                        <div className="mt-5 overflow-hidden rounded-2xl border border-orange-200/70 bg-white">
                                            <img
                                                src={detail.recipe.image}
                                                alt={detail.recipe.title}
                                                className="h-56 w-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    {detail.recipe.description && (
                                        <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                                            {detail.recipe.description}
                                        </p>
                                    )}

                                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-5">
                                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700/80">
                                                Ingredients
                                            </div>
                                            <ul className="mt-3 space-y-2 text-sm text-gray-800">
                                                {ingredients.map((x, idx) => (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="text-orange-500">•</span>
                                                        <span>{x}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-5">
                                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700/80">
                                                Instructions
                                            </div>
                                            <ol className="mt-3 space-y-3 text-sm text-gray-800">
                                                {instructions.map((x, idx) => (
                                                    <li key={idx} className="flex gap-3">
                                                        <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="leading-relaxed">{x}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>

                                    {/* Reviews CRUD (uses existing ReviewController routes) */}
                                    <div className="mt-8 rounded-2xl border border-orange-200/70 bg-white/70 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700/80">
                                                    Field Notes (Reviews)
                                                </div>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Add your own observation to the log.
                                                </div>
                                            </div>

                                            {detail.userReview?.id && user && (
                                                <button
                                                    type="button"
                                                    onClick={deleteMyReview}
                                                    className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                                                    disabled={processing}
                                                >
                                                    Delete my review
                                                </button>
                                            )}
                                        </div>

                                        {!user ? (
                                            <div className="mt-4 rounded-xl border border-orange-200 bg-white p-4 text-sm text-gray-700">
                                                <Link className="font-semibold text-orange-700 hover:underline" href={route('login')}>
                                                    Sign in
                                                </Link>{' '}
                                                to leave a review.
                                            </div>
                                        ) : (
                                            <form onSubmit={submitReview} className="mt-4 space-y-3">
                                                <input type="hidden" value={data.recipe_id} />

                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                                                            Rating
                                                        </label>
                                                        <select
                                                            value={data.rating}
                                                            onChange={(e) => setData('rating', Number(e.target.value))}
                                                            className="mt-2 w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                        >
                                                            {[5, 4, 3, 2, 1].map((n) => (
                                                                <option key={n} value={n}>
                                                                    {n} ★
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.rating && (
                                                            <div className="mt-1 text-xs text-red-700">{errors.rating}</div>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                                                            Your note
                                                        </label>
                                                        <textarea
                                                            value={data.body}
                                                            onChange={(e) => setData('body', e.target.value)}
                                                            rows={3}
                                                            className="mt-2 w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                            placeholder="Tell others how it turned out…"
                                                            minLength={10}
                                                            maxLength={1000}
                                                            required
                                                        />
                                                        {errors.body && (
                                                            <div className="mt-1 text-xs text-red-700">{errors.body}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
                                                        disabled={processing}
                                                    >
                                                        {detail.userReview?.id ? 'Update review' : 'Submit review'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="mt-6 space-y-3">
                                            {(detail.reviews ?? []).length === 0 ? (
                                                <div className="text-sm text-gray-600">
                                                    No reviews yet. Be the first to write a note.
                                                </div>
                                            ) : (
                                                detail.reviews.map((r) => (
                                                    <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {r.user?.name ?? 'Unknown'}
                                                            </div>
                                                            <div className="text-xs font-semibold text-orange-700">
                                                                {r.rating} ★
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                                            {r.body}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Detail header actions */}
                                    <div className="mt-4">
                                        {detail.source === 'mealdb' ? (
                                            <button
                                                type="button"
                                                onClick={importMealDbToLocal}
                                                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                                            >
                                                Add to journal (enable favorites & reviews)
                                            </button>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}