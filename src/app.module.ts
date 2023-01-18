import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource } from 'typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import mailConfig from './config/mail.config';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HeaderResolver, I18nService } from 'nestjs-i18n';
import { MailConfigService } from './mail/mail-config.service';
import { RolesModule } from './roles/roles.module';
import { ForgotModule } from './forgot/forgot.module';
import { MailModule } from './mail/mail.module';
import { LocationsModule } from './locations/locations.module';
import { GuessesModule } from './guesses/guesses.module';
import { UploadController } from './upload/upload.controller';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.fallbackLanguage'),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService) => {
            return [configService.get('app.headerLanguage')];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    ForgotModule,
    MailModule,
    LocationsModule,
    GuessesModule,
    LoggerModule
  ],
  controllers: [UploadController],
  providers: [],
})
export class AppModule {}
