"use client";

import { useCarrito } from "./CarritoContext";

export default function Carrito() {
  const {
    carrito, carritoAbierto, cantidadTotal, totalCarrito,
    setCarritoAbierto, aumentarCantidad, disminuirCantidad,
    eliminarProducto, formatoPrecio, enviarPedidoWhatsApp,
  } = useCarrito();

  return (
    <>
      {carritoAbierto && (
        <div onClick={() => setCarritoAbierto(false)} className="fixed inset-0 z-40 bg-black/50" />
      )}

      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${carritoAbierto ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-[#101820]">Tu carrito</h2>
            <p className="text-sm text-gray-500">{cantidadTotal} producto(s)</p>
          </div>
          <button onClick={() => setCarritoAbierto(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-black hover:bg-gray-200">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {carrito.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-6xl">🛒</div>
              <h3 className="mt-4 text-xl font-bold text-[#101820]">Tu carrito está vacío</h3>
              <p className="mt-2 text-sm text-gray-500">Agrega productos para comenzar tu pedido.</p>
              <button
                onClick={() => {
                  setCarritoAbierto(false);
                  setTimeout(() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }), 200);
                }}
                className="mt-6 rounded-md bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {carrito.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-5">
                  <img src={item.imagen} alt={item.nombre} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#101820]">{item.nombre}</h3>
                    <p className="mt-1 font-black text-red-600">${formatoPrecio(item.precio)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-md border border-gray-300">
                        <button onClick={() => disminuirCantidad(item.id)} className="px-3 py-1 text-black hover:bg-gray-100">−</button>
                        <span className="px-3 text-sm font-bold text-black">{item.cantidad}</span>
                        <button onClick={() => aumentarCantidad(item.id)} className="px-3 py-1 text-black hover:bg-gray-100">+</button>
                      </div>
                      <button onClick={() => eliminarProducto(item.id)} className="text-sm font-semibold text-gray-400 hover:text-red-600">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {carrito.length > 0 && (
          <div className="border-t bg-gray-50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-semibold text-gray-600">Total</span>
              <span className="text-2xl font-black text-[#101820]">${formatoPrecio(totalCarrito)}</span>
            </div>
            <button onClick={enviarPedidoWhatsApp} className="w-full rounded-md bg-[#25D366] py-4 font-bold text-white transition hover:opacity-90">
              Hacer pedido por WhatsApp
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">El pago y despacho se coordinan directamente por WhatsApp.</p>
          </div>
        )}
      </aside>
    </>
  );
}
