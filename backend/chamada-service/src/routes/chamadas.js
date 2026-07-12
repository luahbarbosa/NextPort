const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

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
    const { dispositivoOrigemId, dispositivoDestinoId, status, origemAndroidId, destinoAndroidId } = req.body

    let origemId = dispositivoOrigemId
    let destinoId = dispositivoDestinoId

    // Se vier androidId, resolvemos para o ID inteiro do banco
    if (origemAndroidId && !origemId) {
      const orig = await prisma.dispositivo.findUnique({ where: { androidId: origemAndroidId } })
      if (orig) origemId = orig.id
    }
    if (destinoAndroidId && !destinoId) {
      const dest = await prisma.dispositivo.findUnique({ where: { androidId: destinoAndroidId } })
      if (dest) destinoId = dest.id
    }

    if (!origemId || !destinoId) {
      return res.status(400).json({ erro: 'Dispositivos de origem ou destino não encontrados.' })
    }

    const valStatus = status || 'nao_atendida'
    const statusValidos = ['atendida', 'nao_atendida', 'recusada', 'erro']
    if (!statusValidos.includes(valStatus)) {
      return res.status(400).json({ erro: `Status inválido. Deve ser um dos seguintes: ${statusValidos.join(', ')}` })
    }

    const chamada = await prisma.chamada.create({
      data: {
        dispositivoOrigemId: Number(origemId),
        dispositivoDestinoId: Number(destinoId),
        iniciadoEm: new Date(),
        status: valStatus
      }
    })
    res.status(201).json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Obter chamada por ID
router.get('/:id', async (req, res) => {
  try {
    const chamada = await prisma.chamada.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        origem: {
          include: { residencia: { include: { usuario: true } } }
        },
        destino: {
          include: { residencia: { include: { usuario: true } } }
        }
      }
    })
    if (!chamada) {
      return res.status(404).json({ erro: 'Chamada não encontrada' })
    }
    res.json(chamada)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Atualizar status genérico da chamada
router.patch('/:id', async (req, res) => {
  try {
    const { status, atendidoEm, encerradoEm } = req.body
    const id = Number(req.params.id)

    const existe = await prisma.chamada.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Chamada não encontrada' })
    }

    if (status) {
      const statusValidos = ['atendida', 'nao_atendida', 'recusada', 'erro']
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: `Status inválido. Deve ser um dos seguintes: ${statusValidos.join(', ')}` })
      }
    }

    const chamada = await prisma.chamada.update({
      where: { id },
      data: { 
        status, 
        atendidoEm: atendidoEm ? new Date(atendidoEm) : undefined, 
        encerradoEm: encerradoEm ? new Date(encerradoEm) : undefined 
      }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Atender chamada
router.patch('/:id/atender', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.chamada.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Chamada não encontrada' })
    }

    const chamada = await prisma.chamada.update({
      where: { id },
      data: {
        status: 'atendida',
        atendidoEm: new Date()
      }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Encerrar chamada
router.patch('/:id/encerrar', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.chamada.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Chamada não encontrada' })
    }

    const chamada = await prisma.chamada.update({
      where: { id },
      data: {
        encerradoEm: new Date()
      }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Recusar chamada
router.patch('/:id/recusar', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.chamada.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Chamada não encontrada' })
    }

    const chamada = await prisma.chamada.update({
      where: { id },
      data: {
        status: 'recusada',
        encerradoEm: new Date()
      }
    })
    res.json(chamada)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router