import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesAndPermissionsGuard } from './auth/guards/roles-and-permissions.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './email/email.module';
import { ServeStaticModule } from '@nestjs/serve-static'; // <-- 1. Impor ServeStaticModule
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TokoModule } from './toko/toko.module';
import { PendaftarModule } from './pendaftar/pendaftar.module';
import { PemilikTokoModule } from './pemilik-toko/pemilik-toko.module';
import { FileUploadService } from './common/services/file-upload.services';
import { KategoriModule } from './kategori/kategori.module';
import { CabangModule } from './cabang/cabang.module';
import { SosialMediaModule } from './sosial-media/sosial-media.module';
import { FaqModule } from './faq/faq.module';
import { ProdukModule } from './produk/produk.module';
import { UlasanModule } from './ulasan/ulasan.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HashtagModule } from './hashtag/hashtag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: true, // true untuk port 465, false untuk port lain
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('MAIL_FROM')}>`,
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    PrismaModule,
    EmailModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    TokoModule,
    PendaftarModule,
    PemilikTokoModule,
    KategoriModule,
    CabangModule,
    SosialMediaModule,
    FaqModule,
    ProdukModule,
    UlasanModule,
    DashboardModule,
    HashtagModule,
  ],
  controllers: [],
  providers: [
    FileUploadService,
    PrismaService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesAndPermissionsGuard,
    },
  ],
  
})

export class AppModule {}
