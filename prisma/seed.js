const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seeder() {
    await seedUsers();
    await seedClusters();
}

async function seedUsers() {
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

async function seedClusters() {
    // Data cluster dari gambar
    const clusters = [
        { nama_cluster: 'Calista', nominal_tagihan: 150000 },
        { nama_cluster: 'Calosa', nominal_tagihan: 150000 },
        { nama_cluster: 'Celeste', nominal_tagihan: 150000 },
        { nama_cluster: 'Chaira', nominal_tagihan: 150000 },
        { nama_cluster: 'Cistena', nominal_tagihan: 150000 },
        { nama_cluster: 'Cressida', nominal_tagihan: 150000 },
        { nama_cluster: 'Crista', nominal_tagihan: 150000 },
        { nama_cluster: 'Crystalina', nominal_tagihan: 150000 },
        { nama_cluster: 'Grand Calista', nominal_tagihan: 200000 },
        { nama_cluster: 'Grand Celeste', nominal_tagihan: 200000 },
        { nama_cluster: 'Grand Crystalina', nominal_tagihan: 200000 },
        { nama_cluster: 'Rukan Chrysant', nominal_tagihan: 250000 },
        { nama_cluster: 'Ruko Crystal', nominal_tagihan: 250000 },
        { nama_cluster: 'New Celeste', nominal_tagihan: 150000 }
    ];

    // Hitung jumlah cluster yang sudah ada
    const existingClustersCount = await prisma.cluster.count();

    if (existingClustersCount === 0) {
        // Tambahkan semua cluster jika belum ada data
        for (const cluster of clusters) {
            await prisma.cluster.create({
                data: cluster
            });
        }
        console.log(`✅ ${clusters.length} cluster berhasil ditambahkan!`);
    } else {
        console.log(`⚠️ Data cluster sudah ada, ditemukan ${existingClustersCount} cluster.`);
        
        // Periksa dan tambahkan cluster yang belum ada
        for (const cluster of clusters) {
            const existingCluster = await prisma.cluster.findUnique({
                where: { nama_cluster: cluster.nama_cluster }
            });
            
            if (!existingCluster) {
                await prisma.cluster.create({
                    data: cluster
                });
                console.log(`✅ Cluster ${cluster.nama_cluster} ditambahkan.`);
            }
        }
    }
}

module.exports=seeder;


