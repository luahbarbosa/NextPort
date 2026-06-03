const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: "postgresql://admin:senha123@localhost:5432/interfone" })
const prisma = new PrismaClient({ adapter })

// Listar todos
router.get('/', async (req, res) => {
  const dispositivos = await prisma.dispositivo.findMany({
    include: { residencia: true }
  })
  res.json(dispositivos)
})

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const { nome, token, tipo, residenciaId } = req.body
    const dispositivo = await prisma.dispositivo.create({
      data: { nome, token, tipo, residenciaId: residenciaId ? Number(residenciaId) : null }
    })
    res.json(dispositivo)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Remover
router.delete('/:id', async (req, res) => {
  try {
    await prisma.dispositivo.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ mensagem: 'Dispositivo removido' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router