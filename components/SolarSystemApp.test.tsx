'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function SolarSystemAppTest() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 100, 10], fov: 75 }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        
        {/* Simple test mesh */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Earth test */}
        <mesh position={[30, 0, 0]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h2 className="text-lg font-bold">Test Mode</h2>
        <p>If you see this, the basic setup works!</p>
      </div>
    </div>
  )
}
