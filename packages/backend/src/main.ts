import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // 환경 변수 검증
  const requiredEnvVars = [
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_USERNAME',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
    process.exit(1);
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 글로벌 필터 설정 (에러 처리)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 글로벌 인터셉터 설정 (응답 래핑)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
  });

  // 글로벌 API prefix 설정
  app.setGlobalPrefix('api/v1');

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('ThreadFileSharing API')
    .setDescription('파일 중심의 팀 협업 플랫폼 API 문서')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', '사용자 인증 및 회원가입')
    .addTag('Users', '사용자 프로필 관리')
    .addTag('Companies', '회사 정보 및 멤버 관리')
    .addTag('Invitations', '회사 초대 시스템')
    .addTag('health', '시스템 상태 및 헬스체크')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
  console.log(
    `🗄️  Database health: http://localhost:${port}/api/v1/health/database`,
  );
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}
bootstrap();
