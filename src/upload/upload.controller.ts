import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { S3 } from 'aws-sdk';

@Controller()
export class UploadController {
  constructor(private readonly configService: ConfigService) {}

  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    configService: ConfigService,
  ) {
    const url = await this.uploadPublicFile(file.buffer, file.originalname);
    return {
      url,
    };
  }

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();

    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');

    const uploadResult = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${randomName}-${filename}`,
      })
      .promise();

    return uploadResult.Location;
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['exposeProvider'],
  })
  @Get('uploads/:path')
  async getImage(@Param('path') path, @Res() res: Response) {
    res.sendFile(path, { root: 'uploads' });
  }
}
