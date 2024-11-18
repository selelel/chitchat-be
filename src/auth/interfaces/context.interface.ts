import { Response, Request } from 'express';

export interface GraphQLContext {
  res: Response;
  req: Request;
}
