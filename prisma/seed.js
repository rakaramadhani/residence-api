const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seeder() {
    // Ngecek Admin
    const adminCheck = await prisma.user.findUnique({
        where: { email: "admin@gmail.com"},
    });
    const userCheck = await prisma.user.findUnique({
        where: { email: "user@gmail.com"},
    });

    
    if (!adminCheck && !userCheck) {
        // Hash password
        const adminHashedPassword = await bcrypt.hash("admin123", 10);
        const penghunihashedPassword = await bcrypt.hash("user123", 10);
        // Buat akun admin
        await prisma.user.create({
            data: {
                username: "Admin Raka",
                email: "admin@gmail.com",
                password: adminHashedPassword,
                role: "admin",
            },
        });

        await prisma.user.create({
            data: {
                username: "userRaka",
                email: "user@gmail.com",
                password: penghunihashedPassword,
                role: "penghuni",
            },
        });

        console.log("✅ Admin dan User berhasil dibuat!");
    } else {
        if (adminCheck) {
            console.log("⚠️ Admin sudah ada, tidak perlu membuat lagi.");
        }
        if (userCheck) {
            console.log("⚠️ User sudah ada, tidak perlu membuat lagi.");
        }
    }
}

module.exports=seeder;


