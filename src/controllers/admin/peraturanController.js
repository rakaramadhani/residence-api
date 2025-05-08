const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();
const {createClient} = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const createPeraturan = async (req, res) => {
    try {
        const { judul, isi_peraturan, kategori } = req.body;
        const peraturan = await prisma.peraturan.create({
                data: { judul, isi_peraturan, kategori },
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
        const { judul, isi_peraturan, kategori } = req.body;

        // Konversi id ke Int
        const peraturan = await prisma.peraturan.update({
            where: { id: parseInt(id, 10) }, // Konversi id ke Int
            data: { judul, isi_peraturan, kategori },
        });

        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_updated",
            payload: peraturan,
        });

        res.status(200).json({ success: true, data: peraturan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePeraturan = async (req, res) => {
    try {
        const { id } = req.params;
        const peraturan = await prisma.peraturan.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(200).json({ success: true, message: "Peraturan deleted" });
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