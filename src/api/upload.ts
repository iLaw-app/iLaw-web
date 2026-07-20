import { api } from './client';

// POST /upload/image — multipart, 필드명 'image' → { url }
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post<{ url: string }>('/upload/image', fd);
  return res.url;
}
