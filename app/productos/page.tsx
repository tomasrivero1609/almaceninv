"use client";

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { addProduct, adjustPrices, deleteProduct, getProducts, updateProduct } from '@/lib/storage';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showInflationModal, setShowInflationModal] = useState(false);
  const [inflationPercent, setInflationPercent] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', salePrice: '' });

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
        salePrice: parseFloat(formData.salePrice),
      });
    } else {
      await addProduct({ name: formData.name, code: formData.code });
    }
    const list = await getProducts();
    setProducts(list);
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', code: '', salePrice: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, code: product.code, salePrice: product.salePrice.toString() });
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de Productos</h1>
        <div>
          <button onClick={() => setShowModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Nuevo Producto
          </button>
          <button onClick={() => setShowInflationModal(true)} className="ml-4 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 px-6 py-3 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700">
            Ajuste por inflación
          </button>
        </div>
      </div>

      <div className="rounded-xl shadow-sm overflow-hidden border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Costo Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Precio Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr key={product.id} className={i % 2 === 0 ? 'bg-zinc-50/60 dark:bg-zinc-950/30' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${product.unitCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">${product.salePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{product.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-violet-600 dark:text-violet-400 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-xl shadow-2xl p-8 max-w-md w-full border border-zinc-200/30 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Código</label>
                <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="Ej: PROD001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Nombre</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="Nombre del producto" />
              </div>
              {editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Precio de Venta</label>
                  <input type="number" step="0.01" required value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="0.00" />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Puedes ajustar el precio en cualquier momento o usar el ajuste por inflación.</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-medium transition-colors">{editingProduct ? 'Actualizar' : 'Crear Producto'}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); setFormData({ name: '', code: '', salePrice: '' }); }} className="flex-1 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 py-2 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInflationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-xl shadow-2xl p-8 max-w-md w-full border border-zinc-200/30 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Ajuste de precios por inflación</h2>
            <form onSubmit={async (e) => { e.preventDefault(); const percent = parseFloat(inflationPercent); if (!isFinite(percent)) return; await adjustPrices(percent); const list = await getProducts(); setProducts(list); setInflationPercent(''); setShowInflationModal(false); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Porcentaje (%)</label>
                <input type="number" step="0.1" required value={inflationPercent} onChange={(e) => setInflationPercent(e.target.value)} className="w-full px-3 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors" placeholder="Ej: 8.5" />
              </div>
              {inflationPercent && (
                <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/40 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Factor aplicado: <span className="font-semibold text-green-700 dark:text-green-400">{(1 + (parseFloat(inflationPercent) || 0) / 100).toFixed(4)}x</span></p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-medium transition-colors">Aplicar ajuste</button>
                <button type="button" onClick={() => { setShowInflationModal(false); setInflationPercent(''); }} className="flex-1 bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 py-2 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

