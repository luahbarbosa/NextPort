const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

// Listar todos
router.get('/', async (req, res) => {
  const dispositivos = await prisma.dispositivo.findMany({
    include: { residencia: { include: { usuario: true } } }
  })
  res.json(dispositivos)
})

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const { nomeDispositivo, androidId, tipo, residenciaId } = req.body
    const dispositivo = await prisma.dispositivo.create({
      data: { nomeDispositivo, androidId, tipo, residenciaId: residenciaId ? Number(residenciaId) : null }
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
// Buscar dispositivo pelo usuarioId
router.get('/por-usuario/:usuarioId', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findFirst({
      where: {
        residencia: {
          usuarioId: Number(req.params.usuarioId)
        }
      },
    include: { residencia: { include: { usuario: true } } }
    })
    res.json(dispositivo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})
module.exports = router