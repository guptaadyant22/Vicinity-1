// Renders the Vicinity brand mark SVG and optional text label.
// Used in navbars, sidebars, and the footer throughout the app.

import React from 'react'
import { UI_SETTINGS } from '../lib/ui'

interface VicinityLogoProps {
  className?: string
  textClassName?: string
  showText?: boolean
}

// Renders the Vicinity brand SVG mark and optional text
export default function VicinityLogo({
  className = '',
  textClassName = 'text-slate-900 dark:text-white',
  showText = true,
}: VicinityLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand mark SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="35"
        height="35"
        viewBox="0 0 256 256"
        className="w-8 h-8 shrink-0"
      >
        <g fill="#2563eb" fillRule="nonzero">
          <g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)">
            <path d="M5,45l4,-11l12,-12l-6,23z"></path>
            <path d="M25,18l8,27h10l-11,-33z"></path>
            <path d="M16.059,14.164l3.941,-11.164h8z"></path>
            <path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"></path>
            <path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"></path>
            <path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"></path>
          </g>
        </g>
      </svg>

      {showText && (
        <span className={`font-black text-xl tracking-tight ${textClassName}`}>
          {UI_SETTINGS.siteName}
        </span>
      )}
    </div>
  )
}
