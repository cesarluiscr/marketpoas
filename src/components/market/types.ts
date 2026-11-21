export type ConversationWithMeta = {
  id: string
  listingId: string
  listing: { id: string; title: string; imageUrl: string | null; price: number; status: string }
  fromUser: { id: string; name: string | null; image: string | null }
  toUser: { id: string; name: string | null; image: string | null }
  lastMessageAt: string
  unreadCount: number
  messages: { body: string; createdAt: string; fromUserId: string; read: boolean }[]
}

export type Message = {
  id: string
  conversationId: string
  fromUserId: string
  toUserId: string
  body: string
  read: boolean
  createdAt: string
}

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
