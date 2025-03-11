const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client')

const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(express.json())
const PORT = process.env.PORT;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
        }
    
        jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

// Login
app.post("/admin/login", async (req,res) => {
    try {
        const user = await prisma.user.findUnique({where: {
            email,
        }})
        const password = await prisma.user.findUnique({where: {
            password,
        }})
        const passwordMatch = await bcrypt.compare(req.body.password)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})


