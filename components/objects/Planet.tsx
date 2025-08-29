'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Color } from 'three'
import { PlanetData, MoonData, getScaledDistance, getScaledRadius } from '@/lib/planets'
// import Moon from './Moon'
// import SaturnRings from './SaturnRings'

interface PlanetProps {
  data: PlanetData
  moons: MoonData[]
  time: number
  showOrbit: boolean
  showLabel: boolean
}

export default function Planet({ data, moons, time, showOrbit, showLabel }: PlanetProps) {
  const groupRef = useRef<Group>(null)
  const planetRef = useRef<Mesh>(null)

  const distance = getScaledDistance(data.distanceAu)
  const radius = getScaledRadius(data.radiusKm)

  // Load texture with fallback to color - Temporarily disabled
  // useEffect(() => {
  //   const loader = new TextureLoader()
  //   loader.load(
  //     `/textures/planets/${data.texture}`,
  //     (loadedTexture) => {
  //       setTexture(loadedTexture)
  //     },
  //     undefined,
  //     (error) => {
  //       console.warn(`Failed to load texture for ${data.name}: ${data.texture}`)
  //       setTexture(null)
  //     }
  //   )
  // }, [data.texture, data.name])

  useFrame(() => {
    if (groupRef.current) {
      // Orbital motion
      const angle = (time / data.periodDays) * 2 * Math.PI
      groupRef.current.position.x = Math.cos(angle) * distance
      groupRef.current.position.z = Math.sin(angle) * distance
    }

    if (planetRef.current) {
      // Planet rotation (faster than orbital motion)
      planetRef.current.rotation.y = time * 0.01
      
      // Apply axial tilt
      if (data.tiltDeg) {
        planetRef.current.rotation.z = (data.tiltDeg * Math.PI) / 180
      }
    }
  })

  // Create orbit line geometry
  const orbitPoints = []
  const segments = 128
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    orbitPoints.push(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    )
  }

  return (
    <>
      {/* Orbit Line - Temporarily disabled */}
      {false && showOrbit && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={orbitPoints.length / 3}
              array={new Float32Array(orbitPoints)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#444444" transparent opacity={0.3} />
        </line>
      )}

      {/* Planet Group */}
      <group ref={groupRef}>
        {/* Planet Sphere */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial 
            color={new Color(data.color)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Saturn's Rings - Temporarily disabled */}
        {/* {false && data.hasRings && data.name === 'Saturn' && (
          <SaturnRings planetRadius={radius} />
        )} */}

        {/* Planet Label - Temporarily disabled */}
        {/* {false && showLabel && (
          <div>{data.name}</div>
        )} */}

        {/* Moons - Temporarily disabled */}
        {/* {false && moons.map((moon) => (
          <Moon
            key={moon.name}
            data={moon}
            planetRadius={radius}
            time={time}
          />
        ))} */}
      </group>
    </>
  )
}
