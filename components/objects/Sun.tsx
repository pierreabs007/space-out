'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Color } from 'three'

export default function Sun() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation for the sun
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial 
        color={new Color('#FDB813')}
        emissive={new Color('#FDB813')}
        emissiveIntensity={0.6}
      />
    </mesh>
  )
}
