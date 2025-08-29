'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'

function SimpleCube() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function ThreeJsTest() {
  return (
    <div className="w-full h-screen bg-black">
      <div className="absolute top-4 left-4 text-white z-10 bg-black/50 p-4 rounded">
        <h2 className="text-xl font-bold">Three.js Test</h2>
        <p>You should see an orange cube below</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SimpleCube />
      </Canvas>
    </div>
  )
}
