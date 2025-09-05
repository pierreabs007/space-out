// Constants for scaling
export const AU_TO_UNITS = 30 // 1 AU = 30 units for visualization
export const SIZE_SCALE = 0.00005 // Scale factor for planet sizes (keeps Earth around 0.6 units)

export interface PlanetData {
  name: string
  color: string
  radiusKm: number
  distanceAu: number
  periodDays: number
  hasRings: boolean
  texture: string
  tiltDeg?: number
  inclination?: number    // orbital inclination in degrees
  eccentricity?: number   // orbital eccentricity (0-1)
}

export interface MoonData {
  name: string
  parent: string
  color: string
  radiusKm: number
  distanceFromParent: number // in planetary radii
  periodDays: number
  texture?: string
}

export const planets: PlanetData[] = [
  {
    name: 'Mercury',
    color: '#8C7853',
    radiusKm: 2439.7,
    distanceAu: 0.387,
    periodDays: 87.969,
    hasRings: false,
    texture: 'mercury.jpg',
    tiltDeg: 0.034
  },
  {
    name: 'Venus',
    color: '#FFC649',
    radiusKm: 6051.8,
    distanceAu: 0.723,
    periodDays: 224.701,
    hasRings: false,
    texture: 'venus.jpg',
    tiltDeg: 177.4
  },
  {
    name: 'Earth',
    color: '#6B93D6',
    radiusKm: 6371,
    distanceAu: 1.0,
    periodDays: 365.256,
    hasRings: false,
    texture: 'earth.jpg',
    tiltDeg: 23.44
  },
  {
    name: 'Mars',
    color: '#C1440E',
    radiusKm: 3389.5,
    distanceAu: 1.524,
    periodDays: 686.98,
    hasRings: false,
    texture: 'mars.jpg',
    tiltDeg: 25.19
  },
  {
    name: 'Jupiter',
    color: '#D8CA9D',
    radiusKm: 69911,
    distanceAu: 5.203,
    periodDays: 4332.589,
    hasRings: false,
    texture: 'jupiter.jpg',
    tiltDeg: 3.13
  },
  {
    name: 'Saturn',
    color: '#FAD5A5',
    radiusKm: 58232,
    distanceAu: 9.537,
    periodDays: 10759.22,
    hasRings: true,
    texture: 'saturn.jpg',
    tiltDeg: 26.73
  },
  {
    name: 'Uranus',
    color: '#4FD0E7',
    radiusKm: 25362,
    distanceAu: 19.191,
    periodDays: 30687.15,
    hasRings: false,
    texture: 'uranus.jpg',
    tiltDeg: 97.77
  },
  {
    name: 'Neptune',
    color: '#4B70DD',
    radiusKm: 24622,
    distanceAu: 30.068,
    periodDays: 60190.03,
    hasRings: false,
    texture: 'neptune.jpg',
    tiltDeg: 28.32
  },
  {
    name: 'Pluto',
    color: '#C5A572',
    radiusKm: 1188.3,
    distanceAu: 39.482,
    periodDays: 90560,
    hasRings: false,
    texture: 'pluto.jpg',
    tiltDeg: 122.53,
    inclination: 17.14,
    eccentricity: 0.248
  }
]

export const moons: MoonData[] = [
  // Earth's moon
  {
    name: 'Moon',
    parent: 'Earth',
    color: '#C9C9C9',
    radiusKm: 1737.4,
    distanceFromParent: 60, // ~60 Earth radii
    periodDays: 27.321,
    texture: 'moon.jpg'
  },
  // Mars moons
  {
    name: 'Phobos',
    parent: 'Mars',
    color: '#8C7853',
    radiusKm: 11.3,
    distanceFromParent: 2.76,
    periodDays: 0.319
  },
  {
    name: 'Deimos',
    parent: 'Mars',
    color: '#8C7853',
    radiusKm: 6.2,
    distanceFromParent: 6.94,
    periodDays: 1.263
  },
  // Jupiter moons (Galilean satellites)
  {
    name: 'Io',
    parent: 'Jupiter',
    color: '#FFFF99',
    radiusKm: 1821.6,
    distanceFromParent: 5.9,
    periodDays: 1.769
  },
  {
    name: 'Europa',
    parent: 'Jupiter',
    color: '#87CEEB',
    radiusKm: 1560.8,
    distanceFromParent: 9.4,
    periodDays: 3.551
  },
  {
    name: 'Ganymede',
    parent: 'Jupiter',
    color: '#A0A0A0',
    radiusKm: 2634.1,
    distanceFromParent: 15.0,
    periodDays: 7.155
  },
  {
    name: 'Callisto',
    parent: 'Jupiter',
    color: '#696969',
    radiusKm: 2410.3,
    distanceFromParent: 26.3,
    periodDays: 16.689
  },
  // Saturn moons
  {
    name: 'Titan',
    parent: 'Saturn',
    color: '#FFA500',
    radiusKm: 2574,
    distanceFromParent: 20.5,
    periodDays: 15.945
  },
  {
    name: 'Rhea',
    parent: 'Saturn',
    color: '#C0C0C0',
    radiusKm: 763.8,
    distanceFromParent: 8.8,
    periodDays: 4.518
  },
  // Pluto moon
  {
    name: 'Charon',
    parent: 'Pluto',
    color: '#8B8680',
    radiusKm: 606,
    distanceFromParent: 19.6, // Distance in Pluto radii
    periodDays: 6.387
  }
]

// Helper functions
export const getScaledRadius = (radiusKm: number): number => {
  return radiusKm * SIZE_SCALE
}

export const getScaledDistance = (distanceAu: number): number => {
  return distanceAu * AU_TO_UNITS
}

export const getMoonsForPlanet = (planetName: string): MoonData[] => {
  return moons.filter(moon => moon.parent === planetName)
}
