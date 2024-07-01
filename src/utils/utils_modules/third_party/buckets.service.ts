import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Folders } from './dto/bucket.folder';

@Injectable()
export class BucketsService {
  constructor() {}
  bucketName = process.env.AWS_BUCKET_NAME;

  private s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async uploadFile(dataBuffer: Buffer, filename: string, folder: Folders) {
    try {
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Body: dataBuffer,
          Key: `${folder}/${filename}`,
          ACL: 'public-read',
          ContentDisposition: 'inline',
        })
        .promise();

      return uploadResult;
    } catch (error) {
      console.error(error);
    }
  }

  async deletePublicFile(fileKey: string) {
    try {
      const deletedFile = await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: fileKey,
        })
        .promise();

      return deletedFile;
    } catch (error) {
      console.log(error);
    }
  }
}
