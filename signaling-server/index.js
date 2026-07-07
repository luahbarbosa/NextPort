const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Mapa de dispositivos conectados: { androidId: socketId }
const dispositivosConectados = {}

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`)

  // Dispositivo se registra ao conectar
  socket.on('registrar', (androidId) => {
    dispositivosConectados[androidId] = socket.id
    console.log(`Dispositivo registrado: ${androidId} → ${socket.id}`)

    // Confirma registro
    socket.emit('registrado', { androidId })

    // Avisa todos que alguém ficou online
    io.emit('status_atualizado', {
      androidId,
      online: true
    })
  })

  // Iniciar chamada
  socket.on('chamar', ({ deAndroidId, paraAndroidId, nome, local, chamadaId }) => {
    const socketDestino = dispositivosConectados[paraAndroidId]

    if (socketDestino) {
      console.log(`Chamada de ${deAndroidId} para ${paraAndroidId} (ID DB: ${chamadaId})`)
      io.to(socketDestino).emit('chamada_recebida', {
        deAndroidId,
        nome,
        local,
        chamadaId
      })
    } else {
      socket.emit('dispositivo_offline', { paraAndroidId })
    }
  })

  // Aceitar chamada
  socket.on('aceitar_chamada', ({ paraAndroidId }) => {
    const socketDestino = dispositivosConectados[paraAndroidId]
    if (socketDestino) {
      io.to(socketDestino).emit('chamada_aceita')
    }
  })

  // Recusar chamada
  socket.on('recusar_chamada', ({ paraAndroidId }) => {
    const socketDestino = dispositivosConectados[paraAndroidId]
    if (socketDestino) {
      io.to(socketDestino).emit('chamada_recusada')
    }
  })

  // Encerrar chamada
  socket.on('encerrar_chamada', ({ paraAndroidId }) => {
    const socketDestino = dispositivosConectados[paraAndroidId]
    if (socketDestino) {
      io.to(socketDestino).emit('chamada_encerrada')
    }
  })

  // Desconexão
  socket.on('disconnect', () => {
    const androidId = Object.keys(dispositivosConectados).find(
      id => dispositivosConectados[id] === socket.id
    )
    if (androidId) {
      delete dispositivosConectados[androidId]
      console.log(`Dispositivo desconectado: ${androidId}`)
      io.emit('status_atualizado', { androidId, online: false })
    }
  })
})

app.get('/status', (req, res) => {
  res.json(Object.keys(dispositivosConectados))
})

app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "signaling-server" })
})

app.post('/reiniciar', (req, res) => {
  const { androidId } = req.body
  if (!androidId) {
    return res.status(400).json({ erro: 'O campo androidId é obrigatório.' })
  }

  const socketId = dispositivosConectados[androidId]
  if (socketId) {
    io.to(socketId).emit('reiniciar', { androidId })
    console.log(`[Signaling] Evento 'reiniciar' enviado para ${androidId} (socket: ${socketId})`)
    return res.json({ mensagem: `Comando de reinicialização enviado ao dispositivo ${androidId}.` })
  }

  res.status(404).json({ erro: `Dispositivo ${androidId} não está online no momento.` })
})

const PORT = process.env.PORT || 3004
server.listen(PORT, () => {
  console.log(`Signaling Server rodando na porta ${PORT}`)
})