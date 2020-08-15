const socketio  = require('socket.io')

const connections = []

let io;

exports.setupWebsocket = (server) => {
    io = socketio(server)
    
    io.on('connection', socket => {

        connections.push({
            id: socket.id,
        })

    })

}

exports.sendTaskCreated = (task) => {
    io.emit('new', {...task})
}

exports.sendTaskDeleted = (taskId) => {
    io.emit('taskDeleted', taskId )
}

exports.sendTaskStageUpdated = (taskId, lastStage, newStage, userDoing, userDoingId) => {
    io.emit('taskStageUpdated', { taskId, lastStage, newStage, userDoing, userDoingId} )
}