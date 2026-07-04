const express = require('express')
const router = express.Router()
const { prisma } = require('../../../shared-db');

// Listar histórico de chamadas
router.get('/', async (req, res) => {
  try {
    const chamadas = await prisma.chamada.findMany({
      orderBy: { iniciadoEm: 'desc' },
      include: {
        origem: {
          include: { residencia: { include: { usuario: true } } }
        },
        destino: {
          include: { residencia: { include: { usuario: true } } }
        }
      }
    })
    res.json(chamadas)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar chamadas por dispositivo (androidId)
router.get('/por-dispositivo/:androidId', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { androidId: req.params.androidId }
    })

    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    const chamadas = await prisma.chamada.findMany({
      where: {
        OR: [
          { dispositivoOrigemId: dispositivo.id },
          { dispositivoDestinoId: dispositivo.id }
        ]
      },
      orderBy: { iniciadoEm: 'desc' },
      include: {
        origem: {
          include: { residencia: { include: { usuario: true } } }
        },
        destino: {
          include: { residencia: { include: { usuario: true } } }
        }
      }
    })

    res.json(chamadas)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Registrar nova chamada
router.post('/', async (req, res) => {
  try {
    const { dispositivoOrigemId, dispositivoDestinoId, status } = req.body
    const chamada = await prisma.chamada.create({
      data: {
        dispositivoOrigemId,
        dispositivoDestinoId,
        iniciadoEm: new Date(),
        status
      }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Atualizar status da chamada
router.patch('/:id', async (req, res) => {
  try {
    const { status, atendidoEm, encerradoEm } = req.body
    const chamada = await prisma.chamada.update({
      where: { id: Number(req.params.id) },
      data: { status, atendidoEm, encerradoEm }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router