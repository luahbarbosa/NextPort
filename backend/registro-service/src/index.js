const express = require('express')
const app = express()
require('dotenv').config()

app.use(express.json())

const residenciaRoutes = require('./routes/residencias')
const dispositivoRoutes = require('./routes/dispositivos')

app.use('/residencias', residenciaRoutes)
app.use('/dispositivos', dispositivoRoutes)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Registro Service rodando na porta ${PORT}`)
})