'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, Mesh, Color, InstancedMesh, Object3D } from 'three'
import { planets, getMoonsForPlanet, getScaledDistance, getScaledRadius, AU_TO_UNITS } from '@/lib/planets'

// Control state interface
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

// Background Stars
function BackdropStars({ count }: { count: number }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const radius = 8000 + Math.random() * 2000
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    
    return positions
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        sizeAttenuation={false}
        color="white"
        transparent
        opacity={0.8}
      />
    </points>
  )
}

// Saturn's Rings
function SaturnRings({ planetRadius }: { planetRadius: number }) {
  const innerRadius = planetRadius * 1.2
  const outerRadius = planetRadius * 2.2

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshBasicMaterial 
        color={new Color('#D4AF37')}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

// Asteroid Belt
function AsteroidBelt({ time, count }: { time: number, count: number }) {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])

  // Generate asteroid data
  const asteroids = useMemo(() => {
    const asteroidData = []
    const innerRadius = 2.2 * AU_TO_UNITS
    const outerRadius = 3.2 * AU_TO_UNITS

    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 10

      const size = 0.1 + Math.random() * 0.3
      const rotationSpeed = (Math.random() - 0.5) * 0.02
      const orbitalSpeed = 1 / Math.sqrt(radius / AU_TO_UNITS)

      asteroidData.push({
        radius,
        initialAngle: angle,
        y,
        size,
        rotationSpeed,
        orbitalSpeed,
        color: new Color().setHSL(0.05 + Math.random() * 0.1, 0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.3)
      })
    }

    return asteroidData
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return

    asteroids.forEach((asteroid, i) => {
      const orbitalAngle = asteroid.initialAngle + (time * asteroid.orbitalSpeed * 0.001)
      const x = Math.cos(orbitalAngle) * asteroid.radius
      const z = Math.sin(orbitalAngle) * asteroid.radius

      tempObject.position.set(x, asteroid.y, z)
      tempObject.scale.setScalar(asteroid.size)
      tempObject.rotation.x = time * asteroid.rotationSpeed
      tempObject.rotation.y = time * asteroid.rotationSpeed * 0.7
      tempObject.rotation.z = time * asteroid.rotationSpeed * 0.5

      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
      meshRef.current!.setColorAt(i, asteroid.color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, count]}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  )
}

