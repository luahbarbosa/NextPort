const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

const residenciaRoutes = require('./routes/residencias')
const dispositivoRoutes = require('./routes/dispositivos')
const moradoresRoutes = require('./routes/moradores')
const funcionariosRoutes = require('./routes/funcionarios')

app.use('/residencias', residenciaRoutes)
app.use('/dispositivos', dispositivoRoutes)
app.use('/moradores', moradoresRoutes)
app.use('/funcionarios', funcionariosRoutes)

app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "registro-service" })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Registro Service rodando na porta ${PORT}`)
})