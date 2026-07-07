const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

const chamadaRoutes = require('./routes/chamadas')
app.use('/chamadas', chamadaRoutes)

app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "chamada-service" })
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Chamada Service rodando na porta ${PORT}`)
})