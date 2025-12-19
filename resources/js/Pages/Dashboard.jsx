import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LoadingScreen from '@/Components/loadingScreen';
import Capy from '@/Components/Capy';
import MarqueeBanner from '@/Components/MarqueeBanner';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';

function parseAreaCategory(description) {
    // Your import sets: "Area • Category"
    const raw = String(description || '');
    const parts = raw.split('•').map((s) => s.trim()).filter(Boolean);
    return {
        area: parts[0] || '',
        category: parts[1] || '',
    };
}

function CapyMotionController({ animation, setAnimation, groupRef, elapsedRef, startX, targetX, duration, onRunComplete }) {
    useFrame((_, delta) => {
        if (!groupRef.current || animation !== 'run') return;

        elapsedRef.current += delta;
        const progress = Math.min(elapsedRef.current / duration, 1);
        const nextX = startX + (targetX - startX) * progress;
        groupRef.current.position.x = nextX;

        if (progress >= 1) {
            setAnimation('wave');
            if (typeof onRunComplete === 'function') {
                onRunComplete();
            }
        }
    });

    return null;
}

function CapyRotationController({ groupRef, rotationTargetRef, speed }) {
    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const current = groupRef.current.rotation.y;
        const target = rotationTargetRef.current;
        if (Math.abs(current - target) < 0.001) return;
        const step = Math.min(delta * speed, 1);
        groupRef.current.rotation.y = current + (target - current) * step;
    });

    return null;
}

function ChefCapyScene() {
    const groupRef = useRef(null);
    const [animation, setAnimation] = useState('run');
    const elapsedRef = useRef(0);
    const RUN_DURATION = 2; // seconds
    const START_X = 3.5;
    const TARGET_X = 0.15;
    const SIDE_ROTATION = -Math.PI / 2; // look sideways while running in
    const FRONT_ROTATION = 0;
    const ROTATION_SPEED = 4;
    const rotationTargetRef = useRef(SIDE_ROTATION);

    useEffect(() => {
        elapsedRef.current = 0;
        setAnimation('run');
        if (groupRef.current) {
            groupRef.current.position.x = START_X;
            groupRef.current.rotation.y = SIDE_ROTATION;
        }
        rotationTargetRef.current = SIDE_ROTATION;
    }, []);

    return (
        <Canvas className="dashboard-canvas" camera={{ position: [0, 0.3, 7], fov: 38 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 6, 4]} intensity={0.9} />
            <Suspense fallback={null}>
                <Environment preset="sunset" />
                <group ref={groupRef} position={[START_X, -1.6, 0]}>
                    <Capy currentAnimation={animation} scale={6} />
                </group>
                <CapyMotionController
                    animation={animation}
                    setAnimation={setAnimation}
                    groupRef={groupRef}
                    elapsedRef={elapsedRef}
                    startX={START_X}
                    targetX={TARGET_X}
                    duration={RUN_DURATION}
                    onRunComplete={() => {
                        rotationTargetRef.current = FRONT_ROTATION;
                    }}
                />
                <CapyRotationController
                    groupRef={groupRef}
                    rotationTargetRef={rotationTargetRef}
                    speed={ROTATION_SPEED}
                />
                <ContactShadows
                    position={[0, -1.7, 0]}
                    opacity={0.6}
                    scale={12}
                    blur={2.4}
                    far={8}
                    color="#000000"
                />
            </Suspense>
        </Canvas>
    );
}

