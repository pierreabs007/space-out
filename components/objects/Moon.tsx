


'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, TextureLoader, Color } from 'three'
import { MoonData, getScaledRadius } from '@/lib/planets'

interface MoonProps {
  data: MoonData
  planetRadius: number
  time: number
}

export default function Moon({ data, planetRadius, time }: MoonProps) {
  const groupRef = useRef<Group>(null)
  const moonRef = useRef<Mesh>(null)
  const [texture, setTexture] = useState<any>(null)

  const moonRadius = getScaledRadius(data.radiusKm)
  // Distance from planet surface (not center)
  const orbitDistance = planetRadius + (data.distanceFromParent * planetRadius * 0.1)

  // Load texture with fallback to color
  useEffect(() => {
    if (data.texture) {
      const loader = new TextureLoader()
      loader.load(
        `/textures/planets/${data.texture}`,
        (loadedTexture) => {
          setTexture(loadedTexture)
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture for moon ${data.name}: ${data.texture}`)
          setTexture(null)
        }
      )
    }
  }, [data.texture, data.name])

  useFrame(() => {
    if (groupRef.current) {
      // Moon orbital motion (much faster than realistic for visibility)
      const speed = 10 // Speed multiplier for moon orbits
      const angle = (time * speed / data.periodDays) * 2 * Math.PI
      
      groupRef.current.position.x = Math.cos(angle) * orbitDistance
      groupRef.current.position.z = Math.sin(angle) * orbitDistance
    }

    if (moonRef.current) {
      // Moon rotation
      moonRef.current.rotation.y = time * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[moonRadius, 16, 16]} />
        {texture ? (
          <meshStandardMaterial 
            map={texture}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial 
            color={new Color(data.color)}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>
    </group>
  )
}
