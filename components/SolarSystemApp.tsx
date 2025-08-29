'use client'

import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './Scene'

export interface ControlsState {
  timeScale: number
  tilt: number
  zoom: number
  showOrbits: boolean
  showLabels: boolean
  showMoons: boolean
  showAsteroidBelt: boolean
  showGrid: boolean
}

export default function SolarSystemApp() {
  const [controls, setControls] = useState<ControlsState>({
    timeScale: 1000,
    tilt: 10,
    zoom: 1300,
    showOrbits: true,
    showLabels: true,
    showMoons: true,
    showAsteroidBelt: true,
    showGrid: false,
  })

  const orbitControlsRef = useRef<any>(null)

  const updateControl = (key: keyof ControlsState, value: number | boolean) => {
    setControls(prev => ({ ...prev, [key]: value }))
  }

  const resetToTopDown = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.set(0, controls.zoom, 10)
      orbitControlsRef.current.target.set(0, 0, 0)
      orbitControlsRef.current.update()
    }
  }

  const resetZoom = (zoomValue: number) => {
    updateControl('zoom', zoomValue)
    if (orbitControlsRef.current) {
      const camera = orbitControlsRef.current.object
      const currentDirection = camera.position.clone().normalize()
      camera.position.copy(currentDirection.multiplyScalar(zoomValue))
      orbitControlsRef.current.update()
    }
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Main 3D Canvas */}
      <Canvas
        camera={{ position: [0, controls.zoom, 10], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <OrbitControls
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
          minDistance={150}
          maxDistance={4000}
          mouseButtons={{
            LEFT: 0, // Rotate
            MIDDLE: 1, // Zoom
            RIGHT: 2, // Pan
          }}
        />
        <Scene {...controls} />
      </Canvas>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white min-w-[300px] border border-white/20">
        <h2 className="text-lg font-bold mb-4">Solar System Controls</h2>
        
        {/* Animation Speed */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Animation Speed: {controls.timeScale}×
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={controls.timeScale}
            onChange={(e) => updateControl('timeScale', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => updateControl('timeScale', 1000)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              1000×
            </button>
            <button
              onClick={() => updateControl('timeScale', 250)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              250×
            </button>
            <button
              onClick={() => updateControl('timeScale', 0)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Pause
            </button>
          </div>
        </div>

        {/* Tilt */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Tilt: {controls.tilt}°
          </label>
          <input
            type="range"
            min="-60"
            max="60"
            step="1"
            value={controls.tilt}
            onChange={(e) => updateControl('tilt', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Zoom */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Zoom: {Math.round(controls.zoom)}
          </label>
          <input
            type="range"
            min="250"
            max="2500"
            step="50"
            value={controls.zoom}
            onChange={(e) => updateControl('zoom', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* View Controls */}
        <div className="mb-4">
          <button
            onClick={resetToTopDown}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
          >
            Reset to Top-Down View
          </button>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-2">
          {[
            { key: 'showOrbits' as const, label: 'Show Orbit Paths' },
            { key: 'showLabels' as const, label: 'Show Planet Labels' },
            { key: 'showMoons' as const, label: 'Show Moons' },
            { key: 'showAsteroidBelt' as const, label: 'Show Asteroid Belt' },
            { key: 'showGrid' as const, label: 'Show Reference Grid' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={controls[key]}
                onChange={(e) => updateControl(key, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* HUD */}
      <div className="absolute bottom-4 right-4 text-white/80 text-sm space-y-1">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded">
          <p>Left-click: Rotate • Right-click: Pan • Scroll: Zoom</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded text-center">
          <p className="text-yellow-400 font-medium">Not to scale</p>
          <p>Distances and sizes adjusted for visualization</p>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  )
}
