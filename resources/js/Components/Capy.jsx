import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Capy(props) {
    const group = useRef();
    const { scene, animations } = useGLTF('/models/capy_final.glb');

    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        if (animations.length > 0) {
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