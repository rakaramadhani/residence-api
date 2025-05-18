const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get semua cluster
const getCluster = async (req, res) => {
  try {
    const clusters = await prisma.cluster.findMany({
      orderBy: { nama_cluster: 'asc' }
    });
    res.status(200).json({ message: "Success", data: clusters });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Create cluster baru
const createCluster = async (req, res) => {
  try {
    const { nama_cluster, nominal_tagihan } = req.body;
    
    if (!nama_cluster || !nominal_tagihan) {
      return res.status(400).json({ message: "Nama cluster dan nominal tagihan wajib diisi" });
    }
    
    // Cek apakah cluster sudah ada
    const existingCluster = await prisma.cluster.findUnique({
      where: { nama_cluster }
    });
    
    if (existingCluster) {
      return res.status(400).json({ message: "Nama cluster sudah digunakan" });
    }
    
    const cluster = await prisma.cluster.create({
      data: {
        nama_cluster,
        nominal_tagihan: parseInt(nominal_tagihan, 10)
      }
    });
    
    res.status(201).json({ message: "Cluster berhasil dibuat", data: cluster });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update cluster
const updateCluster = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nama_cluster, nominal_tagihan } = req.body;
    
    if (!nama_cluster && !nominal_tagihan) {
      return res.status(400).json({ message: "Minimal satu field harus diubah" });
    }
    
    const updateData = {};
    if (nama_cluster) updateData.nama_cluster = nama_cluster;
    if (nominal_tagihan) updateData.nominal_tagihan = parseInt(nominal_tagihan, 10);
    
    const cluster = await prisma.cluster.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({ message: "Cluster berhasil diupdate", data: cluster });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete cluster
const deleteCluster = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Cek apakah cluster masih digunakan oleh user
    const usersWithCluster = await prisma.user.count({
      where: { clusterId: id }
    });
    
    if (usersWithCluster > 0) {
      return res.status(400).json({ 
        message: "Cluster tidak dapat dihapus karena masih digunakan oleh penghuni" 
      });
    }
    
    await prisma.cluster.delete({
      where: { id }
    });
    
    res.status(200).json({ message: "Cluster berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  getCluster,
  createCluster,
  updateCluster,
  deleteCluster
};
