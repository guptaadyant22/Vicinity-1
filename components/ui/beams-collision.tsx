"use client"


// Animated background effect with falling light beams that explode on collision.
// Creates a visually dynamic backdrop using Framer Motion for the landing page hero section.

import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type BackgroundBeamsWithCollisionProps = {
  children: React.ReactNode
  className?: string
}

// Container that renders animated falling beams with collision effects
export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: BackgroundBeamsWithCollisionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)


  const beams = [
    { initialX: 10, translateX: 10, duration: 5, repeatDelay: 2, delay: 0 },
    { initialX: 100, translateX: 100, duration: 4, repeatDelay: 3, delay: 0.2, className: "h-6" },
    { initialX: 200, translateX: 200, duration: 6, repeatDelay: 2, delay: 0.4 },
    { initialX: 300, translateX: 300, duration: 5, repeatDelay: 4, delay: 0.6, className: "h-12" },
    { initialX: 400, translateX: 400, duration: 4, repeatDelay: 3, delay: 0.8 },
    { initialX: 500, translateX: 500, duration: 7, repeatDelay: 2, delay: 1.0, className: "h-20" },
    { initialX: 600, translateX: 600, duration: 5, repeatDelay: 3, delay: 1.2 },
    { initialX: 700, translateX: 700, duration: 4, repeatDelay: 4, delay: 1.4, className: "h-6" },
    { initialX: 800, translateX: 800, duration: 6, repeatDelay: 2, delay: 1.6 },
    { initialX: 900, translateX: 900, duration: 5, repeatDelay: 3, delay: 1.8, className: "h-12" },
    { initialX: 1000, translateX: 1000, duration: 4, repeatDelay: 2, delay: 2.0 },
    {
      initialX: 1100,
      translateX: 1100,
      duration: 6,
      repeatDelay: 3,
      delay: 2.2,
      className: "h-20",
    },
    { initialX: 1200, translateX: 1200, duration: 5, repeatDelay: 4, delay: 2.4 },
    { initialX: 1300, translateX: 1300, duration: 4, repeatDelay: 2, delay: 2.6, className: "h-6" },
    { initialX: 1400, translateX: 1400, duration: 7, repeatDelay: 3, delay: 2.8 },
  ]

  return (
    <div
      ref={parentRef}
      className={cn(

        "relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent",
        className
      )}
    >
      {beams.map((beam) => (
        <CollisionMechanism
          key={`${beam.initialX}-beam`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}

     <div
  ref={containerRef}
  className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
/>
    </div>
  )
}

type BeamOptions = {
  initialX?: number
  translateX?: number
  initialY?: number | string
  translateY?: number | string
  rotate?: number
  className?: string
  duration?: number
  delay?: number
  repeatDelay?: number
}

type CollisionMechanismProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  parentRef: React.RefObject<HTMLDivElement | null>
  beamOptions?: BeamOptions
}

// Individual beam that detects collision and triggers an explosion
const CollisionMechanism = React.forwardRef<HTMLDivElement, CollisionMechanismProps>(
  ({ parentRef, containerRef, beamOptions = {} }, _ref) => {
    const beamRef = useRef<HTMLDivElement>(null)


    const [collision, setCollision] = useState<{
      detected: boolean
      coordinates: { x: number; y: number } | null
    }>({
      detected: false,
      coordinates: null,
    })

    const [beamKey, setBeamKey] = useState(0)
    const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false)


    useEffect(() => {
      const checkCollision = () => {
        if (
          beamRef.current &&
          containerRef.current &&
          parentRef.current &&
          !cycleCollisionDetected
        ) {
          const beamRect = beamRef.current.getBoundingClientRect()
          const containerRect = containerRef.current.getBoundingClientRect()
          const parentRect = parentRef.current.getBoundingClientRect()

          if (beamRect.bottom >= containerRect.top) {
            const relativeX = beamRect.left - parentRect.left + beamRect.width / 2
            const relativeY = beamRect.bottom - parentRect.top

            setCollision({
              detected: true,
              coordinates: {
                x: relativeX,
                y: relativeY,
              },
            })

            setCycleCollisionDetected(true)
          }
        }
      }

      const animationInterval = setInterval(checkCollision, 50)
      return () => clearInterval(animationInterval)
    }, [cycleCollisionDetected, containerRef, parentRef])


    useEffect(() => {
      if (collision.detected && collision.coordinates) {
        const resetTimeout = setTimeout(() => {
          setCollision({ detected: false, coordinates: null })
          setCycleCollisionDetected(false)
        }, 2000)

        const beamTimeout = setTimeout(() => {
          setBeamKey((prevKey) => prevKey + 1)
        }, 2000)

        return () => {
          clearTimeout(resetTimeout)
          clearTimeout(beamTimeout)
        }
      }
    }, [collision])

    return (
      <>
        <motion.div
          ref={beamRef}
          key={beamKey}
          animate="animate"
          initial={{
            translateY: beamOptions.initialY ?? "-200px",
            translateX: beamOptions.initialX ?? "0px",
            rotate: beamOptions.rotate ?? 0,
          }}
          variants={{
            animate: {
              translateY: beamOptions.translateY ?? "1800px",
              translateX: beamOptions.translateX ?? "0px",
              rotate: beamOptions.rotate ?? 0,
            },
          }}
          transition={{
            duration: beamOptions.duration ?? 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
            delay: beamOptions.delay ?? 0,
            repeatDelay: beamOptions.repeatDelay ?? 0,
          }}
          className={cn(

            "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
            beamOptions.className
          )}
        />

        <AnimatePresence>
          {collision.detected && collision.coordinates && (
            <Explosion
              key={`${collision.coordinates.x}-${collision.coordinates.y}`}
              className=""
              style={{
                left: `${collision.coordinates.x}px`,
                top: `${collision.coordinates.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </AnimatePresence>
      </>
    )
  }
)

CollisionMechanism.displayName = "CollisionMechanism"


// Burst of particles rendered at a collision point
const Explosion = (props: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }))

  return (
    <div
      {...props}
      className={cn("absolute z-50 h-2 w-2", props.className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      />

      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  )
}
