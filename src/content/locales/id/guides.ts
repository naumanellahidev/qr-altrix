import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Cara Membuat Kode QR Gratis – Panduan Langkah demi Langkah',
    description: 'Pelajari cara membuat kode QR dalam waktu kurang dari semenit: pilih jenis, tambahkan isi, rancang, uji, lalu cetak. Gratis, tanpa daftar untuk kode statis.',
    h1: 'Cara membuat kode QR',
    name: 'Cara membuat kode QR',
    intro: 'Membuat kode QR butuh waktu kurang dari semenit. Membuat kode yang selalu terbaca, terlihat bagus, dan masih berfungsi setahun lagi butuh beberapa keputusan tambahan. Panduan ini membahas keduanya.',
    sections: [
      {
        heading: '1. Tentukan: statis atau dinamis',
        body: [
          'Kode statis menyimpan isi di dalam pola. Berfungsi selamanya dan offline, tetapi tidak bisa diubah atau dilacak. Gunakan untuk Wi-Fi, kartu kontak, dan tautan yang tidak akan pernah berubah.',
          'Kode dinamis menyimpan tautan pendek yang Anda kendalikan. Anda bisa mengubah tujuan setelah dicetak dan melihat setiap pemindaian. Gunakan untuk apa pun yang dicetak banyak atau dipakai untuk pemasaran.',
        ],
      },
      {
        heading: '2. Pilih jenisnya',
        body: [
          'Pilih apa yang terjadi saat dipindai: membuka situs web, terhubung ke Wi-Fi, menyimpan kontak, menampilkan menu, memutar video. Jenis yang tepat membuat orang mendapat persis yang mereka harapkan.',
        ],
      },
      {
        heading: '3. Tambahkan isi',
        body: [
          'Masukkan tautan, detail jaringan, atau teks. Buat singkat: isi lebih sedikit berarti pola lebih sederhana yang lebih cepat dipindai. Pada kode dinamis, pola tetap sederhana apa pun tujuannya.',
        ],
      },
      {
        heading: '4. Rancang',
        body: [
          'Pilih warna, gaya pola, bentuk sudut, logo, dan bingkai dengan ajakan bertindak seperti “Pindai untuk menu”. Buat kode gelap di atas latar terang dengan kontras kuat.',
          'Perhatikan skor keamanan pindai: skor ini memperingatkan kontras rendah, logo terlalu besar, dan margin kurang sebelum Anda mencetak.',
        ],
      },
      {
        heading: '5. Uji dan cetak',
        body: [
          'Pindai kode dengan minimal dua ponsel, satu iPhone dan satu Android, dari jarak yang akan dipakai orang. Unduh SVG atau PDF untuk cetak agar tetap tajam di ukuran apa pun.',
        ],
      },
    ],
    faqs: [
      { q: 'Apakah membuat kode QR gratis?', a: 'Ya. Di QR ALTRIX semua fitur gratis, termasuk kode dinamis dan analitik.' },
      { q: 'Apakah perlu akun?', a: 'Tidak untuk kode statis. Kode dinamis memerlukan akun gratis agar bisa diubah dan dilacak.' },
      { q: 'Format file apa yang sebaiknya diunduh?', a: 'PNG untuk layar dan dokumen; SVG, PDF, atau EPS untuk percetakan profesional.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Kode QR Statis vs Dinamis – Perbedaan dan Kapan Memakainya',
    description: 'Kode QR statis atau dinamis? Pelajari cara kerja masing-masing, mana yang bisa diubah dan dilacak, mana yang kedaluwarsa, dan mana yang cocok untuk menu, kemasan, Wi-Fi, dan iklan.',
    h1: 'Kode QR statis vs dinamis',
    name: 'Statis vs dinamis',
    intro: 'Setiap kode QR bersifat statis atau dinamis. Perbedaannya menentukan apakah Anda bisa mengubahnya setelah dicetak, apakah bisa menghitung pemindaian, dan — di banyak platform — apakah kode berhenti saat uji coba berakhir.',
    sections: [
      {
        heading: 'Cara kerja kode QR statis',
        body: [
          'Isinya — tautan, kata sandi Wi-Fi, kontak — dienkode langsung di kotak hitam putih. Tidak ada yang dicari saat dipindai, jadi berfungsi offline dan selamanya.',
          'Kekurangannya: Anda tidak bisa mengubahnya dan tidak ada yang bisa menghitung pemindaiannya. Salah ketik berarti cetak ulang.',
        ],
      },
      {
        heading: 'Cara kerja kode QR dinamis',
        body: [
          'Polanya berisi tautan pendek. Saat dipindai, server tautan mencatat pemindaian dan mengalihkan ke tujuan yang Anda tetapkan. Ubah tujuannya dan semua salinan cetak ikut berubah.',
          'Karena tautannya pendek, pola tetap sederhana dan mudah dipindai meski dicetak kecil.',
        ],
      },
      {
        heading: 'Apakah kode QR dinamis kedaluwarsa?',
        body: [
          'Seharusnya tidak, tetapi di banyak layanan iya: paket gratis sering membatasi Anda pada beberapa kode dinamis atau menonaktifkannya setelah uji coba, dan kode cetak berhenti berfungsi.',
          'Di QR ALTRIX kode dinamis gratis dan tanpa batas, serta tetap berfungsi sampai Anda menjeda atau menghapusnya.',
        ],
      },
      {
        heading: 'Mana yang sebaiknya dipakai?',
        body: [
          'Statis: Wi-Fi, kontak vCard, teks biasa, dan tautan yang Anda yakin tidak akan berubah.',
          'Dinamis: menu, kemasan, poster, kartu nama, kampanye — apa pun yang dicetak banyak atau ingin diukur hasilnya.',
        ],
      },
    ],
    faqs: [
      { q: 'Bisakah mengubah kode statis menjadi dinamis?', a: 'Tidak, polanya berbeda. Buat kode dinamis dan ganti yang dicetak.' },
      { q: 'Apakah kode dinamis lebih lambat dipindai?', a: 'Pengalihan menambah sepersekian detik; pola yang lebih sederhana sering membuatnya lebih cepat terbaca.' },
      { q: 'Apakah kode dinamis mengumpulkan data pribadi?', a: 'Di QR ALTRIX kode ini mencatat negara, perangkat, dan detail serupa, dengan alamat IP disimpan hanya sebagai hash ber-salt.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Ukuran Kode QR untuk Cetak – Ukuran Minimum dan Jarak Pindai',
    description: 'Seberapa besar kode QR seharusnya? Ukuran minimum untuk kartu nama, brosur, poster, dan papan, aturan 10:1, serta tips zona tenang dan resolusi.',
    h1: 'Ukuran kode QR untuk cetak',
    name: 'Panduan ukuran cetak',
    intro: 'Kode QR yang terlalu kecil adalah penyebab paling umum gagalnya hasil cetak. Ukuran yang tepat bergantung pada jarak pemindaian dan banyaknya data dalam kode.',
    sections: [
      {
        heading: 'Aturan 10:1',
        body: [
          'Patokan yang baik: kode minimal sepersepuluh dari jarak pindai. Dipindai dari 30 cm, buat 3 cm; dari 2 meter, buat 20 cm.',
        ],
      },
      {
        heading: 'Ukuran minimum per media',
        body: [
          'Kartu nama dan label: minimal 2 × 2 cm.',
          'Brosur, menu, dan penanda meja: 3–4 cm.',
          'Poster yang dilihat dari beberapa meter: 10–20 cm.',
          'Spanduk dan papan gedung: sesuaikan dengan jarak memakai aturan 10:1.',
        ],
      },
      {
        heading: 'Jaga zona tenang',
        body: [
          'Sisakan ruang kosong di sekitar kode selebar sekitar empat modul (kotak kecil). Teks atau grafis yang menempel pada kode adalah penyebab umum gagal pindai.',
        ],
      },
      {
        heading: 'Gunakan file vektor',
        body: [
          'Unduh SVG, PDF, atau EPS untuk cetak. File vektor tetap tajam sempurna di ukuran apa pun, sedangkan PNG yang diperbesar bisa buram.',
          'Kode dinamis memiliki lebih sedikit modul, sehingga tetap terbaca di ukuran kecil yang tidak bisa dicapai tautan statis panjang.',
        ],
      },
    ],
    faqs: [
      { q: 'Berapa ukuran kode QR terkecil yang berfungsi?', a: 'Sekitar 2 × 2 cm untuk pemindaian dekat, jika datanya sedikit dan dicetak tajam.' },
      { q: 'Apakah logo mengubah ukuran minimum?', a: 'Logo menutupi sebagian modul; jaga di bawah seperempat kode dan naikkan koreksi kesalahan ke Q atau H.' },
      { q: 'Berapa resolusi PNG yang dibutuhkan?', a: 'Untuk cetak, utamakan vektor. Jika harus PNG, ekspor minimal 1000 px untuk cetakan kecil dan lebih untuk yang besar.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Praktik Terbaik Desain Kode QR – Warna, Logo, dan Bingkai',
    description: 'Rancang kode QR yang menarik dan tetap terbaca: aturan kontras, ukuran logo, warna dan gradien, bingkai dan ajakan bertindak, serta cara menguji sebelum mencetak.',
    h1: 'Praktik terbaik desain kode QR',
    name: 'Praktik terbaik desain',
    intro: 'Kode QR bermerek lebih sering dipindai daripada kode polos — selama ponsel masih bisa membacanya. Aturan berikut menjaga desain Anda tetap di sisi yang aman.',
    sections: [
      {
        heading: 'Utamakan kontras',
        body: [
          'Pemindai butuh pola gelap di atas latar terang. Targetkan rasio kontras minimal 4:1, dan hindari kode terbalik (terang di atas gelap) kecuali sudah diuji di banyak ponsel.',
        ],
      },
      {
        heading: 'Logo: kecil dan di tengah',
        body: [
          'Logo menutupi sebagian kode. Koreksi kesalahan QR bisa memulihkan bagian yang hilang, tetapi ada batasnya: jaga logo di bawah sekitar 25% kode dan gunakan tingkat koreksi Q atau H.',
        ],
      },
      {
        heading: 'Warna dan gradien',
        body: [
          'Warna merek aman jika cukup gelap. Gradien boleh jika kedua ujungnya gelap. Pola pastel, kuning, dan abu-abu muda paling sering gagal.',
        ],
      },
      {
        heading: 'Tambahkan bingkai dan ajakan bertindak',
        body: [
          'Beri tahu orang alasan memindai: “Pindai untuk menu”, “Dapatkan diskon 10%”, “Sambung ke Wi-Fi kami”. Kode dengan ajakan yang jelas jauh lebih sering dipindai daripada kode polos.',
        ],
      },
      {
        heading: 'Uji sebelum mencetak',
        body: [
          'Gunakan cek keamanan pindai, lalu pindai cetakan uji dengan iPhone dan Android pada ukuran dan jarak sebenarnya.',
        ],
      },
    ],
    faqs: [
      { q: 'Bisakah kode QR berwarna apa saja?', a: 'Bisa, selama polanya jelas lebih gelap dari latarnya.' },
      { q: 'Apakah pola membulat atau titik bisa dipindai?', a: 'Bisa, ponsel modern membacanya dengan baik; jaga kotak sudut tetap jelas.' },
      { q: 'Apa itu skor keamanan pindai?', a: 'Pemeriksaan di editor yang memperingatkan kontras rendah, logo terlalu besar, dan risiko lain sebelum Anda mengunduh.' },
    ],
  },
};
