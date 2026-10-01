"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Carrito from "./components/Carrito";
import {
  useCarrito,
  type Producto,
} from "./components/CarritoContext";
import { categorias } from "./data/productos";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("Todas");

  const [productosSupabase, setProductosSupabase] = useState<
    Producto[]
  >([]);

  const [cargandoProductos, setCargandoProductos] =
    useState(true);

  /* =========================
     CARGAR PRODUCTOS
  ========================= */

  useEffect(() => {
    const cargarProductos = async () => {
      setCargandoProductos(true);

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
        setCargandoProductos(false);
        return;
      }

      const productosConvertidos: Producto[] = (data || []).map(
        (item) => ({
          id: Number(item.id),

          nombre: item.nombre || "",

          categoria: item.categoria || "Otros",

          precioAnterior:
            item.precio_anterior === null ||
            item.precio_anterior === undefined
              ? null
              : Number(item.precio_anterior),

          precio: Number(item.precio || 0),

          imagen: item.imagen || "",

          imagenes: Array.isArray(item.imagenes)
            ? item.imagenes
            : [],

          oferta: Boolean(item.oferta),

          vendido: Boolean(item.vendido),

          descripcion: item.descripcion || undefined,

          estado:
            item.estado === "Nuevo" ||
            item.estado === "Usado" ||
            item.estado === "Reacondicionado"
              ? item.estado
              : undefined,

          stock:
            item.stock === null || item.stock === undefined
              ? undefined
              : Number(item.stock),

          caracteristicas: Array.isArray(item.caracteristicas)
            ? item.caracteristicas
            : [],
        })
      );

      setProductosSupabase(productosConvertidos);
      setCargandoProductos(false);
    };

    cargarProductos();
  }, []);

  /* =========================
     CARRITO
  ========================= */

  const {
    cantidadTotal,
    setCarritoAbierto,
    agregarAlCarrito,
    formatoPrecio,
  } = useCarrito();

  /* =========================
     FILTROS
  ========================= */

  const productosFiltrados = productosSupabase.filter(
    (producto) => {
      const coincideBusqueda =
        producto.nombre
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        producto.categoria
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        producto.categoria === categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    }
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSeleccionada("Todas");
  };

  const irAProductos = () => {
    document
      .getElementById("productos")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* =========================
     PRODUCTOS HERO
  ========================= */

  /*
    IMPORTANTE:
    El hero solamente muestra productos que realmente
    están disponibles para comprar.

    - No muestra vendidos.
    - No muestra productos con stock 0.
    - Muestra como máximo 3.
  */

  const productosHero = productosSupabase
    .filter(
      (producto) =>
        !producto.vendido &&
        (producto.stock === undefined ||
          producto.stock > 0)
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* =========================
          BARRA SUPERIOR
      ========================= */}

      <div className="bg-[#101820] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <p>
            ¡Grandes oportunidades, todos los días!
          </p>

          <div className="flex items-center gap-3">
            <span>Síguenos</span>
            <span>●</span>
            <span>●</span>
            <span>●</span>
          </div>
        </div>
      </div>

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-5">
          {/* LOGO */}

          <button
            onClick={limpiarFiltros}
            className="min-w-fit text-left"
          >
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
          </button>

          {/* BUSCADOR ESCRITORIO */}

          <div className="hidden flex-1 sm:flex">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  irAProductos();
                }
              }}
              className="w-full rounded-l-md border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-red-500"
            />

            <button
              onClick={irAProductos}
              className="rounded-r-md bg-red-600 px-5 text-xl text-white transition hover:bg-red-700"
            >
              🔍
            </button>
          </div>

          {/* CARRITO */}

          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative ml-auto flex items-center gap-2 text-[#101820]"
          >
            <span className="text-3xl">🛒</span>

            <span className="hidden font-semibold md:block">
              Carrito
            </span>

            <span className="absolute -right-2 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {cantidadTotal}
            </span>
          </button>
        </div>

        {/* BUSCADOR MÓVIL */}

        <div className="mx-auto flex max-w-7xl px-6 pb-4 sm:hidden">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                irAProductos();
              }
            }}
            className="w-full rounded-l-md border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-red-500"
          />

          <button
            onClick={irAProductos}
            className="rounded-r-md bg-red-600 px-5 text-white"
          >
            🔍
          </button>
        </div>

        {/* CATEGORÍAS */}

        <nav className="border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-6 py-4">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => {
                  setCategoriaSeleccionada(categoria);

                  setTimeout(() => {
                    document
                      .getElementById("productos")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }, 50);
                }}
                className={`whitespace-nowrap border-b-2 pb-1 text-sm font-semibold transition ${
                  categoriaSeleccionada === categoria
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-700 hover:text-red-600"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* =========================
          HERO
      ========================= */}

      <section className="bg-[#161d25] text-white">
        <div className="mx-auto grid min-h-[420px] max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          {/* TEXTO */}

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-red-500">
              Oportunidades reales
            </p>

            <h2 className="text-5xl font-black uppercase leading-tight md:text-6xl">
              Grandes{" "}
              <span className="text-red-600">
                Remates
              </span>
            </h2>

            <p className="mt-4 text-xl font-bold">
              De todo tipo de productos
            </p>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-300">
              <span>✓ Calidad</span>
              <span>✓ Precios increíbles</span>
              <span>✓ Nuevos y usados</span>
            </div>

            <a
              href="#productos"
              className="mt-8 inline-block rounded-md bg-red-600 px-8 py-4 font-bold text-white transition hover:bg-red-700"
            >
              VER PRODUCTOS
            </a>
          </div>

          {/* PRODUCTOS HERO */}

          <div className="relative hidden h-[330px] md:block">
            {/* PRODUCTO 1 */}

            {productosHero[0] && (
              <Link
                href={`/producto/${productosHero[0].id}`}
                className={`absolute overflow-hidden rounded-xl bg-white shadow-2xl transition hover:scale-105 ${
                  productosHero.length === 1
                    ? "left-1/2 top-1/2 h-[270px] w-[330px] -translate-x-1/2 -translate-y-1/2"
                    : "left-0 top-10 h-[210px] w-[230px]"
                }`}
              >
                <img
                  src={productosHero[0].imagen}
                  alt={productosHero[0].nombre}
                  className="h-full w-full object-cover"
                />
              </Link>
            )}

            {/* PRODUCTO 2 */}

            {productosHero[1] && (
              <Link
                href={`/producto/${productosHero[1].id}`}
                className={`absolute z-20 overflow-hidden rounded-xl bg-white shadow-2xl transition hover:scale-105 ${
                  productosHero.length === 2
                    ? "bottom-5 right-5 h-[210px] w-[260px] rotate-[4deg]"
                    : "bottom-0 left-[160px] h-[150px] w-[180px] rotate-[-5deg]"
                }`}
              >
                <img
                  src={productosHero[1].imagen}
                  alt={productosHero[1].nombre}
                  className="h-full w-full object-cover"
                />
              </Link>
            )}

            {/* PRODUCTO 3 */}

            {productosHero[2] && (
              <Link
                href={`/producto/${productosHero[2].id}`}
                className="absolute bottom-5 right-0 z-10 h-[190px] w-[280px] overflow-hidden rounded-xl bg-white shadow-2xl transition hover:scale-105"
              >
                <img
                  src={productosHero[2].imagen}
                  alt={productosHero[2].nombre}
                  className="h-full w-full object-cover"
                />
              </Link>
            )}

            {/* ETIQUETA */}

            {productosHero.length > 0 && (
              <div className="absolute right-5 top-3 z-30 rotate-[-5deg] bg-red-600 px-6 py-3 font-black uppercase text-white shadow-xl">
                Oportunidades reales
              </div>
            )}

            {/* SIN PRODUCTOS DISPONIBLES */}

            {!cargandoProductos &&
              productosHero.length === 0 && (
                <div className="flex h-full items-center justify-center rounded-xl border border-gray-700 bg-[#101820]">
                  <div className="text-center">
                    <div className="text-5xl">🏷️</div>

                    <p className="mt-3 font-bold text-gray-300">
                      Próximamente nuevas oportunidades
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =========================
          PRODUCTOS
      ========================= */}

      <section
        id="productos"
        className="mx-auto max-w-7xl scroll-mt-10 px-6 py-12"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#101820]">
              {categoriaSeleccionada === "Todas"
                ? "Productos destacados"
                : categoriaSeleccionada}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {busqueda
                ? `Resultados para "${busqueda}"`
                : "Descubre nuestras mejores oportunidades."}
            </p>
          </div>

          {(busqueda ||
            categoriaSeleccionada !== "Todas") && (
            <button
              onClick={limpiarFiltros}
              className="self-start text-sm font-bold text-red-600 hover:underline sm:self-auto"
            >
              Ver todos →
            </button>
          )}
        </div>

        {/* CARGANDO */}

        {cargandoProductos && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <div className="text-5xl">🏷️</div>

            <p className="mt-4 font-bold text-[#101820]">
              Cargando productos...
            </p>
          </div>
        )}

        {/* SIN RESULTADOS */}

        {!cargandoProductos &&
          productosFiltrados.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <div className="text-5xl">🔍</div>

              <h3 className="mt-4 text-xl font-bold text-[#101820]">
                No encontramos productos
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Prueba con otra búsqueda o selecciona otra
                categoría.
              </p>

              <button
                onClick={limpiarFiltros}
                className="mt-6 rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Ver todos los productos
              </button>
            </div>
          )}

        {/* GRILLA */}

        {!cargandoProductos &&
          productosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productosFiltrados.map((producto) => {
                const agotado =
                  producto.stock !== undefined &&
                  producto.stock <= 0;

                const noDisponible =
                  producto.vendido || agotado;

                return (
                  <article
                    key={producto.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* IMAGEN */}

                    <Link
                      href={`/producto/${producto.id}`}
                      className="block"
                    >
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                            noDisponible
                              ? "opacity-40 grayscale"
                              : ""
                          }`}
                        />

                        {/* OFERTA */}

                        {producto.oferta &&
                          !noDisponible && (
                            <span className="absolute right-3 top-3 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">
                              ¡OFERTA!
                            </span>
                          )}

                        {/* VENDIDO */}

                        {producto.vendido && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="-rotate-12 rounded-md bg-[#101820] px-5 py-2 text-xl font-black text-white shadow-lg">
                              VENDIDO
                            </span>
                          </div>
                        )}

                        {/* SIN STOCK */}

                        {!producto.vendido &&
                          agotado && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="-rotate-12 rounded-md bg-orange-500 px-5 py-2 text-xl font-black text-white shadow-lg">
                                SIN STOCK
                              </span>
                            </div>
                          )}
                      </div>
                    </Link>

                    {/* INFORMACIÓN */}

                    <div className="p-5">
                      <p className="mb-1 text-xs font-medium text-gray-400">
                        {producto.categoria}
                      </p>

                      <Link
                        href={`/producto/${producto.id}`}
                      >
                        <h3 className="min-h-12 text-lg font-bold text-[#101820] transition hover:text-red-600">
                          {producto.nombre}
                        </h3>
                      </Link>

                      <div className="mt-3">
                        {producto.precioAnterior && (
                          <p className="text-sm text-gray-400 line-through">
                            $
                            {formatoPrecio(
                              producto.precioAnterior
                            )}
                          </p>
                        )}

                        <p
                          className={`text-2xl font-black ${
                            noDisponible
                              ? "text-gray-500"
                              : "text-red-600"
                          }`}
                        >
                          $
                          {formatoPrecio(
                            producto.precio
                          )}
                        </p>
                      </div>

                      {/* VER PRODUCTO */}

                      <Link
                        href={`/producto/${producto.id}`}
                        className="mt-4 block w-full rounded-md border-2 border-[#101820] py-2.5 text-center text-sm font-bold text-[#101820] transition hover:bg-[#101820] hover:text-white"
                      >
                        Ver producto
                      </Link>

                      {/* CARRITO */}

                      <button
                        disabled={noDisponible}
                        onClick={() =>
                          agregarAlCarrito(producto)
                        }
                        className={`mt-2 w-full rounded-md py-3 text-sm font-bold transition ${
                          noDisponible
                            ? "cursor-not-allowed bg-gray-300 text-gray-600"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {producto.vendido
                          ? "Vendido"
                          : agotado
                            ? "Sin stock"
                            : "🛒 Agregar al carrito"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      {/* =========================
          FOOTER
      ========================= */}

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