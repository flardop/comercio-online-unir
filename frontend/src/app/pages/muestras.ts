export interface Muestra {
  id: string;
  titulo: string;
  precio: string;
  lugar: string;
  estado: string;
  foto: string;
  vendedor: string;
  inicial: string;
  vendedorMeta: string;
  descripcion: string;
}

export const muestras: Muestra[] = [
  {
    id: '1',
    titulo: 'Abrigo de lana',
    precio: '25 €',
    lugar: 'Sevilla · Como nuevo',
    estado: 'Publicado',
    foto: 'ph-c',
    vendedor: 'Marta Ruiz',
    inicial: 'M',
    vendedorMeta: 'Vendedora · Sevilla',
    descripcion: 'Abrigo de lana, talla M. Lo vende Marta.',
  },
  {
    id: '2',
    titulo: 'Mesa de roble',
    precio: '60 €',
    lugar: 'Bilbao · Buen estado',
    estado: 'Publicado',
    foto: 'ph-f',
    vendedor: 'Nora Campos',
    inicial: 'N',
    vendedorMeta: 'Vendedora · Bilbao',
    descripcion: 'Mesa de roble macizo. Lo vende Nora.',
  },
  {
    id: '3',
    titulo: 'Silla de escritorio',
    precio: '40 €',
    lugar: 'Madrid · Aceptable',
    estado: 'Publicado',
    foto: 'ph-b',
    vendedor: 'Andrés Molina',
    inicial: 'A',
    vendedorMeta: 'Vendedor · Madrid',
    descripcion: 'Silla de escritorio negra. Lo vende Andrés.',
  },
];

export function muestraPorId(id: string | null): Muestra {
  return muestras.find((item) => item.id === id) ?? muestras[0];
}
