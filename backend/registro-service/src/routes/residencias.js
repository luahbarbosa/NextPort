const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: "postgresql://admin:senha123@localhost:5432/interfone" })
const prisma = new PrismaClient({ adapter })

// Listar todas
router.get('/', async (req, res) => {
  const residencias = await prisma.residencia.findMany({
    include: { dispositivos: true }
  })
  res.json(residencias)
})

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const { nome, numero } = req.body
    const residencia = await prisma.residencia.create({
      data: { nome, numero }
    })
    res.json(residencia)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Remover
router.delete('/:id', async (req, res) => {
  try {
    await prisma.residencia.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ mensagem: 'Residência removida' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router