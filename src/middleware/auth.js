import jwt from 'jsonwebtoken'

const authentication = {
    verifyToken: function(req, res, next) {
        const token = req.headers.authorization.split(" ")[1]
        
        jwt.verify(token, process.env.secret_key, (err, decoded) => {
            if (err) {
                console.log('Token not valid')
                res.sendStatus(401)
            } else {
                console.log('Token is valid');
                console.log('payload', decoded);
                next()
            }
        })
    }
}



export default authentication