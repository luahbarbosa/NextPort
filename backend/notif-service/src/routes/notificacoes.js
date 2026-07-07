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

    if (!tipo) {
      return res.status(400).json({ erro: 'O campo tipo é obrigatório.' })
    }

    const tiposValidos = ['chamada', 'sistema', 'atualizacao']
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ erro: `Tipo de notificação inválido. Deve ser um dos seguintes: ${tiposValidos.join(', ')}` })
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

    res.status(201).json(notificacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Obter notificação por ID
router.get('/:id', async (req, res) => {
  try {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        dispositivo: {
          include: { residencia: { include: { usuario: true } } }
        },
        chamada: true
      }
    })
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }
    res.json(notificacao)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Marcar notificação como lida (/ler)
router.patch('/:id/ler', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.notificacao.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }

    const notificacao = await prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    })
    res.json(notificacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Marcar notificação como lida (/lida)
router.patch('/:id/lida', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.notificacao.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }

    const notificacao = await prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    })
    res.json(notificacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Excluir notificação
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.notificacao.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }

    await prisma.notificacao.delete({
      where: { id }
    })
    res.json({ mensagem: 'Notificação removida com sucesso.' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router
