// components/AIChat.tsx - USES WEBSITE DARK/LIGHT MODE

'use client'

import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChat() {
  const { session, loading, userType } = useAuth()
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMessage = getGreetingMessage()
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greetingMessage,
        timestamp: new Date(),
      }])
    }
  }, [isOpen, userType])

  function getGreetingMessage(): string {
    if (!session?.user || !userType) {
      return "👋 Hi there! I'm Vicinity's AI assistant. I can help you discover amazing local businesses, find specific types of places, check hours and ratings, and more. Ask me anything about local businesses!"
    }

    console.log('✅ User type detected:', userType)

    if (userType === 'business') {
      return "👋 Welcome back, business owner! I'm your AI assistant. I can help you analyze your business performance, understand customer feedback, identify improvement opportunities, and develop growth strategies. What would you like to know about your business?"
    }

    if (userType === 'user' || userType === 'community') {
      const firstName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'there'
      return `👋 Hi ${firstName}! I'm Vicinity's AI assistant. I can help you discover new businesses, show your review stats, recommend places based on your interests, and answer questions about local businesses. What are you looking for?`
    }

    return "👋 Hi there! I'm Vicinity's AI assistant. Ask me anything about local businesses!"
  }

  function getCurrentPage(): string {
    if (typeof window === 'undefined') return 'home'
    const path = window.location.pathname
    if (path.includes('/business')) return 'business'
    if (path.includes('/community')) return 'community'
    if (path.includes('/dashboard')) return 'dashboard'
    return 'home'
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userId = session?.user?.id || null
    const page = getCurrentPage()
    const detectedUserType = userType || 'guest'

    console.log('📤 Sending message with userType:', detectedUserType)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: userId,
          userType: detectedUserType,
          page: page,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  if (!mounted) return null

  const isDisabled = loading || chatLoading

  // Theme colors
  const colors = {
    dark: {
      bg: '#0f0f0f',
      bgSecondary: '#1a1a1a',
      border: 'rgba(255, 111, 0, 0.25)',
      text: '#e0e0e0',
      textSecondary: '#a0a0a0',
      inputBg: 'rgba(255, 111, 0, 0.06)',
      inputBgFocus: 'rgba(255, 111, 0, 0.12)',
      messageBg: 'rgba(255, 111, 0, 0.08)',
    },
    light: {
      bg: '#ffffff',
      bgSecondary: '#f5f5f5',
      border: 'rgba(255, 111, 0, 0.2)',
      text: '#333333',
      textSecondary: '#666666',
      inputBg: '#f0f0f0',
      inputBgFocus: '#e8e8e8',
      messageBg: '#f9f3f0',
    }
  }

  const theme = isDark ? colors.dark : colors.light

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isOpen 
            ? 'linear-gradient(135deg, #ff6f00, #ff8c42)'
            : 'linear-gradient(135deg, #ff6f00, #ec4899)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(255, 111, 0, 0.5)',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 111, 0, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 111, 0, 0.5)'
        }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '32px',
            width: '420px',
            height: '600px',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 111, 0, 0.15)'
              : '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 40px rgba(255, 111, 0, 0.1)',
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #ff6f00 0%, #ec4899 100%)',
              padding: '16px 20px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaRobot size={18} />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Vicinity AI</h3>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px',
              backgroundColor: theme.bgSecondary,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div 
                  style={{ 
                    maxWidth: '85%',
                    padding: msg.role === 'user' ? '10px 14px' : '12px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #ff6f00, #ec4899)' 
                      : theme.messageBg,
                    border: msg.role === 'user' ? 'none' : `1px solid ${theme.border}`,
                    color: msg.role === 'user' ? 'white' : theme.text,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <FormattedText content={msg.content} isDarkMode={isDark} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6f00', fontSize: '13px' }}>
                <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSendMessage} 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '12px',
              borderTop: `1px solid ${theme.border}`,
              backgroundColor: theme.bg
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isDisabled ? 'Loading...' : 'Ask me anything...'}
              disabled={isDisabled}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.inputBg,
                color: theme.text,
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s ease',
                opacity: isDisabled ? 0.5 : 1,
              } as any}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = theme.inputBgFocus
                e.currentTarget.style.borderColor = 'rgba(255, 111, 0, 0.4)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = theme.inputBg
                e.currentTarget.style.borderColor = theme.border
              }}
            />
            <button
              type="submit"
              disabled={isDisabled}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6f00, #ec4899)',
                color: 'white',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>

          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            input::placeholder {
              color: ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
            }
          `}</style>
        </div>
      )}
    </>
  )
}

function FormattedText({ content, isDarkMode }: { content: string; isDarkMode: boolean }) {
  const sections = content.split(/(?=\*\*[^*]+\*\*:|###|^-\s)/m).filter(s => s.trim())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sections.map((section, idx) => {
        if (section.match(/\*\*[^*]+\*\*:/)) {
          const match = section.match(/\*\*([^*]+)\*\*:(.*)/)
          return (
            <div key={idx}>
              <span style={{ color: '#ff6f00', fontWeight: 'bold' }}>
                {match?.[1]}:
              </span>
              <span style={{ marginLeft: '4px' }}>
                {match?.[2]?.trim()}
              </span>
            </div>
          )
        }

        if (section.trim().startsWith('###')) {
          return (
            <div key={idx} style={{ color: '#ff8c42', fontWeight: '600', marginTop: '4px' }}>
              {section.replace(/^###\s*/, '').trim()}
            </div>
          )
        }

        if (section.trim().startsWith('-')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
              <span style={{ color: '#ff6f00', minWidth: '12px' }}>•</span>
              <span>{section.replace(/^-\s*/, '').trim()}</span>
            </div>
          )
        }

        return section.trim() ? (
          <div key={idx} style={{ lineHeight: '1.4' }}>
            {section.trim()}
          </div>
        ) : null
      })}
    </div>
  )
}
