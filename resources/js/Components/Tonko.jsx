import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Tonko({ currentAnimation = "run", ...props }) {
    const group = useRef();
    // Load your specific Capybara file
    const { nodes, materials, animations } = useGLTF('/models/tonko_animations.glb');
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        // Stop all previous animations
        Object.values(actions).forEach(action => action.stop());
        
        // Play the new one (if it exists)
        if (actions[currentAnimation]) {
            actions[currentAnimation].reset().fadeIn(0.5).play();
        }
    }, [currentAnimation, actions]);

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={nodes.Scene || nodes.root} />
        </group>
    );
}

// Pre-load the model so it doesn't pop in late
useGLTF.preload('/models/tonko_animations.glb');