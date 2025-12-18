import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef } from 'react';

export default function IngredientScrollySection2({
    ingredient = 'Yellow Pepper',
}) {
    const sectionRef = useRef(null);

    // Track scroll progress of the entire section
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Image Animation: Rotates and Scales
    const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.5, 1.2, 0.8]);
    const rotate = useTransform(smoothProgress, [0, 1], [-45, 45]);
    const imgY = useTransform(smoothProgress, [0, 1], [200, -200]);

    // Text Animations (Pop Art Style)
    // 1. "CRUNCHY" - Moves from left, rotates slightly
    const crunchX = useTransform(smoothProgress, [0, 0.5, 1], [-500, -200, -500]);
    const crunchRotate = useTransform(smoothProgress, [0, 1], [-10, 10]);

    // 2. "YELLOW" - Explodes from center (Scale + Fade)
    const yellowScale = useTransform(smoothProgress, [0.3, 0.5, 0.7], [0, 1.5, 0]);
    const yellowOpacity = useTransform(smoothProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

    // 3. "FRESH" - Moves from right
    const freshX = useTransform(smoothProgress, [0, 0.5, 1], [500, 200, 500]);
    const freshRotate = useTransform(smoothProgress, [0, 1], [10, -10]);

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
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-orange-900/80 font-medium tracking-wide"
                >
                    Adding some brightness and crunch...
                </motion.h2>
            </div>

            {/* Background POP Text Container */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
                
                {/* Left Text: CRUNCHY */}
                <motion.div 
                    style={{ x: crunchX, rotate: crunchRotate }} 
                    className="absolute left-[10%] top-[30%]"
                >
                    <span className="block font-black text-transparent text-[8vw] leading-none"
                          style={{
                              WebkitTextStroke: '2px rgba(234, 179, 8, 0.6)', // Yellow-Orange outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        CRUNCHY
                    </span>
                </motion.div>

                {/* Center Text: YELLOW (Behind image) */}
                <motion.div 
                    style={{ scale: yellowScale, opacity: yellowOpacity }} 
                    className="absolute"
                >
                    <span className="block font-black text-yellow-400/20 text-[20vw] leading-none"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                        YELLOW
                    </span>
                </motion.div>

                {/* Right Text: FRESH */}
                <motion.div 
                    style={{ x: freshX, rotate: freshRotate }} 
                    className="absolute right-[10%] bottom-[30%]"
                >
                    <span className="block font-black text-transparent text-[8vw] leading-none"
                          style={{
                              WebkitTextStroke: '2px rgba(249, 115, 22, 0.6)', // Deep Orange outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        FRESH
                    </span>
                </motion.div>
            </div>

            {/* Foreground Image */}
            <div className="relative z-10 flex items-center justify-center mt-20 sm:mt-0">
                <motion.div style={{ scale, rotate, y: imgY }} className="relative">
                    {/* Vibrant Yellow Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-yellow-400/30 blur-[100px] rounded-full mix-blend-multiply" />
                    
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