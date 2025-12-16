import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import LoadingScreen from '@/Components/LoadingScreen';
import Capy from '@/Components/Capy';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import RecipeTimeline from '@/Components/RecipeTimeline';
import { mealdbRandomBatch } from '@/api/mealdb';

// Recommendation: Move this to resources/js/Utils/images.js
function preloadImage(url) {
    if (!url) return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
    });
}

export default function Welcome() {
    // State for loading screen visibility
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [preloadedMeals, setPreloadedMeals] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            // 1) Minimum loading time (8s)
            const minDelay = new Promise((r) => setTimeout(r, 8000));

            // 2) Fetch meals + preload images
            const preloadMeals = (async () => {
                try {
                    const data = await mealdbRandomBatch(4);
                    const meals = Array.isArray(data?.meals) ? data.meals.slice(0, 4) : [];
                    await Promise.all(meals.map((m) => preloadImage(m?.strMealThumb)));

                    if (alive) setPreloadedMeals(meals);
                } catch {
                    if (alive) setPreloadedMeals([]);
                }
            })();

            await Promise.all([minDelay, preloadMeals]);

            if (!alive) return;
            setIsLoading(false);
            
            // Small buffer to ensure smooth transition
            setTimeout(() => setShowContent(true), 100);
        })();

        return () => { alive = false; };
    }, []);

    return (
        <>
            <Head>
                <title>Welcome</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />
            </Head>
            
            <LoadingScreen isVisible={isLoading} durationMs={8000} />

            <div className="welcome-container">
                {showContent && (
                    <div className="welcome-navbar-wrapper"> 
                         <Navbar />
                    </div>
                )}

                <motion.div
                    className="welcome-content-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showContent ? 1 : 0 }}
                    transition={{ duration: 1.0 }}
                >
                    <div className="welcome-hero-section">
                        {/* Left Column - Capybara Model */}
                        <motion.div
                            className="welcome-hero-left"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showContent ? 1 : 0 }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                        >
                            <div className="welcome-canvas-container">
                                {showContent && (
                                    <Canvas key="welcome-canvas" camera={{ position: [0, 0, 8], fov: 25 }}>
                                        <ambientLight intensity={0.8} />
                                        <spotLight position={[5, 5, 5]} intensity={1} />
                                        <Environment preset="studio" />
                                        <group position={[0, -1.5, 0]}>
                                            <Capy 
                                                key="capy-welcome"
                                                currentAnimation="wave" 
                                                scale={5.5} 
                                            />
                                        </group>
                                    </Canvas>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Column - Text Content */}
                        <div className="welcome-hero-right">
                            <motion.h1 
                                className="welcome-title"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                Capy & Co.
                            </motion.h1>
                            
                            <motion.h2 
                                className="welcome-subtitle"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                Global Recipe Adventure
                            </motion.h2>
                            
                            <motion.p 
                                className="welcome-description"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                Join our beloved Capybara chef as they travel across continents, discovering and recreating iconic dishes from around the world with a delightful twist.
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                {showContent && <RecipeTimeline initialMeals={preloadedMeals} />}
            </div>
        </>
    ); 
}