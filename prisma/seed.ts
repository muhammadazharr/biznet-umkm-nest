import * as bcrypt from 'bcrypt';
import { PrismaClient, Status, StatusProduk, StatusPendaftar, VisibilitasProduk, StatusToko, StatusUlasan, KategoriEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seeder baru...');
  const saltRounds = 10;

  // 1. Bersihkan database terlebih dahulu untuk menghindari constraint violation
  console.log('Membersihkan data lama di database...');
  await prisma.verificationCode.deleteMany({});
  await prisma.activeToken.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.pemilikToko.deleteMany({});
  await prisma.produkCabang.deleteMany({});
  await prisma.ulasan.deleteMany({});
  await prisma.produkHashtag.deleteMany({});
  await prisma.hashtag.deleteMany({});
  await prisma.produk.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.sosialMedia.deleteMany({});
  await prisma.cabangToko.deleteMany({});
  await prisma.kategoriToko.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.pendaftar.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.toko.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});

  console.log('Database berhasil dibersihkan.');

  // 2. Buat Permissions
  console.log('Membuat permissions...');
  const permissionToCreate = [
    { name: 'kelola_semua_toko' },
    { name: 'kelola_toko' },
    { name: 'kelola_semua_pengguna' },
    { name: 'kelola_pengguna' },
    { name: 'kelola_cabang' },
    { name: 'kelola_semua_pemilik_toko' },
    { name: 'kelola_pemilik_toko' },
    { name: 'kelola_kategori' },
    { name: 'verifikasi_toko' },
    { name: 'kelola_sosial_media' },
    { name: 'kelola_produk' },
  ];

  for (const data of permissionToCreate) {
    await prisma.permission.create({
      data: { name: data.name },
    });
  }

  // 3. Buat Roles dan Hubungkan ke Permissions
  console.log('Membuat roles dan menghubungkannya dengan permissions...');
  const rolesAndPermissions = {
    admin: [
      'kelola_semua_toko',
      'kelola_semua_pengguna',
      'kelola_semua_pemilik_toko',
      'kelola_kategori',
      'verifikasi_toko',
    ],
    client: [
      'kelola_toko',
      'kelola_pengguna',
      'kelola_cabang',
      'kelola_sosial_media',
      'kelola_produk',
    ],
  };

  const roleInstances: Record<string, any> = {};

  for (const roleName in rolesAndPermissions) {
    const role = await prisma.role.create({
      data: { name: roleName },
    });
    roleInstances[roleName] = role;

    const permissionsForRole = rolesAndPermissions[roleName];
    if (permissionsForRole) {
      const permissionsInDb = await prisma.permission.findMany({
        where: { name: { in: permissionsForRole } },
      });

      for (const perm of permissionsInDb) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }

  // 4. Buat User Admin
  console.log('Membuat user admin...');
  const adminPassword = await bcrypt.hash('password', saltRounds);
  const adminUser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'admin@app.id',
      password: adminPassword,
      verifiedAt: new Date(),
    },
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: roleInstances['admin'].id,
    },
  });

  // 5. Buat Kategori Toko dan Kategori Produk
  console.log('Membuat kategori...');
  
  // Kategori Toko
  const tokoCategories = [
    { nama_kategori: 'Makanan & Minuman', tipe: KategoriEnum.toko, icon: 'Utensils' },
    { nama_kategori: 'Kerajinan & Seni', tipe: KategoriEnum.toko, icon: 'Palette' },
    { nama_kategori: 'Fashion & Pakaian', tipe: KategoriEnum.toko, icon: 'Shirt' },
    { nama_kategori: 'Kecantikan & Kesehatan', tipe: KategoriEnum.toko, icon: 'HeartPulse' },
    { nama_kategori: 'Elektronik & Gadget', tipe: KategoriEnum.toko, icon: 'Laptop' },
  ];

  const dbTokoCategories: any[] = [];
  for (const cat of tokoCategories) {
    const dbCat = await prisma.kategori.create({ data: cat });
    dbTokoCategories.push(dbCat);
  }

  // Kategori Produk
  const produkCategories = [
    { nama_kategori: 'Makanan Basah', tipe: KategoriEnum.produk, icon: 'Soup' },
    { nama_kategori: 'Minuman', tipe: KategoriEnum.produk, icon: 'CupSoda' },
    { nama_kategori: 'Camilan', tipe: KategoriEnum.produk, icon: 'Cookie' },
    { nama_kategori: 'Tas & Sepatu', tipe: KategoriEnum.produk, icon: 'ShoppingBag' },
    { nama_kategori: 'Pakaian', tipe: KategoriEnum.produk, icon: 'Footprints' },
    { nama_kategori: 'Kosmetik', tipe: KategoriEnum.produk, icon: 'Sparkles' },
    { nama_kategori: 'Hiasan Dinding', tipe: KategoriEnum.produk, icon: 'Image' },
    { nama_kategori: 'Gadget', tipe: KategoriEnum.produk, icon: 'Smartphone' },
  ];

  const dbProdukCategories: any[] = [];
  for (const cat of produkCategories) {
    const dbCat = await prisma.kategori.create({ data: cat });
    dbProdukCategories.push(dbCat);
  }

  // Helper untuk mencari Kategori berdasarkan nama dan tipe
  const findTokoCat = (name: string) => dbTokoCategories.find(c => c.nama_kategori === name);
  const findProdCat = (name: string) => dbProdukCategories.find(c => c.nama_kategori === name);

  // 6. Buat 5 Toko dengan Pemilik, Cabang, dan Produk
  console.log('Membuat 5 toko beserta produk, pemilik, cabang, faq, dan sosial media...');
  
  const shopTemplates = [
    {
      email: 'client@app.id',
      username: 'Johndoe',
      ownerName: 'John Doe',
      tokoName: 'Dapur Rasa Kota',
      slug: 'dapur-rasa-kota',
      nib: '010801',
      deskripsi: 'Menyajikan makanan dan minuman tradisional khas dengan cita rasa modern dan higienis.',
      nomorHp: '081234567891',
      rating: 4.8,
      categoryToko: 'Makanan & Minuman',
      hasFaqAndSocial: true,
      branches: [
        { nama: 'Pusat Tangerang', tipe: 'primer', alamat: 'Jl. Ahmad Yani No. 12, Tangerang', lat: -6.1782, lng: 106.6321 },
        { nama: 'Cabang BSD', tipe: 'sekunder', alamat: 'Ruko Serpong Boulevard No. 45, Serpong', lat: -6.3024, lng: 106.6715 }
      ],
      products: [
        {
          nama: 'Roti Bakar Premium',
          deskripsi: 'Roti bakar empuk khas buatan rumah dengan isian cokelat lumer dan keju parut melimpah.',
          slug: 'roti-bakar-premium',
          harga: 25000,
          kategori: 'Makanan Basah',
          thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
          hashtags: ['kuliner', 'rotibakar', 'cemilan']
        },
        {
          nama: 'Es Kopi Susu Aren',
          deskripsi: 'Kopi espresso robusta dipadukan dengan susu segar dan gula aren murni pilihan.',
          slug: 'es-kopi-susu-aren',
          harga: 18000,
          kategori: 'Minuman',
          thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
          hashtags: ['kopiaren', 'kopikekinian', 'minumansegar']
        }
      ],
      faqs: [
        { pertanyaan: 'Apakah melayani pesan antar?', jawaban: 'Ya, kami melayani pesan antar gratis untuk radius 3 km dari cabang terdekat dengan minimal pembelian Rp50.000.' },
        { pertanyaan: 'Apakah produk tahan lama?', jawaban: 'Untuk produk makanan basah disarankan langsung dikonsumsi dalam waktu 24 jam.' }
      ],
      socials: [
        { nama: '@dapur.rasakota', url: 'https://instagram.com/dapur.rasakota', tipe: 'instagram' },
        { nama: 'Dapur Rasa Kota Official', url: 'https://dapurrasakota.co.id', tipe: 'website' }
      ]
    },
    {
      email: 'client2@app.id',
      username: 'Janedoe',
      ownerName: 'Jane Doe',
      tokoName: 'Seni Bambu Tangerang',
      slug: 'seni-bambu-tangerang',
      nib: '010802',
      deskripsi: 'Produksi kerajinan tangan berbahan dasar bambu lokal berkualitas tinggi untuk hiasan dan keperluan sehari-hari.',
      nomorHp: '081234567892',
      rating: 4.6,
      categoryToko: 'Kerajinan & Seni',
      hasFaqAndSocial: true,
      branches: [
        { nama: 'Galeri Utama', tipe: 'primer', alamat: 'Jl. Veteran No. 8, Tangerang', lat: -6.1751, lng: 106.6378 },
        { nama: 'Workshop Pinang', tipe: 'sekunder', alamat: 'Jl. KH. Hasyim Ashari No. 100, Pinang', lat: -6.2145, lng: 106.6892 }
      ],
      products: [
        {
          nama: 'Anyaman Bambu Dinding',
          deskripsi: 'Hiasan dinding bambu dengan pola geometris etnik, dilapisi pelindung anti jamur.',
          slug: 'anyaman-bambu-dinding',
          harga: 85000,
          kategori: 'Hiasan Dinding',
          thumbnail: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=500&auto=format&fit=crop&q=60',
          hashtags: ['handmade', 'bambu', 'decor']
        },
        {
          nama: 'Tas Keranjang Bambu',
          deskripsi: 'Tas keranjang bambu estetik untuk belanja ramah lingkungan maupun properti foto.',
          slug: 'tas-keranjang-bambu',
          harga: 120000,
          kategori: 'Tas & Sepatu',
          thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
          hashtags: ['tasetnik', 'eco-friendly', 'handmade']
        }
      ],
      faqs: [
        { pertanyaan: 'Apakah menerima custom design?', jawaban: 'Ya, kami menerima pemesanan kustom ukuran dan corak sesuai kebutuhan dengan minimum order.' },
        { pertanyaan: 'Apakah anyaman bambu tahan air?', jawaban: 'Sudah dilapisi cat pelindung air, namun hindari terkena basah atau terendam terus-menerus.' }
      ],
      socials: [
        { nama: '@senibambu.tng', url: 'https://tiktok.com/@senibambu.tng', tipe: 'tiktok' },
        { nama: 'Seni Bambu Tangerang Facebook', url: 'https://facebook.com/senibambutangerang', tipe: 'facebook' }
      ]
    },
    {
      email: 'client3@app.id',
      username: 'Budi',
      ownerName: 'Budi Rahardjo',
      tokoName: 'Gaya Muda Mode',
      slug: 'gaya-muda-mode',
      nib: '010803',
      deskripsi: 'Menyediakan fashion modern kasual untuk anak muda dengan bahan terbaik dan desain up-to-date.',
      nomorHp: '081234567893',
      rating: 4.7,
      categoryToko: 'Fashion & Pakaian',
      hasFaqAndSocial: true,
      branches: [
        { nama: 'Gerai Karawaci', tipe: 'primer', alamat: 'Ruko Pinangsia Raya Blok A No. 3, Karawaci', lat: -6.2201, lng: 106.6190 },
        { nama: 'Cabang Cipondoh', tipe: 'sekunder', alamat: 'Jl. KH Hasyim Ashari No. 12, Cipondoh', lat: -6.1955, lng: 106.6740 }
      ],
      products: [
        {
          nama: 'Kaos Cotton Combed 30s',
          deskripsi: 'Kaos polos berbahan 100% cotton combed 30s premium, sangat adem dan nyaman digunakan sehari-hari.',
          slug: 'kaos-cotton-combed-30s',
          harga: 55000,
          kategori: 'Pakaian',
          thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
          hashtags: ['kaospolos', 'fashioncasual', 'localbrand']
        },
        {
          nama: 'Jaket Hoodie Oversize',
          deskripsi: 'Hoodie dengan potongan oversize bergaya ala Korea, berbahan fleece tebal namun lembut di kulit.',
          slug: 'jaket-hoodie-oversize',
          harga: 145000,
          kategori: 'Pakaian',
          thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60',
          hashtags: ['hoodieoversize', 'koreanstyle', 'jaketkeren']
        }
      ],
      faqs: [
        { pertanyaan: 'Apakah bisa retur ukuran?', jawaban: 'Tentu, retur ukuran diperbolehkan maksimal 3 hari sejak produk diterima dengan catatan tag label belum dicopot.' },
        { pertanyaan: 'Berapa hari waktu pengiriman?', jawaban: 'Pengiriman reguler berkisar antara 2-4 hari kerja tergantung lokasi tujuan Anda.' }
      ],
      socials: [
        { nama: '@gayamuda.mode', url: 'https://instagram.com/gayamuda.mode', tipe: 'instagram' },
        { nama: 'Gaya Muda Mode Twitter', url: 'https://twitter.com/gayamudamode', tipe: 'twitter' }
      ]
    },
    {
      email: 'client4@app.id',
      username: 'Siti',
      ownerName: 'Siti Aminah',
      tokoName: 'Cantik Herbal Alami',
      slug: 'cantik-herbal-alami',
      nib: '010804',
      deskripsi: 'Solusi kecantikan dan perawatan kulit alami menggunakan bahan herbal tradisional bersertifikasi BPOM.',
      nomorHp: '081234567894',
      rating: 4.5,
      categoryToko: 'Kecantikan & Kesehatan',
      hasFaqAndSocial: false,
      branches: [
        { nama: 'Toko Pusat Ciledug', tipe: 'primer', alamat: 'Jl. H. Cokroaminoto No. 56, Ciledug', lat: -6.2291, lng: 106.7285 }
      ],
      products: [
        {
          nama: 'Masker Wajah Green Tea',
          deskripsi: 'Masker bubuk organik dari ekstrak teh hijau murni untuk membantu mengatasi jerawat dan minyak berlebih.',
          slug: 'masker-wajah-green-tea',
          harga: 20000,
          kategori: 'Kosmetik',
          thumbnail: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500&auto=format&fit=crop&q=60',
          hashtags: ['maskerorganik', 'skincareherbal', 'cantikalami']
        },
        {
          nama: 'Serum Brightening Alami',
          deskripsi: 'Serum konsentrat berbahan aktif vitamin C organik untuk mencerahkan noda hitam secara alami.',
          slug: 'serum-brightening-alami',
          harga: 75000,
          kategori: 'Kosmetik',
          thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
          hashtags: ['serumwajah', 'brighteningserum', 'alami']
        }
      ],
      faqs: [],
      socials: []
    },
    {
      email: 'client5@app.id',
      username: 'Agus',
      ownerName: 'Agus Setiawan',
      tokoName: 'Tech Gadget Solution',
      slug: 'tech-gadget-solution',
      nib: '010805',
      deskripsi: 'Menjual aksesoris gadget, komponen komputer, dan solusi perangkat keras terlengkap dengan harga terjangkau.',
      nomorHp: '081234567895',
      rating: 4.4,
      categoryToko: 'Elektronik & Gadget',
      hasFaqAndSocial: false,
      branches: [
        { nama: 'Toko Jatiuwung', tipe: 'primer', alamat: 'Jl. Gatot Subroto No. 44, Jatiuwung', lat: -6.1912, lng: 106.5824 }
      ],
      products: [
        {
          nama: 'Kabel Data Fast Charge C',
          deskripsi: 'Kabel charger USB Type-C berkualitas tinggi yang mendukung pengisian daya cepat hingga 65W dan transfer data stabil.',
          slug: 'kabel-data-fast-charge-c',
          harga: 35000,
          kategori: 'Gadget',
          thumbnail: 'https://images.unsplash.com/photo-1619752187659-3a362742de86?w=500&auto=format&fit=crop&q=60',
          hashtags: ['charger', 'typec', 'gadgetmurah']
        },
        {
          nama: 'Holder Meja Lipat HP',
          deskripsi: 'Penyangga HP meja lipat berbahan plastik ABS tebal dengan sudut pandang ergonomis yang dapat disesuaikan.',
          slug: 'holder-meja-lipat-hp',
          harga: 25000,
          kategori: 'Gadget',
          thumbnail: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&auto=format&fit=crop&q=60',
          hashtags: ['holderhp', 'aksesorisgadget', 'mejakerja']
        }
      ],
      faqs: [],
      socials: []
    }
  ];

  for (const shop of shopTemplates) {
    // 6a. Buat User Client
    const clientPass = await bcrypt.hash('password', saltRounds);
    const user = await prisma.user.create({
      data: {
        username: shop.username,
        email: shop.email,
        password: clientPass,
        verifiedAt: new Date(),
      }
    });

    // Hubungkan user ke client role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleInstances['client'].id
      }
    });

    // 6b. Buat Toko
    const dbToko = await prisma.toko.create({
      data: {
        nib: shop.nib,
        nama_toko: shop.tokoName,
        slug: shop.slug,
        deskripsi: shop.deskripsi,
        nomor_hp: shop.nomorHp,
        rating: shop.rating,
        status: StatusToko.aktif,
      }
    });

    // Hubungkan Toko dengan PemilikToko
    await prisma.pemilikToko.create({
      data: {
        nama: shop.ownerName,
        jabatan: 'Owner',
        userId: user.id,
        tokoId: dbToko.id,
        status: Status.aktif
      }
    });

    // Hubungkan Toko dengan Kategori Toko
    const tCat = findTokoCat(shop.categoryToko);
    if (tCat) {
      await prisma.kategoriToko.create({
        data: {
          tokoId: dbToko.id,
          kategoriId: tCat.id
        }
      });
    }

    // 6c. Buat Cabang Toko
    const createdBranches: any[] = [];
    for (const b of shop.branches) {
      const dbBranch = await prisma.cabangToko.create({
        data: {
          tokoId: dbToko.id,
          nama_cabang: b.nama,
          tipe: b.tipe,
          alamat: b.alamat,
          latitude: b.lat,
          longitude: b.lng,
          status: Status.aktif
        }
      });
      createdBranches.push(dbBranch);
    }

    // 6d. Buat Hashtags toko & Produk
    for (const prod of shop.products) {
      // Dapatkan Kategori Produk
      const pCat = findProdCat(prod.kategori);

      const dbProduct = await prisma.produk.create({
        data: {
          nama_produk: prod.nama,
          deskripsi: prod.deskripsi,
          slug: prod.slug,
          harga: prod.harga,
          thumbnail: prod.thumbnail,
          tokoId: dbToko.id,
          kategoriId: pCat ? pCat.id : null,
          status: VisibilitasProduk.tampilkan,
        }
      });

      // Hubungkan produk ke semua cabang toko
      for (const branch of createdBranches) {
        await prisma.produkCabang.create({
          data: {
            produkId: dbProduct.id,
            cabangId: branch.id,
            status: StatusProduk.tersedia
          }
        });
      }

      // Buat & Hubungkan Hashtags ke Produk
      for (const tagText of prod.hashtags) {
        // Cari atau buat Hashtag
        const dbHashtag = await prisma.hashtag.upsert({
          where: {
            nama_tokoId: {
              nama: tagText,
              tokoId: dbToko.id
            }
          },
          update: {},
          create: {
            nama: tagText,
            tokoId: dbToko.id
          }
        });

        // Hubungkan ke Produk
        await prisma.produkHashtag.create({
          data: {
            produkId: dbProduct.id,
            hashtagId: dbHashtag.id
          }
        });
      }

      // Buat 1 ulasan dummy untuk membuat produk terasa hidup
      await prisma.ulasan.create({
        data: {
          produkId: dbProduct.id,
          nama: 'Budi Santoso',
          nilai: 5,
          komentar: 'Sangat recommended! Pelayanan cepat dan kualitas produk sangat bagus.',
          status: StatusUlasan.terima
        }
      });
    }

    // 6e. Buat FAQ & Sosial Media jika bernilai true
    if (shop.hasFaqAndSocial) {
      for (const faq of shop.faqs) {
        await prisma.faq.create({
          data: {
            tokoId: dbToko.id,
            pertanyaan: faq.pertanyaan,
            jawaban: faq.jawaban
          }
        });
      }

      for (const soc of shop.socials) {
        await prisma.sosialMedia.create({
          data: {
            tokoId: dbToko.id,
            nama: soc.nama,
            url: soc.url,
            tipe: soc.tipe
          }
        });
      }
    }
  }

  // 7. Buat 2 Pendaftar
  console.log('Membuat data 2 pendaftar dummy...');
  await prisma.pendaftar.create({
    data: {
      nib: '010991',
      nama_pemilik: 'Ahmad Yusuf',
      nama_toko: 'Roti Bakar Bahagia',
      email: 'ahmad@rotibahagia.com',
      status: StatusPendaftar.menunggu
    }
  });

  await prisma.pendaftar.create({
    data: {
      nib: '010992',
      nama_pemilik: 'Dewi Lestari',
      nama_toko: 'Kerajinan Rotan Indah',
      email: 'dewi@rotanindah.com',
      status: StatusPendaftar.ditolak
    }
  });

  console.log('Proses seeding selesai dengan sukses!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error saat proses seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
