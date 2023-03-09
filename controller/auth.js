const { OAuth2Client } = require("google-auth-library");
const { User } = require('../model')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const TOKEN_KEY = process.env.TOKEN_KEY
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

module.exports.googleSignin = async (req, res) => {
    const { sendToken } = req.body;
    console.log(sendToken);
    if (!sendToken) {
        return res.status(400).json({ error: "Access token is missing" });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: sendToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        // check if the user already exists in your database
        let user = await User.findOne({ where: { username: email } });
        if (user) {
            console.log("User found in database");
        } else {
            // create a new user with the Google credentials
            user = await User.create({
                username: email,
                access_token: sendToken,
            });
            console.log("New user created in database");
        }
        const tokenPayload = {
            user_id: user.id, email: user.email,
        };
        const token = jwt.sign(tokenPayload, TOKEN_KEY, {
            expiresIn: '3h'
        });
        return res.status(200).json({ message: "Successful login with Google", user, token });
    } catch (error) {
        console.error(error);
        if (error.message === "Invalid Value") {
            return res.status(400).json({ error: "Invalid access token" });
        }
        if (error.message === "user not found") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports.verifyToken = (req, res) => {
    const token = req.headers['authorization']
}


module.exports.signIn = (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists in the database
    User.findOne({ where: { username } })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: "Invalid username" });
            }

            // Check if the password is correct
            if (password !== user.password) {
                return res.status(401).json({ error: "Invalid password" });
            }

            // Login successful
            const tokenPayload = {
                user_id: user.id, email: user.email,
            };
            const token = jwt.sign(tokenPayload, TOKEN_KEY, {
                expiresIn: '3h'
            });
            return res.status(200).json({ message: "Login successful", user, token });
        })
        .catch((err) => res.status(500).json({ error: "Internal server error" }));
};

module.exports.signUp = (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists in the database
    User.findOne({ where: { username } })
        .then(async (user) => {
            if (user) {
                return res.status(401).json({ error: "Email already exists" });
            }
            user = await User.create({
                username,
                password,
            });
            console.log("New user created in database");
            // Login successful
            const tokenPayload = {
                user_id: user.id, email: user.email,
            };
            const token = jwt.sign(tokenPayload, TOKEN_KEY, {
                expiresIn: '3h'
            });
            return res.status(200).json({ message: "Login successful", user, token });
        })
        .catch((err) => { console.log(err); res.status(500).json({ error: "Internal server error" }) });
};

module.exports.updatePassword = (req, res) => {
    const { username, password } = req.body;
    if(!password) {
        return res.status(401).json({ error: "Password is invalid" });
    }
    // Check if the user exists in the database
    User.findOne({ where: { username } })
        .then(async (user) => {
            if (!user) {
                return res.status(401).json({ error: "Internal server error" });
            }
            user.update({ password })
            // Login successful
            return res.status(200).json({ message: "Password is changed successfully!" });
        })
        .catch((err) => { console.log(err); res.status(500).json({ error: "Internal server error" }) });
};