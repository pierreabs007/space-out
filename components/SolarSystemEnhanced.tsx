'use client'

import React, { useRef, useState, useMemo, useEffect, createContext, useContext } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh, Group, InstancedMesh, Object3D, Vector2, Raycaster, Vector3, CanvasTexture, RepeatWrapping, ClampToEdgeWrapping, BackSide, TextureLoader } from 'three'
import { RotateCcw, EyeOff, Eye, Maximize, Info, ArrowLeft } from 'lucide-react'
import SunEasterEgg from './SunEasterEgg'
import MilkyWayEasterEgg from './MilkyWayEasterEgg'

// Video Cache Context for preloading celestial body videos
interface VideoCache {
  [key: string]: HTMLVideoElement | 'loading' | 'error'
}

interface VideoCacheContextType {
  cache: VideoCache
  isVideoReady: (fileName: string) => boolean
  getVideo: (fileName: string) => HTMLVideoElement | null
}

const VideoCacheContext = createContext<VideoCacheContextType | null>(null)

// Global video cache provider with background preloading
function VideoCacheProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef<VideoCache>({})
  const [cacheUpdated, setCacheUpdated] = useState(0) // Force re-renders when cache updates
  
  // Video loading priority (most likely to be viewed first)
  const loadingPriority = [
    'sun',         // Most central, likely to be hovered first
    'earth',       // Home planet
    'jupiter',     // Largest, most interesting
    'saturn',      // Most beautiful (rings)
    'mars',        // Popular planet
    'venus',       // Inner planet
    'mercury',     // Inner planet  
    'neptune',     // Outer planet
    'uranus',      // Outer planet
    'asteroid_belt', // Interesting feature
    'kuiper_belt'  // Distant feature
  ]
  
  useEffect(() => {
    console.log('🎬 Starting background video preloading...')
    
    const preloadVideo = async (fileName: string, index: number) => {
      // Stagger loading to prevent network overload
      await new Promise(resolve => setTimeout(resolve, index * 1000)) // 1 second between starts
      
      if (cache.current[fileName]) return // Already loading/loaded
      
      console.log(`🎬 Preloading ${fileName}.mp4...`)
      cache.current[fileName] = 'loading'
      
      const video = document.createElement('video')
      video.src = `/celestial_bodies/${fileName}.mp4`
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.preload = 'auto'
      
      const handleLoad = () => {
        console.log(`✅ Cached ${fileName}.mp4`)
        cache.current[fileName] = video
        setCacheUpdated(prev => prev + 1) // Trigger re-render
      }
      
      const handleError = () => {
        console.error(`❌ Failed to cache ${fileName}.mp4`)
        cache.current[fileName] = 'error'
        setCacheUpdated(prev => prev + 1)
      }
      
      video.addEventListener('canplaythrough', handleLoad)
      video.addEventListener('error', handleError)
      
      video.load()
    }
    
    // Start preloading all videos with priority
    loadingPriority.forEach((fileName, index) => {
      preloadVideo(fileName, index)
    })
    
  }, [])
  
  const isVideoReady = (fileName: string): boolean => {
    const cached = cache.current[fileName]
    return cached instanceof HTMLVideoElement
  }
  
  const getVideo = (fileName: string): HTMLVideoElement | null => {
    const cached = cache.current[fileName]
    if (cached instanceof HTMLVideoElement) {
      return cached.cloneNode(true) as HTMLVideoElement
    }
    return null
  }
  
  const contextValue: VideoCacheContextType = {
    cache: cache.current,
    isVideoReady,
    getVideo
  }
  
  return (
    <VideoCacheContext.Provider value={contextValue}>
      {children}
    </VideoCacheContext.Provider>
  )
}

function useVideoCache() {
  const context = useContext(VideoCacheContext)
  if (!context) {
    throw new Error('useVideoCache must be used within VideoCacheProvider')
  }
  return context
}

// Celestial body descriptions - Expanded with detailed information
const celestialInfo = {
  Sun: {
    name: "Sun",
    type: "G-type main-sequence star",
    description: "Our solar system's central star and the source of all life on Earth, containing 99.86% of the system's total mass.\n\nThis massive nuclear furnace converts 600 million tons of hydrogen into helium every second through nuclear fusion in its core, generating temperatures of 15 million°C at its center and 5,778K at its visible surface.\n\nThe Sun's immense gravitational pull holds all planets, moons, asteroids, and comets in their orbits. Its magnetic field extends throughout the solar system, creating the heliosphere that protects us from harmful cosmic radiation.\n\nWith a diameter of 1.39 million kilometers, you could fit over one million Earths inside it."
  },
  Mercury: {
    name: "Mercury",
    type: "Rocky planet",
    description: "The smallest and innermost planet in our solar system, Mercury is a world of extremes.\n\nWith no atmosphere to retain heat, it experiences the most dramatic temperature variations of any planet - scorching 427°C (800°F) on its sunlit side and freezing -173°C (-280°F) on its dark side.\n\nMercury has a large iron core making up 75% of its radius, giving it a magnetic field about 1% as strong as Earth's. One day on Mercury lasts 176 Earth days due to its slow rotation, while its year is only 88 Earth days.\n\nThe planet's heavily cratered surface resembles our Moon, with the massive Caloris Basin impact crater stretching 1,550 km across."
  },
  Venus: {
    name: "Venus",
    type: "Rocky planet", 
    description: "Often called Earth's 'evil twin,' Venus is the hottest planet in the solar system due to a runaway greenhouse effect.\n\nIts thick atmosphere, composed of 96% carbon dioxide with sulfuric acid clouds, traps heat so effectively that surface temperatures reach 462°C (864°F) - hot enough to melt lead. The atmospheric pressure is 92 times that of Earth, equivalent to being 900 meters underwater.\n\nVenus rotates backwards (retrograde) compared to most planets, possibly due to a massive ancient collision. One day on Venus is longer than its year - it takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.\n\nDespite being shrouded in thick clouds, radar mapping has revealed vast volcanic plains, mountain ranges, and impact craters."
  },
  Earth: {
    name: "Earth",
    type: "Rocky planet",
    description: "The only known planet harboring life, Earth is a rare gem in the cosmic void. About 71% of its surface is covered by liquid water oceans, with the remaining 29% consisting of continents and islands.\n\nOur planet sits in the 'Goldilocks Zone' - not too hot, not too cold - allowing liquid water to exist on its surface. Earth's protective magnetic field, generated by its molten iron core, deflects harmful solar radiation and cosmic rays.\n\nThe planet's tilted axis (23.5°) creates our seasons, while its single large moon stabilizes this tilt and creates ocean tides that may have been crucial for early life.\n\nEarth's atmosphere is 78% nitrogen and 21% oxygen, with trace amounts of other gases. The planet is geologically active with plate tectonics constantly reshaping its surface, and it hosts an estimated 8.7 million species of life."
  },
  "Earth-Moon-0": {
    name: "Moon (Luna)",
    type: "Natural satellite",
    description: "Earth's only natural satellite and our constant companion for over 4.5 billion years.\n\nFormed likely from debris after a Mars-sized object called Theia collided with early Earth, the Moon is unusually large relative to its parent planet - about 1/4 Earth's diameter.\n\nThe Moon's gravitational influence creates our ocean tides and helps stabilize Earth's axial tilt, preventing extreme climate variations. It's tidally locked to Earth, meaning the same side always faces us.\n\nIts surface is covered in impact craters, maria (dark volcanic plains), and regolith (powdered rock). The Moon has no atmosphere, no weather, and temperature variations from 127°C in sunlight to -173°C in shadow."
  },
  Mars: {
    name: "Mars",
    type: "Rocky planet",
    description: "Known as the 'Red Planet' due to iron oxide (rust) covering its surface, Mars has captivated human imagination for centuries.\n\nThis cold desert world has the largest volcano in the solar system - Olympus Mons, standing 21 km tall (nearly three times taller than Mount Everest). Mars also features Valles Marineris, a canyon system stretching over 4,000 km across its surface.\n\nEvidence of ancient river valleys, lake beds, and ocean basins suggests Mars once had a thicker atmosphere and liquid water on its surface billions of years ago. Today's thin atmosphere is 95% carbon dioxide, with dust storms that can engulf the entire planet.\n\nMars has two small, irregularly shaped moons - Phobos and Deimos - likely captured asteroids. A day on Mars is very similar to Earth at 24 hours 37 minutes, but its year is nearly twice as long at 687 Earth days."
  },
  "Mars-Moon-0": {
    name: "Phobos",
    type: "Natural satellite",
    description: "The larger and closer of Mars' two moons, Phobos is a small, irregular, potato-shaped object measuring just 27 × 22 × 18 kilometers. It orbits Mars at an extremely close distance of only 6,000 km above the surface - closer than any other moon orbits its planet in our solar system. This proximity means Phobos completes three orbits around Mars in a single Martian day (7.6 hours per orbit). The moon is gradually spiraling inward due to tidal forces and will either crash into Mars or break apart into a ring system in about 50 million years. Phobos is likely a captured asteroid from the asteroid belt, composed of carbon-rich rock. Its surface is heavily cratered, with the most prominent feature being Stickney crater - 9 km wide, nearly half the moon's diameter. From Mars' surface, Phobos would appear to rise in the west and set in the east, crossing the sky in just over 4 hours."
  },
  "Mars-Moon-1": {
    name: "Deimos", 
    type: "Natural satellite",
    description: "The smaller and more distant of Mars' two moons, Deimos is an irregularly shaped object measuring just 15 × 12 × 11 kilometers - small enough that you could drive around it in a car in less than an hour. It orbits Mars at a distance of 23,463 km, taking 30.3 hours to complete one orbit, which is longer than a Martian day. Like Phobos, Deimos is probably a captured asteroid from the asteroid belt, made of carbon-rich rock with a very low density. Its surface is smoother than Phobos due to a thick layer of regolith (loose rock particles) that has filled in many craters over time. The largest crater on Deimos is only 2.3 km across. From Mars' surface, Deimos would appear as a bright star, looking only slightly larger than Venus appears from Earth. Unlike Phobos, Deimos is slowly moving away from Mars and rising in the east and setting in the west like a normal moon."
  },
  Jupiter: {
    name: "Jupiter",
    type: "Gas giant",
    description: "The king of planets, Jupiter is a massive gas giant that contains more mass than all other planets in the solar system combined. This colossal world could fit over 1,300 Earths inside it and acts as the solar system's 'vacuum cleaner,' protecting inner planets by capturing or deflecting asteroids and comets with its immense gravity.\n\nJupiter's most famous feature is the Great Red Spot, a storm larger than Earth that has been raging for at least 400 years with winds up to 432 km/h. The planet rotates incredibly fast, completing a full rotation in just under 10 hours, causing its equatorial bulge and creating distinct atmospheric bands.\n\nJupiter has at least 95 known moons, including the four large Galilean moons discovered by Galileo in 1610. The planet is composed mainly of hydrogen and helium, similar to the Sun, and generates more heat than it receives from the Sun due to gravitational compression.\n\nJupiter's powerful magnetic field, 14 times stronger than Earth's, creates intense radiation belts and spectacular auroras at its poles."
  },
  "Jupiter-Moon-0": {
    name: "Io",
    type: "Galilean moon",
    description: "The most volcanically active body in the solar system, Io is constantly reshaped by over 400 active volcanoes that spew sulfur compounds up to 500 km high into space. This moon is caught in a gravitational tug-of-war between Jupiter and its neighboring moons Europa and Ganymede, creating tidal forces that flex Io's surface and generate the internal heat driving its volcanism. The moon's colorful surface is painted with yellows, reds, whites, and blacks from various sulfur compounds and silicate materials. Io has no water and virtually no atmosphere, with surface temperatures ranging from -143°C to -183°C. Despite being roughly the size of Earth's Moon, Io is the densest moon in the solar system due to its large iron core. The volcanic activity continuously resurfaces the moon, making it the youngest surface of any solid body in the solar system with no visible impact craters. Io completes one orbit around Jupiter every 42.5 hours and is tidally locked, always showing the same face to Jupiter."
  },
  "Jupiter-Moon-1": {
    name: "Europa",
    type: "Galilean moon", 
    description: "One of the most intriguing moons in the solar system, Europa hides a vast liquid water ocean beneath its smooth, icy surface - an ocean that may contain twice as much water as all of Earth's oceans combined. The moon's surface is one of the smoothest in the solar system, with very few craters, indicating it's geologically young and constantly renewed by geological processes. Dark linear features called lineae crisscross the surface, likely caused by tidal flexing that cracks the ice shell. Europa orbits Jupiter every 85 hours and is tidally locked. The subsurface ocean is kept liquid by tidal heating from Jupiter's gravity and may be in contact with the rocky mantle below, potentially providing the chemical ingredients necessary for life. The moon has a thin oxygen atmosphere produced by radiation splitting water molecules. Europa is considered one of the most promising places to search for extraterrestrial life in our solar system, leading to planned future missions to study its hidden ocean in detail."
  },
  "Jupiter-Moon-2": {
    name: "Ganymede",
    type: "Galilean moon",
    description: "The largest moon in the solar system, Ganymede is even bigger than the planets Mercury and Pluto, with a diameter of 5,268 km. This fascinating world is the only moon known to have its own magnetic field, likely generated by a liquid iron core deep beneath its surface. Ganymede's surface shows a complex history with both dark, heavily cratered regions (some of the oldest surfaces in the solar system) and lighter, grooved terrain formed by tectonic activity. Like Europa, Ganymede likely harbors a subsurface ocean beneath its icy crust - in fact, this ocean may contain more water than all Earth's oceans. The moon's interior is layered like an onion: a small iron core, surrounded by a rocky mantle, then a liquid water ocean, and finally an outer shell of ice. Ganymede has a thin oxygen atmosphere and experiences auroras at its poles due to its magnetic field interacting with Jupiter's magnetosphere. It completes one orbit around Jupiter every 172 hours and is part of a 1:2:4 orbital resonance with Io and Europa."
  },
  "Jupiter-Moon-3": {
    name: "Callisto",
    type: "Galilean moon",
    description: "The most heavily cratered body in the solar system, Callisto's ancient surface tells the story of the early solar system's violent past. This moon is composed of roughly equal parts rock and water ice, making it less dense than the other Galilean moons. Unlike Io, Europa, and Ganymede, Callisto shows little evidence of internal geological activity and has remained largely unchanged for billions of years. Its most prominent feature is the multi-ring impact basin Valhalla, with concentric rings extending up to 1,500 km from the center. Callisto orbits Jupiter at the greatest distance of the Galilean moons (1.88 million km), taking 400 hours (16.7 days) to complete one orbit. It's not part of the orbital resonance that affects the other three Galilean moons, which may explain its lack of tidal heating and geological activity. Despite its heavily cratered appearance, Callisto may also harbor a subsurface ocean, though much deeper than those of Europa and Ganymede. The moon has a very thin carbon dioxide atmosphere and experiences less radiation than the other Galilean moons due to its distance from Jupiter."
  },
  Saturn: {
    name: "Saturn", 
    type: "Gas giant",
    description: "The crown jewel of the solar system, Saturn is famous for its spectacular ring system - the most extensive and complex of any planet. This gas giant is the second-largest planet but has the lowest density of all planets, so low that it would actually float if you could find an ocean big enough!\n\nSaturn is composed mostly of hydrogen and helium, with a small rocky core surrounded by layers of metallic hydrogen and liquid hydrogen. The planet's rapid rotation (10.7 hours) creates a strong magnetic field and pronounced equatorial bulge.\n\nSaturn's rings are made of countless particles of water ice and rock debris, ranging from tiny grains to house-sized chunks, all orbiting in a disk less than 1 km thick but extending up to 282,000 km from the planet.\n\nSaturn has 146 known moons, including Titan (larger than Mercury with a thick atmosphere and methane lakes) and Enceladus (which shoots geysers of water ice from its south pole)."
  },
  "Saturn-Moon-0": {
    name: "Titan",
    type: "Natural satellite",
    description: "Saturn's largest moon and the second-largest moon in the solar system, Titan is the only moon with a substantial atmosphere and the only celestial body other than Earth known to have stable liquid on its surface - though these are lakes and rivers of methane and ethane rather than water. Titan's thick atmosphere is 95% nitrogen (like Earth's) but with methane clouds that create a complex weather system with methane rain, rivers, and seasonal changes. The atmospheric pressure at the surface is 50% greater than Earth's. Titan's surface features vast dune fields of organic particles, hydrocarbon lakes concentrated near the poles, and cryovolcanoes that erupt water ice and ammonia. The moon is larger than Mercury but less dense, composed of water ice and rock in roughly equal proportions. Titan likely has a subsurface ocean of liquid water beneath its icy crust. The thick atmosphere creates a strong greenhouse effect, maintaining surface temperatures around -179°C. Titan's organic chemistry makes it a natural laboratory for studying prebiotic conditions and it's considered one of the most Earth-like worlds in the solar system."
  },
  "Saturn-Moon-1": {
    name: "Rhea",
    type: "Natural satellite", 
    description: "Saturn's second-largest moon, Rhea is an icy world composed primarily of water ice with a small rocky core, giving it a low density of 1.23 g/cm³. With a diameter of 1,527 km, it's the ninth-largest moon in the solar system and the largest moon without a substantial atmosphere. Rhea's surface is heavily cratered, indicating an ancient age, with some craters having bright rays extending from them - evidence of relatively recent impacts that exposed fresh ice beneath the surface. The moon's leading hemisphere is more heavily cratered than its trailing hemisphere, suggesting that Saturn's magnetosphere affects the distribution of impact debris. Rhea has a very thin oxygen and carbon dioxide atmosphere, probably produced by the radiolysis of water ice on its surface by Saturn's radiation. The moon is tidally locked to Saturn, completing one orbit every 108.4 hours. Rhea may have had a ring system in the past, as suggested by observations of particle debris, which would make it the first moon known to have rings, though this remains unconfirmed."
  },
  Uranus: {
    name: "Uranus",
    type: "Ice giant",
    description: "The third-largest planet in our solar system, Uranus is unique for its extreme 98° axial tilt, essentially rotating on its side. This unusual orientation means that Uranus rolls along its orbital path like a ball rather than spinning like a top, causing each pole to experience 42 years of continuous sunlight followed by 42 years of darkness.\n\nThe planet appears blue-green due to methane in its atmosphere, which absorbs red light and reflects blue and green wavelengths back to space. Uranus is classified as an 'ice giant' because its interior contains more water, methane, and ammonia ices than the gas giants Jupiter and Saturn.\n\nThe planet has a faint ring system, discovered in 1977, consisting of 13 known rings made of dark particles. Uranus has 27 known moons, all named after characters from Shakespeare and Alexander Pope's works.\n\nWith surface temperatures reaching -224°C, Uranus is the coldest planet in the solar system despite not being the most distant from the Sun."
  },
  Neptune: {
    name: "Neptune", 
    type: "Ice giant",
    description: "The windiest planet in the solar system, Neptune features the fastest winds recorded on any planet, with speeds reaching up to 2,100 km/h (1,300 mph) - nearly supersonic by Earth standards. This deep blue world gets its striking color from methane in its atmosphere, which absorbs red light and gives the planet its distinctive azure appearance. Like Uranus, Neptune is an ice giant composed of water, methane, and ammonia ices surrounding a rocky core about the size of Earth. The planet takes 165 Earth years to complete one orbit around the Sun, meaning it has only completed one full orbit since its discovery in 1846. Neptune has 16 known moons, with Triton being by far the largest and most interesting - it's the only large moon in the solar system with a retrograde orbit, suggesting it's a captured Kuiper Belt object. Neptune has a faint ring system with five named rings. The planet radiates 2.6 times more energy than it receives from the Sun, indicating significant internal heat generation. Despite being 30 times farther from the Sun than Earth, Neptune's dynamic atmosphere shows active weather patterns including storm systems like the Great Dark Spot, comparable in size to Jupiter's Great Red Spot."
  },
  "Asteroid Belt": {
    name: "Asteroid Belt",
    type: "Asteroid region",
    description: "Located between Mars and Jupiter, the Asteroid Belt is a circumstellar disc containing hundreds of thousands of rocky objects ranging from tiny pebbles to dwarf planet-sized bodies. Despite popular depictions in movies, the asteroid belt is mostly empty space - the average distance between asteroids is over 1 million kilometers.\n\nThe total mass of all asteroids combined is less than 4% of the Moon's mass, with the dwarf planet Ceres making up about one-third of the belt's total mass. Most asteroids are composed of rock and metal, with three main types: C-type (carbonaceous, about 75%), S-type (silicate, about 17%), and M-type (metallic, about 8%).\n\nThe asteroid belt formed from planetesimals that were prevented from coalescing into a planet by Jupiter's powerful gravitational influence. Many asteroids show evidence of past collisions, and some have their own small moons.\n\nThe belt serves as a source of meteorites that occasionally reach Earth, providing valuable information about the early solar system's formation 4.6 billion years ago."
  },
  "Kuiper Belt": {
    name: "Kuiper Belt", 
    type: "Trans-Neptunian region",
    description: "Extending from Neptune's orbit to approximately 50 AU from the Sun, the Kuiper Belt is a vast, donut-shaped region of icy objects left over from the solar system's formation. This cold, distant realm contains hundreds of thousands of objects larger than 100 km across, including several dwarf planets like Pluto, Eris, Makemake, and Haumea. Kuiper Belt Objects (KBOs) are composed primarily of frozen methane, ammonia, and water - the building blocks that didn't get incorporated into planets during the solar system's formation. The belt is the source of short-period comets (those with orbital periods less than 200 years) that provide spectacular displays when they venture into the inner solar system. The region is named after astronomer Gerard Kuiper, who predicted its existence in 1951, though it wasn't discovered until 1992. The Kuiper Belt extends the habitable zone concept, as some of its larger objects may harbor subsurface oceans beneath their icy crusts. New Horizons' flyby of Pluto in 2015 and Arrokoth in 2019 provided our first close-up views of these mysterious, ancient worlds that preserve the conditions from the solar system's birth."
  }
}

