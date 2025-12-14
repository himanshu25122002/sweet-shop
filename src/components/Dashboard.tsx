import { useState, useEffect } from 'react';
import { LogOut, Plus, Search, Filter, Candy, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sweet } from '../types/database';
import { SweetCard } from './SweetCard';
import { SweetForm } from './SweetForm';
import { RestockForm } from './RestockForm';

export function Dashboard() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockingSweet, setRestockingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    filterSweets();
  }, [sweets, searchTerm, categoryFilter, priceFilter]);

  const loadSweets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sweets')
        .select('*')
        .order('name');

      if (error) throw error;
      setSweets(data || []);
    } catch (error) {
      console.error('Error loading sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSweets = () => {
    let filtered = [...sweets];

    if (searchTerm) {
      filtered = filtered.filter(
        (sweet) =>
          sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((sweet) => sweet.category === categoryFilter);
    }

    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number);
      filtered = filtered.filter((sweet) => {
        if (max) {
          return sweet.price >= min && sweet.price <= max;
        }
        return sweet.price >= min;
      });
    }

    setFilteredSweets(filtered);
  };

  const categories = Array.from(new Set(sweets.map((s) => s.category)));

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setShowForm(true);
  };

  const handleRestock = (sweet: Sweet) => {
    setRestockingSweet(sweet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Candy className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sweet Shop</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                  Admin
                </span>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sweets by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Prices</option>
                <option value="0-5">Under $5</option>
                <option value="5-10">$5 - $10</option>
                <option value="10-20">$10 - $20</option>
                <option value="20">$20+</option>
              </select>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingSweet(null);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add Sweet
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredSweets.length} of {sweets.length} sweets
            </p>
            <button
              onClick={loadSweets}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading sweets...</p>
          </div>
        ) : filteredSweets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sweets found</h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter || priceFilter
                ? 'Try adjusting your filters'
                : 'Add some sweets to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onUpdate={loadSweets}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <SweetForm
          sweet={editingSweet}
          onClose={() => {
            setShowForm(false);
            setEditingSweet(null);
          }}
          onSuccess={loadSweets}
        />
      )}

      {restockingSweet && (
        <RestockForm
          sweet={restockingSweet}
          onClose={() => setRestockingSweet(null)}
          onSuccess={loadSweets}
        />
      )}
    </div>
  );
}
