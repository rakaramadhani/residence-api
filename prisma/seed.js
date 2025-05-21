const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seeder() {
    await seedUsers();
    await seedClusters();
}

async function seedUsers() {
    // Cek jika akun admin sudah ada
    const admin1Check = await prisma.user.findUnique({
        where: { email: "rakaramadhani2001@gmail.com"},
    });
    
    const admin2Check = await prisma.user.findUnique({
        where: { email: "perumahanxyz@gmail.com"},
    });

    // Cek jika akun penghuni sudah ada
    const user1Check = await prisma.user.findUnique({
        where: { email: "dickyfauzieseptiana@gmail.com"},
    });
    
    const user2Check = await prisma.user.findUnique({
        where: { email: "ahmadauli37@gmail.com"},
    });

    // Hash password
    const adminHashedPassword = await bcrypt.hash("admin1234", 10);
    const penghuniHashedPassword = await bcrypt.hash("user1234", 10);
    
    // Buat akun Admin 1 jika belum ada
    if (!admin1Check) {
        await prisma.user.create({
            data: {
                username: "Admin Raka",
                email: "rakaramadhani2001@gmail.com",
                password: adminHashedPassword,
                role: "admin",
                isActive: true,
            },
        });
        console.log("✅ Admin 1 berhasil dibuat!");
    } else {
        console.log("⚠️ Admin 1 sudah ada, tidak perlu membuat lagi.");
    }
    
    // Buat akun Admin 2 jika belum ada
    if (!admin2Check) {
        await prisma.user.create({
            data: {
                username: "Admin Perumahan",
                email: "perumahanxyz@gmail.com",
                password: adminHashedPassword,
                role: "admin",
                isActive: true,
            },
        });
        console.log("✅ Admin 2 berhasil dibuat!");
    } else {
        console.log("⚠️ Admin 2 sudah ada, tidak perlu membuat lagi.");
    }
    
    // Buat akun Penghuni 1 jika belum ada
    if (!user1Check) {
        await prisma.user.create({
            data: {
                username: "Dicky Fauzie",
                email: "dickyfauzieseptiana@gmail.com",
                password: penghuniHashedPassword,
                role: "penghuni",
                isActive: true,
            },
        });
        console.log("✅ Penghuni 1 berhasil dibuat!");
    } else {
        console.log("⚠️ Penghuni 1 sudah ada, tidak perlu membuat lagi.");
    }
    
    // Buat akun Penghuni 2 jika belum ada
    if (!user2Check) {
        await prisma.user.create({
            data: {
                username: "Ahmad Auli",
                email: "ahmadauli37@gmail.com",
                password: penghuniHashedPassword,
                role: "penghuni",
                isActive: true,
            },
        });
        console.log("✅ Penghuni 2 berhasil dibuat!");
    } else {
        console.log("⚠️ Penghuni 2 sudah ada, tidak perlu membuat lagi.");
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


