interface UISettingsType {
  siteName: string
  siteDescription: string
  copyright: string
  colors: {
    primary: string
    primaryGradient: string
    hoverPrimary: string
  }
  glassInput: string
}

interface NavItem {
  name: string
  href: string
}

interface FooterLinksType {
  company: NavItem[]
  legal: NavItem[]
}

export const UI_SETTINGS: UISettingsType = {
    siteName: 'Vicinity',
    siteDescription: 'Discover local businesses, read reviews, and find the best deals near you.',
    copyright: '© 2025 Vicinity Inc. All rights reserved.',

    // Styling Constants — blue theme
    colors: {
        primary: 'text-blue-600 dark:text-blue-300',
        primaryGradient: 'bg-blue-600',
        hoverPrimary: 'hover:text-blue-600 dark:hover:text-blue-300',
    },

    // General Settings
    glassInput: "w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all",
}

export const LANDING_NAV_ITEMS: NavItem[] = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'FAQs', href: '#faq' }
]

export const FOOTER_LINKS: FooterLinksType = {
    company: [
        { name: 'About Us', href: '#' },
        { name: 'Contact', href: '#' },
    ],
    legal: [
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
    ]
}
