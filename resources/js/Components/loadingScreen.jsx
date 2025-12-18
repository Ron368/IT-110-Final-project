import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Capy from './Capy';

// Flag assets reused across renders
const FLAG_TEXTURES = [
    '/models/argentina.svg', '/models/australia.svg', '/models/belgium.svg',
    '/models/china.svg', '/models/denmark.svg', '/models/egypt.svg',
    '/models/greece.svg', '/models/hongkong.svg', '/models/jamaica.svg',
    '/models/japan.svg', '/models/newzealand.svg', '/models/philippines.svg',
    '/models/singapore.svg', '/models/southafrica.svg', '/models/spain.svg',
    '/models/srilanka.svg', '/models/thailand.svg', '/models/uk.svg',
    '/models/usa.svg',
];

// Preload flag textures so the loading screen can render immediately
FLAG_TEXTURES.forEach((texturePath) => useTexture.preload(texturePath));

// -- FLAG COMPONENT ---
function FlagItem({ url, startPos, speed }) {
    const texture = useTexture(url);

    const meshRef = useRef();

    useFrame((state, delta) => {
        // Move flags from Right to Left
        if (meshRef.current) {
            meshRef.current.position.x -= delta * speed;
        }
    });

    return (
        <mesh ref={meshRef} position={startPos}>
            {/* Standard flag aspect ratio */}
            <planeGeometry args={[2.2, 1.3]} />
            <meshBasicMaterial 
                map={texture} 
                transparent={true} 
                side={THREE.DoubleSide} 
                toneMapped={false} 
            />
        </mesh>
    );
}

// -- RUNNING CAPYBARA ---
function RunnerCapy({ durationMs }) {
    const groupRef = useRef();
    
    // The capybara should traverse from START_X to END_X in exactly durationMs milliseconds
    // This ensures it syncs perfectly with the loading bar animation
    const START_X = -5.0; 
    const END_X = 5.0;
    const DISTANCE = END_X - START_X; // 10 units
    const DURATION_SECONDS = durationMs / 1000;
    
    // Speed in units per second: must travel DISTANCE in DURATION_SECONDS
    const speed = DISTANCE / DURATION_SECONDS;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Move by (speed * delta) each frame
            // Total distance after DURATION_SECONDS: speed * DURATION_SECONDS = DISTANCE ✓
            groupRef.current.position.x += delta * speed;
            
            // Clamp to END_X so it doesn't overshoot
            if (groupRef.current.position.x > END_X) {
                groupRef.current.position.x = END_X;
            }
        }
    });

    return (
        // Position Y=-3.5 places the feet right on the top edge of the HTML loading bar
        <group ref={groupRef} position={[START_X, -3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
            <Capy currentAnimation="run" scale={5} />
        </group>
    );
}

// --- LOADING BAR UI ---
function LoadingBar({ durationMs }) {
    return (
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: durationMs / 1000, ease: 'linear' }}
            className="h-full bg-orange-400 rounded"
        />
    );
}

// --- MAIN COMPONENT ---
export default function LoadingScreen({ isVisible = true, durationMs = 2500 }) {
    if (!isVisible) return null;

    const flags = useMemo(() => {
        return FLAG_TEXTURES.map((url, i) => ({
            id: i,
            url: url,
            // Flags floating slightly above head level (Y=0.5)
            // Starting just off-screen to the right relative to the narrower bar area
            position: [6 + (i * 2.5), 0.5, -2], 
            speed: 7.0
        }));
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                key="loading-overlay"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fef3c7]"
            >
                {/* 3D SCENE CONTAINER */}
                <div className="w-[400px] h-[200px] relative overflow-hidden rounded-t-xl bg-[#fef3c7]">
                    <Canvas shadows camera={{ position: [0, 1, 10], fov: 40 }}>
                        <ambientLight intensity={0.7} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        
                        <Suspense fallback={null}>
                            <Environment preset="city" />
                        </Suspense>

                        <Suspense fallback={null}>
                            <RunnerCapy durationMs={durationMs} />
                        </Suspense>

                        <Suspense fallback={null}>
                            {flags.map((flag) => (
                                <FlagItem 
                                    key={flag.id} 
                                    url={flag.url} 
                                    startPos={flag.position}
                                    speed={flag.speed}
                                />
                            ))}
                        </Suspense>

                        <fog attach="fog" args={['#fef3c7', 10, 25]} />
                    </Canvas>
                </div>

                {/* LOADING BAR & TEXT */}
                <div className="w-64 flex flex-col items-center">
                    <div className="w-full h-1 bg-gray-300 rounded overflow-hidden mb-2">
                        <LoadingBar durationMs={durationMs} />
                    </div>
                    
                    <h2 className="text-gray-600 text-xs uppercase tracking-[0.25em] font-bold">
                        Running to Kitchen...
                    </h2>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}