'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Color, CanvasTexture } from 'three'
import { PlanetData, MoonData, getScaledDistance, getScaledRadius } from '@/lib/planets'
// import Moon from './Moon'
// import SaturnRings from './SaturnRings'

// Create simple procedural Jupiter texture using Canvas (client-side only)
const createJupiterTexture = () => {
  // Only create on client side
  if (typeof window === 'undefined') return null
  
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Background base color
  ctx.fillStyle = '#D8CA9D'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw horizontal bands
  const bandHeight = canvas.height / 12
  for (let i = 0; i < 12; i++) {
    const y = i * bandHeight
    
    // Alternate between light and dark bands
    if (i % 2 === 0) {
      // Light zones (cream/beige)
      ctx.fillStyle = i % 4 === 0 ? '#F0E6D2' : '#E8DCC0'
    } else {
      // Dark belts (brown)
      ctx.fillStyle = i % 3 === 1 ? '#B8860B' : '#A0522D'
    }
    
    ctx.fillRect(0, y, canvas.width, bandHeight)
  }

  // Add Great Red Spot
  const grsX = canvas.width * 0.3
  const grsY = canvas.height * 0.65  // Southern hemisphere
  const grsWidth = canvas.width * 0.12
  const grsHeight = canvas.height * 0.08

  ctx.fillStyle = '#CC4C39'
  ctx.beginPath()
  ctx.ellipse(grsX, grsY, grsWidth / 2, grsHeight / 2, 0, 0, 2 * Math.PI)
  ctx.fill()

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

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

  // Create Jupiter procedural texture (only for Jupiter)
  const jupiterTexture = useMemo(() => {
    if (data.name === 'Jupiter') {
      console.log('🪐 Creating Jupiter texture...')
      const texture = createJupiterTexture()
      console.log('🪐 Jupiter texture created:', texture ? 'Success' : 'Failed')
      return texture
    }
    return null
  }, [data.name])

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
            map={jupiterTexture}
            color={jupiterTexture ? new Color(0xffffff) : (data.name === 'Jupiter' ? new Color(0xff0000) : new Color(data.color))}
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
