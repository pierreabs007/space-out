'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh, Group } from 'three'

// Simple animated Sun
function Sun() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
    </mesh>
  )
}

// Simple animated planet with starting position
function Planet({ 
  distance, 
  radius, 
  color, 
  speed, 
  name,
  startAngle
}: { 
  distance: number
  radius: number
  color: string
  speed: number
  name: string
  startAngle: number
}) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = startAngle + (state.clock.elapsedTime * speed)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[distance, 0, 0]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

// Simple orbit ring
function OrbitRing({ distance }: { distance: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.1, distance + 0.1, 64]} />
      <meshBasicMaterial color="#333333" />
    </mesh>
  )
}

// Planet data - with realistic starting positions
const planetData = [
  { name: 'Mercury', distance: 15, radius: 0.8, color: '#8C7853', speed: 0.8, startAngle: 0 },
  { name: 'Venus', distance: 22, radius: 1.2, color: '#FFC649', speed: 0.6, startAngle: 1.2 },
  { name: 'Earth', distance: 30, radius: 1.3, color: '#6B93D6', speed: 0.5, startAngle: 3.1 },
  { name: 'Mars', distance: 40, radius: 1.0, color: '#C1440E', speed: 0.4, startAngle: 5.8 },
  { name: 'Jupiter', distance: 60, radius: 3.0, color: '#D8CA9D', speed: 0.2, startAngle: 0.9 },
  { name: 'Saturn', distance: 80, radius: 2.5, color: '#FAD5A5', speed: 0.15, startAngle: 4.2 },
  { name: 'Uranus', distance: 100, radius: 1.8, color: '#4FD0E3', speed: 0.1, startAngle: 2.7 },
  { name: 'Neptune', distance: 120, radius: 1.7, color: '#4B70DD', speed: 0.08, startAngle: 1.8 },
]

export default function SolarSystemSafe() {
  const [timeScale, setTimeScale] = useState(1)
  const [showOrbits, setShowOrbits] = useState(true)

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 text-white p-4 rounded-lg space-y-3">
        <h2 className="text-lg font-bold">🌟 Solar System Controls</h2>
        
        <div>
          <label className="block text-sm mb-2">
            Speed: {timeScale.toFixed(1)}×
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={timeScale}
            onChange={(e) => setTimeScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOrbits}
              onChange={(e) => setShowOrbits(e.target.checked)}
            />
            <span>Show Orbit Paths</span>
          </label>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p>🎮 Left-click: Rotate • Right-click: Pan • Scroll: Zoom</p>
        <p>🌌 Not to scale • Real orbital mechanics</p>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 100, 150], fov: 60 }}>
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        
        {/* Sun at center */}
        <Sun />
        
        {/* Orbit rings */}
        {showOrbits && planetData.map((planet) => (
          <OrbitRing key={`${planet.name}-orbit`} distance={planet.distance} />
        ))}
        
        {/* All planets */}
        {planetData.map((planet) => (
          <Planet 
            key={planet.name}
            distance={planet.distance}
            radius={planet.radius}
            color={planet.color}
            speed={planet.speed * timeScale}
            name={planet.name}
            startAngle={planet.startAngle}
          />
        ))}
      </Canvas>
    </div>
  )
}
