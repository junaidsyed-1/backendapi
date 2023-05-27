const jwt = require('jsonwebtoken');

const JWT_SECRET = 'junaidsyedbackend@app'


const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add it to the req object
    const token = req.header('auth-token');
    if (!token) { return res.status(401).send({ error: 'Invalid token' }); }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user
        next();
    } catch (error) {
        return res.status(401).send({ error: 'Invalid token' })
    }
};

module.exports = fetchuser;