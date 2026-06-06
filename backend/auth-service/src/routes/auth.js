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
            { id: usuario.id, email: usuario.email, role: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({ token })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
})

module.exports = router