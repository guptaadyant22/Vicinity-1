// Root layout component for Next.js app with theme, auth providers, and global styles
// Removed custom loading overlay since it is not needed between pages

import dynamic from 'next/dynamic'
import '../context/ThemeContext'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'
import ThemeToggle from '../components/ThemeToggle'

// Load AIChat dynamically on client only
const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })

export const metadata = {
  title: 'Vicinity - Discover Local Businesses',
  description: 'Vicinity - Connect with amazing local businesses near you',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g fill="%232563eb"><g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)"><path d="M5,45l4,-11l12,-12l-6,23z"/><path d="M25,18l8,27h10l-11,-33z"/><path d="M16.059,14.164l3.941,-11.164h8z"/><path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"/><path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"/><path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"/></g></g></svg>',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Theme boot script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (!localStorage.getItem('theme') || localStorage.getItem('theme') === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />

        {/* Global inline shell styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { width: 100%; height: 100%; }

              html {
                scroll-behavior: smooth;
                background: #ffffff;
              }

              html.dark {
                background: #081120;
              }

              *:focus-visible {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
              }
            `,
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-white dark:bg-[#081120] text-slate-900 dark:text-white transition-colors duration-300 relative"
      >
        {/* Prevent flash of wrong theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        {/* App providers */}
        <ThemeProvider>
          <AuthProvider>
            {children}

            {/* AI chat */}
            <div className="fixed bottom-6 right-6 z-50">
              <AIChat />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
