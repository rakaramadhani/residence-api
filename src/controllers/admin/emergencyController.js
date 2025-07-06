const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ========== OPTIMIZED: Real-time Emergency Broadcast ==========
const broadcastEmergencyAlert = async (emergencyData) => {
    try {
        console.log('🚨 Broadcasting emergency alert to frontend...');
        console.log('🚨 Emergency data:', emergencyData);
        
        // Menggunakan channel name yang sama dengan frontend: 'all_changes'
        const broadcast = await supabase.channel('all_changes')
            .send({
                type: 'broadcast',
                event: 'new_emergency',
                payload: {
                    id: emergencyData.id,
                    userId: emergencyData.userId,
                    status: emergencyData.status,
                    created_at: emergencyData.created_at,
                    timestamp: new Date().toISOString(),
                    action: 'emergency_created'
                }
            });
            
        console.log('✅ Emergency broadcast sent:', broadcast);
        return broadcast;
    } catch (error) {
        console.error('❌ Error broadcasting emergency alert:', error);
        throw error;
    }
};

// ========== EXISTING ENDPOINT: GET /admin/emergency ==========
const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({
            include: {user: true},
            orderBy: {
                created_at: 'desc'
            }
        });
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ========== EXISTING ENDPOINT: GET /admin/emergency/alert ==========
// Get Emergency Alert untuk Modal Warning - sesuai dengan format yang diharapkan frontend
const getEmergencyAlert = async (req, res) => {
    try {
        console.log('🔍 Getting emergency alert for admin...');
        
        const emergencyAlert = await prisma.emergency.findFirst({
            where: {
                status: 'pending' // Filter hanya yang pending
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                user: true
            }
        });
        
        console.log('📦 Emergency alert found:', !!emergencyAlert);
        
        // Format response sesuai dengan yang diharapkan frontend
        res.status(200).json({ 
            message: "Success", 
            data: emergencyAlert,
            hasAlert: !!emergencyAlert
        });
    } catch (error) {
        console.error('💥 Error fetching emergency alert:', error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// ========== EXISTING ENDPOINT: PUT /admin/emergency/:id ==========
const updateEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        const { kategori, detail_kejadian, status } = req.body;

        const updatedEmergency = await prisma.emergency.update({
            where: { id },
            data: { kategori, detail_kejadian, status, updatedAt: new Date() },
            include: { user: true }
        });

        res.status(200).json({ message: "Success", data: updatedEmergency });
        
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// ========== EXISTING ENDPOINT: PUT /admin/emergency/:id/handle ==========
const markEmergencyAsHandled = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah emergency dengan id tersebut ada
        const existingEmergency = await prisma.emergency.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!existingEmergency) {
            return res.status(404).json({ 
                message: "Emergency tidak ditemukan" 
            });
        }

        // Update status menjadi "ditindaklanjuti"
        const updatedEmergency = await prisma.emergency.update({
            where: { id },
            data: { 
                status: "ditindaklanjuti",
                updatedAt: new Date()
            },
            include: { user: true }
        });

        res.status(200).json({ 
            message: "Status emergency berhasil diubah menjadi ditindaklanjuti", 
            data: updatedEmergency 
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
}

// ========== EXISTING ENDPOINT: DELETE /admin/emergency/:id ==========
const deleteEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.emergency.delete({ where: { id } });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// ========== EXISTING ENDPOINT: GET /admin/emergency/:id ==========
const getEmergencyById = async (req, res) => {
    try {
        const { id } = req.params;
        const emergency = await prisma.emergency.findUnique({ 
            where: { id }, 
            include: {user: true} 
        });
        
        if (!emergency) {
            return res.status(404).json({ message: "Emergency tidak ditemukan" });
        }
        
        res.status(200).json({ message: "Success", data: emergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// ========== TAMBAHAN: CREATE EMERGENCY ENDPOINT (untuk user app) ==========
// Create Emergency - Endpoint untuk user membuat emergency dengan real-time broadcast
const createEmergency = async (req, res) => {
    try {
        const { userId, latitude, longitude, kategori, detail_kejadian } = req.body;

        // Validasi input
        if (!userId) {
            return res.status(400).json({ 
                message: "User ID diperlukan" 
            });
        }

        console.log('🚨 Creating new emergency for user:', userId);

        // Buat emergency baru dengan include user data langsung
        const newEmergency = await prisma.emergency.create({
            data: {
                userId,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                kategori: kategori || null,
                detail_kejadian: detail_kejadian || null,
                status: 'pending',
                created_at: new Date(),
                updatedAt: new Date()
            },
            include: {
                user: true // Include user data untuk broadcast
            }
        });

        console.log('🚨 New emergency created:', newEmergency.id);

        // Immediately broadcast to frontend admin
        try {
            await broadcastEmergencyAlert(newEmergency);
            console.log('✅ Emergency broadcast sent successfully');
        } catch (broadcastError) {
            console.error('❌ Failed to send emergency broadcast:', broadcastError);
            // Don't fail the operation if broadcast fails
            // Emergency is still created in database
        }

        // Return response immediately after broadcast
        res.status(201).json({ 
            message: "Emergency berhasil dibuat dan alert dikirim", 
            data: newEmergency 
        });
        
    } catch (error) {
        console.error('💥 Error creating emergency:', error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// ========== OPTIMIZED: Real-time Database Subscription ==========
const initEmergencySubscription = () => {
    console.log('🚨 Initializing emergency subscription...');
    
    const channel = supabase
        .channel('emergency_backend_subscription')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public', 
            table: 'Emergency'
        }, async (payload) => {
            try {
                console.log('🔥 New emergency detected via postgres changes:', payload.new);
                
                // Fetch full emergency with user data (in case direct create missed)
                const fullEmergency = await prisma.emergency.findUnique({
                    where: { id: payload.new.id },
                    include: { user: true }
                });
                
                if (fullEmergency) {
                    console.log('🔄 Broadcasting emergency from postgres trigger...');
                    // This serves as backup if direct broadcast in createEmergency fails
                    await broadcastEmergencyAlert(fullEmergency);
                }
                
            } catch (error) {
                console.error('❌ Error processing postgres emergency change:', error);
            }
        })
        .subscribe((status) => {
            console.log('📡 Emergency postgres subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✅ Emergency postgres subscription active');
            }
        });
        
    console.log('✅ Emergency subscription initialized');
    return channel;
};

// ========== EXPORTS ==========
module.exports = {
    getEmergency,                    // GET /admin/emergency
    getEmergencyAlert,               // GET /admin/emergency/alert  
    updateEmergency,                 // PUT /admin/emergency/:id
    markEmergencyAsHandled,          // PUT /admin/emergency/:id/handle
    deleteEmergency,                 // DELETE /admin/emergency/:id
    getEmergencyById,                // GET /admin/emergency/:id
    createEmergency,                 // POST /user/emergency/create (untuk user app)
    broadcastEmergencyAlert,         // Utility function
    initEmergencySubscription        // Initialize function
}; 