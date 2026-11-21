'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Send, Tag } from 'lucide-react'
import { formatCRCFull, formatRelativeTime } from '@/lib/market'
import type { ConversationWithMeta, Message } from '@/components/market/types'

export default function ChatTab({
  session, conversations, activeConversation, activeMessages,
  setActiveMessages, onSelectConversation, onBack,
}: any) {
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [activeMessages])

  if (!session) {
    return (
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-bold text-[#0a3d2e] mb-2">Inicia sesión para chatear</h2>
        <p className="text-sm text-[#0a3d2e]/70">Necesitas una cuenta para enviar y recibir mensajes de otros vecinos.</p>
      </main>
    )
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeConversation) return
    setChatSending(true)
    const body = chatInput.trim()
    setChatInput('')
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (res.ok) {
        setActiveMessages((prev: Message[]) => [...prev, data.message])
      }
    } catch {} finally {
      setChatSending(false)
    }
  }

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-0 sm:px-4 py-0 sm:py-6">
      <div className="sm:rounded-3xl sm:border border-[#0a3d2e]/10 overflow-hidden bg-white h-[calc(100vh-160px)] sm:h-[70vh] flex">
        {/* Lista conversaciones */}
        <div className={`w-full sm:w-80 border-r border-[#0a3d2e]/10 flex flex-col ${activeConversation ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#0a3d2e]/10 bg-[#fdf9ee]">
            <h2 className="font-bold text-[#0a3d2e]">Conversaciones</h2>
            <p className="text-xs text-[#0a3d2e]/60">{conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}</p>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#0a3d2e]/60">
                <div className="text-4xl mb-2">💭</div>
                Aún no tienes conversaciones.<br />Abre un anuncio y toca "Chatear".
              </div>
            ) : (
              <div className="divide-y divide-[#0a3d2e]/8">
                {conversations.map((c: ConversationWithMeta) => {
                  const otherUser = c.fromUser.id === (session.user as any).id ? c.toUser : c.fromUser
                  const lastMsg = c.messages[0]
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelectConversation(c)}
                      className={`w-full text-left p-3 flex gap-3 items-center hover:bg-[#fdf9ee] transition-colors ${activeConversation?.id === c.id ? 'bg-[#fdf9ee]' : ''}`}
                    >
                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white text-sm">
                          {otherUser.name?.charAt(0).toUpperCase() ?? 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-sm text-[#0a3d2e] truncate">{otherUser.name ?? 'Vecino'}</div>
                          {lastMsg && <div className="text-[10px] text-[#0a3d2e]/50 shrink-0">{formatRelativeTime(lastMsg.createdAt)}</div>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-[#0a3d2e]/60 truncate">{c.listing.title}</div>
                          {c.unreadCount > 0 && (
                            <span className="bg-[#c2185b] text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shrink-0">{c.unreadCount}</span>
                          )}
                        </div>
                        {lastMsg && (
                          <div className="text-xs text-[#0a3d2e]/50 truncate mt-0.5">
                            {lastMsg.fromUserId === (session.user as any).id ? 'Tú: ' : ''}{lastMsg.body}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Vista conversación */}
        <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden sm:flex'}`}>
          {activeConversation ? (
            <>
              <div className="p-3 border-b border-[#0a3d2e]/10 bg-[#fdf9ee] flex items-center gap-3">
                <button onClick={onBack} className="sm:hidden p-1.5 rounded-full hover:bg-[#0a3d2e]/10 text-[#0a3d2e]">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white text-xs">
                    {(activeConversation.fromUser.id === (session.user as any).id ? activeConversation.toUser.name : activeConversation.fromUser.name)?.charAt(0).toUpperCase() ?? 'V'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0a3d2e] truncate">
                    {activeConversation.fromUser.id === (session.user as any).id ? activeConversation.toUser.name : activeConversation.fromUser.name}
                  </div>
                  <div className="text-xs text-[#0a3d2e]/60 truncate flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {activeConversation.listing.title} · {formatCRCFull(activeConversation.listing.price)}
                  </div>
                </div>
              </div>

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 fancy-scroll bg-[#fdf9ee]/30">
                {activeMessages.length === 0 ? (
                  <div className="text-center text-sm text-[#0a3d2e]/50 py-8">Aún no hay mensajes. ¡Saluda!</div>
                ) : (
                  activeMessages.map((m: Message) => {
                    const mine = m.fromUserId === (session.user as any).id
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${mine ? 'bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] text-white rounded-br-sm' : 'bg-white text-[#0a3d2e] border border-[#0a3d2e]/10 rounded-bl-sm'}`}>
                          <div>{m.body}</div>
                          <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-[#0a3d2e]/50'}`}>{formatRelativeTime(m.createdAt)}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-3 border-t border-[#0a3d2e]/10 bg-white flex gap-2 items-end">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] max-h-32 min-h-[44px]"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                />
                <Button onClick={sendMessage} disabled={!chatInput.trim() || chatSending} className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl h-11 w-11 p-0 shrink-0" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[#0a3d2e]/50 p-8 text-center">
              <div>
                <div className="text-5xl mb-3">💬</div>
                Selecciona una conversación para ver los mensajes.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
