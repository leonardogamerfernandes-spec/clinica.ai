import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS to allow the Next.js frontend to make queries
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Apply our global exception filter to handle crashes gracefully
  app.useGlobalFilters(new HttpExceptionFilter());

  // Use port 3001 to prevent conflicts with the Next.js frontend on 3000
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Clínica.ai Backend running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start NestJS application', err);
  process.exit(1);
});
