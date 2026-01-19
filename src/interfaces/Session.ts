interface UserMetaData {
  username: string;
}

interface User {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
  user_metadata: UserMetaData;
}
interface UserMetaData {
  username: string;
}

export interface Player {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  user_metadata: UserMetaData;
  avatar_url: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  expires_in: string;
  token_type: string;
  user: User;
}
