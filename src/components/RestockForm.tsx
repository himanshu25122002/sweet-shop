import { useState } from 'react';
import { X, Loader2, Package } from 'lucide-react';
import { Sweet } from '../types/database';
import { supabase } from '../lib/supabase';

interface RestockFormProps {
  sweet: Sweet;
  onClose: () => void;
  onSuccess: () => void;
}

export function RestockForm({ sweet, onClose, onSuccess }: RestockFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const addQuantity = parseInt(quantity);
      if (addQuantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      const { error } = await supabase
        .from('sweets')
        .update({ quantity: sweet.quantity + addQuantity })
        .eq('id', sweet.id);

      if (error) throw error;

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
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Restock Sweet</h2>
          </div>
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{sweet.name}</h3>
            <p className="text-sm text-gray-600">
              Current stock: <span className="font-semibold">{sweet.quantity}</span>
            </p>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Add *
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>

          {quantity && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                New stock will be:{' '}
                <span className="font-semibold">
                  {sweet.quantity + parseInt(quantity || '0')}
                </span>
              </p>
            </div>
          )}

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
                  Restocking...
                </>
              ) : (
                'Restock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
