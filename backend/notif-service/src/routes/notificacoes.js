const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

// Listar todas as notificações
router.get('/', async (req, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        dispositivo: {
          include: { residencia: { include: { usuario: true } } }
        },
        chamada: true
      }
    })
    res.json(notificacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar notificações por dispositivo (usando androidId)
router.get('/por-dispositivo/:androidId', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { androidId: req.params.androidId }
    })

    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: { dispositivoId: dispositivo.id },
      orderBy: { criadoEm: 'desc' },
      include: { chamada: true }
    })

    res.json(notificacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Criar nova notificação
router.post('/', async (req, res) => {
  try {
    const { androidId, dispositivoId, chamadaId, tipo, mensagem } = req.body

    let targetDispositivoId = dispositivoId

    // Se vier androidId, resolve o ID no banco
    if (androidId && !targetDispositivoId) {
      const dispositivo = await prisma.dispositivo.findUnique({
        where: { androidId }
      })
      if (dispositivo) {
        targetDispositivoId = dispositivo.id
      }
    }

    if (!targetDispositivoId) {
      return res.status(400).json({ erro: 'Dispositivo não especificado ou não encontrado.' })
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        dispositivoId: Number(targetDispositivoId),
        chamadaId: chamadaId ? Number(chamadaId) : null,
        tipo,
        mensagem,
        lida: false
      }
    })

    res.json(notificacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Marcar notificação como lida
router.patch('/:id/ler', async (req, res) => {
  try {
    const notificacao = await prisma.notificacao.update({
      where: { id: Number(req.params.id) },
      data: { lida: true }
    })
    res.json(notificacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router