// Background Stars - Star Wars style dense spherical starfield
function BackgroundStars({ count }: { count: number }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Create proper spherical distribution - closer for visibility  
      const radius = 800 + Math.random() * 400 // Closer but still behind outer planets
      
      // Uniform distribution on sphere surface using correct spherical coordinates
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u // Azimuthal angle (0 to 2π)
      const phi = Math.acos(2 * v - 1) // Polar angle with uniform distribution (0 to π)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Star colors - More blue than yellow hue
      const dimness = 0.05 + Math.random() * 0.075 // 0.05 to 0.125 (very very dim)
      const starType = Math.random()
      if (starType < 0.5) {
        // Blue-white stars (most common - 50%)
        colors[i * 3] = dimness * 0.7     // Less red
        colors[i * 3 + 1] = dimness * 0.85 // Less green
        colors[i * 3 + 2] = dimness        // Full blue
      } else if (starType < 0.8) {
        // Cool white stars with blue tint (30%)
        colors[i * 3] = dimness * 0.9     // Slightly less red
        colors[i * 3 + 1] = dimness * 0.95 // Slightly less green
        colors[i * 3 + 2] = dimness        // Full blue for cooler tone
      } else if (starType < 0.95) {
        // Pure blue stars (15%)
        colors[i * 3] = dimness * 0.5     // Much less red
        colors[i * 3 + 1] = dimness * 0.7  // Less green
        colors[i * 3 + 2] = dimness        // Full blue
      } else {
        // Very few yellow stars (5%)
        colors[i * 3] = dimness
        colors[i * 3 + 1] = dimness
        colors[i * 3 + 2] = dimness * 0.6  // Reduced blue for yellow tint
      }
    }
    
    return { positions, colors }
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={2.5} 
        vertexColors={true}
        sizeAttenuation={false}
        transparent={true}
        opacity={0.8}
      />
    </points>
  )
}

// Inner Stars - Closer stars for visibility between planet orbits
function InnerStars({ count }: { count: number }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Much closer stars for visibility between planets
      const radius = 200 + Math.random() * 400 // Between inner and outer planets
      
      // Uniform distribution on sphere surface
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Even dimmer colors for inner stars - 50% dimmer than before
      const dimness = 0.025 + Math.random() * 0.05 // 0.025 to 0.075 (extremely dim for inner stars)
      const starType = Math.random()
      if (starType < 0.8) {
        colors[i * 3] = dimness
        colors[i * 3 + 1] = dimness
        colors[i * 3 + 2] = dimness
      } else if (starType < 0.9) {
        colors[i * 3] = dimness * 0.8
        colors[i * 3 + 1] = dimness * 0.9
        colors[i * 3 + 2] = dimness
      } else {
        colors[i * 3] = dimness
        colors[i * 3 + 1] = dimness
        colors[i * 3 + 2] = dimness * 0.6
      }
    }
    
    return { positions, colors }
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={1.8} 
        vertexColors={true}
        sizeAttenuation={false}
        transparent={true}
        opacity={0.6}
      />
    </points>
  )
}

// Simple video component for celestial body animations
function CelestialBodyMedia({ celestialBody }: { celestialBody: any }) {
  // Map celestial body names to MP4 file names
  const getFileName = (name: string) => {
    const nameMap: { [key: string]: string } = {
      'Sun': 'sun',
      'Earth': 'earth',
      'Mars': 'mars',
      'Jupiter': 'jupiter',
      'Saturn': 'saturn',
      'Venus': 'venus',
      'Mercury': 'mercury',
      'Uranus': 'uranus',
      'Neptune': 'neptune',
      'Asteroid Belt': 'asteroid_belt',
      'Kuiper Belt': 'kuiper_belt'
    }
    return nameMap[name] || 'earth'
  }
  
  const fileName = getFileName(celestialBody.name)
  const videoSrc = `/celestial_bodies/${fileName}.mp4`
  
  console.log(`🎬 Rendering video component for ${celestialBody.name}: ${videoSrc}`)

  return (
    <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden mb-3">
      <video
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onLoadStart={() => console.log(`🎬 Loading started: ${celestialBody.name}`)}
        onCanPlay={() => console.log(`✅ Can play: ${celestialBody.name}`)}
        onError={(e) => console.error(`❌ Video error for ${celestialBody.name}:`, e)}
      />
    </div>
  )
}

// Milky Way - Real astronomical image background
function MilkyWay({ brightness }: { brightness: number }) {
  const [milkyWayTexture, setMilkyWayTexture] = useState<any>(null)
  
  useEffect(() => {
    console.log('🌌 Loading real Milky Way image...')
    
    const loader = new TextureLoader()
    loader.load(
      '/milky-way-panorama.jpg',  // Your real Milky Way image
      (texture) => {
        console.log('🌌 Real Milky Way image loaded successfully!')
        texture.wrapS = RepeatWrapping
        texture.wrapT = ClampToEdgeWrapping
        texture.flipY = false
        setMilkyWayTexture(texture)
      },
      (progress) => {
        console.log('🌌 Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%')
      },
      (error) => {
        console.error('🌌 Failed to load Milky Way image:', error)
        console.log('🌌 Make sure milky-way-panorama.jpg is saved in the /public folder')
        
        // Simple fallback if image fails to load
        setMilkyWayTexture(null)
      }
    )
  }, [])

  // Don't render anything if texture hasn't loaded or brightness is 0
  if (!milkyWayTexture || brightness === 0) {
    return null
  }

  return (
    <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
      <sphereGeometry args={[800, 64, 32]} />
      <meshBasicMaterial 
        map={milkyWayTexture}
        side={BackSide}  // Render inside faces so we see it from inside
        transparent
        opacity={brightness}  // Use slider-controlled brightness
        depthWrite={false}
      />
    </mesh>
  )
}

