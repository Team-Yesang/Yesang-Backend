import { AuthProvider } from '../../database/entities';

export interface LoginRequestDto {
  email: string;
  name: string;
  profileImage?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    profileImage?: string | null;
    provider: AuthProvider;
    createdAt: Date;
    updatedAt: Date;
  };
}
