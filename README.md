# Tune Street — Drive Your Style

Rekonstruksi proyek Lovable "Tune Street" (konsep brand otomotif untuk proyek sekolah) sebagai situs statis — tanpa build step.

## Cara membuka di VS Code
1. `File → Open Folder…` → pilih folder `tune-street`
2. Install ekstensi **Live Server** (disarankan otomatis)
3. Klik kanan `index.html` → **Open with Live Server** (atau `npm start`)

## Struktur
- `index.html`, `about.html` — placeholder (isi aslinya tidak ada di snapshot)
- `catalog.html` — katalog 12 part + Virtual Garage (mode foto) + keranjang demo
- `css/styles.css` — CSS hasil kompilasi dari proyek Lovable
- `js/` — logika filter, keranjang, dan konfigurator
- `assets/` — foto part, foto R34 + mask warna, velg

## Belum ikut (tidak ada di snapshot)
- Mode **3D (Three.js / CarScene3D)** — kodenya tidak tersimpan di file .mhtml
- Halaman Home & Company asli
- Foto Supra MK4 dan RX-7 FD (hanya R34 yang punya foto)
- Efek visual coilover/kap karbon/knalpot/kaliper/tint di mode foto (hanya memengaruhi harga & ringkasan)

Harga part adalah perkiraan; foto dibuat AI, bukan foto resmi produk.
