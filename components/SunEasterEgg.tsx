'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Silhouette {
  id: string
  name: string
  svgPath: string
  quote: string
  movie: string
  year: number
  motion: string
}

interface SunEasterEggProps {
  isActive: boolean
  onComplete: () => void
  sunColor: string
}

export default function SunEasterEgg({ isActive, onComplete, sunColor }: SunEasterEggProps) {
  const [currentSilhouette, setCurrentSilhouette] = useState<Silhouette | null>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [showQuote, setShowQuote] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSvg, setShowSvg] = useState(false)
  const [showMovieInfo, setShowMovieInfo] = useState(false)

  const animationRef = useRef<HTMLDivElement>(null)
  const quoteTimeoutRef = useRef<NodeJS.Timeout>()
  const animationFrameRef = useRef<number | null>(null)
  const [currentX, setCurrentX] = useState<number>(0)
  const [debugInfo, setDebugInfo] = useState<{viewport: number, startX: number, endX: number, svgWidth: number, leftEdge: number, rightEdge: number} | null>(null)
  const [realTimePosition, setRealTimePosition] = useState<number | null>(null)

  // Load movie references data
  const loadMovieReferences = async (): Promise<Silhouette[]> => {
    try {
      const response = await fetch('/movieReferences.json')
      const data = await response.json()
      console.log('🎬 Loaded silhouettes:', data.silhouettes.length, 'items')
      console.log('🎬 Silhouette IDs:', data.silhouettes.map((s: Silhouette) => s.id))
      return data.silhouettes
    } catch (error) {
      console.error('Failed to load movie references:', error)
      return []
    }
  }

  // Get next silhouette to show (cycle through all before repeating)
  const getNextSilhouette = (silhouettes: Silhouette[]): Silhouette => {
    const shownSilhouettes = JSON.parse(localStorage.getItem('shownSilhouettes') || '[]')
    console.log('🎬 Previously shown:', shownSilhouettes)
    
    const unshownSilhouettes = silhouettes.filter(s => !shownSilhouettes.includes(s.id))
    console.log('🎬 Available unshown:', unshownSilhouettes.map(s => s.id))
    
    let selectedSilhouette: Silhouette
    if (unshownSilhouettes.length > 0) {
      // Pick randomly from unshown
      selectedSilhouette = unshownSilhouettes[Math.floor(Math.random() * unshownSilhouettes.length)]
      console.log('🎬 Selected from unshown:', selectedSilhouette.id)
    } else {
      // All have been shown, reset and pick randomly
      console.log('🎬 All shown, resetting localStorage')
      localStorage.setItem('shownSilhouettes', '[]')
      selectedSilhouette = silhouettes[Math.floor(Math.random() * silhouettes.length)]
      console.log('🎬 Selected after reset:', selectedSilhouette.id)
    }
    
    // Mark as shown
    const updatedShown = [...shownSilhouettes, selectedSilhouette.id]
    localStorage.setItem('shownSilhouettes', JSON.stringify(updatedShown))
    console.log('🎬 Updated shown list:', updatedShown)
    
    return selectedSilhouette
  }

  // Load SVG content dynamically
  const loadSVGContent = async (svgPath: string): Promise<string> => {
    try {
      const response = await fetch(svgPath)
      if (!response.ok) {
        // If SVG doesn't exist, create a simple placeholder shape
        return `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="80" height="10" rx="5" fill="black"/>
          <circle cx="20" cy="25" r="8" fill="black"/>
          <circle cx="80" cy="25" r="8" fill="black"/>
        </svg>`
      }
      const svgText = await response.text()
      // Ensure SVG is pure black
      return svgText.replace(/fill="[^"]*"/g, 'fill="black"').replace(/stroke="[^"]*"/g, 'stroke="black"')
    } catch (error) {
      console.error('Failed to load SVG:', error)
      // Return placeholder rocket shape
      return `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,25 30,15 70,15 90,25 70,35 30,35" fill="black"/>
        <circle cx="75" cy="25" r="5" fill="black"/>
      </svg>`
    }
  }

  // Fade-in effect for quote (replacing typewriter)
  const fadeInText = (text: string) => {
    setDisplayedQuote(text) // Set text immediately
  }

  // Distance-based animation function
  const startDistanceBasedAnimation = () => {
    const element = animationRef.current
    if (!element) return
    
    // Measure viewport and SVG
    const viewportWidth = window.innerWidth
    const svgElement = element.querySelector('svg')
    const svgWidth = svgElement ? svgElement.getBoundingClientRect().width : 50
    
    // Calculate start and end positions (3x SVG width off-screen, 1x SVG width past right edge)
    const startX = -(svgWidth * 3) // 3x SVG width off-screen left
    const endX = viewportWidth + svgWidth // 1x SVG width past right edge
    const speed = 4 // pixels per frame (adjust for desired speed)
    
    // Random rotation direction and sine curve parameters
    const rotationDirection = Math.random() < 0.5 ? 1 : -1 // Randomly clockwise or counterclockwise
    const centerY = window.innerHeight * 0.5 // Center of screen
    const amplitude = 240 // Height of sine wave (pixels) - 4x for very dramatic floating
    const waveCount = 1.2 // Number of complete waves across screen
    const randomPhaseOffset = Math.random() * Math.PI * 2 // Random starting point on sine wave (0 to 2π)
    
    let currentPosition = startX
    
    console.log(`🎬 Animation setup: viewport=${viewportWidth}px, svgWidth=${svgWidth}px, startX=${startX}px, endX=${endX}px`)
    console.log(`🎬 Rotation direction: ${rotationDirection === 1 ? 'Clockwise' : 'Counterclockwise'}, Sine wave: amplitude=${amplitude}px, waves=${waveCount}, phase=${randomPhaseOffset.toFixed(2)}`)
    
    // Set debug info for display
    setDebugInfo({
      viewport: viewportWidth,
      startX: startX,
      endX: endX,
      svgWidth: svgWidth,
      leftEdge: 0,
      rightEdge: viewportWidth
    })
    
    // IMMEDIATELY position SVG off-screen before starting animation with random sine position
    const initialSineOffset = Math.sin(randomPhaseOffset) * amplitude
    element.style.transform = `translateX(${startX}px) translateY(calc(-50% + ${initialSineOffset}px)) scale(0.28) rotate(0deg)`
    setRealTimePosition(startX) // Set initial position for debug
    
    // Animation loop
    const animate = () => {
      // Update position FIRST, then apply transform
      currentPosition += speed
      const progress = (currentPosition - startX) / (endX - startX) // 0 to 1 across screen
      const rotation = progress * 180 * rotationDirection // Random direction rotation
      
      // Calculate sine curve floating effect with random starting point
      const sineOffset = Math.sin((progress * Math.PI * waveCount) + randomPhaseOffset) * amplitude
      
      // Update real-time position for debug display
      setRealTimePosition(currentPosition)
      
      // Apply position to element with sine curve floating
      element.style.transform = `translateX(${currentPosition}px) translateY(calc(-50% + ${sineOffset}px)) scale(0.28) rotate(${rotation}deg)`
      
      // Check if SVG has exited viewport (start fade-out)
      if (currentPosition >= viewportWidth && !element.dataset.fadeStarted) {
        console.log('🚨 SVG exited viewport - starting text fade-out')
        element.dataset.fadeStarted = 'true' // Prevent multiple fade-outs
        
        // Start fade-out sequence as soon as SVG exits viewport
        const quoteElement = document.querySelector('.easter-egg-quote') as HTMLElement
        if (quoteElement) {
          quoteElement.style.transition = 'opacity 0.5s ease-out'
          quoteElement.style.opacity = '0'
        }
      }
      
      // Check if animation is completely done (SVG fully off-screen)
      if (currentPosition >= endX) {
        console.log('🚨 Distance-based animation complete!')
        animationFrameRef.current = null
        
        // Start overlay fade-out after text fade-out
        setTimeout(() => {
          console.log('🚨 Starting overlay fade-out')
          const overlay = document.querySelector('.easter-egg-overlay') as HTMLElement
          if (overlay) {
            overlay.style.transition = 'opacity 0.8s ease-out'
            overlay.style.opacity = '0'
          }
          
          // Complete after overlay fade-out
          setTimeout(() => {
            console.log('🚨 Calling onComplete() to end Easter Egg')
            onComplete()
          }, 800) // Wait for overlay fade-out
        }, 500) // Wait for text fade-out first
      } else {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate)
  }

  // Start the Easter egg animation
  useEffect(() => {
    if (isActive && !isAnimating) {
      // Reset all state for fresh start
      setShowSvg(false)
      setShowQuote(false)
      setShowMovieInfo(false)
      setCurrentSilhouette(null)
      setSvgContent('')
      setDisplayedQuote('')
      setRealTimePosition(null)
      
      setIsAnimating(true)
      
      const startAnimation = async () => {
        // Load movie references and select one
        const silhouettes = await loadMovieReferences()
        if (silhouettes.length === 0) return
        
        // Keep localStorage tracking intact for proper cycling
        
        const selectedSilhouette = getNextSilhouette(silhouettes)
        setCurrentSilhouette(selectedSilhouette)
        console.log('🎬 Final selected silhouette:', selectedSilhouette.name, selectedSilhouette.id)
        
        // Load SVG content
        const svgContent = await loadSVGContent(selectedSilhouette.svgPath)
        setSvgContent(svgContent)
        
        // Start animation immediately (no delay)
        console.log('🎬 Starting SVG animation immediately...')
        setShowSvg(true)
        
        // Start animation immediately after showing SVG
        requestAnimationFrame(() => {
          startDistanceBasedAnimation()
        })
        
        // Show quote 3.5 seconds after animation starts
        setTimeout(() => {
          console.log('🎬 3.5s delay complete - showing quote...')
          setShowQuote(true)
          fadeInText(selectedSilhouette.quote)
        }, 3500)
      }
      
      startAnimation()
    }

    return () => {
      if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isActive, isAnimating, onComplete])

  console.log('🔍 EASTER EGG RENDER CHECK - isActive:', isActive, 'currentSilhouette:', currentSilhouette?.name)
  
  if (!isActive) {
    console.log('🔍 Easter egg NOT rendering - returning null')
    return null
  }
  
  console.log('🔍 Easter egg IS rendering - showing overlay')

  return (
    <>
      {/* Minimal CSS for fade-in */}
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .typewriter {
          font-family: 'Orbitron', 'Space Mono', 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Full screen overlay with sun color */}
      <div 
        className={`easter-egg-overlay fixed inset-0 z-50 ${isAnimating ? "" : "easteregg-ending"}`}
        style={{ 
          backgroundColor: sunColor,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden' // Force hide anything outside viewport
        }}
      >

        {/* Animated silhouette - distance-based positioning */}
        {showSvg && currentSilhouette && (
          <div
            ref={animationRef}
            style={{ 
              position: 'fixed',
              left: '0px',
              top: '50%',
              zIndex: 9999,
              margin: 0,
              padding: 0,
              transform: `translateX(-500px) translateY(-50%) scale(0.28)`, // Temporary position, will be updated by animation
              willChange: 'transform'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
        
        {/* Quote display - Both quote and movie info always rendered in final positions */}
        {showQuote && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-4xl px-8 easter-egg-quote">
            <div className="text-center">
              <p 
                className="text-lg md:text-xl lg:text-2xl text-black mb-4 cursor-pointer" 
                style={{ 
                  fontFamily: 'Orbitron, Space Mono, Courier New, monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  animation: 'fade-in 0.8s ease-in forwards'
                }}
                onMouseEnter={() => setShowMovieInfo(true)}
                onMouseLeave={() => setShowMovieInfo(false)}
              >
                {displayedQuote}
              </p>
              {/* Movie info ALWAYS rendered (prevents layout shift) but invisible until hover */}
              <p 
                className="text-sm md:text-base text-black"
                style={{ 
                  fontFamily: 'Orbitron, Space Mono, Courier New, monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  opacity: showMovieInfo ? 0.8 : 0,
                  transition: 'opacity 0.4s ease-in-out',
                  pointerEvents: 'none', // Prevent interference with quote hover
                  height: '1.5rem' // Reserve space to prevent layout shift
                }}
              >
                {currentSilhouette?.movie} ({currentSilhouette?.year})
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
