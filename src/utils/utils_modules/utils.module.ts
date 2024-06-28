import { Module } from '@nestjs/common';
import { BucketsService } from './third_party/buckets.service';
import { FileUploadService } from './services/file_upload.service';

@Module({
  exports: [FileUploadService, BucketsService],
  providers: [FileUploadService, BucketsService],
})
export class UtilModules {}
