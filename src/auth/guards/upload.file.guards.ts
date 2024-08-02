import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UploadFileHeader extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const validFiles = [];
    const files = req.file;
    for (const file of files) {
      if (!file.match(/\.(jpg|png|jpeg)$/)) {
        validFiles.push(file);
      }
    }
    req.files = files;
    return true;
  }
}
