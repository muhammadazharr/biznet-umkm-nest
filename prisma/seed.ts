import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start a seeder ...');

  const saltRounds = 10;

  const permissionToCreate = [
    {
      name: 'kelola_semua_toko',
    },
    {
      name: 'kelola_toko',
    },
    {
      name: 'kelola_semua_pengguna',
    },
    {
      name: 'kelola_pengguna',
    },
    {
      name: 'kelola_cabang',
    },
    {
      name: 'kelola_semua_pemilik_toko',
    },
    {
      name: 'kelola_pemilik_toko',
    },
    {
      name: 'kelola_kategori',
    },
    {
      name: 'verifikasi_toko',
    },
    {
      name: 'kelola_sosial_media',
    },
    {
      name: 'kelola_produk',
    },
  ];

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

  for (const data of permissionToCreate) {
    await prisma.permission.upsert({
      where: { name: data.name },
      update: {},
      create: { name: data.name },
    });
  }

  for (const roleName in rolesAndPermissions) {
    // Buat Role
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    // Ambil daftar permission untuk role ini
    const permissionsForRole = rolesAndPermissions[roleName];
    if (permissionsForRole) {
      // Dapatkan objek Permission dari database berdasarkan namanya
      const permissionsInDb = await prisma.permission.findMany({
        where: { name: { in: permissionsForRole } },
      });

      // Hubungkan setiap permission ke role
      for (const perm of permissionsInDb) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: perm.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  console.log('Membuat user admin...');
  const adminPassword = await bcrypt.hash('password', saltRounds);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@app.id' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@app.id',
      password: adminPassword,
    },
  });

  // 4. Buat User Client
  console.log('Membuat user client...');
  const clientPassword = await bcrypt.hash('password', saltRounds);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@app.id' },
    update: {},
    create: {
      username: 'Johndoe',
      email: 'client@app.id',
      password: clientPassword,
    },
  });

  // 5. Hubungkan Users ke Roles
  console.log('Menghubungkan users ke roles...');
  const adminRoleFromDb = await prisma.role.findUnique({
    where: { name: 'admin' },
  });
  const clientRoleFromDb = await prisma.role.findUnique({
    where: { name: 'client' },
  });

  if (adminRoleFromDb) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: adminRoleFromDb.id },
      },
      update: {},
      create: { userId: adminUser.id, roleId: adminRoleFromDb.id },
    });
  }

  if (clientRoleFromDb) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: clientUser.id, roleId: clientRoleFromDb.id },
      },
      update: {},
      create: { userId: clientUser.id, roleId: clientRoleFromDb.id },
    });
  }

  // 6. Buat Profil Client
  console.log('Membuat profil client...');

  // Upsert toko dan gunakan id yang dikembalikan (jangan mengasumsikan id = 1)
  const toko = await prisma.toko.upsert({
    where: { slug: 'toko-dummy' },
    update: {},
    create: {
      nib: '010802',
      nama_toko: 'Toko Dummy',
      slug: 'toko-dummy',
      deskripsi: 'Lorem ipsum',
      nomor_hp: '081234567890',
    },
  });

  // Pastikan pemilikToko memakai toko.id yang benar
  await prisma.pemilikToko.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      nama: 'John Doe',
      jabatan: 'Owner',
      userId: clientUser.id,
      tokoId: toko.id,
    },
  });

  // Buat kategori jika belum ada (nama_kategori tidak unik di schema, jadi pakai find/create)
  let kategori = await prisma.kategori.findFirst({
    where: { nama_kategori: 'Food and Beverages', tipe: 'toko' },
  });
  if (!kategori) {
    kategori = await prisma.kategori.create({
      data: {
        nama_kategori: 'Food and Beverages',
        tipe: 'toko',
      },
    });
  }

  // Hubungkan kategori dengan toko menggunakan id yang benar
  await prisma.kategoriToko.create({
    data: {
      kategoriId: kategori.id,
      tokoId: toko.id,
    },
  });

  console.log(`Seeding selesai.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
