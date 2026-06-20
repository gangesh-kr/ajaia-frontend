export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content_json: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  role?: 'owner' | 'viewer' | 'editor';
}

export interface Share {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  name: string;
  email: string;
}
