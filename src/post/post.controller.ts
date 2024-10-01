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
import { PostService } from './post.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NestAuthGuard } from 'src/auth/guards/nest.auth.guard';
import { NestCurrentUser } from 'src/auth/decorator/nest.current.user';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('appendImagePost')
  @UseGuards(NestAuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
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
    @NestCurrentUser() {decoded_token},
    @Body() { postId },
  ) {
    try {
      console.log(postId, decoded_token)
      await this.postService.isUserAuthor(postId, decoded_token.payload._id);
      const buffers = files.reduce((acc, file) => {
        return [...acc, file.buffer];
      }, []) as Buffer[];

      const link = await this.postService.appendImageOnPost(postId, buffers);
      return link;
    } catch (error) {
      throw error
    }
  }

  @Post('test')
  @UseGuards(NestAuthGuard)
  async test(
    @NestCurrentUser() user,
    @Body() { postId },
  ) {
    try {
      console.log("Invoked")
      console.log(postId, user)
      return "test";
    } catch (error) {
      throw error
    }
  }

  
}
