const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getKendala = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch data pertama kali
        const data = await prisma.kendala.findMany({
            where: { userId: user_id }
        });

        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }

        res.status(200).json({ message: "Success", data });

        // Subscribe ke semua perubahan status_kendala
        // supabase
        //     .channel('schema-db-changes')
        //     .on(
        //         'postgres_changes',
        //         {
        //             schema: 'public',
        //             table: 'kendala',
        //             event: 'UPDATE',
        //             filter: `userId=eq.${user_id}`
        //         },
        //         async (payload) => {
        //             // Pastikan hanya perubahan status_kendala yang dipantau
        //             if (payload.old.status_kendala !== payload.new.status_kendala) {
        //                 console.log('Status kendala berubah:', payload);

        //                 // Fetch ulang data terbaru
        //                 const updatedData = await prisma.kendala.findMany({
        //                     where: { userId: user_id }
        //                 });

        //                 res.status(200).json({ message: "Updated Data", data: updatedData });
        //             }
        //         }
        //     )
        //     .subscribe();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createKendala = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newKendalaData = await prisma.kendala.create({
            data: { ...req.body, userId: user_id } 
        });
        res.status(201).json({ message: "Success", data: newKendalaData });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

};

const updateKendala = async (req, res) => {
    try {
        const { user_id, kendala_id } = req.params;

        
        const { status_kendala, ...updateData } = req.body;

        const updatedKendala = await prisma.kendala.update({
            where: { 
                id: kendala_id, 
                userId: user_id 
            },
            data: updateData // Hanya update data tanpa `status_kendala`
        });

        res.status(200).json({ message: "Success", data: updatedKendala });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteKendala = async (req, res) => {
    try {
        const { user_id, kendala_id } = req.params;
        const deleted = await prisma.kendala.delete({
            where: { id: kendala_id, userId: user_id }
        });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {getKendala, createKendala, updateKendala, deleteKendala};