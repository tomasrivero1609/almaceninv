'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/storage';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    unitCost: '',
    salePrice: '',
  });

  useEffect(() => {
    const load = async () => {
      const list = await getProducts();
      setProducts(list);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formData.name,
        code: formData.code,
        unitCost: parseFloat(formData.unitCost),
        salePrice: parseFloat(formData.salePrice),
      });
    } else {
      await addProduct({
        name: formData.name,
        code: formData.code,
        unitCost: parseFloat(formData.unitCost),
        salePrice: parseFloat(formData.salePrice),
      });
    }
    const list = await getProducts();
    setProducts(list);
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', code: '', unitCost: '', salePrice: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      unitCost: product.unitCost.toString(),
      salePrice: product.salePrice.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
      const list = await getProducts();
      setProducts(list);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
          📦 Gestión de Productos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-all ai-glow-hover"
        >
          ➕ Nuevo Producto
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-purple-500/30 ai-glow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Costo Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Precio Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-purple-900/20 divide-y divide-purple-500/20">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-purple-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-100">
                    {product.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                    ${product.unitCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                    ${product.salePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                    {product.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-purple-400 hover:text-purple-200 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-violet-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30 ai-glow">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-6">
              {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="Ej: PROD001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="Nombre del producto"
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
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Precio de Venta
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  placeholder="0.00"
                />
              </div>
              {formData.unitCost && formData.salePrice && (
                <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-300">
                    Margen de ganancia:{' '}
                    <span className="font-semibold text-green-400">
                      {((parseFloat(formData.salePrice) - parseFloat(formData.unitCost)) / parseFloat(formData.unitCost) * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-2 rounded-lg font-medium transition-all ai-glow-hover"
                >
                  {editingProduct ? 'Actualizar' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ name: '', code: '', unitCost: '', salePrice: '' });
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

