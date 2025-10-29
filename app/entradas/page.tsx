"use client";

import { useEffect, useState } from 'react';
import { Entry, Product } from '@/types';
import { addEntry, getEntries, getProducts, updateProduct } from '@/lib/storage';

export default function EntradasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '', unitCost: '', salePrice: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, e] = await Promise.all([getProducts(), getEntries()]);
        setProducts(p);
        setEntries(e);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar Entradas. Verifica la conexión a la base de datos (POSTGRES_URL).');
        setProducts([]);
        setEntries([]);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;
    const quantity = parseFloat(formData.quantity);
    const unitCost = parseFloat(formData.unitCost);
    const totalCost = quantity * unitCost;
    try {
      await addEntry({ productId: formData.productId, productName: product.name, productCode: product.code, quantity, unitCost, totalCost });
      const salePriceVal = parseFloat(formData.salePrice);
      if (formData.salePrice && isFinite(salePriceVal) && salePriceVal > 0) {
        await updateProduct(product.id, { salePrice: salePriceVal });
      }
      const [p, e] = await Promise.all([getProducts(), getEntries()]);
      setProducts(p);
      setEntries(e);
      setShowModal(false);
      setFormData({ productId: '', quantity: '', unitCost: '', salePrice: '' });
      setError(null);
    } catch (err) {
      setError('No se pudo registrar la entrada. Verifica la conexión a la base de datos.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Entradas (Compras)</h1>
        <button onClick={() => setShowModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Registrar Entrada</button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-300/50 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-300 text-lg mb-4">No hay entradas registradas</p>
          <button onClick={() => setShowModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Registrar primera entrada</button>
        </div>
      ) : (
        <div className="rounded-xl shadow-sm overflow-hidden border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Costo Unitario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Costo Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-zinc-50/60 dark:bg-zinc-950/30' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                      <div className="font-medium">{entry.productName}</div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-xs">{entry.productCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{entry.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${entry.unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${entry.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-xl shadow-2xl p-8 max-w-md w-full border border-zinc-200/30 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Registrar Entrada</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Producto</label>
                <select required value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors">
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-white dark:bg-zinc-900">
                      {product.code} - {product.name} (Stock: {product.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Cantidad</label>
                <input type="number" step="0.01" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Costo Unitario</label>
                <input type="number" step="0.01" required value={formData.unitCost} onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Precio de Venta (opcional)</label>
                <input type="number" step="0.01" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="0.00" />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Si lo defines aquí, se actualizará el precio del producto.</p>
              </div>
              {formData.productId && formData.quantity && formData.unitCost && (
                <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/40 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Costo total: <span className="font-semibold text-green-700 dark:text-green-400">${(parseFloat(formData.quantity) * parseFloat(formData.unitCost)).toFixed(2)}</span></p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-medium transition-colors">Registrar</button>
                <button type="button" onClick={() => { setShowModal(false); setFormData({ productId: '', quantity: '', unitCost: '', salePrice: '' }); }} className="flex-1 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 py-2 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

