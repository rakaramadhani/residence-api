import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Ngecek Admin
    const adminCheck = await prisma.user.findUnique({
        where: { email: "admin@example.com" },
    });

    if (!adminCheck) {
        // Hash password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Buat akun admin
        await prisma.user.create({
        data: {
            nama: "Admin Perumahan",
            email: "admin@example.com",
            password: hashedPassword,
            role: "ADMIN",
        },
        });

        console.log("✅ Admin berhasil dibuat!");
    } else {
        console.log("⚠️ Admin sudah ada, tidak perlu membuat lagi.");
    }
    }

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
