"use client";

import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/types';
import { addProduct, adjustPrices, deleteProduct, getProducts, updateProduct } from '@/lib/storage';
import { useToastContext } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showInflationModal, setShowInflationModal] = useState(false);
  const [inflationPercent, setInflationPercent] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', salePrice: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });
  const toast = useToastContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await getProducts();
        setProducts(list);
      } catch (error) {
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          code: formData.code,
          salePrice: parseFloat(formData.salePrice),
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await addProduct({ name: formData.name, code: formData.code });
        toast.success('Producto creado correctamente');
      }
      const list = await getProducts();
      setProducts(list);
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', code: '', salePrice: '' });
      setCurrentPage(1);
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, code: product.code, salePrice: product.salePrice.toString() });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.productId) return;
    try {
      await deleteProduct(deleteConfirm.productId);
      const list = await getProducts();
      setProducts(list);
      toast.success('Producto eliminado correctamente');
      setDeleteConfirm({ isOpen: false, productId: null });
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de Productos</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setShowModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
            Nuevo Producto
          </button>
          <button onClick={() => setShowInflationModal(true)} className="bg-zinc-200/60 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700 text-sm sm:text-base">
            Ajuste por inflación
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar por código o nombre..."
          className="w-full sm:w-auto px-4 py-2 border border-zinc-300/40 dark:border-zinc-700 rounded-lg bg-white/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors"
          aria-label="Buscar productos"
        />
      </div>

      {loading ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-300 text-lg mb-4">
            {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Registrar primer producto</button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
          </div>
          <div className="rounded-xl shadow-sm overflow-hidden border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
            <div className="overflow-x-auto">
              <table className="min-w-full" aria-label="Tabla de productos">
                <thead className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Código</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Costo Unitario</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Precio Venta</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Stock</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, i) => (
                    <tr key={product.id} className={i % 2 === 0 ? 'bg-zinc-50/60 dark:bg-zinc-950/30' : ''}>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.code}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{product.name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">${product.unitCost.toFixed(2)}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">${product.salePrice.toFixed(2)}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{product.currentStock}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(product)} className="text-violet-600 dark:text-violet-400 hover:underline" aria-label={`Editar ${product.name}`}>Editar</button>
                        <button onClick={() => handleDeleteClick(product.id)} className="text-red-600 dark:text-red-400 hover:underline" aria-label={`Eliminar ${product.name}`}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-200/60 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-200/60 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 dark:text-zinc-100 rounded-lg font-medium transition-colors border border-zinc-300/40 dark:border-zinc-700"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

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
            <form onSubmit={async (e) => { e.preventDefault(); const percent = parseFloat(inflationPercent); if (!isFinite(percent)) return; try { await adjustPrices(percent); const list = await getProducts(); setProducts(list); setInflationPercent(''); setShowInflationModal(false); toast.success('Precios ajustados correctamente'); } catch (error) { toast.error('Error al ajustar los precios'); } }} className="space-y-4">
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: null })}
      />
    </div>
  );
}

