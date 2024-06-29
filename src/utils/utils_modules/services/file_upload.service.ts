import { Injectable } from '@nestjs/common';
import { BucketsService } from '../third_party/buckets.service';
import { Folders } from '../third_party/dto/bucket.folder';
import { UUID } from 'mongodb';
import Jimp from 'jimp';
import { Readable } from 'node:stream';

@Injectable()
export class FileUploadService {
  constructor(private bucketService: BucketsService) {}

  async uploadFileMessages(
    streams: Readable[],
    filename: string,
    type: string,
  ): Promise<string[]> {
    try {
      const filenames = [];
      const buffers = await this.processMultipleBase64Images([...streams]);
      console.log(buffers);
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
          return filenames;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      return error;
    }
  }

  private async processMultipleBase64Images(
    streams: Readable[],
  ): Promise<Buffer[]> {
    try {
      const buffers = [];
      for (const stream of streams) {
        const outputPath = await this.processBase64Image(stream);
        buffers.push(outputPath);
      }
      return buffers;
    } catch (error) {
      return error;
    }
  }

  private async processBase64Image(stream: Readable): Promise<Buffer> {
    let buffer: Buffer = await this.streamToBuffer(stream);
    try {
      const resizedImageBuffer = await Jimp.read(buffer);

      resizedImageBuffer.resize(1000, Jimp.AUTO).quality(50);

      const resizedBuffer = await resizedImageBuffer.getBufferAsync(
        Jimp.MIME_PNG,
      );
      return resizedBuffer;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (error) => reject(error));
    });
  }
}
