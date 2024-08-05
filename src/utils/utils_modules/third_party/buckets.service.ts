import { Injectable } from '@nestjs/common';
import { Folders } from './dto/bucket.folder';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class BucketsService {
  constructor() {}
  bucketName = process.env.AWS_BUCKET_NAME;

  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  async uploadFile(dataBuffer: Buffer, filename: string, folder: Folders) {
    try {
      const uploadResult = await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Body: dataBuffer,
          Key: `${folder}/${filename}`,
          ACL: 'public-read',
          ContentDisposition: 'inline',
        }),
      );

      return uploadResult;
    } catch (error) {
      console.error(error);
    }
  }

  async deletePublicFile(fileKey: string) {
    try {
      const deletedFile = await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );

      return deletedFile;
    } catch (error) {
      return error;
    }
  }
}
