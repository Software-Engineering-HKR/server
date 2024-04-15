import jwt from 'jsonwebtoken'

const authentication = {
    verifyToken: (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.secret_key, (err, decoded) => {
                if (err) {
                    console.log('Token not valid:', err.message);
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    console.log(decoded);
                    //check age maybe 
                    next();
                }
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
};

export default authentication