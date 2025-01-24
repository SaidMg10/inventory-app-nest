import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validator';
import { DataSource } from 'typeorm';
import { LoggerModule } from './logger/logger.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsService } from './products/products.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ProductsController } from './products/products.controller';
import { CommonModule } from './common/common.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    ProductsModule,
    CategoriesModule,
    LoggerModule,
    CloudinaryModule,
    CommonModule,
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService],
})
export class AppModule {}
