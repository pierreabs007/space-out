'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh, Group } from 'three'

// Animated Sun
function Sun() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
    </mesh>
  )
}

// Animated Planet
function Planet({ 
  distance, 
  radius, 
  color, 
  speed, 
  name 
}: { 
  distance: number, 
  radius: number, 
  color: string, 
  speed: number,
  name: string
}) {
  const groupRef = useRef<Group>(null)
  const planetRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Orbit around sun
      groupRef.current.rotation.y = state.clock.elapsedTime * speed
    }
    if (planetRef.current) {
      // Planet self-rotation
      planetRef.current.rotation.y = state.clock.elapsedTime * 2
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={planetRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// Control Panel
function Controls({ 
  showOrbits, 
  setShowOrbits 
}: { 
  showOrbits: boolean, 
  setShowOrbits: (value: boolean) => void 
}) {
  return (
    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
      <h2 className="text-lg font-bold mb-4">🌌 Solar System</h2>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showOrbits}
          onChange={(e) => setShowOrbits(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">Show Orbit Paths</span>
      </label>
      <div className="mt-4 text-xs text-gray-400">
        <p>🎮 Left-click: Rotate</p>
        <p>🖱️ Right-click: Pan</p>
        <p>🔄 Scroll: Zoom</p>
      </div>
    </div>
  )
}

export default function SolarSystemWorking() {
  const [showOrbits, setShowOrbits] = useState(true)

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={20}
          maxDistance={500}
        />
        
        {/* Lights */}
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={2} />

        {/* Orbit Rings */}
        {showOrbits && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[15, 15.2, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[25, 25.2, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[35, 35.2, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[45, 45.2, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
          </>
        )}

        {/* Sun */}
        <Sun />

        {/* Planets */}
        <Planet distance={15} radius={1} color="#8C7853" speed={0.8} name="Mercury" />
        <Planet distance={25} radius={1.5} color="#FFC649" speed={0.6} name="Venus" />
        <Planet distance={35} radius={2} color="#6B93D6" speed={0.4} name="Earth" />
        <Planet distance={45} radius={1.5} color="#C1440E" speed={0.3} name="Mars" />
      </Canvas>

      {/* UI Controls */}
      <Controls showOrbits={showOrbits} setShowOrbits={setShowOrbits} />

      {/* Info HUD */}
      <div className="absolute bottom-4 right-4 text-white/80 text-sm bg-black/60 backdrop-blur-sm px-3 py-2 rounded">
        <p className="text-yellow-400 font-medium">⚠️ Simplified Scale</p>
        <p>Interactive 3D Solar System</p>
      </div>
    </div>
  )
}