// Simple Moon
function Moon({ 
  data, 
  planetRadius, 
  time 
}: { 
  data: any, 
  planetRadius: number, 
  time: number 
}) {
  const groupRef = useRef<Group>(null)
  const moonRef = useRef<Mesh>(null)

  const moonRadius = getScaledRadius(data.radiusKm)
  const orbitDistance = planetRadius + (data.distanceFromParent * planetRadius * 0.1)

  useFrame(() => {
    if (groupRef.current) {
      const speed = 10
      const angle = (time * speed / data.periodDays) * 2 * Math.PI
      
      groupRef.current.position.x = Math.cos(angle) * orbitDistance
      groupRef.current.position.z = Math.sin(angle) * orbitDistance
    }

    if (moonRef.current) {
      moonRef.current.rotation.y = time * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[moonRadius, 12, 12]} />
        <meshStandardMaterial 
          color={new Color(data.color)}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

// Sun component
function Sun() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial 
        color={new Color('#FDB813')}
        emissive={new Color('#FDB813')}
        emissiveIntensity={0.6}
      />
    </mesh>
  )
}

// Planet component with all features
function Planet({ 
  data, 
  moons, 
  time, 
  showOrbit, 
  showLabel,
  showMoons
}: { 
  data: any, 
  moons: any[],
  time: number, 
  showOrbit: boolean, 
  showLabel: boolean,
  showMoons: boolean
}) {
  const groupRef = useRef<Group>(null)
  const planetRef = useRef<Mesh>(null)

  const distance = getScaledDistance(data.distanceAu)
  const radius = getScaledRadius(data.radiusKm)

  useFrame(() => {
    if (groupRef.current) {
      // Orbital motion
      const angle = (time / data.periodDays) * 2 * Math.PI
      groupRef.current.position.x = Math.cos(angle) * distance
      groupRef.current.position.z = Math.sin(angle) * distance
    }

    if (planetRef.current) {
      // Planet rotation
      planetRef.current.rotation.y = time * 0.01
      
      // Apply axial tilt
      if (data.tiltDeg) {
        planetRef.current.rotation.z = (data.tiltDeg * Math.PI) / 180
      }
    }
  })

  // Create orbit line points
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
      {/* Orbit Line */}
      {showOrbit && (
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

        {/* Saturn's Rings */}
        {data.hasRings && data.name === 'Saturn' && (
          <SaturnRings planetRadius={radius} />
        )}

        {/* Planet Label */}
        {showLabel && (
          <mesh position={[0, radius + 3, 0]} scale={[1, 1, 1]}>
            <planeGeometry args={[data.name.length * 1.2, 2]} />
            <meshBasicMaterial 
              color="white" 
              transparent 
              opacity={0.9}
            />
          </mesh>
        )}

        {/* Moons */}
        {showMoons && moons.map((moon) => (
          <Moon
            key={moon.name}
            data={moon}
            planetRadius={radius}
            time={time}
          />
        ))}
      </group>
    </>
  )
}

// Scene component
function Scene(props: ControlsState) {
  const solarSystemRef = useRef<Group>(null)
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    // Update time for animations
    timeRef.current += delta * props.timeScale

    // Apply tilt to entire solar system
    if (solarSystemRef.current) {
      solarSystemRef.current.rotation.x = (props.tilt * Math.PI) / 180
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.02} />
      <pointLight position={[0, 0, 0]} intensity={2} decay={0.5} />

      {/* Background */}
      <BackdropStars count={3000} />

      {/* Reference Grid */}
      {props.showGrid && (
        <gridHelper args={[2000, 100, '#444444', '#444444']} position={[0, 0, 0]} />
      )}

      {/* Main Solar System Group */}
      <group ref={solarSystemRef}>
        {/* Sun */}
        <Sun />

        {/* Planets */}
        {planets.map((planet) => {
          const planetMoons = props.showMoons ? getMoonsForPlanet(planet.name) : []
          
          return (
            <Planet
              key={planet.name}
              data={planet}
              moons={planetMoons}
              time={timeRef.current}
              showOrbit={props.showOrbits}
              showLabel={props.showLabels}
              showMoons={props.showMoons}
            />
          )
        })}

        {/* Asteroid Belt */}
        {props.showAsteroidBelt && (
          <AsteroidBelt 
            time={timeRef.current}
            count={2000}
          />
        )}
      </group>
    </>
  )
}

// Main Solar System App
export default function SolarSystemComplete() {
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
        <h2 className="text-lg font-bold mb-4">🌌 Solar System Viewer</h2>
        
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
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
            System Tilt: {controls.tilt}°
          </label>
          <input
            type="range"
            min="-60"
            max="60"
            step="1"
            value={controls.tilt}
            onChange={(e) => updateControl('tilt', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* View Controls */}
        <div className="mb-4">
          <button
            onClick={resetToTopDown}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
          >
            🔄 Reset to Top-Down View
          </button>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-2">
          {[
            { key: 'showOrbits' as const, label: '🌕 Show Orbit Paths' },
            { key: 'showLabels' as const, label: '🏷️ Show Planet Labels' },
            { key: 'showMoons' as const, label: '🌙 Show Moons' },
            { key: 'showAsteroidBelt' as const, label: '☄️ Show Asteroid Belt' },
            { key: 'showGrid' as const, label: '📏 Show Reference Grid' },
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

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-xs text-gray-400">
            🚀 Status: {controls.timeScale === 0 ? 'Paused' : `Running at ${controls.timeScale}× speed`}
          </p>
          <p className="text-xs text-gray-400">
            🎯 Objects: {planets.length} planets + moons + {controls.showAsteroidBelt ? '2000 asteroids' : 'no asteroids'}
          </p>
        </div>
      </div>

      {/* HUD */}
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
