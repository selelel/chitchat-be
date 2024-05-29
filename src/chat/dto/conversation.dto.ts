import { Field, InputType } from '@nestjs/graphql';
import { Pagination } from 'src/utils/global_dto/pagination.dto';

@InputType()
export class GetConversation {
  @Field(() => String)
  chatId: string;

  @Field(() => Pagination, { nullable: true })
  pagination?: Pagination;
}
