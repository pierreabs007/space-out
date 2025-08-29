'use client'

import React, { useState, useEffect } from 'react'
import { TextureLoader, Color, DoubleSide } from 'three'

interface SaturnRingsProps {
  planetRadius: number
}

export default function SaturnRings({ planetRadius }: SaturnRingsProps) {
  const [ringTexture, setRingTexture] = useState<any>(null)

  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      '/textures/planets/saturn_rings.png',
      (loadedTexture) => {
        setRingTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.warn('Failed to load Saturn rings texture')
        setRingTexture(null)
      }
    )
  }, [])

  const innerRadius = planetRadius * 1.2
  const outerRadius = planetRadius * 2.2

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      {ringTexture ? (
        <meshBasicMaterial 
          map={ringTexture}
          side={DoubleSide}
          transparent
          opacity={0.8}
        />
      ) : (
        <meshBasicMaterial 
          color={new Color('#D4AF37')}
          side={DoubleSide}
          transparent
          opacity={0.6}
        />
      )}
    </mesh>
  )
}
