export type Category = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category?: Category;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  categoryId: number;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  categoryId?: number;
};
