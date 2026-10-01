"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Producto } from "../components/CarritoContext";
import FormularioProducto from "../components/FormularioProducto";

export default function AdminPage() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [iniciandoSesion, setIniciandoSesion] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] =
    useState<Producto | null>(null);

  const [productoEliminar, setProductoEliminar] =
    useState<Producto | null>(null);

  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const [cambiandoEstadoId, setCambiandoEstadoId] =
    useState<number | null>(null);

  const [recargarProductos, setRecargarProductos] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  /* =========================
     SESIÓN
  ========================= */

  useEffect(() => {
    const comprobarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUsuario(session?.user ?? null);
      setVerificandoSesion(false);
    };

    comprobarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setVerificandoSesion(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     CARGAR PRODUCTOS
  ========================= */

  useEffect(() => {
    if (!usuario) {
      setProductos([]);
      return;
    }

    const cargarProductos = async () => {
      setCargando(true);
      setErrorCarga("");

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);

        setErrorCarga(
          "No se pudieron cargar los productos desde Supabase."
        );

        setCargando(false);
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

      setProductos(productosConvertidos);
      setCargando(false);
    };

    cargarProductos();
  }, [usuario, recargarProductos]);

  /* =========================
     LOGIN
  ========================= */

  const iniciarSesion = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorLogin("");
    setIniciandoSesion(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Error iniciando sesión:", error);

      setErrorLogin(
        "Correo o contraseña incorrectos. Revisa los datos e inténtalo nuevamente."
      );

      setIniciandoSesion(false);
      return;
    }

    setPassword("");
    setIniciandoSesion(false);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    setUsuario(null);
    setProductos([]);
    setEmail("");
    setPassword("");
    setMostrarFormulario(false);
    setProductoEditar(null);
    setProductoEliminar(null);
  };

  /* =========================
     AGREGAR / EDITAR
  ========================= */

  const abrirAgregarProducto = () => {
    setProductoEditar(null);
    setMostrarFormulario(true);
  };

  const abrirEditarProducto = (producto: Producto) => {
    setProductoEditar(producto);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditar(null);
  };

  const productoGuardado = () => {
    setRecargarProductos((valor) => valor + 1);
  };

  /* =========================
     VENDIDO / REACTIVAR
  ========================= */

  const cambiarEstadoVendido = async (producto: Producto) => {
    setCambiandoEstadoId(producto.id);

    const nuevoEstado = !producto.vendido;

    const { error } = await supabase
      .from("productos")
      .update({
        vendido: nuevoEstado,
      })
      .eq("id", producto.id);

    if (error) {
      console.error(
        "Error cambiando estado del producto:",
        error
      );

      alert(
        "No se pudo cambiar el estado del producto. Inténtalo nuevamente."
      );

      setCambiandoEstadoId(null);
      return;
    }

    /*
      Actualizamos inmediatamente la tabla para que
      no sea necesario esperar una recarga.
    */

    setProductos((actuales) =>
      actuales.map((item) =>
        item.id === producto.id
          ? {
              ...item,
              vendido: nuevoEstado,
            }
          : item
      )
    );

    setCambiandoEstadoId(null);
  };

  /* =========================
     ELIMINAR
  ========================= */

  const abrirEliminarProducto = (producto: Producto) => {
    setErrorEliminar("");
    setProductoEliminar(producto);
  };

  const cerrarEliminarProducto = () => {
    if (eliminando) return;

    setProductoEliminar(null);
    setErrorEliminar("");
  };

  const obtenerRutaStorage = (url: string) => {
    const marcador =
      "/storage/v1/object/public/productos/";

    const posicion = url.indexOf(marcador);

    if (posicion === -1) {
      return null;
    }

    const ruta = url.substring(
      posicion + marcador.length
    );

    if (!ruta) {
      return null;
    }

    try {
      return decodeURIComponent(ruta);
    } catch {
      return ruta;
    }
  };

  const eliminarProducto = async () => {
    if (!productoEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    const { error: errorBaseDatos } = await supabase
      .from("productos")
      .delete()
      .eq("id", productoEliminar.id);

    if (errorBaseDatos) {
      console.error(
        "Error eliminando producto:",
        errorBaseDatos
      );

      setErrorEliminar(
        "No se pudo eliminar el producto. Inténtalo nuevamente."
      );

      setEliminando(false);
      return;
    }

    const urlsImagenes =
      productoEliminar.imagenes &&
      productoEliminar.imagenes.length > 0
        ? productoEliminar.imagenes
        : productoEliminar.imagen
          ? [productoEliminar.imagen]
          : [];

    const rutasStorage = Array.from(
      new Set(
        urlsImagenes
          .map(obtenerRutaStorage)
          .filter(
            (ruta): ruta is string =>
              ruta !== null
          )
      )
    );

    if (rutasStorage.length > 0) {
      const { error: errorStorage } =
        await supabase.storage
          .from("productos")
          .remove(rutasStorage);

      if (errorStorage) {
        console.error(
          "Producto eliminado, pero hubo un problema limpiando sus imágenes:",
          errorStorage
        );
      }
    }

    setProductoEliminar(null);
    setEliminando(false);

    setRecargarProductos((valor) => valor + 1);
  };

  /* =========================
     UTILIDADES
  ========================= */

  const formatoPrecio = (precio: number) => {
    return precio.toLocaleString("es-CL");
  };

  const totalProductos = productos.length;

  const disponibles = productos.filter(
    (producto) =>
      !producto.vendido &&
      (producto.stock === undefined || producto.stock > 0)
  ).length;

  const vendidos = productos.filter(
    (producto) => producto.vendido
  ).length;

  const sinStock = productos.filter(
    (producto) =>
      !producto.vendido &&
      producto.stock !== undefined &&
      producto.stock <= 0
  ).length;

  /* =========================
     CARGANDO SESIÓN
  ========================= */

  if (verificandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6">
        <div className="text-center">
          <div className="text-5xl">🔐</div>

          <p className="mt-4 font-bold text-[#101820]">
            Verificando acceso...
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     LOGIN
  ========================= */

  if (!usuario) {
    return (
      <main className="min-h-screen bg-[#f5f6f8]">
        <header className="bg-[#101820] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                Administración
              </p>

              <h1 className="mt-1 text-2xl font-black">
                REMATES
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold transition hover:border-white"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-92px)] max-w-7xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
                🔐
              </div>

              <h2 className="mt-5 text-3xl font-black text-[#101820]">
                Acceso administrador
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Ingresa con tu cuenta de administración para
                gestionar los productos de la tienda.
              </p>
            </div>

            <form
              onSubmit={iniciarSesion}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#101820]"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.cl"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-[#101820]"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {errorLogin && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-600">
                    {errorLogin}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={iniciandoSesion}
                className="w-full rounded-lg bg-red-600 px-5 py-3.5 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {iniciandoSesion
                  ? "Ingresando..."
                  : "Ingresar al panel"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-gray-400">
              Área privada de administración.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PANEL
  ========================= */

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* HEADER */}

      <header className="bg-[#101820] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
              Administración
            </p>

            <h1 className="mt-1 text-2xl font-black">
              REMATES
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold transition hover:border-white"
            >
              ← Ver tienda
            </Link>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* CABECERA PANEL */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-black text-[#101820]">
              Panel de administración
            </h2>

            <p className="mt-2 text-gray-500">
              Administra los productos publicados en tu tienda.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Sesión iniciada como: {usuario.email}
            </p>
          </div>

          <button
            type="button"
            onClick={abrirAgregarProducto}
            className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            + Agregar producto
          </button>
        </div>

        {/* CONTADORES */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total productos
            </p>

            <p className="mt-2 text-3xl font-black text-[#101820]">
              {totalProductos}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Disponibles
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {disponibles}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Vendidos
            </p>

            <p className="mt-2 text-3xl font-black text-gray-500">
              {vendidos}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Sin stock
            </p>

            <p className="mt-2 text-3xl font-black text-orange-500">
              {sinStock}
            </p>
          </div>
        </section>

        {/* PRODUCTOS */}

        <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-black text-[#101820]">
              Productos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Productos guardados actualmente en Supabase.
            </p>
          </div>

          {cargando && (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">🏷️</div>

              <p className="mt-4 font-bold text-[#101820]">
                Cargando productos...
              </p>
            </div>
          )}

          {!cargando && errorCarga && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-5">
              <p className="font-bold text-red-600">
                Error
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {errorCarga}
              </p>
            </div>
          )}

          {!cargando &&
            !errorCarga &&
            productos.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="text-5xl">📦</div>

                <h3 className="mt-4 text-xl font-black text-[#101820]">
                  No hay productos
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Todavía no existen productos guardados.
                </p>
              </div>
            )}

          {!cargando &&
            !errorCarga &&
            productos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-4">
                        Producto
                      </th>

                      <th className="px-6 py-4">
                        Categoría
                      </th>

                      <th className="px-6 py-4">
                        Precio
                      </th>

                      <th className="px-6 py-4">
                        Stock
                      </th>

                      <th className="px-6 py-4">
                        Estado
                      </th>

                      <th className="px-6 py-4 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {productos.map((producto) => {
                      const agotado =
                        producto.stock !== undefined &&
                        producto.stock <= 0;

                      const cambiando =
                        cambiandoEstadoId === producto.id;

                      return (
                        <tr
                          key={producto.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="h-14 w-14 rounded-lg object-cover"
                              />

                              <div>
                                <p className="font-bold text-[#101820]">
                                  {producto.nombre}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  ID: {producto.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {producto.categoria}
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-black text-[#101820]">
                              $
                              {formatoPrecio(
                                producto.precio
                              )}
                            </p>

                            {producto.precioAnterior && (
                              <p className="text-xs text-gray-400 line-through">
                                $
                                {formatoPrecio(
                                  producto.precioAnterior
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`font-bold ${
                                agotado
                                  ? "text-red-600"
                                  : "text-[#101820]"
                              }`}
                            >
                              {producto.stock !== undefined
                                ? producto.stock
                                : "—"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {producto.vendido ? (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                Vendido
                              </span>
                            ) : agotado ? (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                Sin stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                                Disponible
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {/* VENDIDO / REACTIVAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoVendido(
                                    producto
                                  )
                                }
                                disabled={cambiando}
                                className={`rounded-md px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  producto.vendido
                                    ? "border border-green-200 text-green-700 hover:bg-green-600 hover:text-white"
                                    : "border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"
                                }`}
                              >
                                {cambiando
                                  ? "Guardando..."
                                  : producto.vendido
                                    ? "Reactivar"
                                    : "Marcar vendido"}
                              </button>

                              {/* VER */}

                              <Link
                                href={`/producto/${producto.id}`}
                                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                              >
                                Ver
                              </Link>

                              {/* EDITAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  abrirEditarProducto(
                                    producto
                                  )
                                }
                                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-[#101820] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                              >
                                Editar
                              </button>

                              {/* ELIMINAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  abrirEliminarProducto(
                                    producto
                                  )
                                }
                                className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </section>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="font-bold text-[#101820]">
            🔐 Panel protegido
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            Puedes agregar, editar, marcar como vendido,
            reactivar y eliminar productos. Los cambios se
            guardan directamente en Supabase.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <FormularioProducto
          onCerrar={cerrarFormulario}
          onProductoGuardado={productoGuardado}
          productoEditar={productoEditar}
        />
      )}

      {/* CONFIRMACIÓN ELIMINAR */}

      {productoEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
              🗑️
            </div>

            <h2 className="mt-5 text-center text-2xl font-black text-[#101820]">
              ¿Eliminar producto?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-500">
              Estás a punto de eliminar
              <strong className="text-[#101820]">
                {" "}
                {productoEliminar.nombre}
              </strong>
              .
            </p>

            <p className="mt-2 text-center text-sm font-semibold text-red-600">
              Esta acción no se puede deshacer.
            </p>

            {errorEliminar && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-600">
                  {errorEliminar}
                </p>
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={cerrarEliminarProducto}
                disabled={eliminando}
                className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={eliminarProducto}
                disabled={eliminando}
                className="flex-1 rounded-lg bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {eliminando
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}