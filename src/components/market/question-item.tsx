'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/market'

type Question = {
  id: string
  body: string
  answer: string | null
  answeredAt: string | null
  createdAt: string
  fromUser: { id: string; name: string | null }
}

export function QuestionItem({ question, isOwner, onAnswer }: {
  question: Question
  isOwner: boolean
  onAnswer: (answer: string) => void
}) {
  const [answering, setAnswering] = useState(false)
  const [answer, setAnswer] = useState('')

  if (answering && isOwner) {
    return (
      <div className="bg-[#fdf9ee] rounded-xl p-2.5 text-xs space-y-2">
        <div className="font-semibold text-[#0a3d2e]">{question.fromUser.name}:</div>
        <div className="text-[#0a3d2e]/80">{question.body}</div>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escribe tu respuesta..."
          rows={2}
          maxLength={300}
          autoFocus
          className="resize-none rounded-lg border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] text-xs"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setAnswering(false)} className="rounded-lg border-[#0a3d2e]/15 text-[#0a3d2e] h-8 text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onAnswer(answer)
              setAnswering(false)
              setAnswer('')
            }}
            disabled={!answer.trim()}
            className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-lg h-8 text-xs"
          >
            Responder
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fdf9ee] rounded-xl p-2.5 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-5 w-5">
          <AvatarFallback className="bg-[#1a6b4a] text-white text-[9px]">
            {question.fromUser.name?.charAt(0).toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold text-[#0a3d2e]">{question.fromUser.name}</div>
        <div className="text-[#0a3d2e]/40 ml-auto">{formatRelativeTime(question.createdAt)}</div>
      </div>
      <div className="text-[#0a3d2e]/80 pl-7">{question.body}</div>

      {question.answer ? (
        <div className="mt-2 pl-7 border-l-2 border-[#1a6b4a]">
          <div className="text-[10px] font-semibold text-[#1a6b4a] uppercase tracking-wide">Respuesta del vendedor</div>
          <div className="text-[#0a3d2e]/80 mt-0.5">{question.answer}</div>
        </div>
      ) : isOwner ? (
        <button
          onClick={() => setAnswering(true)}
          className="mt-2 ml-7 text-[10px] font-semibold text-[#1a6b4a] hover:underline"
        >
          Responder
        </button>
      ) : (
        <div className="mt-1 ml-7 text-[10px] text-[#0a3d2e]/40 italic">Sin respuesta aún</div>
      )}
    </div>
  )
}
