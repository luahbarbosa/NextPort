const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

// Listar todas as atualizações
router.get('/', async (req, res) => {
  try {
    const atualizacoes = await prisma.atualizacaoRemota.findMany({
      orderBy: { solicitadoEm: 'desc' },
      include: { dispositivo: true }
    })
    res.json(atualizacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar atualizações por dispositivo (androidId)
router.get('/por-dispositivo/:androidId', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { androidId: req.params.androidId }
    })

    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    const atualizacoes = await prisma.atualizacaoRemota.findMany({
      where: { dispositivoId: dispositivo.id },
      orderBy: { solicitadoEm: 'desc' }
    })

    res.json(atualizacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Criar solicitação de atualização
router.post('/', async (req, res) => {
  try {
    const { dispositivoId, androidId, versaoNova, urlPacote } = req.body

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

    if (!versaoNova) {
      return res.status(400).json({ erro: 'O campo versaoNova é obrigatório.' })
    }

    const atualizacao = await prisma.atualizacaoRemota.create({
      data: {
        dispositivoId: Number(targetDispositivoId),
        versaoNova,
        urlPacote: urlPacote || null,
        status: 'pendente'
      }
    })

    res.status(201).json(atualizacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Alterar status da atualização
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    const existe = await prisma.atualizacaoRemota.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Solicitação de atualização não encontrada' })
    }

    if (!status) {
      return res.status(400).json({ erro: 'O campo status é obrigatório.' })
    }

    const statusValidos = ['pendente', 'em_andamento', 'concluida', 'erro']
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Deve ser um dos seguintes: ${statusValidos.join(', ')}` })
    }

    const concluidoEm = status === 'concluida' ? new Date() : undefined

    const atualizacao = await prisma.atualizacaoRemota.update({
      where: { id },
      data: {
        status,
        concluidoEm
      }
    })

    res.json(atualizacao)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router
