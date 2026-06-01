export type Category = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  userId: number;
  category?: Category;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  categoryId?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};
