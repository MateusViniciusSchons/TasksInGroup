require('dotenv').config()

const express = require('express')
const http = require('http')
const routes = require('./routes')
const cors = require('cors')
const { setupWebsocket } = require('./websocket')

const app = express()


const server = http.Server(app)
setupWebsocket(server)


app.use(cors())
app.use(express.json())
app.use(routes)

const port = process.env.PORT || 3333
server.listen(port, _ => {
    console.log("App running on port " + port)
})