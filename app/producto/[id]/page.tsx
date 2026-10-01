"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Carrito from "../../components/Carrito";
import {
  useCarrito,
  type Producto,
} from "../../components/CarritoContext";
import { supabase } from "../../lib/supabase";

export default function ProductoPage() {
  const params = useParams();
  const id = Number(params.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  const {
    cantidadTotal,
    setCarritoAbierto,
    agregarAlCarrito,
    formatoPrecio,
  } = useCarrito();

  useEffect(() => {
    const cargarProducto = async () => {
      setCargando(true);

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando producto:", error);
        setProducto(null);
        setCargando(false);
        return;
      }

      if (!data) {
        setProducto(null);
        setCargando(false);
        return;
      }

      const productoConvertido: Producto = {
        id: Number(data.id),
        nombre: data.nombre || "",
        categoria: data.categoria || "Otros",

        precioAnterior:
          data.precio_anterior === null ||
          data.precio_anterior === undefined
            ? null
            : Number(data.precio_anterior),

        precio: Number(data.precio || 0),

        imagen: data.imagen || "",

        imagenes: Array.isArray(data.imagenes)
          ? data.imagenes
          : [],

        oferta: Boolean(data.oferta),
        vendido: Boolean(data.vendido),

        descripcion: data.descripcion || undefined,

        estado:
          data.estado === "Nuevo" ||
          data.estado === "Usado" ||
          data.estado === "Reacondicionado"
            ? data.estado
            : undefined,

        stock:
          data.stock === null || data.stock === undefined
            ? undefined
            : Number(data.stock),

        caracteristicas: Array.isArray(data.caracteristicas)
          ? data.caracteristicas
          : [],
      };

      setProducto(productoConvertido);
      setImagenSeleccionada(0);
      setCargando(false);
    };

    if (!Number.isNaN(id)) {
      cargarProducto();
    } else {
      setProducto(null);
      setCargando(false);
    }
  }, [id]);

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl">🏷️</div>

          <p className="mt-4 font-bold text-[#101820]">
            Cargando producto...
          </p>
        </div>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl">🔍</div>

          <h1 className="mt-5 text-3xl font-black text-[#101820]">
            Producto no encontrado
          </h1>

          <p className="mt-3 text-gray-500">
            El producto que buscas no existe o ya no está disponible.
          </p>

          <Link
            href="/"
            className="mt-8 rounded-md bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Volver a los productos
          </Link>
        </div>
      </main>
    );
  }

  const imagenesProducto =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : [producto.imagen];

  const sinStock =
    producto.stock !== undefined && producto.stock <= 0;

  const noDisponible = producto.vendido || sinStock;

  return (
    <main className="min-h-screen bg-white">
      {/* BARRA SUPERIOR */}
      <div className="bg-[#101820] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <p>¡Grandes oportunidades, todos los días!</p>

          <div className="flex items-center gap-3">
            <span>Síguenos</span>
            <span>●</span>
            <span>●</span>
            <span>●</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="text-4xl">🏷️</div>

              <div>
                <h1 className="text-3xl font-black leading-none text-[#101820]">
                  REMATES
                </h1>

                <p className="mt-1 text-[10px] font-bold tracking-wide text-gray-500">
                  TODO EN UN SOLO LUGAR
                </p>
              </div>
            </div>
          </Link>

          {/* CARRITO */}
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative flex items-center gap-2 text-[#101820]"
          >
            <span className="text-3xl">🛒</span>

            <span className="hidden font-semibold sm:block">
              Carrito
            </span>

            <span className="absolute -right-2 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {cantidadTotal}
            </span>
          </button>
        </div>
      </header>

      {/* RUTA */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-4 text-sm">
          <Link
            href="/"
            className="font-semibold text-gray-500 transition hover:text-red-600"
          >
            Inicio
          </Link>

          <span className="mx-2 text-gray-300">/</span>

          <span className="text-gray-500">
            {producto.categoria}
          </span>

          <span className="mx-2 text-gray-300">/</span>

          <span className="font-semibold text-[#101820]">
            {producto.nombre}
          </span>
        </div>
      </div>

      {/* PRODUCTO */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* GALERÍA */}
          <div>
            {/* IMAGEN PRINCIPAL */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <img
                src={imagenesProducto[imagenSeleccionada]}
                alt={producto.nombre}
                className={`h-[350px] w-full object-cover sm:h-[450px] lg:h-[520px] ${
                  noDisponible
                    ? "opacity-50 grayscale"
                    : ""
                }`}
              />

              {producto.oferta && !noDisponible && (
                <span className="absolute left-5 top-5 rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white shadow-lg">
                  ¡OFERTA!
                </span>
              )}

              {producto.vendido && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="-rotate-12 rounded-lg bg-[#101820] px-8 py-4 text-3xl font-black text-white shadow-xl">
                    VENDIDO
                  </span>
                </div>
              )}
            </div>

            {/* MINIATURAS */}
            {imagenesProducto.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {imagenesProducto.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setImagenSeleccionada(index)
                    }
                    className={`overflow-hidden rounded-lg border-2 bg-gray-100 transition ${
                      imagenSeleccionada === index
                        ? "border-red-600"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={imagen}
                      alt={`${producto.nombre} - imagen ${
                        index + 1
                      }`}
                      className="h-24 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              {producto.categoria}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight text-[#101820] md:text-5xl">
              {producto.nombre}
            </h1>

            {/* ESTADO */}
            {producto.estado && (
              <div className="mt-4">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-[#101820]">
                  Estado: {producto.estado}
                </span>
              </div>
            )}

            {/* PRECIO */}
            <div className="mt-7 border-b border-gray-200 pb-7">
              {producto.precioAnterior && (
                <p className="text-lg text-gray-400 line-through">
                  Antes: $
                  {formatoPrecio(producto.precioAnterior)}
                </p>
              )}

              <p
                className={`mt-1 text-4xl font-black ${
                  noDisponible
                    ? "text-gray-500"
                    : "text-red-600"
                }`}
              >
                ${formatoPrecio(producto.precio)}
              </p>

              {producto.precioAnterior && !noDisponible && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  Precio especial de remate
                </p>
              )}
            </div>

            {/* DISPONIBILIDAD Y STOCK */}
            <div className="mt-6 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    noDisponible
                      ? "bg-gray-400"
                      : "bg-green-500"
                  }`}
                />

                <span
                  className={`font-bold ${
                    noDisponible
                      ? "text-gray-500"
                      : "text-green-700"
                  }`}
                >
                  {producto.vendido
                    ? "Producto vendido"
                    : sinStock
                    ? "Producto sin stock"
                    : "Producto disponible"}
                </span>
              </div>

              {producto.stock !== undefined &&
                !producto.vendido && (
                  <p className="mt-2 text-sm text-gray-600">
                    {producto.stock === 1
                      ? "1 unidad disponible"
                      : `${producto.stock} unidades disponibles`}
                  </p>
                )}
            </div>

            {/* DESCRIPCIÓN */}
            <div className="mt-6 rounded-xl bg-gray-50 p-5">
              <h2 className="text-lg font-black text-[#101820]">
                Descripción
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {producto.descripcion ||
                  "Consulta por WhatsApp para conocer todos los detalles de este producto."}
              </p>
            </div>

            {/* CARACTERÍSTICAS */}
            {producto.caracteristicas &&
              producto.caracteristicas.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-black text-[#101820]">
                    Características
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {producto.caracteristicas.map(
                      (caracteristica, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
                        >
                          <span className="font-black text-red-600">
                            ✓
                          </span>

                          <span className="text-sm text-gray-700">
                            {caracteristica}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* AGREGAR AL CARRITO */}
            <button
              disabled={noDisponible}
              onClick={() => {
                agregarAlCarrito(producto);
                setCarritoAbierto(true);
              }}
              className={`mt-8 w-full rounded-md py-4 text-lg font-black transition ${
                noDisponible
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {producto.vendido
                ? "Producto vendido"
                : sinStock
                ? "Sin stock"
                : "🛒 Agregar al carrito"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              El pago y la entrega se coordinan directamente
              después de confirmar disponibilidad.
            </p>

            <Link
              href="/#productos"
              className="mt-5 block text-center text-sm font-bold text-gray-500 transition hover:text-red-600"
            >
              ← Volver a todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 bg-[#101820] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <h2 className="text-2xl font-black text-red-600">
                REMATES
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Grandes oportunidades, todos los días.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              <p>¿Tienes alguna consulta?</p>

              <button
                onClick={() =>
                  window.open(
                    "https://wa.me/56949474649",
                    "_blank"
                  )
                }
                className="mt-2 font-bold text-white hover:text-red-500"
              >
                Contáctanos por WhatsApp
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
            © 2026 Remates. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      <Carrito />
    </main>
  );
}