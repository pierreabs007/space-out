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
  const [rotationDirection, setRotationDirection] = useState<'cw' | 'ccw'>('cw')
  const animationRef = useRef<HTMLDivElement>(null)
  const quoteTimeoutRef = useRef<NodeJS.Timeout>()
  const completeTimeoutRef = useRef<NodeJS.Timeout>()

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

  // All animations now use slow counterclockwise rotation
  const getMotionClass = (motion: string): string => {
    console.log('🎬 Using slow counterclockwise rotation for all SVGs')
    return 'animate-slow-counterclockwise-spin'
  }

  // Start the Easter egg animation
  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true)
      
      const startAnimation = async () => {
        // Load movie references and select one
        const silhouettes = await loadMovieReferences()
        if (silhouettes.length === 0) return
        
        // Clear localStorage for testing (remove after debugging)
        localStorage.removeItem('shownSilhouettes')
        console.log('🎬 Cleared localStorage for fresh selection')
        
        const selectedSilhouette = getNextSilhouette(silhouettes)
        setCurrentSilhouette(selectedSilhouette)
        console.log('🎬 Final selected silhouette:', selectedSilhouette.name, selectedSilhouette.id)
        
        // Choose rotation direction ONCE when animation starts
        setRotationDirection(Math.random() > 0.5 ? 'cw' : 'ccw')
        
        // Load SVG content
        const svgContent = await loadSVGContent(selectedSilhouette.svgPath)
        setSvgContent(svgContent)
        
        // WAIT 1.5 seconds before starting animation
        setTimeout(() => {
          console.log('🎬 Starting animation after delay...')
          
          // Start quote fade-in effect immediately with animation
          setShowQuote(true)
          fadeInText(selectedSilhouette.quote)
          
          // SVG animation completes after 7 seconds
          completeTimeoutRef.current = setTimeout(() => {
            console.log('🎬 SVG exited screen - hiding text')
            
            // Step 1: Hide quotes immediately when SVG exits  
            setShowQuote(false)
            
            // Step 2: Wait 2 seconds then FORCE return to solar system
            setTimeout(() => {
              console.log('🎬 FORCING return to solar system - clearing state FIRST')
              
              // Clear local state immediately
              setIsAnimating(false)
              setShowQuote(false) 
              setDisplayedQuote('')
              setCurrentSilhouette(null)
              setSvgContent('')
              
              // THEN call parent completion (this should hide the overlay)
              setTimeout(() => {
                console.log('🚨 About to call onComplete() - this should end Easter egg!')
                console.log('🚨 Current isAnimating:', isAnimating)
                console.log('🚨 Current currentSilhouette:', currentSilhouette?.name)
                onComplete()
                console.log('🚨 onComplete() called - Easter egg should be hidden now')
              }, 100)
            }, 2000)
          }, 7000)
          
        }, 1500) // 1.5 second delay before animation starts
      }
      
      startAnimation()
    }

    return () => {
      if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current)
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current)
    }
  }, [isActive, isAnimating, onComplete])

  console.log('🔍 EASTER EGG RENDER CHECK - isActive:', isActive, 'currentSilhouette:', currentSilhouette?.name)
  
  if (!isActive || !currentSilhouette) {
    console.log('🔍 Easter egg NOT rendering - returning null')
    return null
  }
  
  console.log('🔍 Easter egg IS rendering - showing overlay')

  return (
    <>
      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes slight-bobbing {
          0% { transform: translateX(-50px) translateY(calc(-50% + 0px)) scale(0.28); }
          10% { transform: translateX(calc(10vw - 50px)) translateY(calc(-50% - 2px)) scale(0.28); }
          20% { transform: translateX(calc(20vw - 50px)) translateY(calc(-50% - 3px)) scale(0.28); }
          30% { transform: translateX(calc(30vw - 50px)) translateY(calc(-50% - 2px)) scale(0.28); }
          40% { transform: translateX(calc(40vw - 50px)) translateY(calc(-50% + 0px)) scale(0.28); }
          50% { transform: translateX(calc(50vw - 50px)) translateY(calc(-50% + 2px)) scale(0.28); }
          60% { transform: translateX(calc(60vw - 50px)) translateY(calc(-50% + 3px)) scale(0.28); }
          70% { transform: translateX(calc(70vw - 50px)) translateY(calc(-50% + 2px)) scale(0.28); }
          80% { transform: translateX(calc(80vw - 50px)) translateY(calc(-50% + 0px)) scale(0.28); }
          90% { transform: translateX(calc(90vw - 50px)) translateY(calc(-50% - 2px)) scale(0.28); }
          100% { transform: translateX(calc(100vw + 300px)) translateY(calc(-50% + 0px)) scale(0.28); }
        }
        
        @keyframes slow-clockwise-spin {
          0% { transform: translateX(-30px) translateY(-50%) scale(0.28) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(-50%) scale(0.28) rotate(180deg); }
        }
        
        @keyframes slow-counterclockwise-spin {
          0% { transform: translateX(-30px) translateY(-50%) scale(0.28) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(-50%) scale(0.28) rotate(-180deg); }
        }
        
        @keyframes slight-vibration {
          0% { transform: translateX(-50px) translateY(-50%) scale(0.28); }
          10% { transform: translateX(10vw) translateY(calc(-50% - 1px)) scale(0.28); }
          20% { transform: translateX(20vw) translateY(calc(-50% + 1px)) scale(0.28); }
          30% { transform: translateX(30vw) translateY(calc(-50% - 1px)) scale(0.28); }
          40% { transform: translateX(40vw) translateY(calc(-50% + 1px)) scale(0.28); }
          50% { transform: translateX(50vw) translateY(calc(-50% - 1px)) scale(0.28); }
          60% { transform: translateX(60vw) translateY(calc(-50% + 1px)) scale(0.28); }
          70% { transform: translateX(70vw) translateY(calc(-50% - 1px)) scale(0.28); }
          80% { transform: translateX(80vw) translateY(calc(-50% + 1px)) scale(0.28); }
          90% { transform: translateX(90vw) translateY(calc(-50% - 1px)) scale(0.28); }
          100% { transform: translateX(calc(100vw + 300px)) translateY(-50%) scale(0.28); }
        }
        
        @keyframes easteregg-fadeout {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-slight-bobbing { animation: slight-bobbing 7s linear forwards; }
        .animate-slow-clockwise-spin { animation: slow-clockwise-spin 7s linear forwards; }
        .animate-slow-counterclockwise-spin { animation: slow-counterclockwise-spin 7s linear forwards; }
        .animate-slight-vibration { animation: slight-vibration 7s linear forwards; }
        
        .typewriter {
          font-family: 'Orbitron', 'Space Mono', 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Full screen overlay with sun color */}
      <div 
        className={isAnimating ? "fixed inset-0 z-50" : "fixed inset-0 z-50 easteregg-ending"}
        style={{ 
          backgroundColor: sunColor,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden' // Force hide anything outside viewport
        }}
      >
        {/* Animated silhouette - FORCE OFF-SCREEN EXIT */}
        <div
          ref={animationRef}
          className={getMotionClass(currentSilhouette.motion)}
          style={{ 
            position: 'fixed',
            width: '50px',
            height: '50px',
            left: '-50px', // Start further left
            top: '50%',
            zIndex: 9999,
            margin: 0,
            padding: 0
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {/* Quote display - Fade in instead of typewriter */}
        {showQuote && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-4xl px-8 animate-fade-in">
            <div className="text-center">
              <p className="text-lg md:text-xl lg:text-2xl text-black mb-4" style={{ 
                fontFamily: 'Orbitron, Space Mono, Courier New, monospace',
                fontWeight: 'bold',
                letterSpacing: '1px',
                animation: 'fade-in 0.8s ease-in forwards'
              }}>
                {displayedQuote}
              </p>
              {displayedQuote && (
                <p className="text-sm md:text-base text-black opacity-80" style={{ 
                  fontFamily: 'Orbitron, Space Mono, Courier New, monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  animation: 'fade-in 1.2s ease-in forwards'
                }}>
                  {currentSilhouette.movie} ({currentSilhouette.year})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
