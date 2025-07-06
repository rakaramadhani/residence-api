const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// ✅ PERBAIKAN: Konfigurasi Supabase yang benar
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Gunakan SERVICE_ROLE_KEY untuk realtime
);
const prisma = new PrismaClient();

const createEmergency = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { latitude, longitude } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Buat emergency (status default 'pending' sudah ada di database)
    const newEmergency = await prisma.emergency.create({
      data: {
        userId: user_id,
        latitude,
        longitude,
      },
      include: {
        user: true
      }
    });

    // ✅ PERBAIKAN: Broadcast dengan timeout untuk mencegah hanging
    try {
      const channel = supabase.channel("all_changes");
      
      // Subscribe ke channel dengan timeout
      await Promise.race([
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Supabase subscription timeout'));
          }, 5000); // 5 detik timeout
          
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              resolve(true);
            }
          });
        }),
        // Fallback jika subscription gagal
        new Promise((resolve) => {
          setTimeout(() => resolve(false), 3000);
        })
      ]);

      // Kirim broadcast dengan timeout
      const broadcastPromise = channel.send({
        type: "broadcast",
        event: "new_emergency", 
        payload: newEmergency
      });

      // Timeout untuk broadcast
      const response = await Promise.race([
        broadcastPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Broadcast timeout')), 3000)
        )
      ]);

      console.log("Supabase Event Sent:", response);
      
      // Cleanup channel
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.log("Channel cleanup error:", e.message);
        }
      }, 1000);

    } catch (broadcastError) {
      console.error("Broadcast error:", broadcastError);
      // Jangan fail request jika broadcast gagal - data sudah tersimpan
    }

    return res.status(201).json({
      message: "Emergency reported successfully",
      data: newEmergency,
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({ message: error.message });
  }
};

const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({});
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ TAMBAHAN: Endpoint test untuk verifikasi Supabase realtime
const testSupabaseRealtime = async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Test environment variables
        const envTest = {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            URL_LENGTH: process.env.SUPABASE_URL?.length || 0,
            KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
        };

        // Test channel subscription
        let subscriptionTest = { status: 'pending', error: null, duration: 0 };
        
        try {
            const testChannel = supabase.channel("test_channel");
            
            const subscriptionResult = await Promise.race([
                new Promise((resolve) => {
                    testChannel.subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            resolve({ status: 'success', subscribed: true });
                        }
                    });
                }),
                new Promise((resolve) => {
                    setTimeout(() => resolve({ status: 'timeout', subscribed: false }), 5000);
                })
            ]);
            
            subscriptionTest = {
                ...subscriptionResult,
                duration: Date.now() - startTime
            };
            
            // Cleanup
            setTimeout(() => {
                try {
                    supabase.removeChannel(testChannel);
                } catch (e) {
                    console.log("Test cleanup error:", e.message);
                }
            }, 1000);
            
        } catch (error) {
            subscriptionTest = {
                status: 'error',
                error: error.message,
                duration: Date.now() - startTime
            };
        }

        res.status(200).json({
            message: "Supabase Realtime Test Results",
            environment: envTest,
            subscription: subscriptionTest,
            totalDuration: Date.now() - startTime,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: "Test failed", 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = { createEmergency, getEmergency, testSupabaseRealtime };
