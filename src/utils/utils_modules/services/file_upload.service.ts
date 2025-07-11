import { Injectable } from '@nestjs/common';
import { BucketsService } from '../third_party/buckets.service';
import { Folders } from '../third_party/dto/bucket.folder';
import { UUID } from 'mongodb';
import Jimp from 'jimp';
import { Readable } from 'node:stream';
import { ConflictError } from 'src/utils/error/graphql.error';
import { AWS } from 'src/utils/constant/constant';

@Injectable()
export class FileUploadService {
  constructor(private bucketService: BucketsService) {}
  async removeFileImage(filename: string[]): Promise<string[] | boolean> {
    try {
      filename.forEach(async (d) => {
        const key = d.replace(`${AWS.BASE_LINK}/`, '');
        await this.bucketService.deletePublicFile(key);
      });
    } catch (error) {
      return error;
    }
  }
  async removeFileImagMessage(filename: string[]): Promise<string[] | boolean> {
    try {
      filename.forEach(async (d) => {
        const key = d.replace(`${AWS.BASE_LINK}/`, '');
        await this.bucketService.deletePublicFile(key);
      });
    } catch (error) {
      return error;
    }
  }

  async uploadFileImagePost(
    buffers: Buffer[],
    filename: string,
    type: string,
  ): Promise<string[] | boolean> {
    try {
      const filenames = [];
      const buffered = await this.processMultipleBase64Images(buffers);

      if (!buffered) {
        throw new ConflictError('Error processing image');
      }
      for (let i = 0; i < buffered.length; i++) {
        const id = new UUID();
        try {
          const place = `post-${filename}-${id}.${type}`;
          await this.bucketService.uploadFile(
            buffered[i],
            place,
            Folders.POSTS,
          );
          //! TODO: Create a AppConfig
          filenames.push(
            `${process.env.AWS_BASE_LINK}/${Folders.POSTS}/${place}`,
          );
        } catch (error) {
          return error;
        }
      }
      return filenames;
    } catch (error) {
      return error;
    }
  }

  async uploadFileMessages(
    buffers: Buffer[],
    filename: string,
    type: string,
  ): Promise<string[] | boolean> {
    try {
      const filenames = [];
      const buffered = await this.processMultipleBase64Images(buffers);

      if (!buffered) {
        throw new ConflictError('Error processing image');
      }
      for (let i = 0; i < buffered.length; i++) {
        const id = new UUID();
        try {
          const place = `message-${filename}-${id}.${type}`;
          await this.bucketService.uploadFile(
            buffered[i],
            place,
            Folders.MESSAGES,
          );
          filenames.push(`${AWS.BASE_LINK}/${Folders.MESSAGES}/${place}`);
        } catch (error) {
          return error;
        }
      }

      return filenames;
    } catch (error) {
      return false;
    }
  }

  private async processMultipleBase64Images(
    buffers: Buffer[],
  ): Promise<Buffer[]> {
    try {
      const buffered = [];
      for (const buffer of buffers) {
        const outputPath = await this.processBase64Image(buffer);

        if (!outputPath) {
          throw new Error();
        }
        buffered.push(outputPath);
      }
      return buffered;
    } catch (error) {
      return error;
    }
  }

  private async processBase64Image(buffer: Buffer): Promise<Buffer | boolean> {
    try {
      const resizedImageBuffer = await Jimp.read(buffer);
      resizedImageBuffer.resize(1000, Jimp.AUTO).quality(50);
      const resizedBuffer = await resizedImageBuffer.getBufferAsync(
        resizedImageBuffer.getMIME(),
      );

      return resizedBuffer;
    } catch (error) {
      return false;
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
