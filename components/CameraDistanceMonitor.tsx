'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

interface CameraDistanceMonitorProps {
  onEasterEggTrigger: () => void
  isEasterEggActive: boolean
  isEasterEggCooldown: boolean
}

export default function CameraDistanceMonitor({ 
  onEasterEggTrigger, 
  isEasterEggActive, 
  isEasterEggCooldown 
}: CameraDistanceMonitorProps) {
  const { camera } = useThree()

  useFrame(() => {
    // Skip if Easter egg is already active or in cooldown
    if (isEasterEggActive || isEasterEggCooldown) return

    // Easter egg detection: Check if camera is very close to sun
    const sunPosition = new Vector3(0, 0, 0) // Sun is at origin
    const cameraPosition = camera.position
    const distanceToSun = cameraPosition.distanceTo(sunPosition)
    
    // Trigger Easter egg when camera is within ~6 units of sun center
    // (Sun radius is 4, so this means camera is ~2 units from surface)
    // At this distance, the sun would fill most/all of the screen
    if (distanceToSun <= 6) {
      onEasterEggTrigger()
    }
  })

  // This component doesn't render anything visible
  return null
}
