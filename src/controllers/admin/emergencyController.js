const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get Emergency
const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({include: {user: true},
            orderBy: {
                created_at: 'desc'
            }
        });
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get Emergency Alert untuk Modal Warning
const getEmergencyAlert = async (req, res) => {
    try {
        const emergencyAlert = await prisma.emergency.findFirst({
            where: {
                status: 'pending' // Tambahkan filter status
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: true
            }
        });
        res.status(200).json({ 
            message: "Success", 
            data: emergencyAlert,
            hasAlert: !!emergencyAlert
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

const updateEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        const { kategori, detail_kejadian } = req.body;

        const updatedEmergency = await prisma.emergency.update({
            where: { id },
            data: { kategori, detail_kejadian }
        });

        res.status(200).json({ message: "Success", data: updatedEmergency });
        
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const deleteEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.emergency.delete({ where: { id } });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// Optional: Backend Subscription untuk Additional Processing
const initEmergencySubscription = () => {
    const channel = supabase
        .channel('emergency_backend')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public', 
            table: 'emergency'
        }, async (payload) => {
            try {
                console.log('Emergency baru detected:', payload.new);
                
                // Additional processing bisa ditambahkan di sini:
                // 1. Send email notification
                // 2. Push notification ke mobile
                // 3. Log ke external service
                // 4. Send WhatsApp/Telegram alert
                
                // Contoh: Update status menjadi 'notified'
                // await prisma.emergency.update({
                //     where: { id: payload.new.id },
                //     data: { status: 'notified' }
                // });
                
            } catch (error) {
                console.error('Error processing emergency:', error);
            }
        })
        .subscribe();
        
    console.log('Emergency subscription initialized');
    return channel;
};

const getEmergencyById = async (req, res) => {
    try {
        const { id } = req.params;
        const emergency = await prisma.emergency.findUnique({ where: { id }, include: {user: true} });
        res.status(200).json({ message: "Success", data: emergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


module.exports = {getEmergency, getEmergencyAlert, initEmergencySubscription, updateEmergency, deleteEmergency, getEmergencyById};