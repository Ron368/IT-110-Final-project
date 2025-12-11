import { useState } from 'react'; // Import useState
import { Head } from '@inertiajs/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Tonko } from '@/Components/Tonko';

export default function Welcome() {
    // State to hold the name of the active animation
    // CHANGE "Idle" TO MATCH YOUR EXACT ANIMATION NAME FROM CONSOLE
    const [animation, setAnimation] = useState("idle"); 

    return (
        <>
            <Head title="Animation Test" />
            
            <div className="relative w-full h-screen bg-gray-900 text-white overflow-hidden">
                
                {/* 3D SCENE */}
                <div className="absolute inset-0 z-0">
                    <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                        <Environment preset="city" />

                        <mesh position={[0, -1, 0]}>
                            {/* Pass the state to the component */}
                            <Tonko currentAnimation={animation} />
                        </mesh>

                        <OrbitControls enableZoom={true} />
                    </Canvas>
                </div>

                {/* CONTROL PANEL OVERLAY */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full pb-10 pointer-events-none">
                    <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl pointer-events-auto border border-gray-700">
                        <p className="text-center text-gray-400 mb-4 text-sm uppercase tracking-widest">Test Controls</p>
                        
                        <div className="flex gap-4">
                            {/* Create a button for each animation you have */}
                            {/* Update the names inside setAnimation('') to match your console logs EXACTLY */}
                            
                            <button onClick={() => setAnimation("idle")} className={`px-4 py-2 rounded-lg font-bold transition ${animation === "Idle" ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                                Idle
                            </button>

                            <button onClick={() => setAnimation("walk")} className={`px-4 py-2 rounded-lg font-bold transition ${animation === "Walk" ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                                Walk
                            </button>

                            <button onClick={() => setAnimation("run")} className={`px-4 py-2 rounded-lg font-bold transition ${animation === "Run" ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                                Run
                            </button>

                            <button onClick={() => setAnimation("wave")} className={`px-4 py-2 rounded-lg font-bold transition ${animation === "Wave" ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                                Wave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}