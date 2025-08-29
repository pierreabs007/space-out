'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Sun() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
    </mesh>
  )
}

function Planet({ position, radius, color }: { position: [number, number, number], radius: number, color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function SolarSystemSimple() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 100, 10], fov: 75 }}>
        <OrbitControls />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        
        {/* Sun */}
        <Sun />
        
        {/* Planets */}
        <Planet position={[15, 0, 0]} radius={1} color="#8C7853" /> {/* Mercury */}
        <Planet position={[25, 0, 0]} radius={1.5} color="#FFC649" /> {/* Venus */}
        <Planet position={[35, 0, 0]} radius={2} color="#6B93D6" /> {/* Earth */}
        <Planet position={[45, 0, 0]} radius={1.5} color="#C1440E" /> {/* Mars */}
        <Planet position={[70, 0, 0]} radius={8} color="#D8CA9D" /> {/* Jupiter */}
        <Planet position={[100, 0, 0]} radius={7} color="#FAD5A5" /> {/* Saturn */}
        <Planet position={[140, 0, 0]} radius={4} color="#4FD0E7" /> {/* Uranus */}
        <Planet position={[170, 0, 0]} radius={4} color="#4B70DD" /> {/* Neptune */}
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h2 className="text-lg font-bold">🌌 Solar System Viewer</h2>
        <p className="text-sm">Use mouse to orbit, zoom, and pan</p>
        <p className="text-xs mt-2 opacity-75">Left click: rotate • Right click: pan • Scroll: zoom</p>
      </div>
    </div>
  )
}
