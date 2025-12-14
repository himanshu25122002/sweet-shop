import { useState } from 'react';
import { ShoppingCart, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { Sweet } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SweetCardProps {
  sweet: Sweet;
  onUpdate: () => void;
  onEdit?: (sweet: Sweet) => void;
}

export function SweetCard({ sweet, onUpdate, onEdit }: SweetCardProps) {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (sweet.quantity === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sweets')
        .update({ quantity: sweet.quantity - 1 })
        .eq('id', sweet.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error purchasing sweet:', error);
      alert('Failed to purchase sweet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${sweet.name}"?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('sweets').delete().eq('id', sweet.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting sweet:', error);
      alert('Failed to delete sweet');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    chocolate: 'bg-amber-100 text-amber-800',
    gummy: 'bg-pink-100 text-pink-800',
    'hard candy': 'bg-blue-100 text-blue-800',
    caramel: 'bg-yellow-100 text-yellow-800',
  };

  const categoryColor =
    categoryColors[sweet.category.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">{sweet.name}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}
          >
            {sweet.category}
          </span>
        </div>

        {sweet.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {sweet.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-orange-600">
            ${sweet.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span
              className={`text-sm font-semibold ${
                sweet.quantity === 0
                  ? 'text-red-600'
                  : sweet.quantity < 20
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}
            >
              {sweet.quantity} in stock
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePurchase}
            disabled={sweet.quantity === 0 || loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
              </>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(sweet)}
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                title="Edit sweet"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                title="Delete sweet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
