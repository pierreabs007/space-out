'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
// import { EffectComposer, Bloom } from '@react-three/postprocessing'
// import { KernelSize, Resolution } from 'postprocessing'
// import { Grid } from '@react-three/drei'

// Import our celestial objects
import Sun from './objects/Sun'
import Planet from './objects/Planet'
// import BackdropStars from './objects/BackdropStars'
// import Galaxy from './objects/Galaxy'
// import AsteroidBelt from './objects/AsteroidBelt'

// Import data
import { planets, getMoonsForPlanet } from '@/lib/planets'
import { ControlsState } from './SolarSystemApp'

interface SceneProps extends ControlsState {}

export default function Scene(props: SceneProps) {
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

      {/* Background - Temporarily disabled to test */}
      {/* {false && <BackdropStars count={5000} />} */}
      {/* {false && <Galaxy position={[-2000, 500, -1000]} />} */}
      {/* {false && <Galaxy position={[1500, -400, -1200]} />} */}

      {/* Reference Grid - Temporarily disabled to test */}
      {false && props.showGrid && (
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
            />
          )
        })}

        {/* Asteroid Belt - Temporarily disabled to test */}
        {/* {false && props.showAsteroidBelt && (
          <AsteroidBelt 
            time={timeRef.current}
            count={5000}
          />
        )} */}
      </group>

      {/* Post-processing effects - Temporarily disabled to test */}
      {/* {false && (
        <EffectComposer multisampling={4}>
          <Bloom
            kernelSize={KernelSize.LARGE}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.025}
            intensity={0.5}
            height={Resolution.AUTO_SIZE}
          />
        </EffectComposer>
      )} */}
    </>
  )
}
