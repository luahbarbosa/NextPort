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
          include: { residencia: true }
        },
        destino: {
          include: { residencia: true }
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