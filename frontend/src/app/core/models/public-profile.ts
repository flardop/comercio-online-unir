export interface PublicProfile {
  id: number;
  username: string;
  name: string;
  city: string | null;
  avatarUrl: string | null;
  bio: string | null;
  ratingAverage: number;
  ratingCount: number;
}
