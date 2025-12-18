import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

// List of all ingredients to display in this "Grand Assembly"
const ingredients = [
    { name: 'Eggplant', url: 'https://www.themealdb.com/images/ingredients/Eggplant.png', x: -150, y: 100, rotate: -15, scale: 0.8, delay: 0 },
    { name: 'Yellow Pepper', url: 'https://www.themealdb.com/images/ingredients/Yellow%20Pepper.png', x: 150, y: 120, rotate: 20, scale: 0.85, delay: 0.1 },
    { name: 'Zucchini', url: 'https://www.themealdb.com/images/ingredients/Zucchini.png', x: -80, y: 150, rotate: 45, scale: 0.9, delay: 0.2 },
    { name: 'Tomato', url: 'https://www.themealdb.com/images/ingredients/Tomato.png', x: 80, y: 180, rotate: -10, scale: 1.0, delay: 0.3 },
    { name: 'Onion', url: 'https://www.themealdb.com/images/ingredients/Onion.png', x: -120, y: -50, rotate: 30, scale: 0.7, delay: 0.4 },
    { name: 'Garlic', url: 'https://www.themealdb.com/images/ingredients/Garlic.png', x: 120, y: -40, rotate: -25, scale: 0.5, delay: 0.5 },
    { name: 'Basil', url: 'https://www.themealdb.com/images/ingredients/Basil.png', x: 0, y: -100, rotate: 0, scale: 0.6, delay: 0.6 },
    { name: 'Olive Oil', url: 'https://www.themealdb.com/images/ingredients/Olive%20Oil.png', x: -180, y: -150, rotate: -10, scale: 0.7, delay: 0.5 },
    { name: 'Red Wine Vinegar', url: 'https://www.themealdb.com/images/ingredients/Red%20Wine%20Vinegar.png', x: 180, y: -120, rotate: 15, scale: 0.7, delay: 0.55 },
    { name: 'Sugar', url: 'https://www.themealdb.com/images/ingredients/Sugar.png', x: 0, y: 220, rotate: 0, scale: 0.4, delay: 0.65 },
];

export default function IngredientScrollySection5() {
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

    // Main Text Animation: "Bringing it all together"
    const textScale = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0.8, 1.2, 1]);
    const textOpacity = useTransform(smoothProgress, [0.1, 0.3, 0.8], [0, 1, 0.5]);

    // Background Marquee Speed (Slow & Steady)
    const marqueeX = useTransform(smoothProgress, [0, 1], ['0%', '-20%']);

    return (
        <section ref={sectionRef} className="relative w-full bg-[#FDFBF7] overflow-hidden min-h-[150vh] flex flex-col items-center justify-center">
            
            {/* Contextual Header Text */}
            <div className="absolute top-12 sm:top-20 z-20 text-center px-4 w-full">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-800/80 font-medium tracking-wide"
                >
                    And finally, bringing it all together...
                </motion.h2>
            </div>

            {/* Background Text: "AROMATICS" */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none opacity-10">
                <motion.div style={{ x: marqueeX }} className="whitespace-nowrap">
                    <span className="block font-black text-stone-900 text-[20vw] leading-none tracking-tighter"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                        AROMATICS — FLAVOR — MAGIC — 
                    </span>
                </motion.div>
            </div>

            {/* The "Assembly" Container */}
            <div className="relative z-10 w-full max-w-4xl h-[800px] flex items-center justify-center">
                
                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-200/20 blur-[120px] rounded-full mix-blend-multiply" />

                {ingredients.map((ing, i) => (
                    <IngredientItem 
                        key={ing.name} 
                        item={ing} 
                        progress={smoothProgress} 
                    />
                ))}
            </div>
        </section>
    );
}

// Sub-component for individual ingredient physics
function IngredientItem({ item, progress }) {
    // Parallax: Each item moves from a distant Y to its final 'cluster' Y
    // We add a random offset based on 'item.y' to make them fly in from different heights
    const startY = item.y - 800; // Start high up (or far away)
    const endY = item.y; // Settle into position
    
    const y = useTransform(progress, [0, 0.6], [startY, endY]);
    
    // Scale: Grow as they land
    const scale = useTransform(progress, [0, 0.6], [0, item.scale]);
    
    // Rotate: Spin as they fall
    const rotate = useTransform(progress, [0, 0.6], [item.rotate + 180, item.rotate]);

    return (
        <motion.div
            style={{ x: item.x, y, scale, rotate }}
            className="absolute top-1/2 left-1/2" // Center origin
        >
            <img 
                src={item.url} 
                alt={item.name}
                className="w-[200px] h-[200px] object-contain drop-shadow-xl"
                loading="lazy"
            />
        </motion.div>
    );
}