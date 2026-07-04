const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

const notificacaoRoutes = require('./routes/notificacoes')
app.use('/notificacoes', notificacaoRoutes)

const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
  console.log(`Notification Service rodando na porta ${PORT}`)
})
