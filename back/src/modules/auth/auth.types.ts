export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser extends PublicUser {
  passwordHash: string;
  tokenVersion: number;
}

export interface AuthTokenPayload {
  sub: string;
  tokenVersion: number;
}
