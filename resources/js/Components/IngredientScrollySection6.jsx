import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef } from 'react';

export default function IngredientScrollySection6({
    dishName = 'Ratatouille',
}) {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Image Animation: "Served" Effect
    // Starts small and lower, rises up and scales to full glory
    const imgY = useTransform(smoothProgress, [0, 0.5, 1], [150, 0, -50]);
    const imgScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.2, 1]);
    const imgRotate = useTransform(smoothProgress, [0, 1], [-5, 0]); // Subtle straighten

    // Text Animation: "Bon Appétit" Reveal
    const textY = useTransform(smoothProgress, [0, 0.5, 1], [50, 0, -50]);
    const textOpacity = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

    // Background "Steam/Aroma" Lines
    const steamY1 = useTransform(smoothProgress, [0, 1], [100, -200]);
    const steamY2 = useTransform(smoothProgress, [0, 1], [150, -250]);
    const steamY3 = useTransform(smoothProgress, [0, 1], [50, -150]);

    const imgUrl = useMemo(() => {
        // You can swap this URL with the actual finished dish image from the API or a local asset
        return `https://www.themealdb.com/images/media/meals/wrpwuu1511786491.jpg`; 
    }, []);

    return (
        <section ref={sectionRef} className="ingredient-scrolly-section">
            
            {/* Contextual Header Text */}
            <div className="absolute top-12 sm:top-20 z-20 text-center px-4 w-full">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-800/80 font-medium tracking-wide"
                >
                    A masterpiece is served.
                </motion.h2>
            </div>

            {/* Background "Steam" Text */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none opacity-20">
                <motion.div style={{ y: steamY1 }} className="absolute left-[15%] bottom-[10%]">
                    <span className="block font-serif italic text-4xl text-stone-400">Bon Appétit</span>
                </motion.div>
                <motion.div style={{ y: steamY2 }} className="absolute right-[20%] top-[20%]">
                    <span className="block font-serif italic text-3xl text-stone-400">Delicious</span>
                </motion.div>
                <motion.div style={{ y: steamY3 }} className="absolute left-[25%] top-[15%]">
                    <span className="block font-serif italic text-5xl text-stone-400">Savor</span>
                </motion.div>
            </div>

            {/* Main Title "RATATOUILLE" - Behind Dish */}
            <motion.div 
                style={{ y: textY, opacity: textOpacity }}
                className="absolute z-0"
            >
                <span className="block font-black text-transparent text-[18vw] leading-none tracking-tighter"
                      style={{
                          WebkitTextStroke: '2px rgba(234, 88, 12, 0.5)', // Orange-Red Outline
                          fontFamily: "'Figtree', sans-serif",
                      }}
                >
                    ENJOY
                </span>
            </motion.div>

            {/* Foreground Dish Image */}
            <div className="relative z-10 flex items-center justify-center mt-20 sm:mt-0">
                <motion.div style={{ y: imgY, scale: imgScale, rotate: imgRotate }} className="relative">
                    {/* Warm Serving Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-orange-100/50 blur-[100px] rounded-full mix-blend-multiply" />
                    
                    <img
                        src={imgUrl}
                        alt={dishName}
                        className="relative h-[350px] w-[350px] object-cover rounded-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white"
                        loading="eager"
                        draggable={false}
                    />
                </motion.div>
            </div>
        </section>
    );
}