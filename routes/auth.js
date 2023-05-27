const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchuser')

const JWT_SECRET = 'junaidsyedbackend@app'

// ROUTE-1 create a user usin POST method :: Login dosent required
router.post('/createuser', [
    body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    // check if the user email is already exist
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, message: 'User with this email already exists' })
        }
        // Generating salt and hash for password security
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // create a user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const data = {
            user: {
                id: user.id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log(authToken);
        success = true
        res.send({ success, authToken });

        // res.json(user)

    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Some error occurred " })
    }
}) //End of create user

// ROUTE-2 Authenticate a user using POST:: no login required
router.post('/login', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password cannot be empty').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // destructing to get email,password out from the body
    const { email, password } = req.body;
    let success = false;

    try {
        let user = await User.findOne({ email });
        if (!user) { return res.status(400).json({ success, error: 'User not found' }); }

        // comparing password
        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) { return success, res.status(400).json({ success, error: 'User not found' }); }

        const data = {
            user: {
                id: user.id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.send({ success: true, authToken });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error Occured" })
    }
}); //End of Login User

// ROUTE-3 Get logged in user details using POST :: Login required 
router.post('/getuser', fetchUser, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let userId = req.user.id;
        let user = await User.findById(userId).select('-password')
        if (!user) { return res.status(400).json({ error: 'User not found' }); }
        res.send({ name: user.name, email: user.email })

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error Occured")
    }
});
module.exports = router