import { Producto } from "../components/CarritoContext";

export const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Smart TV Samsung 55"',
    categoria: "Tecnología",
    precioAnterior: 369990,
    precio: 249990,

    imagen:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",

    imagenes: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1552975084-6e027cd345c2?auto=format&fit=crop&w=900&q=80",
    ],

    oferta: true,
    vendido: false,

    estado: "Nuevo",
    stock: 3,

    descripcion:
      "Smart TV Samsung de 55 pulgadas disponible a precio especial de remate. Ideal para living, sala de estar o dormitorio. Consulta por WhatsApp para confirmar todos los detalles del producto y coordinar la entrega.",

    caracteristicas: [
      'Pantalla de 55"',
      "Smart TV",
      "Conectividad Wi-Fi",
      "Aplicaciones de streaming",
      "Control remoto incluido",
    ],
  },

  {
    id: 2,
    nombre: "Freidora de aire",
    categoria: "Electrodomésticos",
    precioAnterior: 69990,
    precio: 39990,
    imagen:
      "https://images.unsplash.com/photo-1648135327756-b606e2eb8c5c?auto=format&fit=crop&w=600&q=80",
    oferta: true,
    vendido: false,
    estado: "Nuevo",
    stock: 4,
    descripcion:
      "Freidora de aire disponible a precio especial de remate.",
    caracteristicas: [
      "Fácil de utilizar",
      "Ideal para el hogar",
      "Producto disponible para entrega",
    ],
  },

  {
    id: 3,
    nombre: "Taladro inalámbrico",
    categoria: "Herramientas",
    precioAnterior: 129990,
    precio: 79990,
    imagen:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    oferta: true,
    vendido: false,
    estado: "Nuevo",
    stock: 2,
    descripcion:
      "Taladro inalámbrico disponible en nuestro remate de herramientas.",
    caracteristicas: [
      "Inalámbrico",
      "Uso doméstico y profesional",
      "Fácil transporte",
    ],
  },

  {
    id: 4,
    nombre: "Suzuki Swift 2018",
    categoria: "Vehículos",
    precioAnterior: null,
    precio: 7990000,
    imagen:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    oferta: false,
    vendido: false,
    estado: "Usado",
    stock: 1,
    descripcion:
      "Vehículo usado disponible para venta. Consulta por WhatsApp para conocer antecedentes, características y coordinar una visita.",
    caracteristicas: [
      "Año 2018",
      "Vehículo usado",
      "1 unidad disponible",
    ],
  },

  {
    id: 5,
    nombre: "Lavadora 12 kg",
    categoria: "Electrodomésticos",
    precioAnterior: 299990,
    precio: 199990,
    imagen:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
    oferta: true,
    vendido: false,
    estado: "Nuevo",
    stock: 2,
    descripcion:
      "Lavadora de 12 kg disponible a precio especial de remate.",
    caracteristicas: [
      "Capacidad de 12 kg",
      "Ideal para uso familiar",
      "Producto disponible",
    ],
  },

  {
    id: 6,
    nombre: "Parrilla a carbón",
    categoria: "Hogar",
    precioAnterior: null,
    precio: 49990,
    imagen:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    oferta: false,
    vendido: true,
    estado: "Usado",
    stock: 0,
    descripcion:
      "Parrilla a carbón perteneciente a nuestro catálogo de remates.",
    caracteristicas: [
      "Funcionamiento a carbón",
      "Uso exterior",
    ],
  },
];

export const categorias = [
  "Todas",
  "Electrodomésticos",
  "Hogar",
  "Tecnología",
  "Herramientas",
  "Accesorios Auto",
  "Vehículos",
  "Otros",
];