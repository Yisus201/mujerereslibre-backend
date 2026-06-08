export interface Metric {
  id: number;
  value: string;
  label: string;
  description?: string;
}

export interface ServiceCard {
  id: number;
  title: string;
  number: string;
  description: string;
  image_url: string;
  is_full_width: boolean;
}

export interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  created_at: string;
}

export type SiteContent = Record<string, string>;

export interface Photo {
  id: number;
  url: string;
}

export interface Album {
  id: number;
  title: string;
  date: string;
  coverImage: string;
  photos: Photo[];
  is_hidden?: boolean;
  linked_article_id?: number | null;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  content?: string;
  is_hidden?: boolean;
  is_popup?: boolean;
  linked_album_id?: number | null;
  linked_form_id?: number | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  articles: Article[];
}

export interface CustomFormField {
  id: number;
  label: string;
  field_type: string;
  required: boolean;
  options?: string;
}

export interface CustomForm {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  fields: CustomFormField[];
}

export interface CustomFormSubmission {
  id: number;
  form_id: number;
  data: string;
  created_at: string;
}
