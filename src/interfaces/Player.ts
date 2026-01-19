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
