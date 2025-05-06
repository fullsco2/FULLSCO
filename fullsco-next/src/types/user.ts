export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}
