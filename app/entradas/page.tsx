'use client';

import { useState, useEffect } from 'react';
import { Product, Entry } from '@/types';
import { getProducts, getEntries, addEntry } from '@/lib/storage';

export default function EntradasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
  });

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
      await addEntry({
        productId: formData.productId,
        productName: product.name,
        productCode: product.code,
        quantity,
        unitCost,
        totalCost,
      });

      const [p, e] = await Promise.all([getProducts(), getEntries()]);
      setProducts(p);
      setEntries(e);
      setShowModal(false);
      setFormData({ productId: '', quantity: '', unitCost: '' });
      setError(null);
    } catch (err) {
      setError('No se pudo registrar la entrada. Verifica la conexión a la base de datos.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
          📥 Entradas (Compras)
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
        >
          ➕ Registrar Entrada
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-400/50 bg-red-900/30 text-red-200 backdrop-blur-sm">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-12 text-center border border-purple-500/30 ai-glow">
          <p className="text-purple-300 text-lg mb-4">
            No hay entradas registradas
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
          >
            Registrar primera entrada
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-purple-500/30 ai-glow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-500/20">
              <thead className="bg-purple-950/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Costo Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-purple-900/20 divide-y divide-purple-500/20">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-purple-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      <div>
                        <div className="font-medium">{entry.productName}</div>
                        <div className="text-purple-300 text-xs">{entry.productCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      {entry.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      ${entry.unitCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      ${entry.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-violet-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30 ai-glow">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-6">
              📥 Registrar Entrada
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Producto
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-purple-900 text-purple-100">
                      {product.code} - {product.name} (Stock: {product.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Costo Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              {formData.productId && formData.quantity && formData.unitCost && (
                <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-300">
                    Costo total:{' '}
                    <span className="font-semibold text-green-400">
                      ${(parseFloat(formData.quantity) * parseFloat(formData.unitCost)).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-2 rounded-lg font-medium transition-all ai-glow-hover"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ productId: '', quantity: '', unitCost: '' });
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

