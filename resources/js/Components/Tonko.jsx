import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Tonko({ currentAnimation, ...props }) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/Capy_animations.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    // TEST 1: Log available animations to verify they are loaded correctly
    console.log("Found animations:", Object.keys(actions));

    const action = actions[currentAnimation];

    // TEST 2: Play a specific animation by name
    if (action) {
      // 2. Fade out all other animations so they don't overlap
      // (This stops the "Idle" from playing while you try to "Run")
      Object.values(actions).forEach(act => act.fadeOut(0.5));

      // 3. Reset and Play the new one
      action.reset().fadeIn(0.5).play();
    } else {
      console.warn(`Animation "${currentAnimation}" not found! Available:`, Object.keys(actions));
    }

    // Cleanup: When component unmounts or animation changes
    return () => {
        if(action) action.fadeOut(0.5);
    }
  }, [currentAnimation, actions]); // Runs every time "currentAnimation" changes

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={3}>
          <skinnedMesh
            name="geometry_0"
            geometry={nodes.geometry_0.geometry}
            material={materials['Material_0.004']}
            skeleton={nodes.geometry_0.skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
         </group>
         <group name="world" />
      </group>
    </group>
  )
}

useGLTF.preload('/models/Capy_animations.glb')