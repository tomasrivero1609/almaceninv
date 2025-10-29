"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, Sale } from "@/types";
import { getProducts, getSales, addMultiSale } from "@/lib/storage";

type CartItem = { productId: string; quantity: string };

export default function SalidasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([{ productId: "", quantity: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const availableProducts = useMemo(() => products.filter((p) => p.currentStock > 0), [products]);

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([getProducts(), getSales()]);
      setProducts(p);
      setSales(s);
    };
    load();
  }, []);

  const validateCart = () => {
    if (cart.length === 0) return false;
    for (const line of cart) {
      if (!line.productId) return false;
      const qty = parseFloat(line.quantity);
      if (!isFinite(qty) || qty <= 0) return false;
      const prod = products.find((p) => p.id === line.productId);
      if (!prod) return false;
      if (qty > prod.currentStock) return false;
    }
    const seen = new Set<string>();
    for (const line of cart) {
      if (seen.has(line.productId)) return false;
      seen.add(line.productId);
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCart()) return;
    setSubmitting(true);
    try {
      const items = cart.map((c) => ({ productId: c.productId, quantity: parseFloat(c.quantity) }));
      await addMultiSale(items);
      const [p, s] = await Promise.all([getProducts(), getSales()]);
      setProducts(p);
      setSales(s);
      setShowModal(false);
      setCart([{ productId: "", quantity: "" }]);
    } catch (err) {
      alert("No se pudo registrar la venta múltiple. Verifica stock y precios.");
    } finally {
      setSubmitting(false);
    }
  };

  const linePrice = (productId: string) => products.find((p) => p.id === productId)?.salePrice ?? 0;
  const cartTotal = cart.reduce((sum, line) => sum + (parseFloat(line.quantity) || 0) * linePrice(line.productId), 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">�Y"� Salidas (Ventas)</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
        >
          �z Registrar Venta
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-12 text-center border border-purple-500/30 ai-glow">
          <p className="text-purple-300 text-lg mb-4">No hay ventas registradas</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
          >
            Registrar primera venta
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-purple-500/30 ai-glow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-500/20">
              <thead className="bg-purple-950/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Ingresos Totales</th>
                </tr>
              </thead>
              <tbody className="bg-purple-900/20 divide-y divide-purple-500/20">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-purple-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      <div>
                        <div className="font-medium">{sale.productName}</div>
                        <div className="text-purple-300 text-xs">{sale.productCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">{sale.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">${sale.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">${sale.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-violet-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-2xl w-full border border-purple-500/30 ai-glow">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-6">�Y"� Registrar Venta (Carrito)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {cart.map((line, idx) => {
                const prod = products.find((p) => p.id === line.productId);
                const unit = prod?.salePrice ?? 0;
                const max = prod?.currentStock ?? 0;
                const subtotal = (parseFloat(line.quantity) || 0) * unit;
                const alreadySelected = new Set(cart.map((c) => c.productId).filter(Boolean));
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-purple-800/20 rounded-lg border border-purple-500/20">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-purple-300 mb-1">Producto</label>
                      <select
                        required
                        value={line.productId}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, productId: v } : c)));
                        }}
                        className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                      >
                        <option value="">Seleccionar producto</option>
                        {availableProducts.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={alreadySelected.has(p.id) && p.id !== line.productId}
                            className="bg-purple-900 text-purple-100"
                          >
                            {p.code} - {p.name} (Stock: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-purple-300 mb-1">Cantidad</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0.01}
                        max={max}
                        required
                        value={line.quantity}
                        onChange={(e) => {
                          setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, quantity: e.target.value } : c)));
                        }}
                        className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                        placeholder="0.00"
                      />
                      {line.productId && (
                        <p className="mt-1 text-xs text-purple-300">Stock disp.: <span className="text-purple-100 font-semibold">{max}</span></p>
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <div className="w-full">
                        <p className="text-sm text-purple-300">P. unitario</p>
                        <p className="text-purple-100 font-semibold">${unit.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                        className="w-full bg-red-900/40 hover:bg-red-800/40 text-red-200 py-2 rounded-lg font-medium transition-all border border-red-500/30"
                        aria-label="Eliminar línea"
                      >
                        �Y-'��?
                      </button>
                    </div>
                    <div className="md:col-span-12 text-right">
                      <p className="text-sm text-purple-300">Subtotal: <span className="text-green-400 font-semibold">${subtotal.toFixed(2)}</span></p>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCart((prev) => [...prev, { productId: "", quantity: "" }])}
                  className="bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 px-4 py-2 rounded-lg font-medium transition-all border border-purple-500/30"
                >
                  Agregar producto
                </button>
                <div className="text-right">
                  <p className="text-sm text-purple-300">Total: <span className="text-green-400 font-semibold">${cartTotal.toFixed(2)}</span></p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!validateCart() || submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 disabled:opacity-60 hover:from-purple-700 hover:to-violet-700 text-white py-2 rounded-lg font-medium transition-all ai-glow-hover"
                >
                  {submitting ? "Procesando..." : "Registrar Venta"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCart([{ productId: "", quantity: "" }]);
                  }}
                  className="flex-1 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 py-2 rounded-lg font-medium transition-all border border-purple-500/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

