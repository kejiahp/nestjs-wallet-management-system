import { Request } from 'express';

export type AuthUserType = {
  id: string;
  email: string;
  image_url: string;
  cloudinary_public_id: string;
  account_status: string;
  email_verified: string;
  created_at: string;
};

export type RequestAuthUserType = Request & { user: AuthUserType };
