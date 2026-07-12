const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

// Listar todas
router.get('/', async (req, res) => {
  try {
    const residencias = await prisma.residencia.findMany({
      include: { dispositivos: true }
    })
    res.json(residencias)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Obter uma residência por ID
router.get('/:id', async (req, res) => {
  try {
    const residencia = await prisma.residencia.findUnique({
      where: { id: Number(req.params.id) },
      include: { dispositivos: true }
    })
    if (!residencia) {
      return res.status(404).json({ erro: 'Residência não encontrada' })
    }
    res.json(residencia)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const { identificador, bloco, usuarioId } = req.body

    if (!identificador) {
      return res.status(400).json({ erro: 'O campo identificador é obrigatório.' })
    }
    if (!usuarioId) {
      return res.status(400).json({ erro: 'O campo usuarioId é obrigatório.' })
    }

    const residencia = await prisma.residencia.create({
      data: { 
        identificador, 
        bloco, 
        usuarioId: Number(usuarioId),
        ativa: true
      }
    })
    res.status(201).json(residencia)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { identificador, bloco, usuarioId, ativa } = req.body
    const id = Number(req.params.id)

    // Verificar se existe
    const existe = await prisma.residencia.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Residência não encontrada' })
    }

    if (!identificador) {
      return res.status(400).json({ erro: 'O campo identificador é obrigatório.' })
    }
    if (!usuarioId) {
      return res.status(400).json({ erro: 'O campo usuarioId é obrigatório.' })
    }

    const residencia = await prisma.residencia.update({
      where: { id },
      data: {
        identificador,
        bloco,
        usuarioId: Number(usuarioId),
        ativa: ativa !== undefined ? Boolean(ativa) : undefined
      }
    })
    res.json(residencia)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Remover
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    // Verificar se existe
    const residencia = await prisma.residencia.findUnique({
      where: { id },
      include: { dispositivos: true }
    })

    if (!residencia) {
      return res.status(404).json({ erro: 'Residência não encontrada' })
    }

    // Verificar se possui dispositivos associados
    if (residencia.dispositivos && residencia.dispositivos.length > 0) {
      return res.status(400).json({
        erro: 'Não é possível excluir uma residência com dispositivos associados.'
      })
    }

    await prisma.residencia.delete({
      where: { id }
    })
    res.json({ mensagem: 'Residência removida' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router