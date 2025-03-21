const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
    
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const subscribeToKendalaInsert = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Bisa diganti dengan UPDATE atau DELETE jika perlu
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
  subscribeToKendalaInsert();
  

const kendala = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.update({
            
        });
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {kendala, update}