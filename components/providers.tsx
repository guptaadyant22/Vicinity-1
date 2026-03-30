'use client'

// This component wraps all client-side providers
// It's used in the root layout to provide client-side functionality
// while keeping the layout as a server component

import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
