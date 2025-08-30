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

  // All animations now use simple straight line motion
  const getMotionClass = (motion: string): string => {
    return 'animate-straight-line'
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
        
        // Complete animation after 7 seconds (when SVG exits screen)
        completeTimeoutRef.current = setTimeout(() => {
          // Start fade-out of quotes and overlay
          setShowQuote(false)
          
          // Wait 3 more seconds, then fade out completely
          setTimeout(() => {
            setIsAnimating(false)
            setDisplayedQuote('')
            setCurrentSilhouette(null)
            setSvgContent('')
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
        @keyframes straight-line {
          from { transform: translateX(-150px) translateY(-50%); }
          to { transform: translateX(calc(100vw + 150px)) translateY(-50%); }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .animate-straight-line { animation: straight-line 7s linear forwards; }
        .easter-egg-overlay { animation: fade-out 1s ease-out forwards; animation-delay: 7s; }
        
        .typewriter {
          font-family: 'Orbitron', 'Space Mono', 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Full screen overlay with sun color */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${!showQuote ? 'easter-egg-overlay' : ''}`}
        style={{ backgroundColor: sunColor }}
      >
        {/* Animated silhouette */}
        <div
          ref={animationRef}
          className={`absolute w-10 h-10 ${getMotionClass(currentSilhouette.motion)}`}
          style={{ left: '-150px', top: '50%', transform: 'translateY(-50%)' }}
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
