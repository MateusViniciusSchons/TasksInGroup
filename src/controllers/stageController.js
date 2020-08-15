const connection = require('../db/connection')
const toBrazilianFormat = require('../utils/dateFormat')
const { sendTaskStageUpdated } = require('../websocket')

module.exports = {
    async update(req, res) {
        const { taskId } = req.body
        const { userid } = req.headers
        
        let stages = ['todo', 'doing', 'done'];

        await connection.execute(
            `SELECT actualStage as stage FROM tasks
                WHERE id = ?`,
            [taskId],
            async (err, result, fields) => {
                if(!err) {
                    if(result[0].stage) {
                        let  lastStage = result[0].stage
                        let newStage = result[0].stage !== 'done'? stages[stages.indexOf(result[0].stage) + 1]: result[0].stage
                        const datetime = toBrazilianFormat()
                        await connection.execute(
                            `UPDATE tasks
                                SET actualStage = ?,
                                    lastChangeStage = ?,
                                    userDoing = ?
                                WHERE id = ?`,
                            [newStage, datetime, userid, taskId],
                            async (err, results, fields) => {
                                if(!err) {
                                    // pega o nome do usuário q mandou
                                        await connection.execute(
                                            `SELECT name as userDoingName FROM users WHERE id = ?`,
                                            [userid],
                                            (err, results, fields) => {
                                                if(!err) {
                                                    // manda socketIO com o id da tarefa, o novo estagio e o usuário q esta fazendo
                                                        sendTaskStageUpdated(taskId, lastStage, newStage, results[0].userDoingName, userid)
                                                    return res.json({ actualStage: newStage})
                                                } else {
                                                    console.log(err)
                                                }
                                            }
                                        )
                                } else {
                                    console.log(err)
                                }
                            }
                        )
                    } else {
                        console.log('Não foi encontrado um campo')
                    }
                } else {
                    console.log(err)
                }
            }
        )
    }
}