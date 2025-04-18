const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();
const {createClient} = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const createPeraturan = async (req, res) => {
    try {
        const { title, content } = req.body;
        const peraturan = await prisma.peraturan.create({
                data: { title, content },
        });
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_created",
            payload: peraturan,
        });
        
        res.status(201).json({ success: true, data: peraturan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPeraturan = async (req, res) => {
    try {
        const allPeraturan = await prisma.peraturan.findMany({});
        res.status(200).json({ success: true, data: allPeraturan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updatePeraturan = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const peraturan = await prisma.peraturan.update({
            where: { id: id },
            data: { title, content },
        });
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_updated",
            payload: peraturan,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deletePeraturan = async (req, res) => {
    try {
        const { id } = req.params;
        const peraturan = await prisma.peraturan.delete({
            where: { id: id },
        });
        res.status(200).json({ success: true, data: peraturan });
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_deleted",
            payload: peraturan,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createPeraturan, getPeraturan, updatePeraturan, deletePeraturan };