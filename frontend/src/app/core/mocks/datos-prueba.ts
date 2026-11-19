import { Article } from '../models/article';
import { Category } from '../models/category';
import { PublicProfile } from '../models/public-profile';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Hogar', slug: 'hogar', parentId: null, isActive: true },
  { id: 2, name: 'Moda', slug: 'moda', parentId: null, isActive: true },
  { id: 3, name: 'Tecnología', slug: 'tecnologia', parentId: null, isActive: true },
  { id: 4, name: 'Deporte', slug: 'deporte', parentId: null, isActive: true },
  { id: 5, name: 'Libros', slug: 'libros', parentId: null, isActive: true },
  { id: 6, name: 'Mascotas', slug: 'mascotas', parentId: null, isActive: true },
];

export const USERS: PublicProfile[] = [
  { id: 1, username: 'alex', name: 'Álex', city: 'Madrid', avatarUrl: null, bio: 'Me gustan las cosas con historia.', ratingAverage: 4.9, ratingCount: 12 },
  { id: 2, username: 'clara', name: 'Clara', city: 'Barcelona', avatarUrl: null, bio: 'Decoración y segunda mano.', ratingAverage: 4.8, ratingCount: 8 },
  { id: 3, username: 'nerea', name: 'Nerea', city: 'Valencia', avatarUrl: null, bio: 'Siempre en bici.', ratingAverage: 5, ratingCount: 21 },
  { id: 4, username: 'diego', name: 'Diego', city: 'Valencia', avatarUrl: null, bio: 'Tecnología cuidada.', ratingAverage: 4.7, ratingCount: 5 },
  { id: 5, username: 'elena', name: 'Elena', city: 'Bilbao', avatarUrl: null, bio: 'Lectora incansable.', ratingAverage: 4.9, ratingCount: 14 },
  { id: 6, username: 'lucia', name: 'Lucía', city: 'Zaragoza', avatarUrl: null, bio: 'Moda con segunda vida.', ratingAverage: 4.6, ratingCount: 3 },
  { id: 7, username: 'jorge', name: 'Jorge', city: 'Madrid', avatarUrl: null, bio: 'Luz y buen diseño.', ratingAverage: 4.8, ratingCount: 9 },
  { id: 8, username: 'paula', name: 'Paula', city: 'Valencia', avatarUrl: null, bio: 'Viajes cortos y mochila ligera.', ratingAverage: 5, ratingCount: 17 },
];

function foto(id: number, url: string): Article['images'] {
  return [{ id, url, sortOrder: 0 }];
}

export const ARTICLES: Article[] = [
  {
    id: 1, ownerId: 1, title: 'Cámara instantánea', price: 85, categoryId: 3, condition: 'like_new', status: 'published',
    description: 'Cámara instantánea en muy buen estado, funciona perfectamente y busca nuevas aventuras.',
    city: 'Madrid', lat: null, lng: null, createdAt: '2026-11-08T10:00:00.000Z',
    images: foto(1, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&q=80'),
  },
  {
    id: 2, ownerId: 2, title: 'Sillón vintage', price: 120, categoryId: 1, condition: 'good', status: 'published',
    description: 'Sillón cómodo con mucho encanto. Ideal para un rincón de lectura.',
    city: 'Barcelona', lat: null, lng: null, createdAt: '2026-11-07T10:00:00.000Z',
    images: foto(2, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&q=80'),
  },
  {
    id: 3, ownerId: 3, title: 'Bicicleta urbana', price: 180, categoryId: 4, condition: 'good', status: 'published',
    description: 'Bicicleta urbana revisada y en buen estado, perfecta para moverse por la ciudad.',
    city: 'Valencia', lat: null, lng: null, createdAt: '2026-11-06T10:00:00.000Z',
    images: foto(3, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=700&q=80'),
  },
  {
    id: 4, ownerId: 4, title: 'Auriculares inalámbricos', price: 60, categoryId: 3, condition: 'like_new', status: 'published',
    description: 'Auriculares muy cuidados con estuche de carga.',
    city: 'Valencia', lat: null, lng: null, createdAt: '2026-11-05T10:00:00.000Z',
    images: foto(4, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80'),
  },
  {
    id: 5, ownerId: 5, title: 'Lote de libros', price: 25, categoryId: 5, condition: 'good', status: 'published',
    description: 'Un lote de cinco libros para disfrutar de nuevas historias.',
    city: 'Bilbao', lat: null, lng: null, createdAt: '2026-11-04T10:00:00.000Z',
    images: foto(5, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=700&q=80'),
  },
  {
    id: 6, ownerId: 6, title: 'Chaqueta vaquera', price: 35, categoryId: 2, condition: 'like_new', status: 'published',
    description: 'Chaqueta vaquera de corte clásico, muy poco usada.',
    city: 'Zaragoza', lat: null, lng: null, createdAt: '2026-11-03T10:00:00.000Z',
    images: foto(6, 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=700&q=80'),
  },
  {
    id: 7, ownerId: 7, title: 'Lámpara de mesa', price: 28, categoryId: 1, condition: 'good', status: 'published',
    description: 'Lámpara de mesa con un diseño cálido y acogedor.',
    city: 'Madrid', lat: null, lng: null, createdAt: '2026-11-02T10:00:00.000Z',
    images: foto(7, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&q=80'),
  },
  {
    id: 8, ownerId: 8, title: 'Mochila para escapadas', price: 38, categoryId: 2, condition: 'like_new', status: 'published',
    description: 'Mochila cómoda y resistente, ideal para viajes cortos.',
    city: 'Valencia', lat: null, lng: null, createdAt: '2026-11-01T10:00:00.000Z',
    images: foto(8, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80'),
  },
  {
    id: 9, ownerId: 1, title: 'Borrador de ejemplo', price: 10, categoryId: 1, condition: 'fair', status: 'draft',
    description: 'Este artículo es un borrador y no debe aparecer en el listado público.',
    city: 'Madrid', lat: null, lng: null, createdAt: '2026-11-10T10:00:00.000Z', images: [],
  },
  {
    id: 10, ownerId: 2, title: 'Artículo en revisión', price: 15, categoryId: 2, condition: 'poor', status: 'in_review',
    description: 'Este artículo está en revisión y no debe aparecer en el listado público.',
    city: 'Barcelona', lat: null, lng: null, createdAt: '2026-11-10T11:00:00.000Z', images: [],
  },
];
