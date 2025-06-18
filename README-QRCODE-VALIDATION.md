# QR Code Validation untuk Surat Perizinan Fasilitas

## Fitur Baru

1. **QR Code di PDF Surat**: Setiap surat perizinan yang dihasilkan akan memiliki QR code untuk validasi
2. **Halaman Validasi Frontend**: Halaman web khusus untuk validasi surat melalui scan QR code
3. **API Endpoint Validasi**: Backend endpoint yang mengembalikan data surat dalam format JSON

## Perubahan yang Dilakukan

### 1. Backend Changes

#### `src/utils/pdfGenerator.js`
- Menambahkan library `qrcode` untuk generate QR code
- Mengubah nama perumahan menjadi "PERUMAHAN CHERRY FIELD"
- Mengubah alamat menjadi "Jl. Ciganitri, Desa Cipagalo, Kecamatan Bojongsoang, Kabupaten Bandung, Jawa Barat 40287"
- Menambahkan QR code di bagian kiri bawah surat
- QR code berisi URL ke halaman validasi frontend

#### `src/controllers/user/suratController.js`
- Menambahkan function `validateSurat()` yang mengembalikan JSON data
- Endpoint untuk validasi surat via API

#### `src/routes/penghuni/penghuniRoutes.js`
- Menambahkan route `GET /validate-surat/:id` (public endpoint, tanpa authentication)

### 2. Frontend Changes

#### `src/app/validate-surat/[id]/page.tsx`
- Halaman Next.js untuk validasi surat
- Menggunakan TypeScript dan Tailwind CSS
- Responsive design dengan loading state dan error handling
- Menampilkan status surat dengan warna yang berbeda (approved/rejected/pending)

## Environment Variables

Tambahkan environment variables berikut:

### Backend (.env)
```env
# URL frontend untuk QR code
FRONTEND_URL=http://localhost:3001
# atau untuk production:
# FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)
```env
# URL backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
# atau untuk production:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Cara Kerja

1. **Generate PDF**: Ketika surat disetujui dan PDF dibuat, sistem akan:
   - Generate QR code dengan URL: `{FRONTEND_URL}/validate-surat/{surat_id}`
   - Embed QR code ke dalam PDF surat

2. **Scan QR Code**: User men-scan QR code dengan kamera/aplikasi:
   - QR code mengarahkan ke halaman frontend
   - Halaman frontend memanggil API backend untuk validasi
   - Menampilkan informasi surat dan status validasi

3. **Validasi**: Sistem akan menampilkan:
   - Status surat (approved/rejected/pending)
   - Detail pemohon dan surat
   - Waktu validasi
   - Informasi perumahan

## API Endpoint

### GET /api/penghuni/validate-surat/:id

**Response Success:**
```json
{
  "success": true,
  "message": "Data surat berhasil ditemukan",
  "data": {
    "id": "surat_id",
    "nama": "Nama Pemohon",
    "nik": "1234567890123456",
    "alamat": "Blok A No. 12",
    "fasilitas": "Aula",
    "keperluan": "Acara keluarga",
    "tanggalMulai": "2024-01-15T10:00:00.000Z",
    "tanggalSelesai": "2024-01-15T22:00:00.000Z",
    "status": "approved",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-12T09:00:00.000Z",
    "deskripsi": "Deskripsi tambahan"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Surat tidak ditemukan",
  "data": null
}
```

## Testing

1. Buat surat perizinan melalui aplikasi
2. Admin approve surat tersebut
3. Download PDF dan scan QR code
4. Verifikasi halaman validasi menampilkan data yang benar

## Security Notes

- Endpoint validasi adalah public (tidak memerlukan authentication)
- Hanya mengembalikan data yang diperlukan untuk validasi
- Tidak ada sensitive information yang diexpose
- ID surat bersifat UUID yang sulit ditebak 