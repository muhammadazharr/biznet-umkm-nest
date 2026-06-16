import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${Date.now() - start}ms) - Size: ${res.get('Content-Length') || 0}`);
    });
    next();
  });

  console.log('Verifikasi URL Database:', process.env.DATABASE_URL);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const origins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) 
    : [
        'http://localhost:5173',
        'https://ecommerce-demo.adilasoma.cloud',
        'http://ecommerce-demo.adilasoma.cloud',
        'https://inbiz.azhr.cloud',
        'http://inbiz.azhr.cloud',
        'https://api-inbiz.azhr.cloud',
        'http://api-inbiz.azhr.cloud'
      ];
  
  console.log('Allowed CORS Origins:', origins);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('UMKM KTG')
    .setDescription('Dokumentasi API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const publicPath = join(process.cwd(), 'public');
  app.useStaticAssets(publicPath);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
