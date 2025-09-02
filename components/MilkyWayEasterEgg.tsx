'use client'

import React, { useState, useEffect, useRef } from 'react'

interface MilkyWayEasterEggProps {
  isActive: boolean
  onComplete: () => void
}

export default function MilkyWayEasterEgg({ isActive, onComplete }: MilkyWayEasterEggProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Start video when Easter Egg becomes active
  useEffect(() => {
    if (isActive && videoRef.current) {
      console.log('🌌 Milky Way Easter Egg activated - starting video')
      const video = videoRef.current
      
      // Reset video state
      setVideoLoaded(false)
      setVideoEnded(false)
      video.currentTime = 0
      
      // Start playing
      video.play().catch(error => {
        console.error('Failed to play Milky Way video:', error)
        // If video fails, complete immediately
        setTimeout(() => onComplete(), 1000)
      })
    }
  }, [isActive, onComplete])

  const handleVideoLoaded = () => {
    console.log('🌌 Milky Way video loaded and ready - starting fade-in')
    setVideoLoaded(true)
    // Start fade-in effect
    setTimeout(() => {
      setFadeIn(true)
    }, 100) // Small delay to ensure video is ready
  }

  const handleVideoEnded = () => {
    console.log('🌌 Milky Way video ended - starting fade-out')
    setVideoEnded(true)
    setFadeOut(true)
    
    // Complete immediately after fade-out animation
    setTimeout(() => {
      console.log('🌌 Fade-out complete - calling onComplete')
      onComplete()
    }, 950) // Slightly less than 1s to avoid flash
  }

  if (!isActive) {
    return null
  }

  return (
    <>
      {/* CSS for fade effects */}
      <style jsx>{`
        .video-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-in forwards;
        }
        
        .video-fade-out {
          opacity: 1;
          animation: fadeOut 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      <div 
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${
            fadeOut ? 'video-fade-out' : 
            fadeIn ? 'video-fade-in' : 
            'opacity-0'
          }`}
          onLoadedData={handleVideoLoaded}
          onEnded={handleVideoEnded}
          muted
          playsInline
        >
          <source src="/milky_way.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        

      </div>
    </>
  )
}
