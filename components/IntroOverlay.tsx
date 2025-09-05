'use client'

import React, { useState, useEffect } from 'react'

interface IntroOverlayProps {
  isVisible: boolean
  onClose: () => void
}

export default function IntroOverlay({ isVisible, onClose }: IntroOverlayProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // When overlay becomes visible, check current localStorage state for checkbox
  useEffect(() => {
    if (isVisible) {
      const currentSetting = localStorage.getItem('spaceout-intro-hidden') === 'true'
      setDontShowAgain(currentSetting)
    }
  }, [isVisible])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  const handleClose = () => {
    setIsClosing(true)
    // Wait for fade animation to complete before actually closing
    setTimeout(() => {
      if (dontShowAgain) {
        localStorage.setItem('spaceout-intro-hidden', 'true')
      } else {
        // User unchecked "Don't show again" - remove the setting so overlay shows on next visit
        localStorage.removeItem('spaceout-intro-hidden')
      }
      onClose()
      setIsClosing(false) // Reset for next time
    }, 300) // Match transition duration
  }

  if (!isVisible) return null

  return (
    <>
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes glow {
          0% { filter: drop-shadow(0 0 25px rgba(255, 193, 7, 0.3)); }
          100% { filter: drop-shadow(0 0 25px rgba(255, 193, 7, 0.8)); }
        }

        .space-title {
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes hover-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        .hover-text {
          animation: hover-float 1.8s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2125)',
          backdropFilter: 'blur(8px)',
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.3s ease-out'
        }}
        onClick={handleClose}
      >
        {/* Main container */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1219 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            padding: '50px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 0 60px rgba(6, 182, 212, 0.2)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            opacity: isClosing ? 0 : 1,
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            transform: isClosing ? 'scale(0.95)' : 'scale(1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* SPACE OUT Title */}
          <div className="text-center mb-2">
            {/* SPACE - each letter getting smaller */}
            <div 
              className="space-title"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginBottom: '-15px'
              }}
            >
              {['S', 'P', 'A', 'C', 'E'].map((letter, index) => (
                <span
                  key={`space-${index}`}
                  style={{
                    fontFamily: '"Oups Clean", "Bebas Neue", cursive',
                    fontSize: `${84 - (index * 8)}px`, // 84px, 76px, 68px, 60px, 52px
                    letterSpacing: '4px',
                    background: 'linear-gradient(135deg, #FFB300 0%, #FDD835 50%, #FFB300 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    lineHeight: '0.8'
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
            
            {/* OUT - each letter getting smaller */}
            <div 
              className="space-title"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginBottom: '10px'
              }}
            >
              {['O', 'U', 'T'].map((letter, index) => (
                <span
                  key={`out-${index}`}
                  style={{
                    fontFamily: '"Oups Clean", "Bebas Neue", cursive',
                    fontSize: `${84 - (index * 12)}px`, // 84px, 72px, 60px
                    letterSpacing: '4px',
                    background: 'linear-gradient(135deg, #FFB300 0%, #FDD835 50%, #FFB300 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    lineHeight: '0.8'
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div 
            className="text-center mb-6"
            style={{
              color: '#06b6d4',
              fontSize: '14px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}
          >
            YOUR MISSION CONTROL TO THE COSMOS
          </div>

          {/* Description */}
          <div className="mb-8 mx-auto" style={{ maxWidth: '388px' }}>
            <p className="text-white text-justify leading-relaxed mb-4" style={{ fontSize: '12px', fontWeight: '200' }}>
              Embark on an extraordinary journey through our solar system! Command your view of the cosmos with NASA-inspired controls, accelerate time to witness planetary orbits, and explore detailed information about every celestial body.
            </p>
            
            <p className="text-white text-justify leading-relaxed" style={{ fontSize: '12px', fontWeight: '200', opacity: 0.9, marginBottom: '44px' }}>
              Countless mysteries await discovery in the cosmos. What hidden wonders might be orbiting nearby? Sometimes you may need to take a closer look... or pull back to see the bigger picture!
            </p>

            {/* Control keys grid */}
            <div className="flex justify-center gap-6 max-w-lg mx-auto" style={{ marginBottom: '52px' }}>
              {/* SPACE key */}
              <div className="flex flex-col items-center gap-2">
                <span style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>TOGGLE CAMERA MODE</span>
                <div
                  className="control-key"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '5px',
                    padding: '10px 16px',
                    color: '#06b6d4',
                    minWidth: '70px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'default',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  SPACE
                </div>
              </div>

              {/* Arrow keys */}
              <div className="flex flex-col items-center gap-2">
                <span style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>NAVIGATE AROUND</span>
                <div className="flex items-center gap-1" style={{ width: '70px' }}>
                  {/* Left Arrow */}
                  <div
                    className="control-key"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '5px',
                      padding: '8px 6px',
                      color: '#06b6d4',
                      width: '17px',
                      height: '36px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'default',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    ←
                  </div>
                  
                  {/* Up/Down Arrow Stack */}
                  <div className="flex flex-col gap-1">
                    {/* Up Arrow */}
                    <div
                      className="control-key"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '5px',
                        padding: '4px 6px',
                        color: '#06b6d4',
                        width: '26px',
                        height: '17px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'default',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      ↑
                    </div>
                    
                    {/* Down Arrow */}
                    <div
                      className="control-key"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '5px',
                        padding: '4px 6px',
                        color: '#06b6d4',
                        width: '26px',
                        height: '17px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'default',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      ↓
                    </div>
                  </div>
                  
                  {/* Right Arrow */}
                  <div
                    className="control-key"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '5px',
                      padding: '8px 6px',
                      color: '#06b6d4',
                      width: '17px',
                      height: '36px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'default',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    →
                  </div>
                </div>
              </div>

              {/* Z/X keys */}
              <div className="flex flex-col items-center gap-2">
                <span style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>ZOOM IN/OUT</span>
                <div className="flex gap-1">
                  <div
                    className="control-key"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '5px',
                      padding: '10px 12px',
                      color: '#06b6d4',
                      minWidth: '32px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'default',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Z
                  </div>
                  <div
                    className="control-key"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '5px',
                      padding: '10px 12px',
                      color: '#06b6d4',
                      minWidth: '32px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'default',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)'
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    X
                  </div>
                </div>
              </div>

              {/* HOVER key */}
              <div className="flex flex-col items-center gap-2">
                <span style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>VIEW PLANET DETAILS</span>
                <div
                  className="control-key"
                  style={{
                    background: 'transparent',
                    border: '1px dashed rgba(59, 130, 246, 0.4)',
                    borderRadius: '5px',
                    padding: '10px 16px',
                    color: '#06b6d4',
                    minWidth: '70px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'default',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span className="hover-text">HOVER</span>
                </div>
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="text-center mb-6">
              <div
                onClick={handleClose}
                style={{
                  background: 'linear-gradient(180deg, #0369a1 0%, #0891b2 100%)',
                  border: 'none',
                  padding: '16px 48px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(6, 182, 212, 0.2), 0 8px 16px rgba(6, 182, 212, 0.1)',
                  width: '388px',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #0284c7 0%, #06d6f7 100%)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(6, 182, 212, 0.3), 0 12px 20px rgba(6, 182, 212, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #0369a1 0%, #0891b2 100%)'
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(6, 182, 212, 0.2), 0 8px 16px rgba(6, 182, 212, 0.1)'
                }}
              >
                LET'S BEGIN EXPLORING
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center justify-center gap-3" style={{ marginTop: '30px' }}>
              <div className="relative">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => setDontShowAgain(!dontShowAgain)}
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '1px solid #06b6d4',
                    borderRadius: '3px',
                    background: dontShowAgain 
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' 
                      : 'rgba(20, 24, 36, 0.9)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {dontShowAgain && (
                    <svg 
                      width="10" 
                      height="8" 
                      viewBox="0 0 10 8" 
                      fill="none"
                      style={{ color: '#ffffff' }}
                    >
                      <path 
                        d="M1 4L3.5 6.5L9 1" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <label 
                htmlFor="dontShowAgain"
                onClick={() => setDontShowAgain(!dontShowAgain)}
                style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Don't show this again
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
