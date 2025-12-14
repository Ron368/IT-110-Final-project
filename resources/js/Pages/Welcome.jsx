import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import LoadingScreen from '@/Components/LoadingScreen';
import Capy from '@/Components/Capy';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import RecipeTimeline from '@/Components/RecipeTimeline';
import { mealdbRandomBatch } from '@/api/mealdb'; // NEW

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
            
            {/* The Loading Screen covers everything while isLoading is true */}
            <LoadingScreen isVisible={isLoading} durationMs={8000} />

            {/* Main Page Container */}
            <div className="relative w-full flex flex-col min-h-screen bg-[#FFF8F0] overflow-hidden">
                
                {/* --- THE FIX IS HERE --- */}
                {/* Only render the Navbar if showContent is true */}
                {showContent && (
                    <div className="relative z-40 animate-fade-in"> 
                         <Navbar />
                    </div>
                )}

                <motion.div
                    className="flex-1 relative w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showContent ? 1 : 0 }}
                    transition={{ duration: 1.0 }}
                >
                    <div 
                        className="relative w-full h-full flex items-center justify-center p-6"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
                            backgroundSize: '80px 80px'
                        }}
                    >
                        {/* Left Column - Capybara Model */}
                            <motion.div
                                className="w-1/2 h-full flex items-center justify-center" // Keep justify-center to center in the left half
                                initial={{ opacity: 0 }}
                                animate={{ opacity: showContent ? 1 : 0 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                            >
                                {/* I increased the container size slightly to w-[500px] h-[500px] so the model isn't cut off */}
                                <div className="w-[500px] h-[500px] relative">
                                    {showContent && (
                                        <Canvas key="welcome-canvas" camera={{ position: [0, 0, 8], fov: 25 }}>
                                            <ambientLight intensity={0.8} />
                                            <spotLight position={[5, 5, 5]} intensity={1} />
                                            <Environment preset="studio" />
                                            
                                            {/* --- FIX IS HERE --- */}
                                            {/* position={[x, y, z]} -> y is -2.5 to move it DOWN */}
                                            <group position={[0, -1.2, 0]}>
                                                <Capy 
                                                    key="capy-welcome"
                                                    currentAnimation="wave" 
                                                    scale={4} 
                                                />
                                            </group>
                                        </Canvas>
                                    )}
                                </div>
                            </motion.div>

                        {/* Right Column - Text Content */}
                        <div className="w-1/2 h-full flex flex-col items-start justify-center pr-12 z-10">
                            <motion.h1 
                                className="text-orange-500 text-7xl md:text-8xl mb-2" 
                                style={{ fontFamily: "'Dancing Script', cursive" }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                Capy & Co.
                            </motion.h1>
                            
                            <motion.h2 
                                className="text-black text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                Global Recipe Adventure
                            </motion.h2>
                            
                            <motion.p 
                                className="text-gray-800 text-lg md:text-xl max-w-2xl leading-relaxed font-medium"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                Join our beloved Capybara chef as they travel across continents, discovering and recreating iconic dishes from around the world with a delightful twist.
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                {/* Timeline renders with preloaded data/images */}
                {showContent && <RecipeTimeline initialMeals={preloadedMeals} />}
            </div>
        </>
    );
}