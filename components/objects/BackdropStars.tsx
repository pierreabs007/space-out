'use client'

import React, { useMemo } from 'react'
import { Points, PointsMaterial } from 'three'

interface BackdropStarsProps {
  count: number
}

export default function BackdropStars({ count }: BackdropStarsProps) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Generate stars in a large sphere around the solar system
      const radius = 8000 + Math.random() * 2000 // 8000-10000 units away
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1) // Uniform distribution on sphere
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    
    return positions
  }, [count])

  const colors = useMemo(() => {
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Vary star colors slightly - mostly white with some blue/orange tint
      const variation = Math.random()
      if (variation < 0.1) {
        // Blue stars (hot)
        colors[i * 3] = 0.8 + Math.random() * 0.2     // R
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1 // G
        colors[i * 3 + 2] = 1.0                       // B
      } else if (variation < 0.2) {
        // Orange/red stars (cool)
        colors[i * 3] = 1.0                           // R
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3 // G
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.3 // B
      } else {
        // White stars (most common)
        const intensity = 0.8 + Math.random() * 0.2
        colors[i * 3] = intensity
        colors[i * 3 + 1] = intensity
        colors[i * 3 + 2] = intensity
      }
    }
    
    return colors
  }, [count])

  const sizes = useMemo(() => {
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Vary star sizes
      sizes[i] = Math.random() * 2 + 0.5 // 0.5 to 2.5
    }
    
    return sizes
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.8}
      />
    </points>
  )
}
