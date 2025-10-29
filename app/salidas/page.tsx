"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, Sale } from "@/types";
import { getProducts, getSales, addMultiSale } from "@/lib/storage";
import { useToastContext } from '@/components/ToastProvider';

type CartItem = { productId: string; quantity: string };

export default function SalidasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([{ productId: "", quantity: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const availableProducts = useMemo(() => products.filter((p) => p.currentStock > 0), [products]);
  const toast = useToastContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [p, s] = await Promise.all([getProducts(), getSales()]);
        setProducts(p);
        setSales(s);
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

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
      toast.success('Venta registrada correctamente');
    } catch (err) {
      toast.error("No se pudo registrar la venta múltiple. Verifica stock y precios.");
    } finally {
      setSubmitting(false);
    }
  };

  const linePrice = (productId: string) => products.find((p) => p.id === productId)?.salePrice ?? 0;
  const cartTotal = cart.reduce((sum, line) => sum + (parseFloat(line.quantity) || 0) * linePrice(line.productId), 0);

  // Group sales by transactionId (fallback to id)
  const groups = useMemo(() => {
    const map = new Map<string, { id: string; date: string; items: Sale[]; total: number }>();
    for (const s of sales) {
      const key = s.transactionId || s.id;
      const g = map.get(key) || { id: key, date: s.date, items: [], total: 0 };
      g.items.push(s);
      g.total += s.totalRevenue;
      if (new Date(s.date) < new Date(g.date)) g.date = s.date;
      map.set(key, g);
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  const exportCsv = (g: { id: string; date: string; items: Sale[]; total: number }) => {
    const header = ['transactionId','date','productCode','productName','quantity','unitPrice','totalRevenue'];
    const rows = g.items.map(it => [
      it.transactionId || g.id,
      new Date(it.date).toISOString(),
      it.productCode,
      it.productName,
      String(it.quantity),
      it.unitPrice.toFixed(2),
      it.totalRevenue.toFixed(2)
    ]);
    const csv = [header.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venta-${g.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printGroup = (g: { id: string; date: string; items: Sale[]; total: number }) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = g.items.map(it => `
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #ddd;">${it.productCode}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #ddd;">${it.productName}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #ddd;">${it.quantity}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #ddd;">$${it.unitPrice.toFixed(2)}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #ddd;">$${it.totalRevenue.toFixed(2)}</td>
      </tr>
    `).join('');
    w.document.write(`
      <html>
        <head>
          <title>Venta ${g.id}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            p { margin: 0 0 12px; color: #444; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #000; }
          </style>
        </head>
        <body>
          <h1>Recibo de venta</h1>
          <p>Transacción: ${g.id}</p>
          <p>Fecha: ${new Date(g.date).toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <h2 style="text-align:right;margin-top:12px;">Total: $${g.total.toFixed(2)}</h2>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Salidas (Ventas)</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Registrar Venta
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">Cargando ventas...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-300 text-lg mb-4">No hay ventas registradas</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Registrar primera venta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-200/40 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Venta</p>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{new Date(g.date).toLocaleString()}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Total</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-600 dark:text-green-400">${g.total.toFixed(2)}</p>
                </div>
              </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
                <tr className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Cantidad</th>
                  <th className="px-4 py-2">Precio Unitario</th>
                  <th className="px-4 py-2">Importe</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((sale, i) => (
                  <tr key={sale.id} className={i % 2 === 0 ? "bg-zinc-50/60 dark:bg-zinc-950/30" : ""}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                      <div className="font-medium">{sale.productName}</div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-xs">{sale.productCode}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{sale.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${sale.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${sale.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-200/40 dark:border-zinc-800">
              <button onClick={() => printGroup(g)} className="px-3 py-1.5 rounded-md border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Imprimir</button>
              <button onClick={() => exportCsv(g)} className="px-3 py-1.5 rounded-md border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Exportar CSV</button>
            </div>
          </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-xl shadow-2xl p-8 max-w-2xl w-full border border-zinc-200/30 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Registrar Venta (Carrito)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {cart.map((line, idx) => {
                const prod = products.find((p) => p.id === line.productId);
                const unit = prod?.salePrice ?? 0;
                const max = prod?.currentStock ?? 0;
                const subtotal = (parseFloat(line.quantity) || 0) * unit;
                const alreadySelected = new Set(cart.map((c) => c.productId).filter(Boolean));
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/30 dark:border-zinc-800">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Producto</label>
                      <select
                        required
                        value={line.productId}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, productId: v } : c)));
                        }}
                        className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                      >
                        <option value="">Seleccionar producto</option>
                        {availableProducts.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={alreadySelected.has(p.id) && p.id !== line.productId}
                            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                          >
                            {p.code} - {p.name} (Stock: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cantidad</label>
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
                        className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                        placeholder="0.00"
                      />
                      {line.productId && (
                        <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">Stock disp.: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{max}</span></p>
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <div className="w-full">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">P. unitario</p>
                        <p className="text-zinc-900 dark:text-zinc-100 font-semibold">${unit.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                        className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-2 rounded-lg font-medium transition-all border border-red-200 dark:border-red-800"
                        aria-label="Eliminar línea"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="md:col-span-12 text-right">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">Subtotal: <span className="text-green-600 dark:text-green-400 font-semibold">${subtotal.toFixed(2)}</span></p>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCart((prev) => [...prev, { productId: "", quantity: "" }])}
                  className="bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 px-4 py-2 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700"
                >
                  Agregar producto
                </button>
                <div className="text-right">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total: <span className="text-green-600 dark:text-green-600 dark:text-green-400 font-semibold text-lg">${cartTotal.toFixed(2)}</span></p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!validateCart() || submitting}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting ? "Procesando..." : "Registrar Venta"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCart([{ productId: "", quantity: "" }]);
                  }}
                  className="flex-1 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 py-2 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700"
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
