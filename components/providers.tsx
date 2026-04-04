// Wraps all client-side providers so the root layout can remain a server component.
// Currently provides AuthProvider; additional providers can be added here.

'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'

// Wraps children with all required client-side context providers
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