function RecipeCard({ recipe, onView, onEdit, onDelete }) {
    return (
        <article className="recipe-card">
            <div className="recipe-card-media">
                <img src={recipe.cover} alt={recipe.title} className="recipe-card-image" />
                <span className="recipe-card-badge">
                    {recipe.mood}
                </span>
            </div>
            <div className="recipe-card-body">
                <div>
                    <p className="recipe-card-cuisine">{recipe.cuisine}</p>
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                </div>
                <p className="recipe-card-notes">{recipe.notes}</p>
                <div className="recipe-card-tags">
                    {recipe.tags.map((tag) => (
                        <span key={tag} className="recipe-card-tag">
                            #{tag}
                        </span>
                    ))}
                </div>
                <div className="recipe-card-actions">
                    <button onClick={() => onView(recipe)} className="recipe-card-primary-btn">
                        View recipe
                    </button>
                    <button onClick={() => onEdit(recipe.id)} className="recipe-card-secondary-btn">
                        Edit notes
                    </button>
                    <button onClick={() => onDelete(recipe.id)} className="recipe-card-tertiary-btn">
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function Dashboard() {
    const { auth, url, favorites = [] } = usePage().props;

    const chefName = auth?.user?.name ? `Chef ${auth.user.name}` : 'Chef';

    const [isLoading, setIsLoading] = useState(true);

    // Build dashboard cards from DB favorites
    const dbRecipes = useMemo(() => {
        return (Array.isArray(favorites) ? favorites : []).map((r) => {
            const { area, category } = parseAreaCategory(r.description);

            return {
                id: r.id,
                title: r.title,
                cuisine: area || 'Global',
                mood: 'Saved',
                notes: r.description || 'Saved from Explorer Log.',
                cover: r.image || 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15f?auto=format&fit=crop&w=800&q=80',
                tags: category ? [category.toLowerCase().replace(/\s+/g, '-')] : [],
            };
        });
    }, [favorites]);

    // Use DB favorites as the source of truth (instead of placeholders)
    const [recipes, setRecipes] = useState(dbRecipes);

    useEffect(() => {
        setRecipes(dbRecipes);
    }, [dbRecipes]);

    const [searchTerm, setSearchTerm] = useState('');
    const [moodFilter, setMoodFilter] = useState('all');
    const [cuisineFilter, setCuisineFilter] = useState('all');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
    }, [url]);

    useEffect(() => {
        document.body.classList.add('dashboard-bg');
        return () => document.body.classList.remove('dashboard-bg');
    }, []);

    const moodOptions = useMemo(() => ['all', ...new Set(recipes.map((recipe) => recipe.mood))], [recipes]);
    const cuisineOptions = useMemo(() => ['all', ...new Set(recipes.map((recipe) => recipe.cuisine))], [recipes]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter((recipe) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                recipe.title.toLowerCase().includes(term) ||
                recipe.cuisine.toLowerCase().includes(term) ||
                recipe.notes.toLowerCase().includes(term);
            const matchesMood = moodFilter === 'all' || recipe.mood === moodFilter;
            const matchesCuisine = cuisineFilter === 'all' || recipe.cuisine === cuisineFilter;
            return matchesSearch && matchesMood && matchesCuisine;
        });
    }, [recipes, searchTerm, moodFilter, cuisineFilter]);

    const handleViewRecipe = (recipe) => {
        // Navigate to the server-rendered recipe details page
        router.visit(`/recipes/${recipe.id}`);
        
    };

    const handleEditNotes = (id) => {
        const target = recipes.find((recipe) => recipe.id === id);
        if (!target) return;
        if (typeof window === 'undefined') return;
        const nextNotes = window.prompt('Update your tasting notes', target.notes);
        if (nextNotes === null) return;
        setRecipes((prev) => prev.map((recipe) => (recipe.id === id ? { ...recipe, notes: nextNotes } : recipe)));
    };

    const handleDeleteEntry = (id) => {
        if (typeof window !== 'undefined' && !window.confirm('Remove this recipe from your cookbook?')) {
            return;
        }
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    };

    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(''), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    const removeFromFavorites = (recipeId) => {
        router.delete(`/recipes/${recipeId}/favorite`, {
            preserveScroll: true,
            onSuccess: () => {
                setToast('Recipe removed from favorites.');
                router.reload({ only: ['favorites'] });
                setIsRecipeModalOpen(false);
            },
        });
    };

    useEffect(() => {
        function onMessage(event) {
            if (event.origin !== window.location.origin) return;

            const { type } = event.data || {};
            if (type === 'favorite:updated') {
                router.reload({ only: ['favorites'] });
            }

            if (type === 'review:saved') {
                setToast('Review saved.');
                setIsRecipeModalOpen(false);
            }
        }

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    return (
        <AuthenticatedLayout header={<MarqueeBanner />}>
            <Head title="Dashboard" />
            <LoadingScreen isVisible={isLoading} durationMs={2500} />

            {toast ? (
                <div className="fixed right-6 top-6 z-[9999] rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-lg">
                    {toast}
                </div>
            ) : null}

            <div className="dashboard-page-surface">
                <div className="dashboard-content-wrapper">
                    {/* Welcome Banner */}
                    <motion.section
                        className="dashboard-hero-grid"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="dashboard-hero-card"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.1 }}
                        >
                            <div className="dashboard-hero-light" />
                
                            <motion.h1
                                className="greetings-title"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.35 }}
                            >
                                Welcome back, {chefName}!
                            </motion.h1>
                            <motion.p
                                className="dashboard-hero-description"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.5 }}
                            >
                                Have another recipe in mind? Let’s plan your next tasting flight and keep your travel-inspired cookbook glowing.
                            </motion.p>
                            <motion.div
                                className="dashboard-hero-tags"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.65 }}
                            >
                                <a
                                    href="#dashboard-cookbook"
                                    className="dashboard-cta"
                                >
                                    My Cookbook
                                </a>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="dashboard-canvas-card"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.25 }}
                        >
                            <ChefCapyScene />
                        </motion.div>
                    </motion.section>

                    {/* Search & Filter */}
                    <section className="dashboard-search-panel">
                        <div className="dashboard-search-grid">
                            <div className="dashboard-field">
                                <label className="dashboard-field-label">Search</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Find a recipe, cuisine, or note"
                                    className="dashboard-input"
                                />
                            </div>
                            <div className="dashboard-field">
                                <label className="dashboard-field-label">Mood</label>
                                <select
                                    value={moodFilter}
                                    onChange={(event) => setMoodFilter(event.target.value)}
                                    className="dashboard-input"
                                >
                                    {moodOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option === 'all' ? 'All moods' : option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="dashboard-field">
                                <label className="dashboard-field-label">Cuisine</label>
                                <select
                                    value={cuisineFilter}
                                    onChange={(event) => setCuisineFilter(event.target.value)}
                                    className="dashboard-input"
                                >
                                    {cuisineOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option === 'all' ? 'All cuisines' : option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Cookbook Section */}
                    <section id="dashboard-cookbook" className="dashboard-cookbook-section">
                        <div className="dashboard-cookbook-header">
                            <div>
                                <p className="dashboard-section-label">Cookbook</p>
                                <h2 className="dashboard-section-title">Saved recipes & tasting notes</h2>
                            </div>
                            <button
                                type="button"
                                className="dashboard-add-entry-btn"
                                onClick={() => router.visit('/#explorer-log')}
                            >
                                + New entry
                            </button>
                        </div>

                        {filteredRecipes.length === 0 ? (
                            <div className="dashboard-empty-state">
                                Nothing matches that search—brew a new idea and add it to the book.
                            </div>
                        ) : (
                            <div className="dashboard-recipe-grid">
                                {filteredRecipes.map((recipe) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        onView={handleViewRecipe}
                                        onEdit={handleEditNotes}
                                        onDelete={handleDeleteEntry}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}