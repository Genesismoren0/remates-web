"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import type {
  EstadoProducto,
  Producto,
} from "./CarritoContext";

type FormularioProductoProps = {
  onCerrar: () => void;
  onProductoGuardado: () => void;
  productoEditar?: Producto | null;
};

const categorias = [
  "Electrodomésticos",
  "Hogar",
  "Tecnología",
  "Herramientas",
  "Accesorios Auto",
  "Vehículos",
  "Otros",
];

export default function FormularioProducto({
  onCerrar,
  onProductoGuardado,
  productoEditar = null,
}: FormularioProductoProps) {
  const editando = Boolean(productoEditar);

  const [nombre, setNombre] = useState(
    productoEditar?.nombre || ""
  );

  const [categoria, setCategoria] = useState(
    productoEditar?.categoria || "Electrodomésticos"
  );

  const [precioAnterior, setPrecioAnterior] = useState(
    productoEditar?.precioAnterior?.toString() || ""
  );

  const [precio, setPrecio] = useState(
    productoEditar?.precio?.toString() || ""
  );

  const [estado, setEstado] = useState<EstadoProducto>(
    productoEditar?.estado || "Nuevo"
  );

  const [stock, setStock] = useState(
    productoEditar?.stock?.toString() ?? "1"
  );

  const [descripcion, setDescripcion] = useState(
    productoEditar?.descripcion || ""
  );

  const [caracteristicasTexto, setCaracteristicasTexto] =
    useState(
      productoEditar?.caracteristicas?.join("\n") || ""
    );

  const [oferta, setOferta] = useState(
    productoEditar?.oferta || false
  );

  const [vendido, setVendido] = useState(
    productoEditar?.vendido || false
  );

  const imagenesIniciales =
    productoEditar?.imagenes &&
    productoEditar.imagenes.length > 0
      ? productoEditar.imagenes
      : productoEditar?.imagen
        ? [productoEditar.imagen]
        : [];

  const [imagenesExistentes, setImagenesExistentes] =
    useState<string[]>(imagenesIniciales);

  const [archivosNuevos, setArchivosNuevos] = useState<
    File[]
  >([]);

  const [vistasPrevias, setVistasPrevias] = useState<
    string[]
  >([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     VISTAS PREVIAS NUEVAS
  ========================= */

  useEffect(() => {
    const urls = archivosNuevos.map((archivo) =>
      URL.createObjectURL(archivo)
    );

    setVistasPrevias(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [archivosNuevos]);

  /* =========================
     SELECCIONAR FOTOS NUEVAS
  ========================= */

  const seleccionarFotos = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const seleccionadas = Array.from(
      e.target.files || []
    );

    if (seleccionadas.length === 0) {
      return;
    }

    const soloImagenes = seleccionadas.filter((archivo) =>
      archivo.type.startsWith("image/")
    );

    if (soloImagenes.length !== seleccionadas.length) {
      setError(
        "Solo puedes seleccionar archivos de imagen."
      );
      return;
    }

    setError("");

    setArchivosNuevos((actuales) => [
      ...actuales,
      ...soloImagenes,
    ]);

    e.target.value = "";
  };

  /* =========================
     QUITAR FOTO EXISTENTE
  ========================= */

  const quitarFotoExistente = (indice: number) => {
    setImagenesExistentes((actuales) =>
      actuales.filter((_, i) => i !== indice)
    );
  };

  /* =========================
     QUITAR FOTO NUEVA
  ========================= */

  const quitarFotoNueva = (indice: number) => {
    setArchivosNuevos((actuales) =>
      actuales.filter((_, i) => i !== indice)
    );
  };

  /* =========================
     SUBIR FOTOS NUEVAS
  ========================= */

  const subirFotosNuevas = async () => {
    const urlsPublicas: string[] = [];

    for (let i = 0; i < archivosNuevos.length; i++) {
      const archivo = archivosNuevos[i];

      const extension =
        archivo.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const nombreSeguro = archivo.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const identificador =
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${i}`;

      const nombreArchivo = `${identificador}-${nombreSeguro}.${extension}`;

      const rutaArchivo = `productos/${nombreArchivo}`;

      const { error: errorSubida } =
        await supabase.storage
          .from("productos")
          .upload(rutaArchivo, archivo, {
            cacheControl: "3600",
            upsert: false,
            contentType: archivo.type,
          });

      if (errorSubida) {
        console.error(
          "Error subiendo imagen:",
          errorSubida
        );

        throw new Error(
          `No se pudo subir la imagen ${archivo.name}.`
        );
      }

      const { data } = supabase.storage
        .from("productos")
        .getPublicUrl(rutaArchivo);

      urlsPublicas.push(data.publicUrl);
    }

    return urlsPublicas;
  };

  /* =========================
     GUARDAR / EDITAR
  ========================= */

  const guardarProducto = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!nombre.trim()) {
      setError("Debes ingresar el nombre del producto.");
      return;
    }

    if (precio === "" || Number(precio) < 0) {
      setError("Debes ingresar un precio válido.");
      return;
    }

    if (
      precioAnterior !== "" &&
      Number(precioAnterior) < 0
    ) {
      setError(
        "El precio anterior no puede ser negativo."
      );
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setError("Debes ingresar un stock válido.");
      return;
    }

    if (
      imagenesExistentes.length === 0 &&
      archivosNuevos.length === 0
    ) {
      setError(
        "Debes mantener o seleccionar al menos una foto."
      );
      return;
    }

    setGuardando(true);

    try {
      const nuevasUrls = await subirFotosNuevas();

      const todasLasImagenes = [
        ...imagenesExistentes,
        ...nuevasUrls,
      ];

      const imagenPrincipal = todasLasImagenes[0];

      const caracteristicas = caracteristicasTexto
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const datosProducto = {
        nombre: nombre.trim(),
        categoria,

        precio_anterior:
          precioAnterior !== ""
            ? Number(precioAnterior)
            : null,

        precio: Number(precio),

        imagen: imagenPrincipal,
        imagenes: todasLasImagenes,

        oferta,
        vendido,
        estado,
        stock: Number(stock),

        descripcion:
          descripcion.trim() || null,

        caracteristicas,
      };

      if (productoEditar) {
        const { error: errorSupabase } = await supabase
          .from("productos")
          .update(datosProducto)
          .eq("id", productoEditar.id);

        if (errorSupabase) {
          console.error(
            "Error editando producto:",
            errorSupabase
          );

          throw new Error(
            "No se pudieron guardar los cambios del producto."
          );
        }
      } else {
        const { error: errorSupabase } = await supabase
          .from("productos")
          .insert(datosProducto);

        if (errorSupabase) {
          console.error(
            "Error guardando producto:",
            errorSupabase
          );

          throw new Error(
            "No se pudo guardar el producto."
          );
        }
      }

      setGuardando(false);
      onProductoGuardado();
      onCerrar();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el producto."
      );

      setGuardando(false);
    }
  };

  const totalFotos =
    imagenesExistentes.length + archivosNuevos.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        {/* CABECERA */}

        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
              Administración
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#101820]">
              {editando
                ? "Editar producto"
                : "Agregar producto"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editando
                ? "Modifica la información del producto y guarda los cambios."
                : "Completa la información del producto que quieres publicar."}
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500 transition hover:bg-gray-200 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={guardarProducto}
          className="space-y-6 p-6"
        >
          {/* NOMBRE */}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#101820]">
              Nombre del producto *
            </label>

            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder='Ej: Smart TV LG 50"'
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* CATEGORÍA / ESTADO */}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#101820]">
                Categoría *
              </label>

              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#101820] outline-none focus:border-red-500"
              >
                {categorias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#101820]">
                Estado *
              </label>

              <select
                value={estado}
                onChange={(e) =>
                  setEstado(
                    e.target.value as EstadoProducto
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#101820] outline-none focus:border-red-500"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Usado">Usado</option>
                <option value="Reacondicionado">
                  Reacondicionado
                </option>
              </select>
            </div>
          </div>

          {/* PRECIOS */}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#101820]">
                Precio anterior
              </label>

              <input
                type="number"
                min="0"
                value={precioAnterior}
                onChange={(e) =>
                  setPrecioAnterior(e.target.value)
                }
                placeholder="Ej: 369990"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Déjalo vacío si no existe un precio anterior.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#101820]">
                Precio remate *
              </label>

              <input
                type="number"
                required
                min="0"
                value={precio}
                onChange={(e) =>
                  setPrecio(e.target.value)
                }
                placeholder="Ej: 249990"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* STOCK */}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#101820]">
              Stock *
            </label>

            <input
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500"
            />
          </div>

          {/* FOTOS */}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#101820]">
              Fotos del producto *
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-red-400 hover:bg-red-50">
              <span className="text-4xl">📷</span>

              <span className="mt-3 font-black text-[#101820]">
                {editando
                  ? "Agregar más fotos"
                  : "Seleccionar fotos"}
              </span>

              <span className="mt-1 text-sm text-gray-500">
                Puedes seleccionar una o varias imágenes
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={seleccionarFotos}
                disabled={guardando}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-gray-400">
              La primera foto de la lista será la imagen
              principal del producto.
            </p>

            {totalFotos > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#101820]">
                    Fotos del producto
                  </p>

                  <p className="text-xs text-gray-400">
                    {totalFotos}{" "}
                    {totalFotos === 1 ? "foto" : "fotos"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {/* EXISTENTES */}

                  {imagenesExistentes.map(
                    (url, indice) => (
                      <div
                        key={`existente-${url}-${indice}`}
                        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <img
                          src={url}
                          alt={`Foto ${indice + 1}`}
                          className="h-40 w-full object-cover"
                        />

                        {indice === 0 && (
                          <div className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                            Principal
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            quitarFotoExistente(indice)
                          }
                          disabled={guardando}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 font-bold text-white transition hover:bg-red-600"
                          title="Quitar foto"
                        >
                          ×
                        </button>

                        <div className="px-3 py-2 text-xs text-gray-500">
                          Foto guardada
                        </div>
                      </div>
                    )
                  )}

                  {/* NUEVAS */}

                  {vistasPrevias.map((url, indice) => {
                    const esPrincipal =
                      imagenesExistentes.length === 0 &&
                      indice === 0;

                    return (
                      <div
                        key={`nueva-${url}`}
                        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <img
                          src={url}
                          alt={`Foto nueva ${indice + 1}`}
                          className="h-40 w-full object-cover"
                        />

                        {esPrincipal && (
                          <div className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                            Principal
                          </div>
                        )}

                        <div className="absolute bottom-10 left-2 rounded-full bg-[#101820] px-3 py-1 text-xs font-bold text-white">
                          Nueva
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            quitarFotoNueva(indice)
                          }
                          disabled={guardando}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 font-bold text-white transition hover:bg-red-600"
                          title="Quitar foto"
                        >
                          ×
                        </button>

                        <div className="truncate px-3 py-2 text-xs text-gray-500">
                          {archivosNuevos[indice]?.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPCIÓN */}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#101820]">
              Descripción
            </label>

            <textarea
              rows={5}
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              placeholder="Describe el producto, su condición y cualquier información importante..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500"
            />
          </div>

          {/* CARACTERÍSTICAS */}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#101820]">
              Características
            </label>

            <textarea
              rows={5}
              value={caracteristicasTexto}
              onChange={(e) =>
                setCaracteristicasTexto(e.target.value)
              }
              placeholder={
                'Pantalla 55"\nSmart TV\nWi-Fi\nResolución 4K'
              }
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-[#101820] outline-none focus:border-red-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Escribe una característica por línea.
            </p>
          </div>

          {/* OPCIONES */}

          <div className="grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={oferta}
                onChange={(e) =>
                  setOferta(e.target.checked)
                }
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold text-[#101820]">
                  Producto en oferta
                </p>

                <p className="text-xs text-gray-500">
                  Mostrará la etiqueta OFERTA.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={vendido}
                onChange={(e) =>
                  setVendido(e.target.checked)
                }
                className="h-5 w-5 accent-red-600"
              />

              <div>
                <p className="font-bold text-[#101820]">
                  Marcar como vendido
                </p>

                <p className="text-xs text-gray-500">
                  No podrá agregarse al carrito.
                </p>
              </div>
            </label>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* BOTONES */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-red-600 px-7 py-3 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {guardando
                ? editando
                  ? "Guardando cambios..."
                  : "Subiendo fotos y guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}