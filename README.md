# CLI VAULT 🗂️

Web app buat nyimpen konfigurasi CLI Cisco Packet Tracer + screenshot bukti. Logo & gaya visualnya terinspirasi tampilan terminal/CMD.

Ada **2 mode penyimpanan** yang bisa di-switch kapan aja lewat menu (☰ Pengaturan):

- 💾 **LOCAL** — data tersimpan di `localStorage` browser kamu sendiri. Gak butuh setup apapun, langsung jalan. Cocok buat coba-coba dulu. Data gak sinkron antar device/browser.
- ☁ **CLOUD** — data tersimpan di **Supabase** (Postgres + Storage, gratis tanpa kartu kredit), sinkron otomatis di semua device.

Default saat pertama dibuka: mode **LOCAL**, jadi kamu bisa langsung coba semua fitur sebelum setup Supabase.

Stack: **React + Vite**, **Supabase**, **GSAP**, desain neubrutalism, full responsif, **PWA installable**.

---

## 1. Jalankan di lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` — langsung bisa dipakai di mode **LOCAL**, tanpa setup apapun.

Mau coba mode **CLOUD**? Lanjut ke langkah 2.

---

## 2. Setup Supabase (buat mode CLOUD, gratis & tanpa kartu kredit, ±5 menit)

### A. Buat project

