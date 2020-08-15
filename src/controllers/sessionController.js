const connection = require('../db/connection')

module.exports = {
    async store(req, res) {
        const { registration, password } = req.body

        await connection.execute(`
            SELECT id, name FROM users
                WHERE id = ?
                AND password = ?`,
            [registration, password],
            (err, result, rows) => {
                if(!err) {
                    return res.json(result.length > 0? result[0]: { error: 'Não existe usuário com essas informações' })
                    
                } else {
                    console.log(err)
                }
            }
        )
        
    }
}