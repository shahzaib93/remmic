'use client'

import { useLayoutEffect, useRef, useCallback, useEffect, useState, Children } from 'react'
import Lenis from 'lenis'

// Isomorphic useLayoutEffect - prevents SSR warning
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * ScrollStackItem - Individual card in the stack
 */
export const ScrollStackItem = ({ children, className = '' }) => (
  <div
    className={`scroll-stack-card relative w-full h-[480px] md:h-[520px] lg:h-[480px] p-6 md:p-8 lg:p-10 rounded-[20px] md:rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.5)] box-border origin-top will-change-transform ${className}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      background: 'linear-gradient(160deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}
  >
    {children}
  </div>
)

/**
 * ScrollStack - Lenis-powered smooth stacking cards with scroll-lock behavior
 */
const ScrollStack = ({
  children,
  className = '',
  itemDistance = 120,
  itemScale = 0.035,
  itemStackDistance = 30,
  stackPosition = '22%',
  scaleEndPosition = '10%',
  baseScale = 0.86,
  scaleDuration = 0.4,
  useWindowScroll = true,
  lockScrollUntilComplete = true,
  scrollSensitivity = 0.002,
  onStackComplete,
  onStepChange,
}) => {
  const containerRef = useRef(null)
  const cardsRef = useRef([])
  const lenisRef = useRef(null)
  const rafIdRef = useRef(null)

  // Progress tracking (0 = first card, 1 = second card stacked, 2 = third card stacked, etc.)
  const progressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const velocityRef = useRef(0)

  // Lock state
  const isLockedRef = useRef(false)
  const isInViewRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const scrollYBeforeLockRef = useRef(0)

  // Touch handling
  const touchStartYRef = useRef(0)
  const lastTouchYRef = useRef(0)

  // Animation state
  const isAnimatingRef = useRef(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  // Count children
  const cardCount = Children.count(children)
  const maxProgress = cardCount - 1 // 0-indexed, so 3 cards = max progress of 2

  // Lock body scroll
  const lockScroll = useCallback(() => {
    if (isLockedRef.current) return

    scrollYBeforeLockRef.current = window.scrollY
    isLockedRef.current = true
    setIsLocked(true)

    // Freeze body at current position
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollYBeforeLockRef.current}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    // Pause Lenis
    if (lenisRef.current) {
      lenisRef.current.stop()
    }
  }, [])

  // Unlock body scroll
  const unlockScroll = useCallback((restorePosition = true) => {
    if (!isLockedRef.current) return

    isLockedRef.current = false
    setIsLocked(false)

    // Unfreeze body
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''

    // Restore scroll position
    if (restorePosition) {
      window.scrollTo(0, scrollYBeforeLockRef.current)
    }

    // Resume Lenis
    if (lenisRef.current) {
      lenisRef.current.start()
    }
  }, [])

  // Update card transforms based on progress
  const updateCardTransforms = useCallback((progress) => {
    const cards = cardsRef.current
    if (!cards.length) return

    cards.forEach((card, index) => {
      if (!card) return

      // How many cards are stacked on top of this one
      const cardsAbove = Math.max(0, Math.floor(progress) - index)

      // Partial progress for the currently animating card
      const partialProgress = Math.max(0, Math.min(1, progress - index))

      // Calculate scale - cards underneath scale down
      const scaleReduction = cardsAbove * itemScale
      const scale = Math.max(baseScale, 1 - scaleReduction)

      // Calculate Y offset - cards underneath move up slightly
      const yOffset = cardsAbove * itemStackDistance

      // Opacity - cards underneath fade slightly
      const opacity = Math.max(0.7, 1 - (cardsAbove * 0.1))

      // Z-index - later cards on top
      const zIndex = index + 1

      // Apply transforms
      card.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scale})`
      card.style.opacity = String(opacity)
      card.style.zIndex = String(zIndex)
      card.style.transition = `transform ${scaleDuration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${scaleDuration}s ease`
    })

    // Update current step state
    const newStep = Math.round(progress)
    if (newStep !== currentStep) {
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }, [itemScale, itemStackDistance, baseScale, scaleDuration, currentStep, onStepChange])

  // Animation loop - smoothly interpolate to target progress
  const animateProgress = useCallback(() => {
    const current = progressRef.current
    const target = targetProgressRef.current
    const diff = target - current

    if (Math.abs(diff) > 0.001) {
      // Smooth interpolation
      const newProgress = current + diff * 0.15
      progressRef.current = newProgress
      updateCardTransforms(newProgress)
      rafIdRef.current = requestAnimationFrame(animateProgress)
    } else {
      // Snap to target
      progressRef.current = target
      updateCardTransforms(target)
      isAnimatingRef.current = false

      // Check completion
      if (target >= maxProgress && !hasCompletedRef.current && lockScrollUntilComplete) {
        hasCompletedRef.current = true
        onStackComplete?.()

        // Delay unlock for smooth feel
        setTimeout(() => {
          unlockScroll(true)
        }, 400)
      }

      // Check if reversed to beginning
      if (target <= 0 && isLockedRef.current) {
        setTimeout(() => {
          unlockScroll(true)
          hasCompletedRef.current = false
        }, 300)
      }
    }
  }, [maxProgress, lockScrollUntilComplete, onStackComplete, unlockScroll, updateCardTransforms])

  // Start animation loop
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true
      rafIdRef.current = requestAnimationFrame(animateProgress)
    }
  }, [animateProgress])

  // Handle wheel event
  const handleWheel = useCallback((e) => {
    if (!lockScrollUntilComplete) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Check if section is in the "lock zone"
    const sectionTop = rect.top
    const sectionBottom = rect.bottom
    const lockThreshold = viewportHeight * 0.25

    // Should we lock?
    const shouldLock = sectionTop <= lockThreshold &&
                       sectionBottom >= viewportHeight * 0.5 &&
                       !hasCompletedRef.current

    if (shouldLock && !isLockedRef.current) {
      lockScroll()
      // Initialize progress based on current state
      progressRef.current = 0
      targetProgressRef.current = 0
      updateCardTransforms(0)
    }

    // If locked, handle scroll internally
    if (isLockedRef.current) {
      e.preventDefault()
      e.stopPropagation()

      // Normalize delta
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40 // Line mode
      if (e.deltaMode === 2) delta *= 800 // Page mode

      // Apply sensitivity and update target
      const progressDelta = delta * scrollSensitivity
      const newTarget = Math.max(0, Math.min(maxProgress, targetProgressRef.current + progressDelta))
      targetProgressRef.current = newTarget

      startAnimation()
    }
  }, [lockScrollUntilComplete, lockScroll, scrollSensitivity, maxProgress, startAnimation, updateCardTransforms])

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (!lockScrollUntilComplete) return

    touchStartYRef.current = e.touches[0].clientY
    lastTouchYRef.current = e.touches[0].clientY
  }, [lockScrollUntilComplete])

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!lockScrollUntilComplete) return
    if (!isLockedRef.current) {
      // Check if we should lock
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const lockThreshold = viewportHeight * 0.25

      if (rect.top <= lockThreshold && rect.bottom >= viewportHeight * 0.5 && !hasCompletedRef.current) {
        lockScroll()
        progressRef.current = 0
        targetProgressRef.current = 0
        updateCardTransforms(0)
      }
    }

    if (isLockedRef.current) {
      e.preventDefault()

      const touchY = e.touches[0].clientY
      const delta = lastTouchYRef.current - touchY // Inverted for natural feel
      lastTouchYRef.current = touchY

      // Touch sensitivity (higher than wheel)
      const progressDelta = delta * scrollSensitivity * 1.5
      const newTarget = Math.max(0, Math.min(maxProgress, targetProgressRef.current + progressDelta))
      targetProgressRef.current = newTarget

      startAnimation()
    }
  }, [lockScrollUntilComplete, lockScroll, scrollSensitivity, maxProgress, startAnimation, updateCardTransforms])

  // Handle keyboard
  const handleKeyDown = useCallback((e) => {
    if (!isLockedRef.current) return

    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault()
      targetProgressRef.current = Math.min(maxProgress, Math.floor(targetProgressRef.current) + 1)
      startAnimation()
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault()
      targetProgressRef.current = Math.max(0, Math.ceil(targetProgressRef.current) - 1)
      startAnimation()
    }
  }, [maxProgress, startAnimation])

  // Setup IntersectionObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewRef.current = entry.isIntersecting

          // If scrolled completely past, unlock
          if (!entry.isIntersecting && isLockedRef.current) {
            unlockScroll(false)
          }

          // Reset when section leaves viewport from bottom (scrolled up past it)
          if (!entry.isIntersecting) {
            const rect = entry.boundingClientRect
            if (rect.top > window.innerHeight) {
              hasCompletedRef.current = false
              progressRef.current = 0
              targetProgressRef.current = 0
              updateCardTransforms(0)
            }
          }
        })
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px'
      }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [unlockScroll, updateCardTransforms])

  // Setup event listeners
  useEffect(() => {
    if (!lockScrollUntilComplete) return

    // Must be non-passive to allow preventDefault
    const wheelOptions = { passive: false }
    const touchOptions = { passive: false }

    window.addEventListener('wheel', handleWheel, wheelOptions)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, touchOptions)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lockScrollUntilComplete, handleWheel, handleTouchStart, handleTouchMove, handleKeyDown])

  // Initialize cards and Lenis
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Find all card elements
    const cards = Array.from(container.querySelectorAll('.scroll-stack-card'))
    cardsRef.current = cards

    // Position cards absolutely, stacked
    cards.forEach((card, i) => {
      card.style.position = 'absolute'
      card.style.top = '0'
      card.style.left = '0'
      card.style.right = '0'
      card.style.willChange = 'transform, opacity'
      card.style.transformOrigin = 'top center'
      card.style.zIndex = String(i + 1)
    })

    // Initial state
    updateCardTransforms(0)

    // Setup Lenis
    if (useWindowScroll && !lenisRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      })

      const raf = (time) => {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)

      lenisRef.current = lenis
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      // Ensure cleanup of body styles
      if (isLockedRef.current) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
      }
    }
  }, [useWindowScroll, updateCardTransforms])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      updateCardTransforms(progressRef.current)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateCardTransforms])

  return (
    <div
      ref={containerRef}
      className={`scroll-stack-container relative w-full ${className}`.trim()}
      style={{
        height: '520px', // Fixed height for the stack area
        minHeight: '520px',
      }}
    >
      {/* Cards wrapper */}
      <div className="scroll-stack-inner relative w-full h-full px-4 md:px-10 lg:px-20">
        {children}
      </div>

      {/* Progress dots */}
      {lockScrollUntilComplete && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
          {Array.from({ length: cardCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (isLockedRef.current) {
                  targetProgressRef.current = i
                  startAnimation()
                }
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i <= currentStep
                  ? 'bg-amber-400 scale-125'
                  : 'bg-white/25 hover:bg-white/40'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      {isLocked && currentStep < maxProgress && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 z-50 animate-bounce">
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default ScrollStack
