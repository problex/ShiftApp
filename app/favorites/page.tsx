'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { FavoriteShift, PASTEL_COLORS } from '@/lib/models';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteShift | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    payRate: '',
    client: '',
    color: PASTEL_COLORS[0],
  });

  useEffect(() => {
    checkAuthAndLoadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadFavorites = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      await loadFavorites();
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleOpenModal = (favorite?: FavoriteShift) => {
    if (favorite) {
      setEditingFavorite(favorite);
      setFormData({
        title: favorite.title,
        startTime: favorite.startTime,
        endTime: favorite.endTime,
        payRate: favorite.payRate.toString(),
        client: favorite.client || '',
        color: favorite.color,
      });
    } else {
      setEditingFavorite(null);
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        payRate: '',
        client: '',
        color: PASTEL_COLORS[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFavorite(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFavorite
        ? `/api/favorites/${editingFavorite._id}`
        : '/api/favorites';
      const method = editingFavorite ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          startTime: formData.startTime,
          endTime: formData.endTime,
          payRate: parseFloat(formData.payRate),
          client: formData.client || undefined,
          color: formData.color,
        }),
      });

      if (response.ok) {
        await loadFavorites();
        handleCloseModal();
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this favorite shift?')) {
      return;
    }

    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFavorites();
      } else {
        alert('Failed to delete favorite shift');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base text-center sm:text-left"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Add New Favorite Shift
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Favorite Shifts</h1>

        {favorites.length === 0 ? (
          <div className="bento-panel text-center py-12">
            <p className="text-gray-600 mb-4">No favorite shifts yet.</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Favorite Shift
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite._id}
                className="bento-panel slide-up"
                style={{
                  borderLeft: `4px solid ${favorite.color}`,
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{favorite.title}</h3>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: favorite.color }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Time:</span> {favorite.startTime} - {favorite.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Pay Rate:</span> ${favorite.payRate.toFixed(2)}/hr
                  </p>
                  {favorite.client && (
                    <p>
                      <span className="font-medium">Client:</span> {favorite.client}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(favorite)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => favorite._id && handleDelete(favorite._id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingFavorite ? 'Edit Favorite Shift' : 'Add New Favorite Shift'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pay Rate *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.payRate}
                onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client (optional)</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color *</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PASTEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingFavorite ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

