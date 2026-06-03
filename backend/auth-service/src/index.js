const express = require('express')
const app = express()
require('dotenv').config()

app.use(express.json())

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Auth Service rodando na porta ${PORT}`)
})