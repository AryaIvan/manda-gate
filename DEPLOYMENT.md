# MANDA Gate Deployment Checklist

## Environment

Backend:

```bash
cd backend
cp .env.example .env
```

Isi `DATABASE_URL`, `JWT_SECRET`, dan `FRONTEND_URL` sesuai server production.

Frontend:

```bash
cd frontend
cp .env.example .env.local
```

Isi `NEXT_PUBLIC_API_URL` ke alamat backend production, contoh:

```bash
NEXT_PUBLIC_API_URL=https://api.manda.sch.id/api
```

## Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run build
npm run start
```

Pastikan endpoint ini berhasil:

```bash
curl https://api-domain-anda/api/health
```

## Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run start
```

## Database

Sebelum production:

```bash
cd backend
npx prisma migrate deploy
```

Jika butuh data awal:

```bash
npm run seed
```

## CORS

Pastikan backend `.env`:

```bash
FRONTEND_URL="https://domain-frontend-anda"
```

Jika frontend memakai Vercel, gunakan domain Vercel production, bukan localhost.

## Final Smoke Test

1. Buka frontend.
2. Login dengan akun admin.
3. Buka Data Kelas, Siswa, Guru, Mapel, Jadwal, Absensi, Nilai.
4. Buka Surat Izin, Pengumuman, Prestasi, Laporan, Pengaturan.
5. Pastikan tidak ada pesan `Gagal memuat`.

## Catatan

Modul Tugas/Assignments belum bisa dibuat real-time karena backend belum memiliki model dan route khusus tugas.
