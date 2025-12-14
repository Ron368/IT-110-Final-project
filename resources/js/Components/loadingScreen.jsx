import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture, Environment } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense } from 'react'; // CHANGED: add Suspense
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Capy from './Capy';

// --- 1. BILLBOARD (Same as before) ---
function Billboard({ position, videoUrl, totalLength }) {
    const meshRef = useRef();

    // CHANGED: don't suspend the scene waiting for canplay (start rendering immediately)
    const texture = useVideoTexture(videoUrl, {
        unsuspend: 'loadeddata', // was: 'canplay'
        muted: true,
        loop: true,
        start: true,
        playsInline: true,
        crossOrigin: 'anonymous',
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
    if (!isVisible) return null;

    const SPACING = 15;
    const flagFiles = [
        "/models/brazil.mp4", "/models/canada.mp4", "/models/france.mp4",
        "/models/hongkong.mp4", "/models/italy.mp4", "/models/japan.mp4",
        "/models/mexico.mp4", "/models/spain.mp4", "/models/usa.mp4",
        "/models/philippines.mp4"
    ];
    const TOTAL_LENGTH = SPACING * flagFiles.length;

    // NEW: warm up video loads ASAP so textures appear quicker
    useEffect(() => {
        flagFiles.forEach((url) => {
            const v = document.createElement('video');
            v.preload = 'auto';
            v.src = url;
            v.muted = true;
            v.playsInline = true;
            v.crossOrigin = 'anonymous';
            // Calling load() encourages earlier network fetch
            try { v.load(); } catch {}
        });
    }, []);

    const flags = useMemo(() => {
        return flagFiles.map((url, i) => ({
            id: i,
            url: url,
            x: i % 2 === 0 ? -2 : 2,
            z: (i * SPACING),
        }));
    }, []);

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
        <AnimatePresence>
            <motion.div
                key="main-content"
                initial={{ opacity: 1, backgroundColor: '#FFF8F0' }}
                exit={{ opacity: 1 }}
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
                    pointerEvents: 'none',
                }}
            >
                <div className="w-[600px] h-[200px] relative overflow-hidden rounded-xl bg-[#fef3c7]">
                    <Canvas key="loading-canvas" shadows camera={{ position: [0, 1, 6], fov: 20 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} intensity={1} />
                        <CameraAnimator durationMs={durationMs} />

                        {/* CHANGED: isolate heavy loaders so they can’t block the whole scene */}
                        <Suspense fallback={null}>
                            <Environment preset="city" />
                        </Suspense>

                        <fog attach="fog" args={['#fef3c7', 8, 40]} />

                        <Suspense fallback={null}>
                            <group position={[0, -1, 0]}>
                                <Capy key="capy-loading" currentAnimation="run" scale={2.5} />
                            </group>
                        </Suspense>

                        {flags.map((flag) => (
                            <Suspense key={flag.id} fallback={null}>
                                <Billboard
                                    position={[flag.x, 0, flag.z]}
                                    videoUrl={flag.url}
                                    totalLength={TOTAL_LENGTH}
                                />
                            </Suspense>
                        ))}
                    </Canvas>
                </div>

                <div className="mt-1 text-center w-64">
                    <h2 className="text-gray-500 text-xs uppercase tracking-[0.25em] font-medium mb-3">
                        Traveling to the next kitchen...
                    </h2>
                    <div className="w-full h-0.5 bg-gray-300/50 rounded overflow-hidden">
                        <LoadingBar durationMs={durationMs} />
                    </div>
                </div>
            </motion.div>

            <motion.div
                key="black-overlay"
                initial={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 51,
                    backgroundColor: '#000000',
                    pointerEvents: 'none',
                }}
            />
        </AnimatePresence>
    );
}