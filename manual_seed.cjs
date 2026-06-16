const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting manual seed...');
  const saltRounds = 10;
  
  // 1. Permissions
  const permissions = [
    'kelola_semua_toko', 'kelola_toko', 'kelola_semua_pengguna', 'kelola_pengguna',
    'kelola_cabang', 'kelola_semua_pemilik_toko', 'kelola_pemilik_toko',
    'kelola_kategori', 'verifikasi_toko', 'kelola_sosial_media', 'kelola_produk'
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Roles
  const roles = {
    admin: ['kelola_semua_toko', 'kelola_semua_pengguna', 'kelola_semua_pemilik_toko', 'kelola_kategori', 'verifikasi_toko'],
    client: ['kelola_toko', 'kelola_pengguna', 'kelola_cabang', 'kelola_sosial_media', 'kelola_produk']
  };

  for (const [roleName, perms] of Object.entries(roles)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const permsInDb = await prisma.permission.findMany({
      where: { name: { in: perms } }
    });

    for (const p of permsInDb) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id }
      });
    }
  }

  // 3. Users
  const password = await bcrypt.hash('password', saltRounds);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@app.id' },
    update: {},
    create: { username: 'superadmin', email: 'admin@app.id', password }
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@app.id' },
    update: {},
    create: { username: 'Johndoe', email: 'client@app.id', password }
  });

  // 4. User Roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const clientRole = await prisma.role.findUnique({ where: { name: 'client' } });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: client.id, roleId: clientRole.id } },
    update: {},
    create: { userId: client.id, roleId: clientRole.id }
  });

  console.log('Manual seed completed successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
