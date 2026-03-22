import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendChatMessage, type ChatApiMessage } from '@/lib/api'
import { getProfile } from '@/lib/profile'
import { getMockChatResponse, type ChatContext } from './chat-mock'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  context?: ChatContext
  autoSend?: { message: string; ts: number } | null
  className?: string
}

const SUGGESTED_QUESTIONS_GLOBAL = [
  'What changes affect me the most right now?',
  'How do I contact my representative?',
  'What should I do about the H-1B changes?',
  'Explain the ACA subsidy situation',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/10 px-4 py-3">
        <motion.span
          className="h-2 w-2 rounded-full bg-indigo-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-violet-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-rose-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn('flex gap-2.5 px-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1',
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-indigo-500'
            : 'bg-gradient-to-br from-indigo-500 to-cyan-500'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
            : 'rounded-bl-sm bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
        )}
        style={
          isUser
            ? { boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }
            : undefined
        }
      >
        {message.content}
      </div>
    </motion.div>
  )
}

export function ChatPanel({ context, autoSend, className }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiError, setApiError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastAutoSendTs = useRef(0)
  const prefersReducedMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)

  // Auto-collapse the button text after 3 seconds
  useEffect(() => {
    if (isOpen) return
    setCollapsed(false)
    const timer = setTimeout(() => setCollapsed(true), 3000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const suggestedQuestions = context?.alertTitle
    ? [
        `How does "${context.alertTitle}" affect me specifically?`,
        'What actions should I take?',
        'When does this take effect?',
        'Who can I contact about this?',
      ]
    : SUGGESTED_QUESTIONS_GLOBAL

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      let responseText: string

      if (apiError) {
        // API already failed this session, use mock directly
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))
        responseText = getMockChatResponse(text, context)
      } else {
        try {
          // Build conversation history for API (strip id/timestamp)
          const apiMessages: ChatApiMessage[] = [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          }))
          const profile = getProfile() ?? undefined
          responseText = await sendChatMessage(apiMessages, context, profile)
        } catch (err) {
          console.warn('Chat API failed, falling back to mock:', err)
          setApiError(true)
          responseText = getMockChatResponse(text, context)
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    },
    [context, messages, apiError]
  )

  // Auto-open and send message from action center buttons
  useEffect(() => {
    if (autoSend && autoSend.ts !== lastAutoSendTs.current) {
      lastAutoSendTs.current = autoSend.ts
      setIsOpen(true)
      // Delay to let the panel animate open before sending
      setTimeout(() => {
        sendMessage(autoSend.message)
      }, 400)
    }
  }, [autoSend, sendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return createPortal(
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed right-4 md:right-6 md:bottom-6 z-60',
              'flex items-center justify-center rounded-full',
              'text-white text-sm font-medium',
              'shadow-lg cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
              collapsed ? 'h-12 w-12' : 'h-12 px-5',
              className
            )}
            style={{
              bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 12px)',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 0 60px rgba(139,92,246,0.15)',
            }}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  key="label"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Ask Legisly AI
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[60] w-full sm:w-[420px] sm:max-h-[600px] flex flex-col"
          >
            <div
              className="flex flex-col h-full sm:h-[560px] sm:rounded-2xl overflow-hidden border border-[var(--border)]"
              style={{
                background: '#12121A',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.08)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]"
                style={{
                  background: 'linear-gradient(135deg, #161625, #18162A)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Bot className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', apiError ? 'bg-amber-400' : 'bg-emerald-400')} />
                      <span className={cn('relative inline-flex rounded-full h-3 w-3 border-2 border-[#12121A]', apiError ? 'bg-amber-400' : 'bg-emerald-400')} />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Legisly AI
                    </h3>
                    <p className={cn('text-[11px] font-medium', apiError ? 'text-amber-400' : 'text-emerald-400')}>
                      {apiError ? 'Offline mode' : 'Online'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-9 w-9 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
                {/* Welcome message if no messages */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 pb-2"
                  >
                    <div className="rounded-2xl p-5 border border-[var(--border)] bg-gradient-to-br from-indigo-500/[0.03] to-violet-500/[0.05]">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {context?.alertTitle
                            ? 'Ask about this change'
                            : 'Civic AI Assistant'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {context?.alertTitle
                          ? `I can help you understand how "${context.alertTitle}" affects you personally, what actions you should take, and more.`
                          : 'I can help you understand legal changes, find your representatives, draft letters, and navigate civic processes.'}
                      </p>
                    </div>

                    {/* Suggested questions */}
                    <div className="mt-3 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] px-1">
                        Suggested questions
                      </span>
                      {suggestedQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          onClick={() => sendMessage(q)}
                          className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-xs text-[var(--foreground)] border border-[var(--border)] hover:border-indigo-300 hover:bg-indigo-500/[0.03] transition-all cursor-pointer min-h-[40px] group"
                        >
                          <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)] group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                          <span className="line-clamp-2">{q}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Chat messages */}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-[var(--border)] px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about legal changes..."
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all min-h-[44px]"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      'flex items-center justify-center h-[44px] w-[44px] rounded-xl transition-all cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      input.trim() && !isTyping
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 text-[10px] text-[var(--muted-foreground)] text-center">
                  AI responses are informational only. Not legal advice.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}
