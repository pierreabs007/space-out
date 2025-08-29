'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh, Group } from 'three'
import { planets, getScaledDistance, getScaledRadius } from '@/lib/planets'

// Animated Sun
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

// Animated Planet using real data
function Planet({ 
  data, 
  timeScale 
}: { 
  data: any, 
  timeScale: number
}) {
  const groupRef = useRef<Group>(null)
  const planetRef = useRef<Mesh>(null)

  const distance = getScaledDistance(data.distanceAu)
  const radius = getScaledRadius(data.radiusKm)

  useFrame((state) => {
    if (groupRef.current) {
      // Realistic orbital motion based on period
      const orbitalSpeed = (2 * Math.PI) / data.periodDays * timeScale * 0.001
      groupRef.current.rotation.y = state.clock.elapsedTime * orbitalSpeed
    }
    if (planetRef.current) {
      // Planet self-rotation (faster)
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.5
      
      // Apply axial tilt if specified
      if (data.tiltDeg) {
        planetRef.current.rotation.z = (data.tiltDeg * Math.PI) / 180
      }
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={planetRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={data.color} roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}

// Saturn's Rings
function SaturnRings({ distance, planetRadius }: { distance: number, planetRadius: number }) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Match Saturn's orbital motion
      const saturnData = planets.find(p => p.name === 'Saturn')
      if (saturnData) {
        const orbitalSpeed = (2 * Math.PI) / saturnData.periodDays * 1000 * 0.001
        groupRef.current.rotation.y = state.clock.elapsedTime * orbitalSpeed
      }
    }
  })

  const innerRadius = planetRadius * 1.2
  const outerRadius = planetRadius * 2.2

  return (
    <group ref={groupRef}>
      <mesh position={[distance, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial color="#D4AF37" />
      </mesh>
    </group>
  )
}

// Orbit Rings
function OrbitRings({ planets, showOrbits }: { planets: any[], showOrbits: boolean }) {
  if (!showOrbits) return null

  return (
    <>
      {planets.map((planet) => {
        const distance = getScaledDistance(planet.distanceAu)
        return (
          <mesh key={planet.name} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[distance - 0.5, distance + 0.5, 128]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
        )
      })}
    </>
  )
}

export default function SolarSystemFull() {
  const [timeScale, setTimeScale] = useState(1000)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [tilt, setTilt] = useState(10)

  const orbitControlsRef = useRef<any>(null)

  const resetView = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.set(0, 200, 300)
      orbitControlsRef.current.target.set(0, 0, 0)
      orbitControlsRef.current.update()
    }
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 200, 300], fov: 60 }}>
        <OrbitControls 
          ref={orbitControlsRef}
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={50}
          maxDistance={2000}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
        />
        
        {/* Lights */}
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} intensity={2} decay={0.5} />

        {/* Main solar system group with tilt */}
        <group rotation={[(tilt * Math.PI) / 180, 0, 0]}>
          {/* Orbit Rings */}
          <OrbitRings planets={planets} showOrbits={showOrbits} />

          {/* Sun */}
          <Sun />

          {/* All 8 Planets */}
          {planets.map((planet) => (
            <Planet 
              key={planet.name}
              data={planet}
              timeScale={timeScale}
            />
          ))}

          {/* Saturn's Rings */}
          <SaturnRings 
            distance={getScaledDistance(planets.find(p => p.name === 'Saturn')?.distanceAu || 9.537)}
            planetRadius={getScaledRadius(planets.find(p => p.name === 'Saturn')?.radiusKm || 58232)}
          />

          {/* Planet Labels - Simplified */}
          {showLabels && planets.map((planet) => {
            const distance = getScaledDistance(planet.distanceAu)
            const radius = getScaledRadius(planet.radiusKm)
            return (
              <mesh 
                key={`${planet.name}-label`} 
                position={[distance, radius + 3, 0]}
              >
                <planeGeometry args={[planet.name.length * 2, 3]} />
                <meshBasicMaterial color="white" />
              </mesh>
            )
          })}
        </group>
      </Canvas>

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white min-w-[300px] border border-white/20">
        <h2 className="text-lg font-bold mb-4">🌌 Solar System Viewer</h2>
        
        {/* Animation Speed */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Animation Speed: {timeScale}×
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={timeScale}
            onChange={(e) => setTimeScale(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setTimeScale(1000)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              1000×
            </button>
            <button
              onClick={() => setTimeScale(250)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              250×
            </button>
            <button
              onClick={() => setTimeScale(0)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Pause
            </button>
          </div>
        </div>

        {/* System Tilt */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            System Tilt: {tilt}°
          </label>
          <input
            type="range"
            min="-60"
            max="60"
            step="1"
            value={tilt}
            onChange={(e) => setTilt(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* View Reset */}
        <button
          onClick={resetView}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium mb-4"
        >
          🔄 Reset Camera View
        </button>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrbits}
              onChange={(e) => setShowOrbits(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">🌕 Show Orbit Paths</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">🏷️ Show Planet Labels</span>
          </label>
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-400">
          <p>🚀 Status: {timeScale === 0 ? 'Paused' : `${timeScale}× speed`}</p>
          <p>🪐 Planets: {planets.length} + Saturn's rings</p>
        </div>
      </div>

      {/* Info HUD */}
      <div className="absolute bottom-4 right-4 text-white/80 text-sm space-y-1">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded">
          <p>Left-click: Rotate • Right-click: Pan • Scroll: Zoom</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded text-center">
          <p className="text-yellow-400 font-medium">⚠️ Not to scale</p>
          <p>Distances and sizes adjusted for visualization</p>
        </div>
      </div>
    </div>
  )
}