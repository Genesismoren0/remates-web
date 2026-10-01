"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

export type EstadoProducto = "Nuevo" | "Usado" | "Reacondicionado";

export type Producto = {
  id: number;
  nombre: string;
  categoria: string;

  precioAnterior: number | null;
  precio: number;

  // Imagen principal que mostramos en el catálogo
  imagen: string;

  // Galería para la ficha del producto
  imagenes?: string[];

  oferta: boolean;
  vendido: boolean;

  // Información adicional
  descripcion?: string;
  estado?: EstadoProducto;
  stock?: number;
  caracteristicas?: string[];
};

export type ItemCarrito = Producto & {
  cantidad: number;
};

type CarritoContextType = {
  carrito: ItemCarrito[];
  carritoAbierto: boolean;
  cantidadTotal: number;
  totalCarrito: number;

  setCarritoAbierto: (abierto: boolean) => void;

  agregarAlCarrito: (producto: Producto) => void;
  aumentarCantidad: (id: number) => void;
  disminuirCantidad: (id: number) => void;
  eliminarProducto: (id: number) => void;

  formatoPrecio: (precio: number) => string;
  enviarPedidoWhatsApp: () => void;
};

const CarritoContext =
  createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.vendido) return;

    if (
      producto.stock !== undefined &&
      producto.stock <= 0
    ) {
      return;
    }

    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        // Si existe stock definido, no permitimos superar
        // las unidades disponibles.
        if (
          producto.stock !== undefined &&
          existe.cantidad >= producto.stock
        ) {
          return carritoActual;
        }

        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  const aumentarCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (
          item.stock !== undefined &&
          item.cantidad >= item.stock
        ) {
          return item;
        }

        return {
          ...item,
          cantidad: item.cantidad + 1,
        };
      })
    );
  };

  const disminuirCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  };

  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalCarrito = carrito.reduce(
    (total, item) =>
      total + item.precio * item.cantidad,
    0
  );

  const formatoPrecio = (precio: number) => {
    return precio.toLocaleString("es-CL");
  };

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    const numeroWhatsApp = "56949474649";

    const detalleProductos = carrito
      .map(
        (item) =>
          `🛒 ${item.cantidad}x ${item.nombre} — $${formatoPrecio(
            item.precio * item.cantidad
          )}`
      )
      .join("\n");

    const mensaje = `Hola 👋 Quiero realizar el siguiente pedido:

${detalleProductos}

💰 Total: $${formatoPrecio(totalCarrito)}

Quisiera coordinar disponibilidad, pago y entrega.`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        carritoAbierto,
        cantidadTotal,
        totalCarrito,
        setCarritoAbierto,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarProducto,
        formatoPrecio,
        enviarPedidoWhatsApp,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);

  if (!contexto) {
    throw new Error(
      "useCarrito debe utilizarse dentro de CarritoProvider"
    );
  }

  return contexto;
}