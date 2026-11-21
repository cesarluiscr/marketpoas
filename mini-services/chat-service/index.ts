import { Server } from 'socket.io'
import http from 'http'

const PORT = 3003

const httpServer = http.createServer((req, res) => {
  // Endpoint interno para emitir eventos desde la app Next.js
  if (req.method === 'POST' && req.url === '/emit') {
    let body = ''
    req.on('data', (chunk) => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const { event, room, payload } = JSON.parse(body)
        if (event && room) {
          io.to(room).emit(event, payload)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } else {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'event and room required' }))
        }
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'invalid json' }))
      }
    })
    return
  }

  // Healthcheck
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, port: PORT, connections: io.engine.clientsCount }))
    return
  }

  // Allow CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

io.on('connection', (socket) => {
  console.log(`[chat] connected: ${socket.id}`)

  // Unirse a una sala de conversación
  socket.on('join_conversation', (conversationId: string) => {
    if (typeof conversationId !== 'string') return
    socket.join(conversationId)
    console.log(`[chat] ${socket.id} joined ${conversationId}`)
  })

  // Salir de una sala
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(conversationId)
  })

  // Marcar como escribiendo
  socket.on('typing', (conversationId: string, isTyping: boolean) => {
    socket.to(conversationId).emit('typing', { from: socket.id, isTyping })
  })

  socket.on('disconnect', () => {
    console.log(`[chat] disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`[chat-service] Socket.io escuchando en puerto ${PORT}`)
})
