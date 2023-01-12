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

@Controller()
export class UploadController {
  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      //to nastavi local storage slik na mapo /uploads
      storage: diskStorage({
        destination: './uploads',
        filename(_, file, callback) {
          //to zgenerira random name ig
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    configService: ConfigService,
  ) {
    /*
    const domain = configService.get('app.publicBackendDomain');
    const img_url = domain + `/api/${file.path}`;
    console.log(domain, img_url);*/
    const img_url = `http://localhost:4000/api/${file.path}`;
    return {
      url: img_url,
    };
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
