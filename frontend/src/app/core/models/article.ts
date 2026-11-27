export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ArticleStatus = 'draft' | 'published' | 'in_review' | 'removed' | 'sold';
export type ArticleSort = 'recent' | 'price_asc' | 'price_desc';

export interface ArticleImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface Article {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  condition: Condition;
  status: ArticleStatus;
  city: string | null;
  lat: number | null;
  lng: number | null;
  images: ArticleImage[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ArticlePage {
  data: Article[];
  pagination: Pagination;
}

export interface ArticleFilter {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  city?: string;
  sort?: ArticleSort;
  page?: number;
  pageSize?: number;
}
