const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Cadastrar admin
router.post('/register', async (req, res) => {
    try {
        const { email, senha } = req.body
        const senhaHash = await bcrypt.hash(senha, 10)
        const usuario = await prisma.usuario.create({
            data: { email, senha: senhaHash }
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

        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha incorreta' })
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({ token })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
})

module.exports = router