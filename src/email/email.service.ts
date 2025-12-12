import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Pendaftar, User } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendAcceptNotification(
    pendaftar: Pendaftar,
    user: User,
    password: any,
  ) {
    await this.mailerService.sendMail({
      to: pendaftar.email,
      subject: 'Selamat Datang! Toko anda berhasil terverifikasi',
      html: `
                <h1>Halo ${pendaftar.nama_pemilik},</h1>
                <p>Selamat! Toko anda ${pendaftar.nama_toko} berhasil terverifikasi.</p>
                <p>Terima kasih telah bergabung dengan kami.</p>
                <p>Berikut kami kirimkan username dan password yang bisa anda gunakan untuk login:</p>
                <ul>
                  <li>Username: ${user.username}</li>
                  <li>Password: ${password}</li>
                </ul>
                <p>Silakan ubah password anda setelah login untuk keamanan akun anda.</p>
                <br/>
                <p>Salam hangat,</p>
                <p>Tim Umkm Ktg</p>
            `,
    });
  }

  async sendRejectNotification(pendaftar: Pendaftar) {
    await this.mailerService.sendMail({
      to: pendaftar.email,
      subject: 'Pemberitahuan Verifikasi Toko',
      html: `
                <h1>Halo ${pendaftar.nama_pemilik},</h1>
                <p>Terima kasih telah mendaftar toko di platform kami.</p>
                <p>Setelah melalui proses verifikasi, kami mohon maaf untuk memberitahukan bahwa pendaftaran toko anda tidak dapat kami setujui saat ini.</p>
                <p>Jika anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi tim support kami.</p>
                <br/>
                <p>Salam hangat,</p>
                <p>Tim Umkm Ktg</p>   
            `,
    });
  }
}