// Asteroid Belt - Individual orbital paths
function AsteroidBelt({ 
  show, 
  timeScale, 
  onHover, 
  onUnhover 
}: { 
  show: boolean, 
  timeScale: number,
  onHover?: (info: any) => void,
  onUnhover?: () => void 
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const count = 1000

  const asteroidData = useMemo(() => {
    const data = []
    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 20 // Between Mars (40) and Jupiter (75) with clear separation
      const startAngle = Math.random() * Math.PI * 2 // Random starting position
      const height = (Math.random() - 0.5) * 3
      const scale = 0.1 + Math.random() * 0.15
      // Individual orbital speeds based on distance (realistic physics) - same direction as planets
      const baseSpeed = 0.0002
      const speed = baseSpeed / Math.sqrt(radius / 50) // Kepler's laws: farther = slower
      const rotationSpeed = Math.random() * 0.05 // Individual rotation
      
      data.push({ radius, startAngle, height, scale, speed, rotationSpeed })
    }
    return data
  }, [])

  useFrame((state) => {
    if (!show || !meshRef.current) return

    asteroidData.forEach((asteroid, i) => {
      // Fix: Asteroids must rotate in SAME direction as planets - use NEGATIVE to match
      const currentAngle = asteroid.startAngle - (state.clock.elapsedTime * asteroid.speed * timeScale)
      const rotationAngle = state.clock.elapsedTime * asteroid.rotationSpeed * timeScale
      
      tempObject.position.set(
        Math.cos(currentAngle) * asteroid.radius,
        asteroid.height,
        Math.sin(currentAngle) * asteroid.radius
      )
      tempObject.scale.setScalar(asteroid.scale)
      tempObject.rotation.x = rotationAngle
      tempObject.rotation.y = rotationAngle * 1.5
      tempObject.rotation.z = rotationAngle * 0.7
      tempObject.updateMatrix()
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!show) return null

  return (
    <group>
      {/* Visible asteroids - unchanged */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#666666" />
      </instancedMesh>
      
      {/* Invisible wide hover area - same thickness as orbit paths */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation()
          if (onHover) {
            onHover(celestialInfo["Asteroid Belt"])
          }
        }}
        onPointerLeave={() => {
          if (onUnhover) {
            onUnhover()
          }
        }}
      >
        <ringGeometry args={[48, 72, 64]} />
        <meshBasicMaterial 
          transparent 
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}

// Simple animated Sun
function Sun({ onHover, onUnhover }: { onHover: (info: any) => void, onUnhover: () => void }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh 
      ref={meshRef}
      onPointerEnter={(e) => {
        e.stopPropagation()
        onHover(celestialInfo.Sun)
      }}
      onPointerLeave={() => onUnhover()}
    >
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
    </mesh>
  )
}

// Moon component - orbits around its parent planet with starting position
function Moon({ 
  distance, 
  radius, 
  color, 
  speed,
  startAngle,
  name,
  onHover,
  onUnhover
}: {
  distance: number
  radius: number
  color: string
  speed: number
  startAngle: number
  name: string
  onHover: (info: any) => void
  onUnhover: () => void
}) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Moon orbits around the planet with its own starting position
      const moonAngle = startAngle + (state.clock.elapsedTime * speed)
      groupRef.current.rotation.y = moonAngle
    }
  })

  return (
    <group ref={groupRef}>
      <mesh 
        position={[distance, 0, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation()
          const info = celestialInfo[name as keyof typeof celestialInfo]
          if (info) onHover(info)
        }}
        onPointerLeave={() => onUnhover()}
      >
        <sphereGeometry args={[radius, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

// Saturn's Rings - rotates with Saturn and follows its orbital mechanics
function SaturnRings({ planet, timeScale }: { 
  planet: any
  timeScale: number
}) {
  const groupRef = useRef<Group>(null)
  const ringsGroupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && ringsGroupRef.current) {
      const angle = planet.startAngle + (state.clock.elapsedTime * planet.speed * timeScale)
      
      // Apply same orbital mechanics as Saturn
      const currentDistance = planet.distance * (1 - planet.eccentricity * Math.cos(angle))
      
      groupRef.current.rotation.y = angle
      
      ringsGroupRef.current.position.x = currentDistance
      ringsGroupRef.current.position.y = Math.sin(angle) * planet.inclination * 5
      ringsGroupRef.current.rotation.z = planet.axialTilt
    }
  })

  return (
    <group ref={groupRef} rotation={[planet.inclination * Math.PI / 180, 0, 0]}>
      <group ref={ringsGroupRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 4.2, 32]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
      </group>
    </group>
  )
}

