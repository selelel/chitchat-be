import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Pagination } from 'src/utils/global_dto/pagination.dto';

@InputType()
export class GetConversation {
  @Field(() => String)
  @IsString()
  chatId: string;

  @Field(() => Pagination, { nullable: true })
  @ValidateNested()
  @Type(() => Pagination)
  pagination?: Pagination;
}
