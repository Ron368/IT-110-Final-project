import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import LoadingScreen from '@/Components/loadingScreen';
import Capy from '@/Components/Capy';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'; //
import { motion } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import RecipeTimeline from '@/Components/RecipeTimeline';
import ExplorerLogSection from '@/Components/ExplorerLogSection';
import { mealdbRandomBatch } from '@/api/mealdb';

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

    // Timer to turn off loading screen after duration
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 8000); // Matches LoadingScreen duration

        return () => clearTimeout(timer);
    }, []);

    // State to show content after loading + exit animation
    const [showContent, setShowContent] = useState(false);
    useEffect(() => {
        // Wait for loading (8000) + slight buffer (100ms) to ensure previous context is fully destroyed
        const total = 8100; 
        const t = setTimeout(() => setShowContent(true), total);
        return () => clearTimeout(t);
    }, []);

    const [preloadedMeals, setPreloadedMeals] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            // 1) keep the loading screen up for at least 8s
            const minDelay = new Promise((r) => setTimeout(r, 8000));

            // 2) fetch meals + preload their images during the loading screen
            const preloadMeals = (async () => {
                try {
                    const data = await mealdbRandomBatch(4); // hits /api/mealdb/random-batch
                    const meals = Array.isArray(data?.meals) ? data.meals.slice(0, 4) : [];

                    await Promise.all(meals.map((m) => preloadImage(m?.strMealThumb)));

                    if (!alive) return;
                    setPreloadedMeals(meals);
                } catch {
                    // don't block the landing page if API fails
                    if (!alive) return;
                    setPreloadedMeals([]); // timeline can handle empty/error state
                }
            })();

            await Promise.all([minDelay, preloadMeals]);

            if (!alive) return;
            setIsLoading(false);
            setShowContent(true);
        })();

        return () => {
            alive = false;
        };
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
                            {/* USE THE CSS CLASS HERE */}
                            <div className="welcome-canvas-container">
                                {/* Ground Shadow */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-br from-black/25 via-black/15 to-transparent rounded-full blur-3xl" />
                                
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
                                            <ContactShadows 
                                                position={[0, 0, 0]} 
                                                opacity={0.8} 
                                                scale={11} 
                                                blur={2.0} 
                                                far={7} 
                                                color="#000000" 
                                            />
                                        </group>
                                    </Canvas>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Column - Text Content */}
                        <div className="welcome-hero-right">
                            {/* USE THE CSS CLASSES HERE */}
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

                {showContent && <ExplorerLogSection />}
            </div>
        </>
    );
}