// Enhanced Earth with day/night, clouds, and realistic features
function EnhancedEarth({ 
  distance, 
  radius, 
  speed, 
  name,
  startAngle,
  moons,
  timeScale,
  onHover,
  onUnhover
}: { 
  distance: number
  radius: number
  speed: number
  name: string
  startAngle: number
  moons?: any[]
  timeScale: number
  onHover: (info: any) => void
  onUnhover: () => void
}) {
  const groupRef = useRef<Group>(null)
  const earthRef = useRef<Mesh>(null)
  const cloudsRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = startAngle + (state.clock.elapsedTime * speed)
    }
    if (earthRef.current) {
      // Earth rotates once every 24 hours (much faster in our time scale)
      earthRef.current.rotation.y += 0.01 * timeScale * 0.001
    }
    if (cloudsRef.current) {
      // Clouds rotate slightly faster than Earth
      cloudsRef.current.rotation.y += 0.012 * timeScale * 0.001
    }
  })

  return (
    <group ref={groupRef}>
      <group position={[distance, 0, 0]}>
        {/* Earth Surface - Procedural realistic texture */}
        <mesh
          ref={earthRef}
          onPointerEnter={(e) => {
            e.stopPropagation()
            const info = celestialInfo[name as keyof typeof celestialInfo]
            if (info) onHover(info)
          }}
          onPointerLeave={() => onUnhover()}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            roughness={0.1}
            metalness={0.0}
            emissive="#111111"
            emissiveIntensity={0.3}
          >
            <primitive 
              attach="map" 
              object={useMemo(() => {
                // Create ultra high-resolution procedural Earth texture
                const canvas = document.createElement('canvas')
                canvas.width = 4096  // Ultra high resolution for crisp details
                canvas.height = 2048
                const ctx = canvas.getContext('2d')!
                
                // Base ocean color - NUCLEAR ELECTRIC BLUE
                ctx.fillStyle = '#00FFFF' // PURE CYAN - MAXIMUM POSSIBLE SATURATION!
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                // Function to draw RECOGNIZABLE continent shapes
                const drawRecognizableContinent = (points: number[][], color: string) => {
                  ctx.fillStyle = color
                  ctx.beginPath()
                  ctx.moveTo(points[0][0], points[0][1])
                  
                  for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i][0], points[i][1])
                  }
                  ctx.closePath()
                  ctx.fill()
                }
                
                // NORTH AMERICA - Ultra detailed with MAXIMUM VIBRANCY
                drawRecognizableContinent([
                  // Arctic Canada archipelago
                  [300, 180], [450, 170], [600, 175], [750, 185], [900, 200], [950, 220],
                  // Hudson Bay area
                  [920, 250], [900, 280], [850, 300], [800, 310], [750, 320],
                  // Great Lakes region
                  [700, 340], [650, 360], [600, 370], [550, 375], [500, 380],
                  // Eastern seaboard detail
                  [480, 400], [470, 450], [465, 500], [460, 550], [455, 600],
                  // Florida peninsula - very detailed
                  [465, 650], [475, 700], [485, 750], [490, 800], [485, 820], [475, 810],
                  // Gulf of Mexico coastline
                  [450, 800], [400, 790], [350, 780], [300, 775], [250, 770],
                  // Texas-Mexico coast
                  [200, 775], [180, 800], [170, 830], [165, 860],
                  // Mexico narrowing dramatically
                  [170, 900], [175, 940], [180, 980], [185, 1020],
                  // Central America bridge
                  [190, 1060], [195, 1100], [200, 1140], [205, 1180],
                  // West coast back up - California, Oregon, Washington
                  [190, 1160], [180, 1120], [170, 1080], [160, 1040], [150, 1000],
                  [140, 960], [130, 920], [120, 880], [110, 840], [105, 800],
                  [100, 760], [95, 720], [90, 680], [85, 640], [80, 600],
                  // Pacific Northwest
                  [75, 560], [70, 520], [65, 480], [60, 440], [55, 400],
                  // Alaska - very detailed
                  [40, 360], [20, 340], [10, 320], [15, 300], [25, 285], [40, 275],
                  [60, 270], [80, 275], [100, 285], [120, 300], [140, 320],
                  // Canadian Rockies and prairie
                  [160, 340], [200, 350], [250, 360], [300, 350], [350, 340],
                  [400, 330], [450, 320], [500, 310], [550, 300], [600, 290],
                  [650, 280], [700, 270], [750, 260], [800, 250], [850, 240],
                  [900, 230], [950, 220], [980, 210], [1000, 195], [950, 180],
                  [900, 175], [850, 172], [800, 170], [750, 169], [700, 170],
                  [650, 172], [600, 175], [550, 178], [500, 180], [450, 175],
                  [400, 172], [350, 175]
                ], '#00FF00') // PURE GREEN - NUCLEAR INTENSITY!
                
                // SOUTH AMERICA - Ultra detailed classic elongated shape
                drawRecognizableContinent([
                  // Venezuela and Guyana coastline
                  [450, 1200], [500, 1190], [550, 1195], [600, 1205], [650, 1220],
                  // Brazilian Atlantic bulge - very detailed
                  [700, 1240], [750, 1260], [800, 1290], [830, 1330], [850, 1380],
                  [860, 1430], [865, 1480], [870, 1530], [875, 1580], [880, 1630],
                  // Southern Brazil
                  [875, 1680], [870, 1730], [860, 1780], [850, 1830], [835, 1880],
                  // Uruguay and northern Argentina
                  [820, 1920], [800, 1960], [780, 2000], [760, 2040], [740, 2080],
                  // Argentina eastern coast
                  [720, 2120], [700, 2160], [680, 2200], [660, 2240], [640, 2280],
                  [620, 2320], [600, 2360], [580, 2400], [560, 2440], [540, 2480],
                  // Patagonia and Tierra del Fuego
                  [520, 2520], [500, 2560], [485, 2600], [475, 2640], [470, 2680],
                  [465, 2720], [460, 2760], [455, 2800], [450, 2840], [445, 2880],
                  // Chile - ultra narrow Pacific coast
                  [440, 2860], [435, 2820], [430, 2780], [425, 2740], [420, 2700],
                  [415, 2660], [410, 2620], [405, 2580], [400, 2540], [395, 2500],
                  [390, 2460], [385, 2420], [380, 2380], [375, 2340], [370, 2300],
                  [365, 2260], [360, 2220], [355, 2180], [350, 2140], [345, 2100],
                  [340, 2060], [335, 2020], [330, 1980], [325, 1940], [320, 1900],
                  // Peru and Ecuador Pacific coast
                  [315, 1860], [310, 1820], [305, 1780], [300, 1740], [295, 1700],
                  [290, 1660], [285, 1620], [280, 1580], [275, 1540], [270, 1500],
                  // Colombia Pacific
                  [265, 1460], [260, 1420], [255, 1380], [250, 1340], [245, 1300],
                  [250, 1270], [260, 1250], [280, 1235], [310, 1225], [350, 1218],
                  [390, 1215], [420, 1210]
                ], '#FF0066') // NUCLEAR HOT PINK - BLAZING INTENSITY!
                
                // AFRICA - Classic inverted triangle with MAXIMUM detail
                drawRecognizableContinent([
                  // Morocco and Northwest Africa
                  [1100, 800], [1150, 790], [1200, 785], [1250, 790], [1300, 800],
                  // North Africa - Mediterranean coast
                  [1350, 810], [1400, 820], [1450, 830], [1500, 845], [1550, 865],
                  [1600, 890], [1650, 920], [1700, 955], [1750, 995], [1800, 1040],
                  // Red Sea and Horn of Africa - very detailed
                  [1820, 1090], [1835, 1140], [1845, 1190], [1850, 1240], [1855, 1290],
                  [1860, 1340], [1865, 1390], [1868, 1440], [1870, 1490], [1872, 1540],
                  // Somalia cape detail
                  [1875, 1590], [1880, 1640], [1882, 1690], [1880, 1740], [1875, 1790],
                  // East African coast - Kenya, Tanzania
                  [1870, 1840], [1865, 1890], [1860, 1940], [1855, 1990], [1850, 2040],
                  // Mozambique coast
                  [1845, 2090], [1840, 2140], [1835, 2190], [1830, 2240], [1825, 2290],
                  [1820, 2340], [1815, 2390], [1810, 2440], [1805, 2490], [1800, 2540],
                  // South Africa eastern coast
                  [1795, 2590], [1790, 2640], [1785, 2690], [1780, 2740], [1775, 2790],
                  // Cape of Good Hope - detailed point
                  [1770, 2840], [1765, 2890], [1755, 2940], [1740, 2985], [1720, 3025],
                  [1695, 3060], [1665, 3090], [1630, 3115], [1590, 3135], [1545, 3150],
                  // South Africa west coast
                  [1500, 3145], [1460, 3135], [1425, 3120], [1395, 3100], [1370, 3075],
                  // Namibia coast
                  [1350, 3045], [1335, 3010], [1325, 2970], [1320, 2925], [1315, 2880],
                  [1310, 2835], [1305, 2790], [1300, 2745], [1295, 2700], [1290, 2655],
                  // Angola coast
                  [1285, 2610], [1280, 2565], [1275, 2520], [1270, 2475], [1265, 2430],
                  [1260, 2385], [1255, 2340], [1250, 2295], [1245, 2250], [1240, 2205],
                  // Congo and Cameroon coast
                  [1235, 2160], [1230, 2115], [1225, 2070], [1220, 2025], [1215, 1980],
                  [1210, 1935], [1205, 1890], [1200, 1845], [1195, 1800], [1190, 1755],
                  // West African bulge - Ghana, Nigeria, Ivory Coast
                  [1185, 1710], [1180, 1665], [1175, 1620], [1170, 1575], [1165, 1530],
                  [1160, 1485], [1155, 1440], [1150, 1395], [1145, 1350], [1140, 1305],
                  // Senegal and northwest coast back
                  [1135, 1260], [1130, 1215], [1125, 1170], [1120, 1125], [1115, 1080],
                  [1110, 1035], [1105, 990], [1100, 945], [1095, 900], [1090, 855]
                ], '#FFFF00') // PURE YELLOW - BLINDING INTENSITY!
                
                // EUROPE - Detailed but compact
                drawRecognizableContinent([
                  // Scandinavia
                  [1050, 600], [1100, 590], [1150, 595], [1200, 605], [1230, 625],
                  // Eastern Europe
                  [1240, 660], [1245, 700], [1250, 740], [1255, 780], [1260, 820],
                  // Black Sea area
                  [1265, 860], [1260, 900], [1250, 935], [1235, 965], [1215, 990],
                  // Mediterranean back west
                  [1190, 1005], [1160, 1015], [1125, 1020], [1090, 1015], [1060, 1005],
                  [1035, 990], [1015, 970], [1000, 945], [990, 915], [985, 880],
                  [980, 845], [975, 810], [970, 775], [965, 740], [960, 705],
                  [955, 670], [950, 635], [955, 605], [970, 580], [995, 565],
                  [1025, 575]
                ], '#00FFFF') // PURE CYAN - NUCLEAR GLOW!
                
                // ASIA - MASSIVE ultra-detailed continent
                drawRecognizableContinent([
                  // Siberian Arctic coast
                  [1260, 500], [1350, 490], [1450, 485], [1550, 482], [1650, 485], 
                  [1750, 490], [1850, 498], [1950, 508], [2050, 520], [2150, 535],
                  [2250, 552], [2350, 572], [2450, 595], [2550, 620], [2650, 648],
                  // Eastern Siberia and Kamchatka
                  [2720, 678], [2780, 710], [2830, 745], [2870, 785], [2900, 830],
                  [2920, 878], [2930, 928], [2935, 980], [2930, 1032], [2915, 1084],
                  // China eastern coast
                  [2890, 1136], [2860, 1188], [2825, 1240], [2785, 1292], [2740, 1344],
                  [2690, 1396], [2635, 1448], [2575, 1500], [2510, 1552], [2440, 1604],
                  // Southeast Asia detail
                  [2365, 1656], [2285, 1708], [2200, 1760], [2110, 1812], [2015, 1864],
                  [1915, 1916], [1810, 1968], [1700, 2020], [1585, 2072], [1465, 2124],
                  // India subcontinent - very detailed
                  [1340, 2176], [1210, 2228], [1075, 2280], [935, 2332], [790, 2384],
                  [640, 2436], [485, 2488], [325, 2540], [160, 2592], [990, 2644],
                  // Arabian Peninsula
                  [1820, 2696], [1650, 2748], [1475, 2800], [1295, 2852], [1110, 2904],
                  [920, 2956], [725, 3008], [525, 3060], [320, 3112], [110, 3164],
                  // Back through Central Asia
                  [895, 3216], [680, 3268], [460, 3320], [235, 3372], [1005, 3424],
                  [780, 3476], [550, 3528], [315, 3580], [1075, 3632], [840, 3684],
                  [600, 3736], [355, 3788], [1105, 3840], [860, 3892], [610, 3944],
                  [355, 3996], [1095, 4048], [1340, 4000], [1585, 3952], [1830, 3904],
                  [2075, 3856], [2320, 3808], [2565, 3760], [2810, 3712], [3055, 3664],
                  // Urals and western boundary
                  [1300, 700], [1295, 650], [1290, 600], [1285, 550], [1280, 520]
                ], '#FF0099') // PURE MAGENTA - BLAZING NUCLEAR POWER!
                
                // AUSTRALIA - Ultra detailed Down Under
                drawRecognizableContinent([
                  // Northern Australia - Cape York and top
                  [3000, 3300], [3100, 3290], [3200, 3295], [3300, 3305], [3400, 3320],
                  [3500, 3340], [3600, 3365], [3700, 3395], [3800, 3430], [3900, 3470],
                  // Eastern coast - Queensland, NSW
                  [3950, 3520], [3980, 3580], [4000, 3640], [4015, 3700], [4025, 3760],
                  [4030, 3820], [4032, 3880], [4030, 3940], [4025, 4000], [4015, 4060],
                  // Southeast corner - Victoria
                  [4000, 4120], [3980, 4180], [3955, 4240], [3925, 4300], [3890, 4360],
                  // Tasmania separation
                  [3850, 4420], [3805, 4480], [3755, 4540], [3700, 4600], [3640, 4660],
                  // South coast - South Australia
                  [3575, 4720], [3505, 4780], [3430, 4840], [3350, 4900], [3265, 4960],
                  [3175, 5020], [3080, 5080], [2980, 5140], [2875, 5200], [2765, 5260],
                  // Western Australia coast
                  [2650, 5320], [2530, 5380], [2405, 5440], [2275, 5500], [2140, 5560],
                  [2000, 5620], [1855, 5680], [1705, 5740], [1550, 5800], [1390, 5860],
                  // Northwest - Kimberley and Pilbara
                  [1225, 5920], [1055, 5980], [880, 6040], [700, 6100], [515, 6160],
                  [325, 6220], [130, 6280], [2935, 6340], [2740, 6400], [2540, 6460],
                  // Back around north
                  [2335, 6520], [2125, 6580], [1910, 6640], [1690, 6700], [1465, 6760],
                  [1235, 6820], [1000, 6880], [2760, 6940], [2515, 7000], [2265, 7060],
                  [2010, 7120], [1750, 7180], [1485, 7240], [1215, 7300], [2940, 7360]
                ], '#FF0000') // PURE RED - MAXIMUM INTENSITY NUCLEAR BLAST!
                
                // ANTARCTICA - BLINDING WHITE ice continent (bottom)
                ctx.fillStyle = '#FFFFFF' // PURE WHITE - NUCLEAR BRIGHTNESS!
                ctx.fillRect(0, canvas.height - 400, canvas.width, 400)
                
                // ARCTIC ICE CAP - BLINDING WHITE (top)
                ctx.fillStyle = '#FFFFFF' // PURE WHITE - NUCLEAR BRIGHTNESS!
                ctx.fillRect(0, 0, canvas.width, 350)
                
                // BRITAIN - Ultra detailed recognizable island
                drawRecognizableContinent([
                  // Scotland
                  [950, 580], [970, 570], [990, 575], [1010, 585], [1025, 600], [1030, 620],
                  // England - more detailed
                  [1028, 640], [1025, 665], [1020, 690], [1015, 715], [1010, 740], [1005, 765],
                  [1000, 790], [995, 815], [990, 840], [985, 865], [980, 890], [975, 915],
                  // Southern England
                  [970, 940], [965, 965], [960, 990], [955, 1015], [950, 1040], [945, 1065],
                  // Wales and back up west coast
                  [940, 1090], [935, 1065], [930, 1040], [925, 1015], [920, 990], [915, 965],
                  [910, 940], [905, 915], [900, 890], [895, 865], [890, 840], [885, 815],
                  [880, 790], [875, 765], [870, 740], [875, 715], [885, 690], [900, 665],
                  [920, 640], [940, 615], [945, 590]
                ], '#00FF33') // PURE LIME - NUCLEAR BRIGHTNESS!
                
                // JAPAN - Ultra detailed island chain  
                ctx.fillStyle = '#FF00FF' // PURE MAGENTA - BLAZING INTENSITY!
                // Honshu - main island
                ctx.beginPath()
                ctx.ellipse(3200, 1200, 25, 120, 0.3, 0, Math.PI * 2)
                ctx.fill()
                // Hokkaido - northern island
                ctx.beginPath()
                ctx.ellipse(3160, 1100, 18, 40, 0, 0, Math.PI * 2)
                ctx.fill()
                // Kyushu - southern island
                ctx.beginPath()
                ctx.ellipse(3180, 1350, 15, 35, -0.2, 0, Math.PI * 2)
                ctx.fill()
                // Shikoku - smallest main island
                ctx.beginPath()
                ctx.ellipse(3210, 1320, 8, 12, 0.1, 0, Math.PI * 2)
                ctx.fill()
                
                const texture = new CanvasTexture(canvas)
                texture.wrapS = RepeatWrapping
                texture.wrapT = ClampToEdgeWrapping
                return texture
              }, [])}
            />
          </meshStandardMaterial>
        </mesh>
        
        {/* Clouds Layer */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius * 1.01, 32, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.4}
            roughness={1.0}
            metalness={0.0}
          />
        </mesh>
        
        {/* Moons */}
        {moons && moons.map((moon, index) => (
          <Moon
            key={`${name}-moon-${index}`}
            distance={radius + moon.distance}
            radius={moon.radius}
            color={moon.color}
            speed={moon.speed * timeScale}
            startAngle={moon.startAngle}
            name={`${name}-Moon-${index}`}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        ))}
      </group>
    </group>
  )
}

