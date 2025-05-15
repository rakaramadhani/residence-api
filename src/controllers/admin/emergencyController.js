const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get Emergency
const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({});
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get Emergency Alert
const getEmergencyAlert = async (req, res) => {
    try {
        const emergencyAlert = await prisma.emergency.findFirst({
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: true  
            }
        });
        res.status(200).json({ 
            message: "Success", 
            data: emergencyAlert 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

module.exports = {getEmergency, getEmergencyAlert};