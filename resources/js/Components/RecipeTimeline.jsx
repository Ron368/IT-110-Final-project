import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { mealdbRandomBatch } from '@/api/mealdb';

function clampText(text, max = 170) {
    const t = (text ?? '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + '…';
}

const cardVariants = {
    hiddenLeft: { opacity: 0, x: -40, y: 10 },
    hiddenRight: { opacity: 0, x: 40, y: 10 },
    show: { opacity: 1, x: 0, y: 0 },
};

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-gray-300 bg-[#F7EBDD] p-5 shadow-sm">
            {/* Bigger image skeleton */}
            <div className="h-44 w-full animate-pulse rounded-xl bg-gray-200 sm:h-52" />

            <div className="mt-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-300" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    );
}

function TimelineCard({ loading, error, meal }) {
    if (loading) return <SkeletonCard />;

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="rounded-xl border border-gray-300 bg-[#F7EBDD] p-5 text-sm text-gray-600 shadow-sm">
                No data available.
            </div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden rounded-xl border border-gray-300 bg-[#F7EBDD] shadow-sm"
        >
            {/* Bigger image */}
            <div className="relative h-44 w-full bg-white sm:h-56">
                <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="h-full w-full object-cover"
                    loading="eager"
                />

                {/* subtle bottom gradient for readability */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

                {/* Title overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="truncate text-lg font-bold text-white">
                        {meal.strMeal}
                    </h3>
                    <p className="mt-1 text-xs text-white/90">
                        {(meal.strArea || 'Unknown area')} {' • '} {(meal.strCategory || 'Unknown category')}
                    </p>
                </div>
            </div>

            {/* No description text (removed strInstructions) */}
            <div className="p-4">
                <p className="text-xs text-gray-600">
                    Meal ID: <span className="font-medium text-gray-800">{meal.idMeal}</span>
                </p>
            </div>
        </motion.div>
    );
}

function preloadImage(url) {
    if (!url) return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // don't block forever on errors
        img.src = url;
    });
}

export default function RecipeTimeline({ initialMeals = null }) {
    const [items, setItems] = useState(Array.isArray(initialMeals) ? initialMeals : []);
    const [loading, setLoading] = useState(!Array.isArray(initialMeals));
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;

        // If we already have meals, don't refetch
        if (Array.isArray(initialMeals)) {
            setItems(initialMeals);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError('');

                const data = await mealdbRandomBatch(4);
                const meals = Array.isArray(data?.meals) ? data.meals.slice(0, 4) : [];

                // optional: preload images even here (fallback path)
                await Promise.all(meals.map((m) => preloadImage(m?.strMealThumb)));

                if (!alive) return;
                setItems(meals);
            } catch (e) {
                if (!alive) return;
                setError(e?.message || 'Failed to load random meals.');
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [initialMeals]);

    const nodes = useMemo(() => new Array(4).fill(null), []);

    return (
        <section className="w-full bg-[#FFF8F0] py-14">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Taste Different Flavors from Around the Globe
                    </h2>
                    <p className="mt-2 max-w-2xl text-gray-600">
                        Explore a curated selection of diverse recipes handpicked by our Capybara chef, each representing a unique culinary tradition from various cultures worldwide.
                    </p>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2">
                        <motion.div
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                            className="h-full w-px origin-top bg-gray-300"
                        />
                    </div>

                    <div className="space-y-12 sm:space-y-16">
                        {nodes.map((_, idx) => {
                            const right = idx % 2 === 0;
                            const meal = items[idx];

                            return (
                                <div key={idx} className="relative grid grid-cols-1 sm:grid-cols-2 sm:gap-10">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <motion.span
                                            initial={{ scale: 0.9, opacity: 0.7 }}
                                            animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                                            className="block h-3 w-3 rounded-full bg-gray-900"
                                        />
                                    </div>

                                    <div className="flex sm:justify-end sm:pr-6">
                                        {!right && (
                                            <motion.div
                                                variants={cardVariants}
                                                initial="hiddenLeft"
                                                whileInView="show"
                                                viewport={{ once: true, amount: 0.35 }}
                                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                                className="w-full sm:max-w-md"
                                            >
                                                <TimelineCard loading={loading} error={error} meal={meal} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex sm:justify-start sm:pl-6">
                                        {right && (
                                            <motion.div
                                                variants={cardVariants}
                                                initial="hiddenRight"
                                                whileInView="show"
                                                viewport={{ once: true, amount: 0.35 }}
                                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                                className="w-full sm:max-w-md"
                                            >
                                                <TimelineCard loading={loading} error={error} meal={meal} />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}