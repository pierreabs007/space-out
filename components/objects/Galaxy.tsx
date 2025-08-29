'use client'

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, Vector3 } from 'three'

interface GalaxyProps {
  position: [number, number, number]
}

export default function Galaxy({ position }: GalaxyProps) {
  const pointsRef = useRef<Points>(null)

  // Generate spiral galaxy shape
  const { positions, colors } = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 400 + 50 // 50-450 units radius
      const spiralTight = 0.01 // How tight the spiral is
      const angle = radius * spiralTight + Math.random() * Math.PI * 2
      
      // Add some randomness to create multiple arms
      const armOffset = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3)
      const finalAngle = angle + armOffset

      // Position in spiral
      const x = Math.cos(finalAngle) * radius + (Math.random() - 0.5) * 20
      const z = Math.sin(finalAngle) * radius + (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 20 // Thin disk

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Color gradient from center to edge
      const centerDistance = Math.sqrt(x * x + z * z)
      const normalizedDistance = centerDistance / 450
      
      if (normalizedDistance < 0.3) {
        // Core: bright yellow/white
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 1.0
        colors[i * 3 + 2] = 0.8
      } else if (normalizedDistance < 0.7) {
        // Middle: white to blue
        const factor = (normalizedDistance - 0.3) / 0.4
        colors[i * 3] = 1.0 - factor * 0.3
        colors[i * 3 + 1] = 1.0 - factor * 0.2
        colors[i * 3 + 2] = 0.8 + factor * 0.2
      } else {
        // Outer: dim blue
        colors[i * 3] = 0.4
        colors[i * 3 + 1] = 0.5
        colors[i * 3 + 2] = 0.8
      }
    }

    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation for the galaxy
      pointsRef.current.rotation.y += 0.0005
      
      // Subtle pulsing opacity
      const opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      if (pointsRef.current.material) {
        ;(pointsRef.current.material as any).opacity = opacity
      }
    }
  })

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        sizeAttenuation={true}
        vertexColors
        transparent
        opacity={0.2}
      />
    </points>
  )
}
