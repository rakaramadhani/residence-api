
const { PrismaClient } = require('@prisma/client')
const express = require("express");
const dotenv = require("dotenv");
const app = express();

const prisma = new PrismaClient()
dotenv.config();

app.use(express.json())

const PORT = process.env.PORT;

app.get("/users", async (req,res) => {
    const users = await prisma.user.findMany()
    res.send(users)
})

app.post("/users", async (req,res) => {
    try {
        const newUser = req.body;
    const users = await prisma.user.create({
        data: {
            name: newUser.name,
            email: newUser.email,
            nik: newUser.nik,
        },
    })
    res.send({
        data: users,
        message: "Input Success"
    })
    } catch (error) {
        res.send({
            message: error,
        })
    }
})

app.listen(PORT, ()=>{
    console.log("Running on :" + PORT)
})