import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef } from 'react';

export default function IngredientScrollySection3({
    ingredient = 'Zucchini',
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

    // Image Animation: Slides in Diagonally
    const imgX = useTransform(smoothProgress, [0, 1], [-200, 200]);
    const imgRotate = useTransform(smoothProgress, [0, 1], [-15, 15]);
    const imgScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);

    // Text "Slicing" Animation (Staggered Reveal)
    // "FRESH" - Moves Down
    const text1Y = useTransform(smoothProgress, [0, 1], [-100, 100]);
    // "GARDEN" - Moves Up
    const text2Y = useTransform(smoothProgress, [0, 1], [100, -100]);
    // "CRUNCH" - Moves Down (Faster)
    const text3Y = useTransform(smoothProgress, [0, 1], [-200, 200]);

    const imgUrl = useMemo(() => {
        const safe = encodeURIComponent(String(ingredient || '').trim());
        return `https://www.themealdb.com/images/ingredients/${safe}.png`;
    }, [ingredient]);

    return (
        <section ref={sectionRef} className="ingredient-scrolly-section">
            
            {/* Contextual Header Text */}
            <div className="absolute top-12 sm:top-20 z-20 text-center px-4 w-full">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-emerald-900/80 font-medium tracking-wide"
                >
                    Fresh from the garden...
                </motion.h2>
            </div>

            {/* Background Text Container */}
            <div className="absolute inset-0 flex flex-col justify-center items-center z-0 pointer-events-none select-none opacity-25">
                
                {/* Line 1: FRESH */}
                <motion.div style={{ y: text1Y }} className="w-full text-center">
                    <span className="block font-black text-transparent text-[12vw] leading-none tracking-tight"
                          style={{
                              WebkitTextStroke: '2px rgba(16, 185, 129, 0.6)', // Emerald Green Outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        FRESH
                    </span>
                </motion.div>

                {/* Line 2: GARDEN (Solid Filled for contrast) */}
                <motion.div style={{ y: text2Y }} className="w-full text-center my-4">
                    <span className="block font-black text-emerald-100 text-[15vw] leading-none tracking-widest"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                        GARDEN
                    </span>
                </motion.div>

                {/* Line 3: CRUNCH */}
                <motion.div style={{ y: text3Y }} className="w-full text-center">
                    <span className="block font-black text-transparent text-[12vw] leading-none tracking-tight"
                          style={{
                              WebkitTextStroke: '2px rgba(5, 150, 105, 0.6)', // Darker Green Outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        CRUNCH
                    </span>
                </motion.div>
            </div>

            {/* Foreground Image */}
            <div className="relative z-10 flex items-center justify-center mt-20 sm:mt-0">
                <motion.div style={{ x: imgX, rotate: imgRotate, scale: imgScale }} className="relative">
                    {/* Fresh Green Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-emerald-300/30 blur-[90px] rounded-full mix-blend-multiply" />
                    
                    <img
                        src={imgUrl}
                        alt={ingredient}
                        className="relative h-[300px] w-[300px] object-contain sm:h-[550px] sm:w-[550px] drop-shadow-2xl"
                        loading="eager"
                        draggable={false}
                    />
                </motion.div>
            </div>
        </section>
    );
}