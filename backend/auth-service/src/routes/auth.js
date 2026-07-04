const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { prisma } = require('shared-db')

// Cadastrar admin
router.post('/register', async (req, res) => {
    try {
        const { email, senha, nome = 'Administrador' } = req.body
        const senhaHash = await bcrypt.hash(senha, 10)
        const usuario = await prisma.usuario.create({
            data: { email, senhaHash, nome, perfil: 'admin' }
        })
        res.json({ mensagem: 'Usuário criado', id: usuario.id })
    } catch (err) {
        res.status(400).json({ erro: err.message })
    }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body

    const usuario = await prisma.usuario.findUnique({ where: { email } })

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' })
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, nome: usuario.nome, id: usuario.id })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Middleware de autenticação
const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' })
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' })
  }
}

// Obter perfil
router.get('/perfil', autenticar, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }
    })
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }
    res.json({
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.perfil === 'admin' ? 'Administrador' : 'Morador',
      telefone: '(11) 99999-0000',
      departamento: 'Operações',
      endereco: 'São Paulo, SP'
    })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Atualizar perfil
router.put('/perfil', autenticar, async (req, res) => {
  try {
    const { nome, email } = req.body
    const usuario = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { nome, email }
    })
    res.json({
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.perfil === 'admin' ? 'Administrador' : 'Morador',
      telefone: req.body.telefone || '(11) 99999-0000',
      departamento: req.body.departamento || 'Operações',
      endereco: req.body.endereco || 'São Paulo, SP'
    })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Alterar senha
router.post('/alterar-senha', autenticar, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }
    })

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }

    const senhaValida = await bcrypt.compare(currentPassword, usuario.senhaHash)
    if (!senhaValida) {
      return res.status(400).json({ erro: 'Senha atual incorreta' })
    }

    const novaSenhaHash = await bcrypt.hash(newPassword, 10)
    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { senhaHash: novaSenhaHash }
    })

    res.json({ mensagem: 'Senha alterada com sucesso' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

module.exports = router