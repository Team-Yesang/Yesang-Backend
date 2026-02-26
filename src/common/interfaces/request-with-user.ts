import { Request } from 'express';

export interface RequestUser {
  id: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