1. Buka [supabase.com](https://supabase.com) → **Start your project** → daftar/login (bisa pakai GitHub, gak perlu kartu kredit).
2. Klik **New project** → isi nama (misal `cli-vault`), bikin password database (catat aja, gak akan dipakai langsung di app), pilih region terdekat (misal Singapore) → **Create new project**.
3. Tunggu ±1-2 menit sampai project selesai di-provision.

### B. Buat tabel database

1. Di sidebar kiri, klik **SQL Editor** → **New query**.
2. Paste lalu jalankan (klik **Run**) SQL ini:

```sql
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text default '',
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.folders enable row level security;

create policy "Public read folders"
  on public.folders for select
  using (true);

create policy "Public insert folders"
  on public.folders for insert
  with check (true);

create policy "Public update folders"
  on public.folders for update
  using (true);

create policy "Public delete folders"
  on public.folders for delete
  using (true);
```

> Rule di atas masih terbuka (siapapun bisa baca/tulis) supaya cepat jalan. Untuk produksi yang lebih aman, tambahkan Supabase Auth lalu ganti `using (true)` jadi cek `auth.uid()`.

3. Buat **Realtime** aktif untuk tabel ini: sidebar **Database → Replication** → cari tabel `folders` → aktifkan toggle-nya. (Di project baru biasanya sudah otomatis aktif untuk schema `public`.)

### C. Buat Storage bucket buat foto

1. Sidebar **Storage** → **New bucket**.
2. Nama bucket: `images` (harus pas sama, huruf kecil semua).
3. Toggle **Public bucket** → **ON** (biar foto bisa diakses lewat URL langsung).
4. Klik **Create bucket**.
5. Masih di Storage, buka tab **Policies** untuk bucket `images` → **New policy** → pilih template "Custom" lalu jalankan SQL ini di SQL Editor (lebih cepat):

```sql
create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Public upload images"
  on storage.objects for insert
  with check (bucket_id = 'images');

create policy "Public delete images"
  on storage.objects for delete
  using (bucket_id = 'images');
```

### D. Ambil URL & anon key

1. Sidebar **Project Settings** (ikon gear) → **API**.
2. Salin nilai **Project URL** dan **anon public** key.
3. Buat file `.env` di root project (copy dari `.env.example`):

```bash
cp .env.example .env
```

4. Isi `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

5. Restart `npm run dev`. Di aplikasi, buka menu ☰ → pilih mode **☁ CLOUD**. Banner kuning "SUPABASE BELUM DIKONFIGURASI" akan hilang kalau `.env` sudah benar.

---

## 3. Install sebagai App (PWA)

CLI VAULT dibangun sebagai **PWA** — bisa diinstall ke HP/laptop kayak app native, **tanpa file `.apk`** (file itu format khusus Android yang butuh build native terpisah; PWA adalah cara universal untuk semua platform dengan hasil yang sama: ikon di home screen, jalan fullscreen).

- **Otomatis**: kalau browser mendukung (Chrome/Edge Android & desktop), popup **"Install CLI VAULT?"** akan muncul sendiri beberapa detik setelah dibuka — klik **📲 INSTALL**, selesai.
- **Manual**: buka menu **☰ Pengaturan** → scroll ke bagian **APLIKASI** → klik tombol install.
- **Safari iOS**: belum dukung prompt otomatis — ketuk tombol Share → **"Add to Home Screen"**.

File terkait: `public/manifest.json`, `public/sw.js`, ikon di `public/icons/`.

---

## 4. Deploy ke Vercel

1. Push folder project ini ke GitHub.
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo tersebut.
3. Vercel otomatis mendeteksi Vite. Pastikan:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Di tab **Environment Variables**, masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (sama seperti isi `.env`). Kalau cuma mau pakai mode LOCAL, langkah ini bisa di-skip.
5. Klik **Deploy**. Selesai.

> File `vercel.json` sudah disiapkan supaya routing SPA-nya jalan dengan benar.

---

## Struktur Folder

```
cli-vault/
├─ index.html
├─ vite.config.js
├─ vercel.json
├─ .env.example
├─ public/
│  ├─ manifest.json          # konfigurasi PWA
│  ├─ sw.js                  # service worker (cache + offline)
│  ├─ favicon.png
│  └─ icons/                 # logo CMD/terminal, berbagai ukuran
├─ src/
│  ├─ main.jsx                # entry point React + register service worker
│  ├─ App.jsx                 # komponen utama, menyatukan semua state
│  ├─ lib/
│  │  ├─ supabase.js          # inisialisasi Supabase client (baca dari .env)
│  │  ├─ cloudBackend.js      # CRUD ke Supabase (mode CLOUD)
│  │  ├─ localBackend.js      # CRUD ke localStorage (mode LOCAL)
│  │  ├─ backends.js          # pemilih backend sesuai mode aktif
│  │  └─ modeStore.js         # state mode (local/cloud) + pub-sub
│  ├─ hooks/
│  │  ├─ useFolders.js        # subscribe data folder sesuai mode
│  │  ├─ useMode.js           # hook mode aktif
│  │  ├─ useInstallPrompt.js  # tangkap event install PWA
│  │  └─ useToast.js          # notifikasi toast
│  ├─ components/
│  │  ├─ Topbar.jsx           # logo, mode pill, tombol tambah, hamburger
│  │  ├─ Hero.jsx
│  │  ├─ Toolbar.jsx          # search + filter + mode switch (desktop)
│  │  ├─ MobileDrawer.jsx     # menu ☰: mode, filter, tambah, install app
│  │  ├─ ModeSwitch.jsx       # pill toggle LOCAL/CLOUD
│  │  ├─ InstallPrompt.jsx    # popup install PWA otomatis
│  │  ├─ Fab.jsx              # tombol + mengambang (mobile)
│  │  ├─ FolderGrid.jsx       # grid + animasi GSAP
│  │  ├─ FolderCard.jsx
│  │  ├─ AddModal.jsx         # form tambah folder + upload foto
│  │  ├─ ViewModal.jsx        # lihat detail, copy kode, hapus
│  │  ├─ Lightbox.jsx
│  │  ├─ Toast.jsx
│  │  └─ SetupBanner.jsx
│  └─ styles/
│     └─ index.css            # semua styling neubrutalism
```

## Cara Kerja Data

- Setiap folder punya field `name`, `code`, `images` (array `{ url, path }`), `createdAt`.
- **Mode LOCAL**: semua data + foto (base64) disimpan langsung di `localStorage` key `clivault_local_folders`.
- **Mode CLOUD**: baris tersimpan di tabel Postgres `folders` (Supabase). Foto disimpan di Supabase Storage bucket `images/{folderId}/{namafile}`, URL publiknya disimpan ke kolom `images`. Pakai Supabase Realtime jadi otomatis sync antar device.
- Pindah mode disimpan di `localStorage` key `clivault_mode`, jadi browser bakal "ingat" mode terakhir yang dipakai.
- Hapus folder di mode CLOUD akan ikut menghapus file-file fotonya dari Storage.

## Navigasi & UI Mobile

- Topbar mobile cuma logo + badge mode + ikon **☰**.
- Tombol bulat kuning **+** (FAB) mengambang di kanan-bawah buat langsung tambah folder.
- Menu **☰ Pengaturan**: ganti mode, filter folder, tambah folder, dan install app.
- Modal (tambah/lihat folder) jadi bottom-sheet biar enak disentuh satu tangan.
- Semua transisi & animasi pakai GSAP (`power3.out`, `back.out`) biar halus, termasuk saat folder muncul/hilang dan modal terbuka.

## Catatan

- Klik tombol **COPY** di kode CLI untuk menyalin ke clipboard.
- Klik ✏️ di detail folder untuk **edit** (ubah nama, kode CLI, hapus/tambah foto) tanpa perlu hapus & buat folder baru.
- Klik foto di detail folder untuk lihat ukuran penuh (lightbox).
- Search & filter (Semua / CLI / Foto) bekerja secara real-time di sisi client.
- Ganti mode LOCAL ⇄ CLOUD tidak memindahkan data secara otomatis — keduanya benar-benar terpisah.
