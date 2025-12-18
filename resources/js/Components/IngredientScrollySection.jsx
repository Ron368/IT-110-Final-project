import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMemo, useRef } from 'react';

export default function IngredientScrollySection({
    ingredient = 'Eggplant',
    headlineLines = ['EGGPLANT', 'EGGPLANT', 'EGGPLANT'],
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

    // Image Animation: Scales up slightly and moves vertically
    const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1, 1.1]);
    const imgY = useTransform(smoothProgress, [0, 1], [100, -100]);

    const imgUrl = useMemo(() => {
        const safe = encodeURIComponent(String(ingredient || '').trim() || 'Eggplant');
        return `https://www.themealdb.com/images/ingredients/${safe}.png`;
    }, [ingredient]);

    return (
        <section ref={sectionRef} className="ingredient-scrolly-section">
            
            {/* NEW: Contextual Header Text */}
            <div className="absolute top-12 sm:top-20 z-20 text-center px-4 w-full">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="font-serif text-2xl sm:text-3xl md:text-4xl text-orange-900/80 font-medium tracking-wide"
                >
                    Let&apos;s start with the iconic Ratatouille shall we?
                </motion.h2>
            </div>

            {/* Background Marquee Text Container */}
            <div className="absolute inset-0 flex flex-col justify-center items-center z-0 pointer-events-none select-none opacity-20">
                
                {/* Line 1 - Faster (12s) */}
                <div className="w-full overflow-hidden">
                    <AutoMarqueeText text={headlineLines?.[0] ?? 'EGGPLANT'} direction="left" speed={12} />
                </div>

                {/* Line 2 - Medium (18s) */}
                <div className="w-full overflow-hidden my-4 sm:my-12">
                    <AutoMarqueeText text={headlineLines?.[1] ?? 'EGGPLANT'} direction="right" speed={18} />
                </div>

                {/* Line 3 - Fast (15s) */}
                <div className="w-full overflow-hidden">
                    <AutoMarqueeText text={headlineLines?.[2] ?? 'EGGPLANT'} direction="left" speed={15} />
                </div>
            </div>

            {/* Foreground Image */}
            <div className="relative z-10 flex items-center justify-center mt-20 sm:mt-0">
                <motion.div style={{ scale, y: imgY }} className="relative">
                    {/* Glow effect behind ingredient */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-400/20 blur-[80px] rounded-full" />
                    
                    <img
                        src={imgUrl}
                        alt={ingredient}
                        className="relative h-[350px] w-[350px] object-contain sm:h-[600px] sm:w-[600px] drop-shadow-2xl"
                        loading="eager"
                        draggable={false}
                    />
                </motion.div>
            </div>
        </section>
    );
}

// Helper for Automatic Continuous Movement
function AutoMarqueeText({ text, direction = 'left', speed = 20 }) {
    const repeatedText = Array(12).fill(text).join(' — ');

    return (
        <motion.div
            className="flex whitespace-nowrap"
            animate={{
                x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
            }}
            transition={{
                duration: speed,
                ease: "linear",
                repeat: Infinity,
            }}
        >
            <span
                className="block font-black uppercase tracking-tighter text-transparent leading-none"
                style={{
                    fontSize: 'clamp(6rem, 18vw, 14rem)',
                    WebkitTextStroke: '2px rgba(249, 143, 82, 0.8)',
                    fontFamily: "'Figtree', sans-serif",
                    paddingRight: '4rem' 
                }}
            >
                {repeatedText}
            </span>
            
            <span
                className="block font-black uppercase tracking-tighter text-transparent leading-none"
                style={{
                    fontSize: 'clamp(6rem, 18vw, 14rem)',
                    WebkitTextStroke: '2px rgba(249, 143, 82, 0.8)',
                    fontFamily: "'Figtree', sans-serif",
                }}
            >
                {repeatedText}
            </span>
        </motion.div>
    );
}