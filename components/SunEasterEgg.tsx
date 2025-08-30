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
  const animationRef = useRef<HTMLDivElement>(null)
  const quoteTimeoutRef = useRef<NodeJS.Timeout>()
  const completeTimeoutRef = useRef<NodeJS.Timeout>()

  // Load movie references data
  const loadMovieReferences = async (): Promise<Silhouette[]> => {
    try {
      const response = await fetch('/movieReferences.json')
      const data = await response.json()
      return data.silhouettes
    } catch (error) {
      console.error('Failed to load movie references:', error)
      return []
    }
  }

  // Get next silhouette to show (cycle through all before repeating)
  const getNextSilhouette = (silhouettes: Silhouette[]): Silhouette => {
    const shownSilhouettes = JSON.parse(localStorage.getItem('shownSilhouettes') || '[]')
    const unshownSilhouettes = silhouettes.filter(s => !shownSilhouettes.includes(s.id))
    
    let selectedSilhouette: Silhouette
    if (unshownSilhouettes.length > 0) {
      // Pick randomly from unshown
      selectedSilhouette = unshownSilhouettes[Math.floor(Math.random() * unshownSilhouettes.length)]
    } else {
      // All have been shown, reset and pick randomly
      localStorage.setItem('shownSilhouettes', '[]')
      selectedSilhouette = silhouettes[Math.floor(Math.random() * silhouettes.length)]
    }
    
    // Mark as shown
    const updatedShown = [...shownSilhouettes, selectedSilhouette.id]
    localStorage.setItem('shownSilhouettes', JSON.stringify(updatedShown))
    
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

  // Typewriter effect for quote - Fixed to prevent character corruption
  const typewriterEffect = (text: string, delay: number = 80) => {
    setDisplayedQuote('')
    let index = 0
    
    const type = () => {
      if (index < text.length) {
        const char = text.charAt(index)
        setDisplayedQuote(prevText => prevText + char)
        index++
        setTimeout(type, delay)
      }
    }
    
    setTimeout(type, 1000) // Start typing after 1 second delay
  }

  // Get CSS animation class for motion type
  const getMotionClass = (motion: string): string => {
    switch (motion) {
      case 'steady horizontal glide':
        return 'animate-steady-glide'
      case 'slight up and down bobbing':
        return 'animate-bobbing'
      case 'slow clockwise rotation':
        return 'animate-slow-rotate-cw'
      case 'very slow clockwise rotation':
        return 'animate-very-slow-rotate-cw'
      case 'slow counterclockwise rotation':
        return 'animate-slow-rotate-ccw'
      case 'slow side-to-side wobble':
        return 'animate-wobble'
      case 'slight vibration':
        return 'animate-vibration'
      case 'quick up and down wobble':
        return 'animate-quick-wobble'
      case 'gentle floating up and down':
        return 'animate-gentle-float'
      case 'bumpy up and down motion':
        return 'animate-bumpy-motion'
      default:
        return 'animate-steady-glide'
    }
  }

  // Start the Easter egg animation
  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true)
      
      const startAnimation = async () => {
        // Load movie references and select one
        const silhouettes = await loadMovieReferences()
        if (silhouettes.length === 0) return
        
        const selectedSilhouette = getNextSilhouette(silhouettes)
        setCurrentSilhouette(selectedSilhouette)
        
        // Load SVG content
        const svgContent = await loadSVGContent(selectedSilhouette.svgPath)
        setSvgContent(svgContent)
        
        // Start quote typewriter effect
        setShowQuote(true)
        typewriterEffect(selectedSilhouette.quote)
        
        // Complete animation after 7 seconds
        completeTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
          setShowQuote(false)
          setDisplayedQuote('')
          setCurrentSilhouette(null)
          setSvgContent('')
          
          // Wait 3 more seconds then trigger zoom out
          setTimeout(() => {
            onComplete()
          }, 3000)
        }, 7000)
      }
      
      startAnimation()
    }

    return () => {
      if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current)
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current)
    }
  }, [isActive, isAnimating, onComplete])

  if (!isActive || !currentSilhouette) {
    return null
  }

  return (
    <>
      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes steady-glide {
          from { transform: translateX(-150px); }
          to { transform: translateX(calc(100vw + 150px)); }
        }
        
        @keyframes bobbing {
          0%, 100% { transform: translateX(-150px) translateY(0px); }
          25% { transform: translateX(25vw) translateY(-8px); }
          50% { transform: translateX(50vw) translateY(0px); }
          75% { transform: translateX(75vw) translateY(-6px); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0px); }
        }
        
        @keyframes slow-rotate-cw {
          from { transform: translateX(-150px) rotate(0deg); }
          to { transform: translateX(calc(100vw + 150px)) rotate(360deg); }
        }
        
        @keyframes very-slow-rotate-cw {
          from { transform: translateX(-150px) rotate(0deg); }
          to { transform: translateX(calc(100vw + 150px)) rotate(180deg); }
        }
        
        @keyframes slow-rotate-ccw {
          from { transform: translateX(-150px) rotate(0deg); }
          to { transform: translateX(calc(100vw + 150px)) rotate(-360deg); }
        }
        
        @keyframes wobble {
          0% { transform: translateX(-150px) translateY(0px); }
          25% { transform: translateX(25vw) translateY(-4px); }
          50% { transform: translateX(50vw) translateY(4px); }
          75% { transform: translateX(75vw) translateY(-4px); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0px); }
        }
        
        @keyframes vibration {
          0%, 100% { transform: translateX(-150px); }
          10% { transform: translateX(-148px); }
          20% { transform: translateX(-152px); }
          30% { transform: translateX(-149px); }
          40% { transform: translateX(-151px); }
          50% { transform: translateX(50vw); }
          60% { transform: translateX(calc(50vw + 1px)); }
          70% { transform: translateX(calc(50vw - 1px)); }
          80% { transform: translateX(calc(50vw + 1px)); }
          90% { transform: translateX(calc(50vw - 1px)); }
          100% { transform: translateX(calc(100vw + 150px)); }
        }
        
        @keyframes quick-wobble {
          0% { transform: translateX(-150px) translateY(0px); }
          10% { transform: translateX(10vw) translateY(-5px); }
          20% { transform: translateX(20vw) translateY(5px); }
          30% { transform: translateX(30vw) translateY(-5px); }
          40% { transform: translateX(40vw) translateY(5px); }
          50% { transform: translateX(50vw) translateY(-5px); }
          60% { transform: translateX(60vw) translateY(5px); }
          70% { transform: translateX(70vw) translateY(-5px); }
          80% { transform: translateX(80vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0px); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateX(-150px) translateY(0px); }
          25% { transform: translateX(25vw) translateY(-8px); }
          50% { transform: translateX(50vw) translateY(-3px); }
          75% { transform: translateX(75vw) translateY(-10px); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0px); }
        }
        
        @keyframes bumpy-motion {
          0% { transform: translateX(-150px) translateY(0px); }
          12.5% { transform: translateX(12.5vw) translateY(-6px); }
          25% { transform: translateX(25vw) translateY(3px); }
          37.5% { transform: translateX(37.5vw) translateY(-4px); }
          50% { transform: translateX(50vw) translateY(2px); }
          62.5% { transform: translateX(62.5vw) translateY(-7px); }
          75% { transform: translateX(75vw) translateY(1px); }
          87.5% { transform: translateX(87.5vw) translateY(-3px); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0px); }
        }

        .animate-steady-glide { animation: steady-glide 7s linear forwards; }
        .animate-bobbing { animation: bobbing 7s ease-in-out forwards; }
        .animate-slow-rotate-cw { animation: slow-rotate-cw 7s linear forwards; }
        .animate-very-slow-rotate-cw { animation: very-slow-rotate-cw 7s linear forwards; }
        .animate-slow-rotate-ccw { animation: slow-rotate-ccw 7s linear forwards; }
        .animate-wobble { animation: wobble 7s ease-in-out forwards; }
        .animate-vibration { animation: vibration 7s linear forwards; }
        .animate-quick-wobble { animation: quick-wobble 7s linear forwards; }
        .animate-gentle-float { animation: gentle-float 7s ease-in-out forwards; }
        .animate-bumpy-motion { animation: bumpy-motion 7s ease-in-out forwards; }
        
        .typewriter {
          font-family: 'Orbitron', 'Space Mono', 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Full screen overlay with sun color */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: sunColor }}
      >
        {/* Animated silhouette */}
        <div
          ref={animationRef}
          className={`absolute top-1/2 -translate-y-1/2 w-32 h-32 ${getMotionClass(currentSilhouette.motion)}`}
          style={{ left: '-150px' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {/* Quote display */}
        {showQuote && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-4xl px-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl text-black typewriter mb-4">
                {displayedQuote}
              </p>
              {displayedQuote === currentSilhouette.quote && (
                <p className="text-lg md:text-xl text-black typewriter opacity-80 animate-fade-in">
                  — {currentSilhouette.movie} ({currentSilhouette.year})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
