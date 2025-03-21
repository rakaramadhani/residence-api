const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const subscribeToKendalaChanges = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Bisa diganti dengan UPDATE atau DELETE jika perlu
          schema: 'public',
          table: 'kendala',
        },
        async (payload) => {
          console.log('Perubahan pada tabel kendala:', payload);
          
          // Opsional: Bisa kirim notifikasi atau trigger proses lain di backend
        }
      )
      .subscribe();
    
    console.log('Listening for changes on "kendala" table...');
  };
  
  // Panggil fungsi subscribe saat server berjalan
  subscribeToKendalaChanges();
  

const getKendala = async (req, res) => {
    try {
        const { user_id } = req.params;

        
        const data = await prisma.kendala.findMany({
            where: { userId: user_id }
        });

        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }

        res.status(200).json({ message: "Success", data });

  
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