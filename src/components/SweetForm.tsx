import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Sweet } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SweetFormProps {
  sweet?: Sweet | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SweetForm({ sweet, onClose, onSuccess }: SweetFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
  });

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name,
        category: sweet.category,
        price: sweet.price.toString(),
        quantity: sweet.quantity.toString(),
        description: sweet.description || '',
      });
    }
  }, [sweet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description || null,
        created_by: user?.id,
      };

      if (sweet) {
        const { error } = await supabase
          .from('sweets')
          .update(data)
          .eq('id', sweet.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('sweets').insert([data]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {sweet ? 'Edit Sweet' : 'Add New Sweet'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="chocolate">Chocolate</option>
              <option value="gummy">Gummy</option>
              <option value="hard candy">Hard Candy</option>
              <option value="caramel">Caramel</option>
              <option value="lollipop">Lollipop</option>
              <option value="mint">Mint</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                sweet ? 'Update Sweet' : 'Add Sweet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
