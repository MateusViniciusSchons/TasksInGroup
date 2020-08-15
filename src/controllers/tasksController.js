const connection = require('../db/connection')
const toBrazilianFormat = require('../utils/dateFormat')
const { sendTaskCreated, sendTaskDeleted } = require('../websocket')
module.exports = {
    async index(req, res) {
        await connection.execute(
            `SELECT T.id, T.title, T.actualStage, T.lastChangeStage, U.name as createdFor, UT.id as userDoingId, UT.name as userDoing FROM tasks as T
            inner join users as U
            ON U.id = T.createdFor
            left JOIN users AS UT
            ON UT.id = T.userDoing
            WHERE deleted = ?`,
            [false],
            (err, results, fields) => {
                if(!err) {

                    let todo = results.filter(task => task.actualStage === 'todo')
                    let doing = results.filter(task => task.actualStage === 'doing')
                    let done = results.filter(task => task.actualStage === 'done')
                    res.json({ todo, doing, done })
                } else {
                    res.json({ error: err })
                }
            }
        )
    },
    async show(req, res) {
        const { taskId } = req.params

        await connection.execute(
            `SELECT T.id, T.title, T.actualStage, T.description, T.lastChangeStage, U.id as createdForId, U.name as createdFor, UT.id as userDoingId, UT.name as userDoing FROM tasks as T
                inner join users as U
                ON U.id = T.createdFor
                left JOIN users AS UT
                ON UT.id = T.userDoing
            
            WHERE deleted = ?
            AND T.id = ?`,
            [false, taskId],
            (err, results, fields) => {
                if(!err) {
                    res.json(results)
                } else {
                    res.json({ error: err })
                }
            }
        )
    },
    async store(req, res) {
        const { title, description } = req.body
        const { userid: userId } = req.headers

        let date = toBrazilianFormat()

        await connection.execute(
            `INSERT INTO tasks 
                (title, description, createdFor, lastChangeStage)
                values (?, ?, ?, ?)`,
            [title, description, userId, date],
            async (err, result, fields) => {
                if(!err) {
                    // Pega o nome da pessoa que criou a tarefa
                        await connection.execute(
                            `SELECT name as createdFor FROM users WHERE id = ?`,
                            [userId],
                            (err, results, fields) => {
                                //manda pros outros clientes a nova tarefa
                                    sendTaskCreated({ id: result.insertId, title, description, createdFor: results[0].createdFor, date, actualStage: 'todo' })

                                    return res.json({ok: true})
                            }
                        )
                    
                } else {
                    return res.json({ error: "Não foi possível inserir" + err })
                }
            }
        )
    },
    async delete(req, res) {
        const { taskId } = req.params
        const { withTimeout } = req.query
        if(withTimeout) {
            let error;
            setTimeout(async () => {
                await connection.execute(
                `UPDATE tasks 
                    SET deleted = ?
                    WHERE id = ?`,
                [true, taskId],
                (err, result, fields) => {
                    if(!err) {
                        // enviar mensagem com socket.IO para todos depois de 24 horas
                        sendTaskDeleted(taskId)
                        
                    } else {
                        return res.json({ err })
                    }
                })
            }, 3600000)
            
            return res.json(error? { error }:  Number(taskId) )
            
        
        } else {
            const { userId } = req.headers

            await connection.execute(
                `UPDATE tasks 
                    SET deleted = ?
                    WHERE id = ?
                    AND createdFor = ?`,
                [true, taskId, userId],
                (err, result, fields) => {
                    if(!err) {
                        return res.json(Number(taskId))
                    } else {
                        return res.json({ err })
                    }
                }
            )
        }

        
    }
}