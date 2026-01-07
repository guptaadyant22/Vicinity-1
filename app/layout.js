import dynamic from 'next/dynamic'
import '../context/ThemeContext'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'
import ThemeToggle from '../components/ThemeToggle'

// Load AIChat dynamically (prevents server-side render issues)
const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })

export const metadata = {
  title: 'Vicinity - Discover Local Businesses',
  description: 'Vicinity - Connect with amazing local businesses near you',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g fill="%23ff6f00"><g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)"><path d="M5,45l4,-11l12,-12l-6,23z"/><path d="M25,18l8,27h10l-11,-33z"/><path d="M16.059,14.164l3.941,-11.164h8z"/><path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"/><path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"/><path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"/></g></g></svg>',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; }
          .custom-loading { position: fixed; inset: 0; background: linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0f0f0f); z-index: 9999; display: flex; align-items: center; justify-content: center; opacity: 1; transition: opacity 0.5s ease-out; }
          .custom-loading.hidden { opacity: 0; pointer-events: none; }
          .loading-content { display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
          .loading-logo { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 20px rgba(255, 111, 0, 0.4)); }
          .loading-text { color: #f97316; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; }
          .loading-dots { display: flex; gap: 8px; margin-top: 16px; justify-content: center; }
          .dot { width: 8px; height: 8px; background: linear-gradient(135deg, #ff6f00 0%, #ff8533 100%); border-radius: 50%; animation: bounce 1.4s infinite; will-change: transform; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-8px); opacity: 1; } }
          body.loading-active { overflow: hidden; }
          html { scroll-behavior: smooth; }
          *:focus-visible { outline: 2px solid #ff6f00; outline-offset: 2px; }
        `}</style>
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300 relative">
        <ThemeProvider>
          <AuthProvider>
            {children}
            
            {/* FLOATING ACTION BUTTONS */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-center">
              
              {/* Dynamic AIChat */}
              <AIChat />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

          </AuthProvider>
        </ThemeProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const loadingScreen = document.createElement('div');
                loadingScreen.className = 'custom-loading';
                loadingScreen.innerHTML = \`
                  <div class="loading-content">
                    <div class="loading-logo">
                      <svg width="36" height="36" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <g fill="#ff6f00">
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
                    </div>
                    <div class="loading-text">Loading Vicinity</div>
                    <div class="loading-dots">
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                    </div>
                  </div>
                \`;
                document.body.appendChild(loadingScreen);
                document.body.classList.add('loading-active');

                window.addEventListener('load', () => {
                  loadingScreen.classList.add('hidden');
                  document.body.classList.remove('loading-active');
                  setTimeout(() => loadingScreen.remove(), 500);
                });

                setTimeout(() => {
                  if (loadingScreen.parentNode) {
                    loadingScreen.classList.add('hidden');
                    document.body.classList.remove('loading-active');
                    setTimeout(() => loadingScreen.remove(), 500);
                  }
                }, 5000);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
