'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color } from 'three'
import { AU_TO_UNITS } from '@/lib/planets'

interface AsteroidBeltProps {
  time: number
  count: number
}

export default function AsteroidBelt({ time, count }: AsteroidBeltProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])

  // Generate asteroid data
  const asteroids = useMemo(() => {
    const asteroidData = []
    const innerRadius = 2.2 * AU_TO_UNITS // Inner edge of belt
    const outerRadius = 3.2 * AU_TO_UNITS // Outer edge of belt

    for (let i = 0; i < count; i++) {
      // Random position in the belt
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 10 // Slight vertical spread

      // Random size and rotation speed
      const size = 0.1 + Math.random() * 0.3
      const rotationSpeed = (Math.random() - 0.5) * 0.02
      const orbitalSpeed = 1 / Math.sqrt(radius / AU_TO_UNITS) // Kepler's laws approximation

      asteroidData.push({
        radius,
        initialAngle: angle,
        y,
        size,
        rotationSpeed,
        orbitalSpeed,
        color: new Color().setHSL(0.05 + Math.random() * 0.1, 0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.3)
      })
    }

    return asteroidData
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return

    asteroids.forEach((asteroid, i) => {
      // Calculate orbital position
      const orbitalAngle = asteroid.initialAngle + (time * asteroid.orbitalSpeed * 0.001)
      const x = Math.cos(orbitalAngle) * asteroid.radius
      const z = Math.sin(orbitalAngle) * asteroid.radius

      // Set position
      tempObject.position.set(x, asteroid.y, z)
      
      // Set scale
      tempObject.scale.setScalar(asteroid.size)
      
      // Set rotation
      tempObject.rotation.x = time * asteroid.rotationSpeed
      tempObject.rotation.y = time * asteroid.rotationSpeed * 0.7
      tempObject.rotation.z = time * asteroid.rotationSpeed * 0.5

      // Update matrix
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)

      // Set color
      meshRef.current!.setColorAt(i, asteroid.color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, count]}
      castShadow
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  )
}
