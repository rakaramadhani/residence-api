const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFamilyData = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.penghuni.findMany({ where: { userId: user_id } });
        if (!data.length) {
            return res.status(200).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createFamilyData = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newFamilyData = await prisma.penghuni.create({
            data: { ...req.body, userId: user_id }
        });
        res.status(201).json({ message: "Success", data: newFamilyData });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const updateFamilyData = async (req, res) => {
    try {
        const { user_id, id } = req.params;
        const updatedFamilyData = await prisma.penghuni.update({
            where: { id: id, userId: user_id },
            data: req.body
        });
        res.status(200).json({ message: "Success", data: updatedFamilyData });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteFamilyData = async (req, res) => {
    try {
        const { user_id, id } = req.params;
        const deleted = await prisma.penghuni.delete({
            where: { id: id, userId: user_id }
        });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports = { getFamilyData, createFamilyData, updateFamilyData, deleteFamilyData };
