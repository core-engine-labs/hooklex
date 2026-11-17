

export interface Collection {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  description: string | null;
  token: string;
}
