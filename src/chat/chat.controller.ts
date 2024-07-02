import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { NestAuthGuard } from 'src/auth/guards/nest.auth.guard';
import { NestCurrentUser } from 'src/auth/decorator/nest.current.user';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('appendImageMessage')
  @UseInterceptors(FilesInterceptor('file'))
  @UseGuards(NestAuthGuard)
  async uploadImage(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @NestCurrentUser() { user },
    @Body()
    { messageId },
  ) {
    try {
      await this.chatService.verifyUserInMessage(messageId, user.payload._id);
      const buffers = files.reduce((acc, file) => {
        return [...acc, file.buffer];
      }, []) as Buffer[];

      const link = await this.chatService.appendImageOnMessage(
        messageId,
        buffers,
      );

      return link;
    } catch (error) {
      return error;
    }
  }
}