// Create simple Jupiter texture using Canvas
const createJupiterTexture = () => {
  if (typeof window === 'undefined') return null
  
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Draw specific Jupiter bands with custom colors and thickness
  const bands = [
    { color: '#BFAB87', thickness: 4 },
    { color: '#BB9D7B', thickness: 1 },
    { color: '#D1C4B8', thickness: 2 },
    { color: '#D7DBE6', thickness: 2 },
    { color: '#C6936C', thickness: 3 },
    { color: '#F4EBE2', thickness: 1 },
    { color: '#D3BDAA', thickness: 2 },
    { color: '#D5C9B8', thickness: 2 },
    { color: '#E4EDEF', thickness: 1 },
    { color: '#C3B9A9', thickness: 1 },
    { color: '#DCD1C4', thickness: 1 },
    { color: '#B8AF9F', thickness: 2 },
    { color: '#B1AFA6', thickness: 1 },
    { color: '#9B886C', thickness: 3 }
  ]
  
  // Calculate total thickness units
  const totalThickness = bands.reduce((sum, band) => sum + band.thickness, 0)
  const unitHeight = canvas.height / totalThickness
  
  let currentY = 0
  bands.forEach(band => {
    const bandHeight = unitHeight * band.thickness
    ctx.fillStyle = band.color
    ctx.fillRect(0, currentY, canvas.width, bandHeight)
    currentY += bandHeight
  })

  // Add Great Red Spot
  const grsX = canvas.width * 0.3
  const grsY = canvas.height * 0.65
  const grsWidth = canvas.width * 0.12
  const grsHeight = canvas.height * 0.08

  ctx.fillStyle = '#CC4C39'
  ctx.beginPath()
  ctx.ellipse(grsX, grsY, grsWidth / 2, grsHeight / 2, 0, 0, 2 * Math.PI)
  ctx.fill()

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Enhanced planet with moons and realistic orbital mechanics
function Planet({ 
  distance, 
  radius, 
  color, 
  speed, 
  name,
  startAngle,
  moons,
  timeScale,
  onHover,
  onUnhover,
  inclination = 0,
  eccentricity = 0,
  axialTilt = 0
}: { 
  distance: number
  radius: number
  color: string
  speed: number
  name: string
  startAngle: number
  moons?: any[]
  timeScale: number
  onHover: (info: any) => void
  onUnhover: () => void
  inclination?: number
  eccentricity?: number
  axialTilt?: number
}) {
  const groupRef = useRef<Group>(null)
  const planetGroupRef = useRef<Group>(null)
  
  // Create Jupiter texture (only for Jupiter)
  const jupiterTexture = useMemo(() => {
    if (name === 'Jupiter') {
      console.log('🪐 Creating Jupiter texture in SolarSystemEnhanced...')
      const texture = createJupiterTexture()
      console.log('🪐 Jupiter texture created:', texture ? 'Success' : 'Failed')
      return texture
    }
    return null
  }, [name])

  useFrame((state) => {
    if (groupRef.current) {
      const angle = startAngle + (state.clock.elapsedTime * speed)
      
      // Apply orbital inclination and eccentricity
      const currentDistance = distance * (1 - eccentricity * Math.cos(angle))
      
      groupRef.current.rotation.y = angle
      
      if (planetGroupRef.current) {
        planetGroupRef.current.position.x = currentDistance
        planetGroupRef.current.position.y = Math.sin(angle) * inclination * 0.5 // Much smaller multiplier for minimal vertical movement
        
        // Apply axial tilt
        planetGroupRef.current.rotation.z = axialTilt
      }
    }
  })

  // Special handling for Earth
  if (name === 'Earth') {
    return (
      <group ref={groupRef} rotation={[inclination * Math.PI / 180, 0, 0]}>
        <group ref={planetGroupRef}>
          <EnhancedEarth
            distance={0} // Position handled by parent group
            radius={radius}
            speed={speed}
            name={name}
            startAngle={startAngle}
            moons={moons}
            timeScale={timeScale}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        </group>
      </group>
    )
  }

  return (
    <group ref={groupRef} rotation={[inclination * Math.PI / 180, 0, 0]}>
      <group ref={planetGroupRef}>
        {/* Planet */}
        <mesh
          onPointerEnter={(e) => {
            e.stopPropagation()
            const info = celestialInfo[name as keyof typeof celestialInfo]
            if (info) onHover(info)
          }}
          onPointerLeave={() => onUnhover()}
          rotation={[0, 0, axialTilt]}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial 
            map={name === 'Jupiter' ? jupiterTexture : undefined}
            color={name === 'Jupiter' && jupiterTexture ? '#ffffff' : (name === 'Jupiter' ? '#ff0000' : color)} 
          />
        </mesh>
        
        {/* Moons */}
        {moons && moons.map((moon, index) => (
          <Moon
            key={`${name}-moon-${index}`}
            distance={radius + moon.distance}
            radius={moon.radius}
            color={moon.color}
            speed={moon.speed * timeScale}
            startAngle={moon.startAngle}
            name={`${name}-Moon-${index}`}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        ))}
      </group>
    </group>
  )
}

// Simple orbit ring with hover functionality
function OrbitRing({ 
  distance, 
  planetName,
  onHover,
  onUnhover 
}: { 
  distance: number,
  planetName?: string,
  onHover?: (info: any) => void,
  onUnhover?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Thin visible ring */}
      <mesh>
        <ringGeometry args={[distance - 0.1, distance + 0.1, 64]} />
        <meshBasicMaterial 
          color={hovered ? "#666666" : "#444444"} 
          transparent 
          opacity={hovered ? 0.8 : 0.5}
        />
      </mesh>
      
      {/* Completely invisible wide hover area */}
      <mesh 
        onPointerEnter={(e) => {
          setHovered(true)
          if (planetName && onHover) {
            e.stopPropagation()
            const planetInfo = celestialInfo[planetName as keyof typeof celestialInfo]
            if (planetInfo) {
              onHover(planetInfo)
            }
          }
        }}
        onPointerLeave={() => {
          setHovered(false)
          if (onUnhover) {
            onUnhover()
          }
        }}
      >
        <ringGeometry args={[distance - 2, distance + 2, 64]} />
        <meshBasicMaterial 
          transparent 
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}

// Enhanced planet data with realistic orbital mechanics and axial tilts
const planetData = [
  { 
    name: 'Mercury', 
    distance: 15, 
    radius: 0.8, 
    color: '#808080', 
    speed: 0.00415, // 4.15x faster than Earth (88 day orbit vs 365 days)
    startAngle: 0,
    inclination: 0.2, // Minimal inclination to stay in orbital plane
    eccentricity: 0.02, // Minimal eccentricity 
    axialTilt: 0.034 * Math.PI / 180
  },
  { 
    name: 'Venus', 
    distance: 22, 
    radius: 1.2, 
    color: '#BBAA8E', 
    speed: 0.00162, // 1.62x Earth's speed (225 day orbit vs 365 days - Venus orbits faster)
    startAngle: 1.2,
    inclination: 0.2, // Minimal inclination to stay in orbital plane
    eccentricity: 0.007,
    axialTilt: 177.4 * Math.PI / 180 // Retrograde rotation
  },
  { 
    name: 'Earth', 
    distance: 30, 
    radius: 1.3, 
    color: '#6B93D6', 
    speed: 0.001,
    startAngle: 3.1,
    inclination: 0.0, // Reference plane
    eccentricity: 0.017,
    axialTilt: 23.4 * Math.PI / 180,
    moons: [
      { distance: 2, radius: 0.15, color: '#CCCCCC', speed: 0.008, startAngle: 0 }
    ]
  },
  { 
    name: 'Mars', 
    distance: 40, 
    radius: 1.0, 
    color: '#C1440E', 
    speed: 0.00053, // 0.53x Earth's speed (687 day orbit vs 365 days)
    startAngle: 5.8,
    inclination: 0.2, // Minimal inclination to stay in orbital plane
    eccentricity: 0.05,
    axialTilt: 25.2 * Math.PI / 180,
    moons: [
      { distance: 1.5, radius: 0.05, color: '#999999', speed: 0.016, startAngle: 0 },
      { distance: 2.2, radius: 0.05, color: '#999999', speed: 0.012, startAngle: 3.14 }
    ]
  },
  { 
    name: 'Jupiter', 
    distance: 75,
    radius: 3.0, 
    color: '#D8CA9D', 
    speed: 0.000083, // 0.083x Earth's speed (12 year orbit vs 1 year)
    startAngle: 0.9,
    inclination: 0.1, // Minimal inclination to stay in orbital plane
    eccentricity: 0.02,
    axialTilt: 3.1 * Math.PI / 180,
    moons: [
      { distance: 4, radius: 0.2, color: '#FFFF99', speed: 0.009, startAngle: 0 },
      { distance: 5, radius: 0.15, color: '#FFFFFF', speed: 0.0063, startAngle: 2.1 },
      { distance: 6, radius: 0.25, color: '#CCCCCC', speed: 0.0041, startAngle: 4.8 },
      { distance: 7, radius: 0.2, color: '#999999', speed: 0.0027, startAngle: 5.9 }
    ]
  },
  { 
    name: 'Saturn', 
    distance: 92, 
    radius: 2.5, 
    color: '#FAD5A5', 
    speed: 0.000034, // 0.034x Earth's speed (29 year orbit vs 1 year)
    startAngle: 4.2,
    inclination: 0.1, // Minimal inclination to stay in orbital plane
    eccentricity: 0.03,
    axialTilt: 26.7 * Math.PI / 180,
    moons: [
      { distance: 5, radius: 0.25, color: '#FFCC99', speed: 0.004, startAngle: 2.1 },
      { distance: 6.5, radius: 0.15, color: '#CCCCCC', speed: 0.003, startAngle: 5.5 }
    ]
  },
  { 
    name: 'Uranus', 
    distance: 100, 
    radius: 1.8, 
    color: '#4FD0E3', 
    speed: 0.000012, // 0.012x Earth's speed (84 year orbit vs 1 year)
    startAngle: 2.7,
    inclination: 0.1, // Minimal inclination to stay in orbital plane
    eccentricity: 0.02,
    axialTilt: 97.8 * Math.PI / 180 // Extreme tilt
  },
  { 
    name: 'Neptune', 
    distance: 120, 
    radius: 1.7, 
    color: '#4B70DD', 
    speed: 0.000006, // 0.006x Earth's speed (165 year orbit vs 1 year)
    startAngle: 1.8,
    inclination: 0.1, // Minimal inclination to stay in orbital plane
    eccentricity: 0.01,
    axialTilt: 28.3 * Math.PI / 180
  },
]

// Kuiper Belt - Distant icy objects beyond Neptune
function KuiperBelt({ 
  show, 
  timeScale, 
  onHover, 
  onUnhover 
}: { 
  show: boolean, 
  timeScale: number,
  onHover?: (info: any) => void,
  onUnhover?: () => void 
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])
  const count = 200 // Lower density

  const kuiperObjects = useMemo(() => {
    const data = []
    for (let i = 0; i < count; i++) {
      const radius = 140 + Math.random() * 60 // Beyond Neptune
      const startAngle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 8
      const scale = 0.05 + Math.random() * 0.1
      const speed = 0.00005 / Math.sqrt(radius / 140) // Very slow
      const rotationSpeed = Math.random() * 0.02
      
      data.push({ radius, startAngle, height, scale, speed, rotationSpeed })
    }
    return data
  }, [])

  useFrame((state) => {
    if (!show || !meshRef.current) return

    kuiperObjects.forEach((obj, i) => {
      // Fix: Kuiper Belt objects must rotate in SAME direction as planets - use NEGATIVE to match  
      const currentAngle = obj.startAngle - (state.clock.elapsedTime * obj.speed * timeScale)
      const rotationAngle = state.clock.elapsedTime * obj.rotationSpeed * timeScale
      
      tempObject.position.set(
        Math.cos(currentAngle) * obj.radius,
        obj.height,
        Math.sin(currentAngle) * obj.radius
      )
      tempObject.scale.setScalar(obj.scale)
      tempObject.rotation.x = rotationAngle
      tempObject.rotation.y = rotationAngle * 1.3
      tempObject.updateMatrix()
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!show) return null

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, count]}
      onPointerEnter={(e) => {
        e.stopPropagation()
        if (onHover) {
          onHover(celestialInfo["Kuiper Belt"])
        }
      }}
      onPointerLeave={() => {
        if (onUnhover) {
          onUnhover()
        }
      }}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#b8c6db" />
    </instancedMesh>
  )
}

// SIMPLE Two-Mode System: Automatic vs Manual
function CameraSystem({ 
  automaticMode, 
  speed, 
  verticalMin, 
  verticalMax,
  onEasterEggTrigger,
  easterEggDelayTimer,
  setEasterEggDelayTimer,
  easterEggActive,
  easterEggCooldown,
  cameraFrozen,
  setCameraFrozen,
  frozenCameraPosition,
  setFrozenCameraPosition,
  onMilkyWayEasterEggTrigger,
  milkyWayEasterEggActive,
  milkyWayEasterEggCooldown
}: { 
  automaticMode: boolean, 
  speed: number,
  verticalMin: number,
  verticalMax: number,
  onEasterEggTrigger: () => void,
  easterEggDelayTimer: NodeJS.Timeout | null,
  setEasterEggDelayTimer: (timer: NodeJS.Timeout | null) => void,
  easterEggActive: boolean,
  easterEggCooldown: boolean,
  cameraFrozen: boolean,
  setCameraFrozen: (frozen: boolean) => void,
  frozenCameraPosition: {x: number, y: number, z: number} | null,
  setFrozenCameraPosition: (pos: {x: number, y: number, z: number} | null) => void,
  onMilkyWayEasterEggTrigger: () => void,
  milkyWayEasterEggActive: boolean,
  milkyWayEasterEggCooldown: boolean
}) {
  const { camera } = useThree()
  const orbitControlsRef = useRef<any>(null)
  const keyStates = useRef<{[key: string]: boolean}>({})
  
  // Direct keyboard event handling in CameraSystem
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'z', 'x'].includes(key)) {
        event.preventDefault()
        keyStates.current[key] = true
        console.log(`🎮 Key pressed: ${key}`, keyStates.current)
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'z', 'x'].includes(key)) {
        event.preventDefault()
        keyStates.current[key] = false
        console.log(`🎮 Key released: ${key}`, keyStates.current)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  useFrame((state) => {
    // Check if camera should be frozen for Easter egg
    if (cameraFrozen && frozenCameraPosition) {
      camera.position.set(frozenCameraPosition.x, frozenCameraPosition.y, frozenCameraPosition.z)
      camera.lookAt(0, 0, 0)
      return // Skip normal camera movement
    }
    
    // Check for maximum zoom-out trigger (only in manual mode)
    if (!automaticMode && !milkyWayEasterEggActive && !milkyWayEasterEggCooldown && !easterEggActive) {
      const cameraDistance = camera.position.distanceTo(new Vector3(0, 0, 0))
      const maxDistance = 3800 // Near the maximum zoom limit (4000)
      
      if (cameraDistance >= maxDistance) {
        console.log('🌌 Maximum zoom detected - triggering Milky Way Easter Egg')
        onMilkyWayEasterEggTrigger()
        return // Skip normal camera movement
      }
    }
    
    if (automaticMode) {
      // AUTOMATIC MODE: Camera moves, no manual controls
      const time = state.clock.elapsedTime * speed
      const radius = 120  // Much closer - just outside Uranus orbit (100 units)
      // Use user-controlled vertical movement range
      const verticalTime = state.clock.elapsedTime * speed * 3.0 // 3x faster vertical movement
      
      // Convert angle degrees to height values
      // Map -90° to 90° range to actual height values
      const minHeight = radius * Math.sin((verticalMin * Math.PI) / 180)
      const maxHeight = radius * Math.sin((verticalMax * Math.PI) / 180)
      const centerHeight = (minHeight + maxHeight) / 2
      const heightRange = (maxHeight - minHeight) / 2
      
      const height = centerHeight + Math.sin(verticalTime) * heightRange
      
      const x = Math.cos(time) * radius
      const z = Math.sin(time) * radius
      
      camera.position.set(x, height, z)
      camera.lookAt(0, 0, 0)
    } else {
      // MANUAL MODE: Handle keyboard controls + OrbitControls
      const moveSpeed = 2 // Units per frame when key is held
      
      // Get current camera position
      const currentPos = camera.position.clone()
      let moved = false
      
      // Handle keyboard movement (using lowercase keys)
      if (keyStates.current['arrowup']) {
        currentPos.y += moveSpeed
        moved = true
      }
      if (keyStates.current['arrowdown']) {
        currentPos.y -= moveSpeed
        moved = true
      }
      if (keyStates.current['arrowleft']) {
        // Move camera left relative to current orientation
        const rightVector = new Vector3()
        rightVector.setFromMatrixColumn(camera.matrix, 0) // Get right vector
        currentPos.addScaledVector(rightVector, -moveSpeed)
        moved = true
      }
      if (keyStates.current['arrowright']) {
        // Move camera right relative to current orientation  
        const rightVector = new Vector3()
        rightVector.setFromMatrixColumn(camera.matrix, 0) // Get right vector
        currentPos.addScaledVector(rightVector, moveSpeed)
        moved = true
      }
      
      // Handle zoom keys (Z and X)
      if (keyStates.current['z']) {
        // Z = Zoom in (move camera toward center)
        const directionToCenter = new Vector3(0, 0, 0).sub(currentPos).normalize()
        currentPos.addScaledVector(directionToCenter, moveSpeed)
        moved = true
      }
      if (keyStates.current['x']) {
        // X = Zoom out (move camera away from center)
        const directionFromCenter = currentPos.clone().normalize()
        currentPos.addScaledVector(directionFromCenter, moveSpeed)
        moved = true
      }
      
      // Debug key states every 3 seconds
      if (Math.floor(state.clock.elapsedTime) % 3 === 0 && Math.floor(state.clock.elapsedTime * 10) % 10 === 0) {
        const activeKeys = Object.keys(keyStates.current).filter(k => keyStates.current[k])
        if (activeKeys.length > 0) {
          console.log(`🎮 Active keys:`, activeKeys)
        }
      }
      
      // Apply the new position if any key was pressed
      if (moved) {
        camera.position.copy(currentPos)
      }
    }
    
    // Easter egg detection: Check if camera is very close to sun
    const sunPosition = new Vector3(0, 0, 0) // Sun is at origin
    const cameraPosition = camera.position
    const distanceToSun = cameraPosition.distanceTo(sunPosition)
    
    // Easter egg detection: Sun completely fills screen at closer distance
    // With sun radius=4 and FOV=60°, for 100% screen fill we need distance ≈ 5
    const optimalDistance = 5 // Distance where sun fills 100% of screen
    console.log('🔍 Distance to sun:', distanceToSun.toFixed(2))
    
    if (distanceToSun <= optimalDistance) {
      if (!easterEggDelayTimer && !easterEggActive && !easterEggCooldown && !cameraFrozen) {
        console.log('🌟 Optimal distance reached - freezing camera and starting 1s timer...')
        
        // Freeze camera at current position
        setCameraFrozen(true)
        setFrozenCameraPosition({ x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z })
        
        // Start 1-second delay timer
        const timer = setTimeout(() => {
          console.log('🚨 1-second hold complete - triggering Easter egg!')
          onEasterEggTrigger()
          setEasterEggDelayTimer(null)
        }, 1000)
        setEasterEggDelayTimer(timer)
      }
    }
  })
  
  return (
    <OrbitControls 
      ref={orbitControlsRef}
      enabled={!automaticMode} // Only enabled in Manual Mode
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.05}
      target={[0, 0, 0]}
    />
  )
}

