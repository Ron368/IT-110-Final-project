import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef } from 'react';

export default function IngredientScrollySection4({
    ingredient = 'Tomato',
}) {
    const sectionRef = useRef(null);

    // Track scroll progress
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Image Animation: "Drop and Bounce" effect
    // Starts high, drops fast to center, then settles
    const imgY = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [-400, 50, -20, 100]);
    // Squashes slightly on "impact" (0.4) then returns to normal
    const imgScaleX = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0.9, 1.15, 0.95, 1]);
    const imgScaleY = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [1.1, 0.85, 1.05, 1]);

    // Text "Ripple" Animation (Circular expansion)
    const textScale = useTransform(smoothProgress, [0.3, 0.5, 0.8], [0.5, 1.2, 1]);
    const textOpacity = useTransform(smoothProgress, [0.2, 0.4, 0.8], [0, 1, 0]);
    const textRotate = useTransform(smoothProgress, [0, 1], [-5, 5]);

    // Floating side text (Bubbles)
    const bubble1Y = useTransform(smoothProgress, [0, 1], [200, -200]);
    const bubble2Y = useTransform(smoothProgress, [0, 1], [300, -100]);

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
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-rose-900/80 font-medium tracking-wide"
                >
                    Rich, red, and full of flavor...
                </motion.h2>
            </div>

            {/* Background Text Container */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
                
                {/* Main Ripple Text */}
                <motion.div 
                    style={{ scale: textScale, opacity: textOpacity, rotate: textRotate }}
                    className="absolute z-0"
                >
                    <span className="block font-black text-rose-500/10 text-[25vw] leading-none tracking-tighter"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                        JUICY
                    </span>
                </motion.div>

                {/* Floating Keywords (Bubbles) */}
                <motion.div 
                    style={{ y: bubble1Y }} 
                    className="absolute left-[10%] bottom-[20%]"
                >
                    <span className="block font-bold text-transparent text-[6vw] leading-none"
                          style={{
                              WebkitTextStroke: '2px rgba(225, 29, 72, 0.5)', // Rose Red outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        RIPE
                    </span>
                </motion.div>

                <motion.div 
                    style={{ y: bubble2Y }} 
                    className="absolute right-[10%] top-[30%]"
                >
                    <span className="block font-bold text-transparent text-[6vw] leading-none"
                          style={{
                              WebkitTextStroke: '2px rgba(225, 29, 72, 0.5)', // Rose Red outline
                              fontFamily: "'Figtree', sans-serif",
                          }}
                    >
                        RED
                    </span>
                </motion.div>
            </div>

            {/* Foreground Image */}
            <div className="relative z-10 flex items-center justify-center mt-20 sm:mt-0">
                <motion.div 
                    style={{ y: imgY, scaleX: imgScaleX, scaleY: imgScaleY }} 
                    className="relative"
                >
                    {/* Splashy Red Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-rose-500/30 blur-[80px] rounded-full mix-blend-multiply" />
                    
                    <img
                        src={imgUrl}
                        alt={ingredient}
                        className="relative h-[320px] w-[320px] object-contain sm:h-[580px] sm:w-[580px] drop-shadow-2xl"
                        loading="eager"
                        draggable={false}
                    />
                </motion.div>
            </div>
        </section>
    );
}