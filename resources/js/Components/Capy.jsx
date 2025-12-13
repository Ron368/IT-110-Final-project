import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Capy(props) {
    const group = useRef();
    // 1. Load the new file
    const { scene, animations } = useGLTF('/models/capy_final.glb');

    console.log(animations.map(a => a.name));

    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        // 2. Automatically play the first animation found in the file
        if (animations.length > 0) {
            // Use the requested animation name, OR default to the first one in the list
            const animationName = props.currentAnimation || animations[0].name;
            const action = actions[animationName];

            if (action) {
                action.reset().fadeIn(0.5).play();
                return () => action.fadeOut(0.5);
            }
        }
    }, [actions, animations, props.currentAnimation]);

    return (
        <group 
            ref={group} 
            {...props} 
            dispose={null}
            key={`capy-${props.currentAnimation}`}
        >
            <primitive object={scene} />
        </group>
    );
}

// Preload to prevent lag
useGLTF.preload('/models/capy_final.glb');