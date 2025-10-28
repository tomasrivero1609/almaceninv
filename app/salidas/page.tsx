'use client';

import { useState, useEffect } from 'react';
import { Product, Sale } from '@/types';
import { getProducts, getSales, addSale } from '@/lib/storage';

export default function SalidasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
  });

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([getProducts(), getSales()]);
      setProducts(p);
      setSales(s);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    if (product.currentStock < parseFloat(formData.quantity)) {
      alert('No hay suficiente stock disponible');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const unitPrice = product.salePrice;
    const totalRevenue = quantity * unitPrice;

    await addSale({
      productId: formData.productId,
      productName: product.name,
      productCode: product.code,
      quantity,
      unitPrice,
      totalRevenue,
    });

    const [p, s] = await Promise.all([getProducts(), getSales()]);
    setProducts(p);
    setSales(s);
    setShowModal(false);
    setFormData({ productId: '', quantity: '' });
  };

  const availableProducts = products.filter(p => p.currentStock > 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
          📤 Salidas (Ventas)
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
        >
          ➕ Registrar Venta
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-12 text-center border border-purple-500/30 ai-glow">
          <p className="text-purple-300 text-lg mb-4">
            No hay ventas registradas
          </p>
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
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Ingresos Totales
                  </th>
                </tr>
              </thead>
              <tbody className="bg-purple-900/20 divide-y divide-purple-500/20">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-purple-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      <div>
                        <div className="font-medium">{sale.productName}</div>
                        <div className="text-purple-300 text-xs">{sale.productCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      ${sale.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      ${sale.totalRevenue.toFixed(2)}
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
              📤 Registrar Venta
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
                  {availableProducts.map((product) => (
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
                  min="0.01"
                  max={
                    formData.productId
                      ? products.find(p => p.id === formData.productId)?.currentStock || 0
                      : 0
                  }
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              {formData.productId && formData.quantity && (
                <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-500/20 space-y-2">
                  <p className="text-sm text-purple-300">
                    Stock disponible:{' '}
                    <span className="font-semibold text-purple-100">
                      {products.find(p => p.id === formData.productId)?.currentStock || 0}
                    </span>
                  </p>
                  <p className="text-sm text-purple-300">
                    Precio unitario:{' '}
                    <span className="font-semibold text-purple-100">
                      ${products.find(p => p.id === formData.productId)?.salePrice.toFixed(2) || '0.00'}
                    </span>
                  </p>
                  {parseFloat(formData.quantity) > 0 && (
                    <p className="text-sm text-purple-300">
                      Ingresos totales:{' '}
                      <span className="font-semibold text-green-400">
                        +${
                          (
                            parseFloat(formData.quantity) *
                            (products.find(p => p.id === formData.productId)?.salePrice || 0)
                          ).toFixed(2)
                        }
                      </span>
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-2 rounded-lg font-medium transition-all ai-glow-hover"
                >
                  Registrar Venta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ productId: '', quantity: '' });
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

