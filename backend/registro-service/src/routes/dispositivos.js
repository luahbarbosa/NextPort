const express = require('express')
const router = express.Router()
const { prisma } = require('shared-db')

// Listar todos
router.get('/', async (req, res) => {
  try {
    const dispositivos = await prisma.dispositivo.findMany({
      include: { residencia: { include: { usuario: true } } }
    })
    res.json(dispositivos)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Obter dispositivo por ID
router.get('/:id', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id: Number(req.params.id) },
      include: { residencia: { include: { usuario: true } } }
    })
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }
    res.json(dispositivo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Obter dispositivo por androidId
router.get('/por-android/:androidId', async (req, res) => {
  try {
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { androidId: req.params.androidId },
      include: { residencia: { include: { usuario: true } } }
    })
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }
    res.json(dispositivo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Cadastrar
router.post('/', async (req, res) => {
  try {
    const { nomeDispositivo, androidId, tipo, residenciaId } = req.body

    if (!nomeDispositivo || !androidId || !tipo) {
      return res.status(400).json({ erro: 'Os campos nomeDispositivo, androidId e tipo são obrigatórios.' })
    }

    if (tipo !== 'residencia' && tipo !== 'portaria') {
      return res.status(400).json({ erro: 'O campo tipo deve ser "residencia" ou "portaria".' })
    }

    const dispositivo = await prisma.dispositivo.create({
      data: {
        nomeDispositivo,
        androidId,
        tipo,
        residenciaId: residenciaId ? Number(residenciaId) : null,
        ultimoPing: new Date()
      }
    })
    res.status(201).json(dispositivo)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Remover
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existe = await prisma.dispositivo.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    await prisma.dispositivo.delete({
      where: { id }
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

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { nomeDispositivo, androidId, tipo, residenciaId, versaoApp } = req.body
    const id = Number(req.params.id)

    const existe = await prisma.dispositivo.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    if (!nomeDispositivo || !androidId || !tipo) {
      return res.status(400).json({ erro: 'Os campos nomeDispositivo, androidId e tipo são obrigatórios.' })
    }

    if (tipo !== 'residencia' && tipo !== 'portaria') {
      return res.status(400).json({ erro: 'O campo tipo deve ser "residencia" ou "portaria".' })
    }

    const dispositivo = await prisma.dispositivo.update({
      where: { id },
      data: {
        nomeDispositivo,
        androidId,
        tipo,
        residenciaId: residenciaId ? Number(residenciaId) : null,
        versaoApp
      }
    })
    res.json(dispositivo)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Ping (atualizar status online/último acesso)
router.patch('/:id/ping', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { ipLocal, macAddress, versaoApp } = req.body

    const existe = await prisma.dispositivo.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    const dispositivo = await prisma.dispositivo.update({
      where: { id },
      data: {
        ultimoPing: new Date(),
        ipLocal: ipLocal || undefined,
        macAddress: macAddress || undefined,
        versaoApp: versaoApp || undefined
      }
    })
    res.json(dispositivo)
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Reiniciar conexão (enviar comando ao signaling server e criar log)
router.patch('/:id/reiniciar', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const dispositivo = await prisma.dispositivo.findUnique({ where: { id } })
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' })
    }

    // Criar Log de Sistema
    await prisma.logSistema.create({
      data: {
        dispositivoId: id,
        acao: 'REINICIAR_CONEXAO',
        detalhes: `Solicitado reinício de conexão para o dispositivo ${dispositivo.nomeDispositivo} (${dispositivo.androidId})`
      }
    })

    // Notificar o signaling server
    const signalingUrl = process.env.SIGNALING_API_URL || 'http://localhost:3004'
    try {
      const response = await fetch(`${signalingUrl}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ androidId: dispositivo.androidId })
      })

      if (response.ok) {
        return res.json({ 
          mensagem: 'Reinicialização solicitada com sucesso. Comando enviado ao dispositivo.',
          dispositivo
        })
      } else {
        const errData = await response.json().catch(() => ({}))
        return res.json({ 
          mensagem: 'Comando registrado no banco, mas dispositivo não está ativo no signaling server no momento.',
          erroSignaling: errData.erro || 'Falha ao notificar signaling server',
          dispositivo
        })
      }
    } catch (fetchErr) {
      // Se o signaling server estiver inacessível, ainda retornamos ok sobre o banco
      return res.json({
        mensagem: 'Comando registrado no banco, mas signaling server está inacessível no momento.',
        erroConexao: fetchErr.message,
        dispositivo
      })
    }
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router