function SolarSystemEnhanced() {
  const [timeScale, setTimeScale] = useState(250)
  const [showSun, setShowSun] = useState(true)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showMoons, setShowMoons] = useState(true)
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true)
  const [showStars, setShowStars] = useState(true)
  const [showPlanets, setShowPlanets] = useState(true)
  const [milkyWayBrightness, setMilkyWayBrightness] = useState(0.1) // Default to 10% brightness
  const [showKuiperBelt, setShowKuiperBelt] = useState(true)
  const [cameraAnimation, setCameraAnimation] = useState(true)
  const [cameraSpeed, setCameraSpeed] = useState(0.03) // Default 15% speed
  const [cameraVerticalMin, setCameraVerticalMin] = useState(-5) // Default lower bound -5°
  const [cameraVerticalMax, setCameraVerticalMax] = useState(60) // Default upper bound 60°
  const [hoveredObject, setHoveredObject] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [controlsVisible, setControlsVisible] = useState(false)
  const [controlsPinned, setControlsPinned] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [controlsHovered, setControlsHovered] = useState(false)
  
  // Easter egg state
  const [easterEggActive, setEasterEggActive] = useState(false)
  const [easterEggCooldown, setEasterEggCooldown] = useState(false)
  const [easterEggDelayTimer, setEasterEggDelayTimer] = useState<NodeJS.Timeout | null>(null)
  const [cameraFrozen, setCameraFrozen] = useState(false)
  const [frozenCameraPosition, setFrozenCameraPosition] = useState<{x: number, y: number, z: number} | null>(null)
  
  // Milky Way Easter egg state
  const [milkyWayEasterEggActive, setMilkyWayEasterEggActive] = useState(false)
  const [milkyWayEasterEggCooldown, setMilkyWayEasterEggCooldown] = useState(false)
  
  // Easter egg handlers
  const handleEasterEggTrigger = () => {
    if (easterEggActive || easterEggCooldown) {
      console.log('🚨 Easter egg trigger BLOCKED - already active or cooling down')
      return
    }
    
    console.log('🌟 Sun Easter Egg Triggered!')
    setEasterEggActive(true)
    setEasterEggCooldown(true)
    
    // Reset cooldown after 15 seconds (long enough for full sequence)
    setTimeout(() => {
      console.log('🚨 Easter egg cooldown reset')
      setEasterEggCooldown(false)
    }, 15000)
  }
  
  const handleEasterEggComplete = () => {
    console.log('🚨 Easter egg complete - showing close-up then zooming out to Mars orbit')
    setEasterEggActive(false)
    setEasterEggCooldown(true)
    
    // Clear any pending delay timer
    if (easterEggDelayTimer) {
      clearTimeout(easterEggDelayTimer)
      setEasterEggDelayTimer(null)
    }
    
    // First: Show close-up sun view (where the Easter Egg was triggered)
    setCameraFrozen(true)
    setFrozenCameraPosition({ x: 0, y: 5, z: 8 }) // Close-up sun view
    
    // After 0.5 seconds, start rapid zoom-out to Mars orbit over 1 second
    setTimeout(() => {
      console.log('🚨 Starting rapid zoom-out to Mars orbit')
      // Animate zoom-out by updating frozen position over time
      let progress = 0
      const startPos = { x: 0, y: 5, z: 8 } // Close-up
      const endPos = { x: 0, y: 45, z: 60 } // Mars orbit
      const duration = 1000 // 1 second
      const startTime = Date.now()
      
      const animateZoom = () => {
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        // Interpolate between start and end positions
        const currentPos = {
          x: startPos.x + (endPos.x - startPos.x) * progress,
          y: startPos.y + (endPos.y - startPos.y) * progress,
          z: startPos.z + (endPos.z - startPos.z) * progress
        }
        
        setFrozenCameraPosition(currentPos)
        
        if (progress < 1) {
          requestAnimationFrame(animateZoom)
        } else {
          // Zoom complete - hold at Mars orbit for 2 seconds then release
          setTimeout(() => {
            setCameraFrozen(false)
            setFrozenCameraPosition(null)
          }, 2000)
        }
      }
      
      requestAnimationFrame(animateZoom)
    }, 500) // 0.5 second delay to show close-up first
    
    // Shorter cooldown to allow retriggering
    setTimeout(() => {
      setEasterEggCooldown(false)
    }, 5000) // 5 second cooldown after completion
  }
  
  // Milky Way Easter egg handlers
  const handleMilkyWayEasterEggTrigger = () => {
    if (milkyWayEasterEggActive || milkyWayEasterEggCooldown || easterEggActive) {
      console.log('🌌 Milky Way Easter egg trigger BLOCKED')
      return
    }
    
    console.log('🌌 Milky Way Easter Egg Triggered!')
    setMilkyWayEasterEggActive(true)
    setMilkyWayEasterEggCooldown(true)
    
    // Reset cooldown after 10 seconds
    setTimeout(() => {
      console.log('🌌 Milky Way Easter egg cooldown reset')
      setMilkyWayEasterEggCooldown(false)
    }, 10000)
  }
  
  const handleMilkyWayEasterEggComplete = () => {
    console.log('🌌 Milky Way Easter egg complete - zooming back to default view')
    setMilkyWayEasterEggActive(false)
    setMilkyWayEasterEggCooldown(true)
    
    // Animate zoom back to default solar system view
    setCameraFrozen(true)
    
    // Zoom in from far out to default view over 2 seconds
    let progress = 0
    const startPos = { x: 0, y: 200, z: 300 } // Far out position
    const endPos = { x: 0, y: 25, z: 35 } // Default view
    const duration = 2000 // 2 seconds
    const startTime = Date.now()
    
    const animateZoomIn = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / duration, 1)
      
      // Interpolate between start and end positions
      const currentPos = {
        x: startPos.x + (endPos.x - startPos.x) * progress,
        y: startPos.y + (endPos.y - startPos.y) * progress,
        z: startPos.z + (endPos.z - startPos.z) * progress
      }
      
      setFrozenCameraPosition(currentPos)
      
      if (progress < 1) {
        requestAnimationFrame(animateZoomIn)
      } else {
        // Zoom complete - release camera
        setTimeout(() => {
          setCameraFrozen(false)
          setFrozenCameraPosition(null)
        }, 1000) // Hold at default view for 1 second
      }
    }
    
    requestAnimationFrame(animateZoomIn)
    
    // Shorter cooldown after completion
    setTimeout(() => {
      setMilkyWayEasterEggCooldown(false)
    }, 5000) // 5 second cooldown
  }

  // Keyboard controls for camera movement and mode switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for our handled keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'z', 'x'].includes(event.key.toLowerCase())) {
        event.preventDefault()
      }

      // Space bar toggles between Automatic and Manual modes
      if (event.key === ' ') {
        setCameraAnimation(prev => !prev)
        return
      }

      // Arrow keys and Z/X keys - switch to Manual Mode in Automatic Mode
      const isControlKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x'].includes(event.key.toLowerCase())
      
      if (isControlKey && cameraAnimation) {
        // If in Automatic Mode, switch to Manual Mode when any control key is pressed
        console.log('🎮 Control key pressed in Auto mode - switching to Manual')
        setCameraAnimation(false)
        return
      }
      
      // Note: Actual camera movement is now handled directly in CameraSystem component
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cameraAnimation]) // Re-run when cameraAnimation changes
  const [lastMouseMove, setLastMouseMove] = useState(Date.now())

  const saturnData = planetData.find(p => p.name === 'Saturn')

  const handleObjectHover = (info: any) => {
    if (easterEggActive) return
    setHoveredObject(info)
  }

  const handleObjectUnhover = () => {
    if (easterEggActive) return
    setHoveredObject(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (easterEggActive) return
    setMousePosition({ x: e.clientX, y: e.clientY })
    setLastMouseMove(Date.now())
    if (!controlsVisible && !controlsPinned) {
      setControlsVisible(true)
    }
  }

  const handleMouseInteraction = (interactionType: string) => {
    if (easterEggActive) return
    if (cameraAnimation) {
      console.log(`🎮 ${interactionType} in Auto mode - switching to Manual`)
      setCameraAnimation(false)
    }
  }

  // Auto-hide controls after 0.5 seconds of no mouse movement (only when not pinned or hovered)
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMouseMove > 500 && !controlsPinned && !controlsHovered) {
        setControlsVisible(false)
      }
    }, 250)
    return () => clearInterval(interval)
  }, [lastMouseMove, controlsPinned, controlsHovered])

  return (
    <div 
      className="w-full h-screen relative overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseDown={(e) => {
        if (e.button === 0) handleMouseInteraction('Left click') // Left click
        if (e.button === 2) handleMouseInteraction('Right click') // Right click
      }}
      onWheel={() => handleMouseInteraction('Mouse scroll')}
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
    >
      {/* Control Panel */}
      <div 
        className={`absolute top-4 left-4 z-10 backdrop-blur-sm border border-white/20 text-white p-4 rounded-2xl space-y-3 max-w-xs shadow-2xl transition-opacity duration-500 ${(controlsVisible || controlsPinned) ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        onMouseEnter={() => { setControlsHovered(true); setControlsVisible(true) }}
        onMouseLeave={() => setControlsHovered(false)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">Mission Control</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="px-2 py-1 text-xs backdrop-blur border border-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
              title={showInstructions ? "Back to Controls" : "Show Instructions"}
            >
              <Info size={14} />
            </button>
            <button 
              onClick={() => {
                // Reset all values to defaults
                setTimeScale(250)
                setCameraSpeed(0.03)
                setCameraAnimation(true)
                setCameraVerticalMin(-5)
                setCameraVerticalMax(60)
                setShowSun(true)
                setShowOrbits(true)
                setShowMoons(true)
                setShowAsteroidBelt(true)
                setShowStars(true)
                setShowPlanets(true)
                setMilkyWayBrightness(0.1)
                setShowKuiperBelt(true)
                setControlsPinned(false)
              }}
              className="px-2 py-1 text-xs backdrop-blur border border-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
              title="Reset to Default Settings"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  document.documentElement.requestFullscreen()
                }
              }}
              className="px-2 py-1 text-xs backdrop-blur border border-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
              title="Toggle Fullscreen"
            >
              <Maximize size={14} />
            </button>
            <button 
              onClick={() => setControlsPinned(!controlsPinned)}
              className="px-2 py-1 text-xs backdrop-blur border border-white/20 rounded-lg transition-all duration-200 text-white/90 hover:text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
              title={controlsPinned ? "Unpin Controls (auto-hide enabled)" : "Pin Controls (always visible)"}
            >
              {controlsPinned ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>

        {showInstructions ? (
          <>
            {/* NASA-Style Camera Operations Manual */}
            <div className="space-y-3 overflow-y-auto" style={{ height: '600px' }}>
              
              {/* Camera Modes */}
              <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3 tracking-wider">CAMERA OPERATION MODES</h3>
                <div className="space-y-3 text-xs text-gray-300">
                  <div>
                    <div className="text-cyan-300 font-medium mb-2">AUTOMATIC MODE (Default)</div>
                    <div className="text-gray-400">Camera moves in smooth orbital pattern around solar system</div>
                    <div className="text-gray-400">• Adjustable speed via VELOCITY CONTROL panel</div>
                    <div className="text-gray-400">• Vertical range controlled by ELEVATION CONTROL</div>
                  </div>
                  <div>
                    <div className="text-cyan-300 font-medium mb-2">MANUAL MODE</div>
                    <div className="text-gray-400">Full manual control using mouse and keyboard</div>
                    <div className="text-gray-400">• Mouse: Rotate view, pan, zoom with scroll wheel</div>
                    <div className="text-gray-400">• Direct keyboard navigation (see below)</div>
                  </div>
                </div>
              </div>

              {/* Keyboard Controls */}
              <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3 tracking-wider">KEYBOARD NAVIGATION</h3>
                <div className="space-y-3">
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-black/60 border border-cyan-400/30 rounded px-3 py-1 font-mono text-cyan-300 text-xs">
                      SPACE
                    </div>
                    <div className="text-xs text-gray-300">Toggle between Automatic and Manual modes</div>
                  </div>

                  <div className="text-cyan-300 font-medium text-xs mb-2">MANUAL MODE CONTROLS:</div>
                  
                  {/* Movement Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">↑</div>
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">↓</div>
                      </div>
                      <div className="text-xs text-gray-300">Move camera up and down</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">←</div>
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">→</div>
                      </div>
                      <div className="text-xs text-gray-300">Move camera left and right</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">Z</div>
                        <div className="bg-black/60 border border-cyan-400/30 rounded px-2 py-1 font-mono text-cyan-300 text-xs">X</div>
                      </div>
                      <div className="text-xs text-gray-300">Zoom in (Z) and zoom out (X)</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-3">
                    Note: Arrow keys in Automatic Mode will switch to Manual Mode
                  </div>
                </div>
              </div>

              {/* Interactive Features */}
              <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3 tracking-wider">INTERACTIVE FEATURES</h3>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="text-gray-400">• Hover over any celestial body for detailed information</div>
                  <div className="text-gray-400">• Information cards appear in top-right corner</div>
                  <div className="text-gray-400">• Includes scientific data, physical properties, and descriptions</div>
                  <div className="text-gray-400">• Available for all planets, moons, asteroid belt, and Kuiper belt</div>
                  <div className="text-gray-400">• Videos show dynamic previews when available</div>
                </div>
              </div>

              {/* Mission Control Overview */}
              <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3 tracking-wider">MISSION CONTROL PANELS</h3>
                <div className="space-y-2 text-xs text-gray-300">
                  <div><span className="text-cyan-300 font-medium">VELOCITY CONTROL:</span> Camera movement speed and automation</div>
                  <div><span className="text-cyan-300 font-medium">ELEVATION CONTROL:</span> Vertical viewing angle boundaries</div>
                  <div><span className="text-cyan-300 font-medium">TIME ACCELERATION:</span> Orbital motion speed control</div>
                  <div><span className="text-cyan-300 font-medium">DISPLAY CONFIGURATION:</span> Toggle visibility of celestial objects</div>
                  <div><span className="text-cyan-300 font-medium">GALAXY LUMINOSITY:</span> Milky Way galaxy brightness</div>
                </div>
              </div>

            </div>
          </>
        ) : (
          <>
            {/* NASA-Style Control Panels - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Velocity Control Panel */}
          <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-gray-300 tracking-wider leading-tight">VELOCITY CONTROL</div>
              <div className="px-1 py-0.5 bg-green-500/20 border border-green-400/40 rounded text-[7px] text-green-300 font-medium">
                {cameraAnimation ? 'ACTIVE' : 'STANDBY'}
              </div>
            </div>
            
            {/* Large Display */}
            <div className="bg-black/60 rounded border border-cyan-400/20 p-4 mb-3 text-center h-28 flex flex-col justify-center">
              <div className="text-2xl font-mono text-cyan-300 font-bold tracking-wider">
                {String(((cameraSpeed / 0.2) * 100).toFixed(1)).padStart(5, '0')}%
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-light">CAMERA VELOCITY</div>
            </div>
            
            {/* Futuristic Slider */}
            <div className="relative w-full mb-4 pb-2">
              {/* Track */}
              <div className="relative h-1 rounded-sm" style={{
                background: 'linear-gradient(to right, transparent, rgba(0, 200, 255, 0.3))'
              }}>
                {/* Active/Filled Track */}
                <div 
                  className="absolute h-1 rounded-sm"
                  style={{
                    width: `${(cameraSpeed / 0.2) * 100}%`,
                    background: '#00ffff',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                  }}
                ></div>
              </div>
              
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={cameraSpeed}
                onChange={(e) => setCameraSpeed(Number(e.target.value))}
                className="absolute w-full appearance-none bg-transparent cursor-pointer slider-futuristic"
                style={{ top: '-15px', height: '32px' }}
              />
              
              {/* Scale markers and labels */}
              <div className="relative mt-2">
                {/* Minor ticks (smaller, dimmer) */}
                {[5, 10, 15, 20, 30, 35, 40, 45, 55, 60, 65, 70, 80, 85, 90, 95].map(position => (
                  <div 
                    key={`minor-${position}`}
                    className="absolute"
                    style={{ 
                      left: `${position}%`, 
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div style={{ 
                        width: '0.5px', 
                        height: '3px',
                        backgroundColor: 'rgba(100, 200, 255, 0.25)',
                        marginBottom: '0.5px'
                      }}></div>
                    </div>
                  </div>
                ))}
                
                {/* Major ticks (with numbers) */}
                {[
                  { value: '0', position: 0 },
                  { value: '.25', position: 25 },
                  { value: '.5', position: 50 },
                  { value: '.75', position: 75 },
                  { value: '1', position: 100 }
                ].map(({ value, position }) => (
                  <div 
                    key={value} 
                    className="absolute"
                    style={{ 
                      left: `${position}%`, 
                      transform: value === '0' ? 'translateX(0%)' : value === '1' ? 'translateX(-100%)' : 'translateX(-50%)'
                    }}
                  >
                    <div className="flex flex-col" style={{ alignItems: value === '0' ? 'flex-start' : value === '1' ? 'flex-end' : 'center' }}>
                      <div className="w-px mb-0.5" style={{ backgroundColor: 'rgba(100, 200, 255, 0.5)', height: '6px' }}></div>
                      <span 
                        className="text-[9px] font-thin font-mono" 
                        style={{ color: '#00ffff' }}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <style jsx>{`
                .slider-futuristic::-webkit-slider-thumb {
                  appearance: none;
                  width: 8px;
                  height: 19px;
                  border-radius: 4px;
                  background: linear-gradient(135deg, #00ffff, #0099ff);
                  border: 1px solid rgba(255, 255, 255, 0.9);
                  cursor: pointer;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                  transition: all 0.2s ease;
                }
                .slider-futuristic::-webkit-slider-thumb:hover {
                  box-shadow: 0 0 30px rgba(0, 255, 255, 1);
                }
                .slider-futuristic::-moz-range-thumb {
                  width: 8px;
                  height: 19px;
                  border-radius: 4px;
                  background: linear-gradient(135deg, #00ffff, #0099ff);
                  border: 1px solid rgba(255, 255, 255, 0.9);
                  cursor: pointer;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                  border: none;
                }
              `}</style>
            </div>
            
            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: '22px' }}>
              <button
                onClick={() => setCameraAnimation(false)}
                className={`px-2 py-1 text-[10px] font-semibold rounded border transition-all duration-200 flex items-center justify-center ${
                  !cameraAnimation 
                    ? 'bg-red-500/20 border-red-400/50 text-red-300' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                STOP CAMERA
              </button>
              <button
                onClick={() => setCameraAnimation(true)}
                className={`px-2 py-1 text-[10px] font-semibold rounded border transition-all duration-200 flex items-center justify-center ${
                  cameraAnimation 
                    ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                AUTO PILOT
              </button>
            </div>
          </div>
          
          {/* Elevation Control Panel */}
          <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-gray-300 tracking-wider leading-tight">ELEVATION CONTROL</div>
              <div className="px-1 py-0.5 bg-orange-500/20 border border-orange-400/40 rounded text-[7px] text-orange-300 font-medium">
                NOMINAL
              </div>
            </div>
            
            {/* Large Display */}
            <div className="bg-black/60 rounded border border-cyan-400/20 p-4 mb-3 text-center h-28 flex flex-col justify-center">
              <div className="text-xl font-mono text-cyan-300 font-bold tracking-wider">
                <span className="text-xs text-cyan-300">min</span> {cameraVerticalMin}°
              </div>
              <div className="text-xl font-mono text-cyan-300 font-bold tracking-wider" style={{ marginTop: '-0.2rem' }}>
                <span className="text-xs text-cyan-300">max</span> {cameraVerticalMax}°
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-light">VIEWING ANGLE RANGE</div>
            </div>
            
            {/* Futuristic Dual Range Slider */}
            <div className="relative w-full h-8 mb-4 pb-2">
              {/* Track */}
              <div className="relative h-1 rounded-sm mt-4" style={{
                background: 'linear-gradient(to right, transparent, rgba(0, 200, 255, 0.3))'
              }}>
                {/* Active range highlight */}
                <div 
                  className="absolute h-1 rounded-sm"
                  style={{
                    left: `${((cameraVerticalMin + 90) / 180) * 100}%`,
                    width: `${((cameraVerticalMax - cameraVerticalMin) / 180) * 100}%`,
                    background: '#00ffff',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                  }}
                ></div>
              </div>
              
              {/* Max handle */}
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={cameraVerticalMax}
                onChange={(e) => {
                  const newMax = Number(e.target.value)
                  if (newMax > cameraVerticalMin + 5) {
                    setCameraVerticalMax(newMax)
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer slider-dual-futuristic"
                style={{
                  background: 'transparent',
                  pointerEvents: 'auto',
                  WebkitAppearance: 'none',
                  zIndex: 2,
                  top: '-15px',
                  height: '32px'
                }}
              />
              
              {/* Min handle */}
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={cameraVerticalMin}
                onChange={(e) => {
                  const newMin = Number(e.target.value)
                  if (newMin < cameraVerticalMax - 5) {
                    setCameraVerticalMin(newMin)
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer slider-dual-futuristic"
                style={{
                  background: 'transparent',
                  pointerEvents: 'auto',
                  WebkitAppearance: 'none',
                  zIndex: 1,
                  top: '-15px',
                  height: '32px'
                }}
              />
              
              <style jsx>{`
                .slider-dual-futuristic::-webkit-slider-thumb {
                  appearance: none;
                  width: 8px;
                  height: 19px;
                  border-radius: 4px;
                  background: linear-gradient(135deg, #00ffff, #0099ff);
                  border: 1px solid rgba(255, 255, 255, 0.9);
                  cursor: pointer;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                  transition: all 0.2s ease;
                }
                .slider-dual-futuristic::-webkit-slider-thumb:hover {
                  box-shadow: 0 0 30px rgba(0, 255, 255, 1);
                }
                .slider-dual-futuristic::-moz-range-thumb {
                  width: 8px;
                  height: 19px;
                  border-radius: 4px;
                  background: linear-gradient(135deg, #00ffff, #0099ff);
                  border: 1px solid rgba(255, 255, 255, 0.9);
                  cursor: pointer;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                  border: none;
                }
              `}</style>
              
              {/* Scale markers and labels */}
              <div className="relative mt-2" style={{ marginBottom: '22px' }}>
                {/* Minor ticks (smaller, dimmer) */}
                {[5.5, 11, 16.5, 22, 27.5, 33, 38.5, 44.5, 55.5, 61, 66.5, 72, 77.5, 83, 88.5, 94.5].map(position => (
                  <div 
                    key={`minor-${position}`}
                    className="absolute"
                    style={{ 
                      left: `${position}%`, 
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div style={{ 
                        width: '0.5px', 
                        height: '3px',
                        backgroundColor: 'rgba(100, 200, 255, 0.25)',
                        marginBottom: '0.5px'
                      }}></div>
                    </div>
                  </div>
                ))}
                
                {/* Major ticks (with numbers) */}
                {[
                  { value: '-90°', position: 0 },
                  { value: '0°', position: 50 },
                  { value: '90°', position: 100 }
                ].map(({ value, position }) => (
                  <div 
                    key={value} 
                    className="absolute"
                    style={{ 
                      left: `${position}%`, 
                      transform: value === '-90°' ? 'translateX(0%)' : value === '90°' ? 'translateX(-100%)' : 'translateX(-50%)'
                    }}
                  >
                    <div className="flex flex-col" style={{ alignItems: value === '-90°' ? 'flex-start' : value === '90°' ? 'flex-end' : 'center' }}>
                      <div className="w-px mb-0.5" style={{ backgroundColor: 'rgba(100, 200, 255, 0.5)', height: '6px' }}></div>
                      <span 
                        className="text-[9px] font-thin font-mono" 
                        style={{ color: '#00ffff' }}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
        </div>

        {/* NASA-Style Orbital Speed Control - Full Width */}
        <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold text-gray-300 tracking-wider">ORBIT ACCELERATION</div>
            <div className="px-1 py-0.5 bg-green-500/20 border border-green-400/40 rounded text-[7px] text-green-300 font-medium">
              {timeScale === 0 ? 'PAUSED' : 'ACTIVE'}
            </div>
          </div>
          
          {/* Large Display */}
          <div className="bg-black/60 rounded border border-cyan-400/20 p-4 mb-3 text-center h-14 flex flex-col justify-center">
            <div className="text-2xl font-mono text-cyan-300 font-bold tracking-wider">
              {timeScale === 0 ? 'PAUSED' : `${String(timeScale.toFixed(0)).padStart(4, '0')}×`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-light">TIME FACTOR</div>
          </div>
          
          {/* Futuristic Slider */}
          <div className="relative w-full mb-4 pb-2">
            {/* Track */}
            <div className="relative h-1 rounded-sm" style={{
              background: 'linear-gradient(to right, transparent, rgba(0, 200, 255, 0.3))'
            }}>
              {/* Active/Filled Track */}
              <div 
                className="absolute h-1 rounded-sm"
                style={{
                  width: `${(timeScale / 5000) * 100}%`,
                  background: '#00ffff',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                }}
              ></div>
            </div>
            
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="absolute w-full appearance-none bg-transparent cursor-pointer slider-futuristic"
              style={{ top: '-15px', height: '32px' }}
            />
            
            {/* Scale markers and labels */}
            <div className="relative mt-2">
              {/* Minor ticks (smaller, dimmer) */}
              {[2, 4, 6, 8, 10, 12, 14, 16, 18, 22, 24, 26, 28, 30, 32, 34, 36, 38, 42, 44, 46, 48, 50, 52, 54, 56, 58, 62, 64, 66, 68, 70, 72, 74, 76, 78, 82, 84, 86, 88, 90, 92, 94, 96, 98].map(position => (
                <div 
                  key={`minor-${position}`}
                  className="absolute"
                  style={{ 
                    left: `${position}%`, 
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div style={{ 
                      width: '0.5px', 
                      height: '3px',
                      backgroundColor: 'rgba(100, 200, 255, 0.25)',
                      marginBottom: '0.5px'
                    }}></div>
                  </div>
                </div>
              ))}
              
              {/* Major ticks (with numbers) */}
              {[
                { value: '0', position: 0 },
                { value: '1K', position: 20 },
                { value: '2K', position: 40 },
                { value: '3K', position: 60 },
                { value: '4K', position: 80 },
                { value: '5K', position: 100 }
              ].map(({ value, position }) => (
                <div 
                  key={value} 
                  className="absolute"
                  style={{ 
                    left: `${position}%`, 
                    transform: value === '0' ? 'translateX(0%)' : value === '5K' ? 'translateX(-100%)' : 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col" style={{ alignItems: value === '0' ? 'flex-start' : value === '5K' ? 'flex-end' : 'center' }}>
                    <div className="w-px mb-0.5" style={{ backgroundColor: 'rgba(100, 200, 255, 0.5)', height: '6px' }}></div>
                    <span 
                      className="text-[9px] font-thin font-mono" 
                      style={{ color: '#00ffff' }}
                    >
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <style jsx>{`
              .slider-futuristic::-webkit-slider-thumb {
                appearance: none;
                width: 8px;
                height: 19px;
                border-radius: 4px;
                background: linear-gradient(135deg, #00ffff, #0099ff);
                border: 1px solid rgba(255, 255, 255, 0.9);
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                transition: all 0.2s ease;
              }
              .slider-futuristic::-webkit-slider-thumb:hover {
                box-shadow: 0 0 30px rgba(0, 255, 255, 1);
              }
              .slider-futuristic::-moz-range-thumb {
                width: 8px;
                height: 19px;
                border-radius: 4px;
                background: linear-gradient(135deg, #00ffff, #0099ff);
                border: 1px solid rgba(255, 255, 255, 0.9);
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                border: none;
              }
            `}</style>
          </div>
          
          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-2" style={{ marginTop: '22px' }}>
            <button
              onClick={() => setTimeScale(0)}
              className={`px-3 py-2 text-[10px] font-semibold rounded border transition-all duration-200 flex items-center justify-center ${
                timeScale === 0 
                  ? 'bg-red-500/20 border-red-400/50 text-red-300' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              PAUSE
            </button>
            <button
              onClick={() => setTimeScale(timeScale === 0 ? 250 : timeScale)}
              className={`px-3 py-2 text-[10px] font-semibold rounded border transition-all duration-200 flex items-center justify-center ${
                timeScale > 0 
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50'
              }`}
                          >
                RESUME
              </button>
          </div>
        </div>

        {/* NASA-Style Display Configuration */}
        <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold text-gray-300 tracking-wider">DISPLAY CONFIGURATION</div>
            <div className={`px-1 py-0.5 rounded text-[7px] font-medium ${
              (() => {
                const activeCount = [showSun, showOrbits, showMoons, showAsteroidBelt, showStars, showPlanets].filter(Boolean).length
                return activeCount === 0 
                  ? 'bg-orange-500/20 border border-orange-400/40 text-orange-300' 
                  : 'bg-green-500/20 border border-green-400/40 text-green-300'
              })()
            }`}>
              {[showSun, showOrbits, showMoons, showAsteroidBelt, showStars, showPlanets].filter(Boolean).length} ACTIVE
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setShowSun(!showSun)}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showSun 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showSun 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showSun 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showSun ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showSun 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">SUN</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setShowOrbits(!showOrbits)}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showOrbits 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showOrbits 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showOrbits 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showOrbits ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showOrbits 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">ORBITS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setShowPlanets(!showPlanets)}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showPlanets 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showPlanets 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showPlanets 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showPlanets ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showPlanets 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">PLANETS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setShowMoons(!showMoons)}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showMoons 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showMoons 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showMoons 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showMoons ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showMoons 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">MOONS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => {
                  setShowAsteroidBelt(!showAsteroidBelt)
                  setShowKuiperBelt(!showKuiperBelt)
                }}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showAsteroidBelt 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showAsteroidBelt 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showAsteroidBelt 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showAsteroidBelt ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showAsteroidBelt 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">ASTEROIDS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setShowStars(!showStars)}
                className={`w-12 h-6 rounded-full border cursor-pointer transition-all duration-300 relative ${
                  showStars 
                    ? 'bg-gray-800/40 border-cyan-400/60' 
                    : 'bg-gray-900/60 border-gray-700/40'
                }`}
                style={{
                  boxShadow: showStars 
                    ? '0 0 15px rgba(0, 255, 255, 0.4), 0 0 25px rgba(0, 255, 255, 0.2)' 
                    : 'none'
                }}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    showStars 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '50%',
                    left: showStars ? '26.5px' : '6.5px',
                    transform: 'translateY(-50%)',
                    boxShadow: showStars 
                      ? '0 0 10px rgba(0, 255, 255, 0.6)' 
                      : 'none'
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-white/80 mt-1 font-light">STAR FIELD</div>
            </div>
          </div>
        </div>

        {/* NASA-Style Background Intensity Control */}
        <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold text-gray-300 tracking-wider">GALAXY LUMINOSITY</div>
            <div className="px-1 py-0.5 bg-green-500/20 border border-green-400/40 rounded text-[7px] text-green-300 font-medium">
              {(milkyWayBrightness * 100).toFixed(0)}%
            </div>
          </div>
          
          {/* Futuristic Slider */}
          <div className="relative w-full mb-4 pb-2">
            {/* Track */}
            <div className="relative h-1 rounded-sm" style={{
              background: 'linear-gradient(to right, transparent, rgba(0, 200, 255, 0.3))'
            }}>
              {/* Active/Filled Track */}
              <div 
                className="absolute h-1 rounded-sm"
                style={{
                  width: `${milkyWayBrightness * 100}%`,
                  background: '#00ffff',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                }}
              ></div>
            </div>
            
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={milkyWayBrightness}
              onChange={(e) => setMilkyWayBrightness(Number(e.target.value))}
              className="absolute w-full appearance-none bg-transparent cursor-pointer slider-futuristic"
              style={{ top: '-15px', height: '32px' }}
            />
            
            {/* Scale markers and labels */}
            <div className="relative mt-2" style={{ marginBottom: '10px' }}>
              {/* Minor ticks (smaller, dimmer) */}
              {[2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 52.5, 55, 57.5, 60, 62.5, 65, 67.5, 70, 72.5, 77.5, 80, 82.5, 85, 87.5, 90, 92.5, 95, 97.5].map(position => (
                <div 
                  key={`minor-${position}`}
                  className="absolute"
                  style={{ 
                    left: `${position}%`, 
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div style={{ 
                      width: '0.5px', 
                      height: '3px',
                      backgroundColor: 'rgba(100, 200, 255, 0.25)',
                      marginBottom: '0.5px'
                    }}></div>
                  </div>
                </div>
              ))}
              
              {/* Major ticks (with numbers) */}
              {[
                { value: '0', position: 0 },
                { value: '25', position: 25 },
                { value: '50', position: 50 },
                { value: '75', position: 75 },
                { value: '100', position: 100 }
              ].map(({ value, position }) => (
                <div 
                  key={value} 
                  className="absolute"
                  style={{ 
                    left: `${position}%`, 
                    transform: value === '0' ? 'translateX(0%)' : value === '100' ? 'translateX(-100%)' : 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col" style={{ alignItems: value === '0' ? 'flex-start' : value === '100' ? 'flex-end' : 'center' }}>
                    <div className="w-px mb-0.5" style={{ backgroundColor: 'rgba(100, 200, 255, 0.5)', height: '6px' }}></div>
                    <span 
                      className="text-[9px] font-thin font-mono" 
                      style={{ color: '#00ffff' }}
                    >
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <style jsx>{`
              .slider-futuristic::-webkit-slider-thumb {
                appearance: none;
                width: 8px;
                height: 19px;
                border-radius: 4px;
                background: linear-gradient(135deg, #00ffff, #0099ff);
                border: 1px solid rgba(255, 255, 255, 0.9);
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                transition: all 0.2s ease;
              }
              .slider-futuristic::-webkit-slider-thumb:hover {
                box-shadow: 0 0 30px rgba(0, 255, 255, 1);
              }
              .slider-futuristic::-moz-range-thumb {
                width: 8px;
                height: 19px;
                border-radius: 4px;
                background: linear-gradient(135deg, #00ffff, #0099ff);
                border: 1px solid rgba(255, 255, 255, 0.9);
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                border: none;
              }
            `}</style>
          </div>
        </div>
          </>
        )}

      </div>

      {/* Tooltip */}
      {hoveredObject && (
        <div 
          className="absolute top-4 right-4 z-50 pointer-events-none backdrop-blur-sm border border-white/20 text-white p-4 rounded-2xl shadow-2xl max-w-xs"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Celestial Body Media */}
          <CelestialBodyMedia celestialBody={hoveredObject} />
          
          <h3 className="text-sm font-semibold text-white mt-3">{hoveredObject.name}</h3>
          <p className="text-xs text-blue-300 mb-2">{hoveredObject.type}</p>
          <div className="text-xs text-white/80 leading-relaxed space-y-2">
            {hoveredObject.description.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 25, 35], fov: 60 }}>
        <CameraSystem 
          automaticMode={cameraAnimation} 
          speed={cameraSpeed} 
          verticalMin={cameraVerticalMin}
          verticalMax={cameraVerticalMax}
          onEasterEggTrigger={handleEasterEggTrigger}
          easterEggDelayTimer={easterEggDelayTimer}
          setEasterEggDelayTimer={setEasterEggDelayTimer}
          easterEggActive={easterEggActive}
          easterEggCooldown={easterEggCooldown}
          cameraFrozen={cameraFrozen}
          setCameraFrozen={setCameraFrozen}
          frozenCameraPosition={frozenCameraPosition}
          setFrozenCameraPosition={setFrozenCameraPosition}
          onMilkyWayEasterEggTrigger={handleMilkyWayEasterEggTrigger}
          milkyWayEasterEggActive={milkyWayEasterEggActive}
          milkyWayEasterEggCooldown={milkyWayEasterEggCooldown}
        />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" />
        <pointLight position={[100, 50, 100]} intensity={0.2} color="#ffffff" />
        <directionalLight position={[0, 0, 0]} intensity={1} color="#FDB813" />
        
        {/* Background - Enhanced star visibility */}
        {showStars && <BackgroundStars count={60000} />}
        {showStars && <InnerStars count={15000} />}
        <MilkyWay brightness={milkyWayBrightness} />
        
        {/* System Rotation Group */}
        <group>
          
          {/* Sun at center */}
          {showSun && <Sun onHover={handleObjectHover} onUnhover={handleObjectUnhover} />}
          
          {/* Orbit rings */}
          {showOrbits && planetData.map((planet) => (
            <OrbitRing 
              key={`${planet.name}-orbit`} 
              distance={planet.distance}
              planetName={planet.name}
              onHover={handleObjectHover}
              onUnhover={handleObjectUnhover}
            />
          ))}
          
          {/* All planets with moons */}
          {showPlanets && planetData.map((planet) => (
            <Planet 
              key={planet.name}
              distance={planet.distance}
              radius={planet.radius}
              color={planet.color}
              speed={planet.speed * timeScale}
              name={planet.name}
              startAngle={planet.startAngle}
              moons={showMoons ? planet.moons : undefined}
              timeScale={timeScale}
              onHover={handleObjectHover}
              onUnhover={handleObjectUnhover}
              inclination={planet.inclination}
              eccentricity={planet.eccentricity}
              axialTilt={planet.axialTilt}
            />
          ))}
          
          {/* Saturn's Rings */}
          {saturnData && (
            <SaturnRings 
              planet={saturnData}
              timeScale={timeScale}
            />
          )}
          
          {/* Asteroid Belt */}
          <AsteroidBelt 
            show={showAsteroidBelt} 
            timeScale={timeScale} 
            onHover={handleObjectHover}
            onUnhover={handleObjectUnhover}
          />
          
          {/* Kuiper Belt */}
          <KuiperBelt 
            show={showKuiperBelt} 
            timeScale={timeScale}
            onHover={handleObjectHover}
            onUnhover={handleObjectUnhover}
          />
          
        </group>
        
      </Canvas>
      
      {/* Sun Easter Egg Overlay */}
      {console.log('🚨 RENDERING CHECK - easterEggActive:', easterEggActive)}
      <SunEasterEgg
        isActive={easterEggActive}
        onComplete={handleEasterEggComplete}
        sunColor="#E8C543"
      />
      
      {/* Milky Way Easter Egg Overlay */}
      {console.log('🌌 RENDERING CHECK - milkyWayEasterEggActive:', milkyWayEasterEggActive)}
      <MilkyWayEasterEgg
        isActive={milkyWayEasterEggActive}
        onComplete={handleMilkyWayEasterEggComplete}
      />
      
    </div>
  )
}

// Export main component (cache temporarily disabled for debugging)
export default function SolarSystemEnhancedWithCache() {
  return <SolarSystemEnhanced />
}

