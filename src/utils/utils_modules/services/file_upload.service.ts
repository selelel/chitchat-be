import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { BucketsService } from '../third_party/buckets.service';
import { Folders } from '../third_party/dto/bucket.folder';
import { UUID } from 'mongodb';
@Injectable()
export class FileUploadService {
  constructor(private bucketService: BucketsService) {}

  async uploadFileMessages(
    buffer: string[],
    filename: string,
    type: string,
  ): Promise<string[]> {
    const filenames = [];
    const buffers = await this.processMultipleBase64Images([...buffer]);

    for (let i = 0; i < buffers.length; i++) {
      const id = new UUID();
      try {
        const place = `message-${filename}-${id}.${type}`;
        await this.bucketService.uploadFile(
          buffers[i],
          place,
          Folders.MESSAGES,
        );
        filenames.push(`${process.env.AWS_BASE_LINK}/messages/${place}`);
      } catch (error) {
        console.log(error);
      }
    }
    return filenames;
  }
  private async processMultipleBase64Images(
    base64Images: string[],
  ): Promise<Buffer[]> {
    const buffers = [];
    for (const base64Image of base64Images) {
      const outputPath = await this.processBase64Image(base64Image);
      buffers.push(outputPath);
    }
    return buffers;
  }

  private async processBase64Image(base64Image: string): Promise<Buffer> {
    const buffer = Buffer.from(base64Image, 'base64');
    try {
      const resizedImageBuffer = await sharp(buffer).resize(1000).toBuffer();

      return resizedImageBuffer;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}
