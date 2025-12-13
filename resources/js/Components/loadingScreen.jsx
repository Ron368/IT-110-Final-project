import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture, Environment } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Capy from './Capy'; 

// --- 1. BILLBOARD (Same as before) ---
function Billboard({ position, videoUrl, totalLength }) {
    const meshRef = useRef();
    
    const texture = useVideoTexture(videoUrl, {
        unsuspend: 'canplay',
        muted: true,
        loop: true,
        start: true,
    });

    useFrame((state, delta) => {
        meshRef.current.position.z -= delta * 15; 
        if (meshRef.current.position.z < -50) {
            meshRef.current.position.z += totalLength;
        }
    });

    return (
        <group ref={meshRef} position={position}>
            <mesh>
                <boxGeometry args={[2.1, 1.2, 0.1]} />
                <meshStandardMaterial color="#333" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[2, 1.1]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshStandardMaterial color="#222" />
            </mesh>
        </group>
    );
}

// --- 2. LOADING BAR ---
function LoadingBar({ durationMs }) {
    return (
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: durationMs / 1000, ease: 'easeInOut' }}
            className="h-full bg-gray-800 rounded"
        />
    );
}

// --- 3. MAIN COMPONENT ---
export default function LoadingScreen({ isVisible = true, durationMs = 2500 }) {
    // NOTE: If your parent component mounts/unmounts this component based on isVisible,
    // this line below might break AnimatePresence.
    // If the animation doesn't run at all, remove this line and ensure the parent
    // keeps rendering <LoadingScreen /> while isVisible is false until the animation finishes.
    if (!isVisible) return null; 

    const SPACING = 15; 
    const flagFiles = [
        "/models/brazil.mp4", "/models/canada.mp4", "/models/france.mp4",
        "/models/hongkong.mp4", "/models/italy.mp4", "/models/japan.mp4",
        "/models/mexico.mp4", "/models/spain.mp4", "/models/usa.mp4",
        "/models/philippines.mp4"
    ];
    const TOTAL_LENGTH = SPACING * flagFiles.length;

    const flags = useMemo(() => {
        return flagFiles.map((url, i) => ({
            id: i,
            url: url,
            x: i % 2 === 0 ? -2 : 2, 
            z: (i * SPACING) 
        }));
    }, [flagFiles]);

    function CameraAnimator({ durationMs }) {
        const { camera } = useThree();
        const cameraStart = useMemo(() => new THREE.Vector3(0, 1, 12), []);
        const cameraTarget = useMemo(() => new THREE.Vector3(0, 0.5, 6), []);
        const elapsedRef = useRef(0);

        useEffect(() => {
            camera.position.copy(cameraStart);
            camera.lookAt(0, 0, 0);
            elapsedRef.current = 0;
        }, [camera, cameraStart]);

        useFrame((_, delta) => {
            if (elapsedRef.current >= durationMs / 1000) return;
            elapsedRef.current += delta;
            const t = Math.min(elapsedRef.current / (durationMs / 1000), 1);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            camera.position.lerpVectors(cameraStart, cameraTarget, eased);
            camera.lookAt(0, 0, 0);
        });

        return null;
    }

    return (
        <AnimatePresence onExitComplete={() => console.log("exit complete")}>
            {/* Main loading screen container */}
            <motion.div
                key="main-content"
                initial={{ opacity: 1, backgroundColor: '#FFF8F0' }}
                // CHANGED: Set exit opacity to 1 so it stays visible underneath the black overlay
                exit={{ opacity: 1 }}
                // CHANGED: Removed duration: 0 so it doesn't instantly disappear
                transition={{ duration: 2.0, ease: "easeInOut" }}
                style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 50, 
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}
            >
                {/* --- ORANGE BOX AREA (The 3D Scene) --- */}
                <div className="w-[600px] h-[200px] relative overflow-hidden rounded-xl bg-[#fef3c7]">
                    <Canvas key="loading-canvas" shadows camera={{ position: [0, 1, 6], fov: 20 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} intensity={1} />
                        <CameraAnimator durationMs={durationMs} />
                        <Environment preset="city" />
                        <fog attach="fog" args={['#fef3c7', 8, 40]} /> 

                        <group position={[0, -1, 0]}>
                            <Capy key="capy-loading" currentAnimation="run" scale={2.5} />
                        </group>

                        {flags.map((flag) => (
                            <Billboard 
                                key={flag.id}
                                position={[flag.x, 0, flag.z]} 
                                videoUrl={flag.url}
                                totalLength={TOTAL_LENGTH}
                            />
                        ))}
                    </Canvas>
                </div>

                {/* --- YELLOW BOX AREA (The UI) --- */}
                <div className="mt-1 text-center w-64">
                    <h2 className="text-gray-500 text-xs uppercase tracking-[0.25em] font-medium mb-3">
                        Traveling to the next kitchen...
                    </h2>
                    <div className="w-full h-0.5 bg-gray-300/50 rounded overflow-hidden">
                        <LoadingBar durationMs={durationMs} />
                    </div>
                </div>
            </motion.div>

            {/* Separate black overlay that fades in over the exit duration */}
            <motion.div
                key="black-overlay"
                initial={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                // CHANGED: Reduced duration to 2.0s and added easing for smoother feel
                transition={{ duration: 1.0, ease: "easeInOut" }}
                style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 51, // Higher Z-index ensures it sits on top
                    backgroundColor: '#000000',
                    pointerEvents: 'none'
                }}
            />
        </AnimatePresence>
    );
}