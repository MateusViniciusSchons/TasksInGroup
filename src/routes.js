const express = require('express')

const sessionController = require('./controllers/sessionController')
const tasksController = require('./controllers/tasksController')
const stageController = require('./controllers/stageController')

const routes = express.Router()

routes.post('/sessions/create', sessionController.store)

routes.get('/tasks', tasksController.index)
routes.get('/tasks/:taskId', tasksController.show)
routes.post('/tasks/create', tasksController.store)
routes.delete('/tasks/:taskId/', tasksController.delete)

routes.put('/tasks/stage', stageController.update)

module.exports = routes