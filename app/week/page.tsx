'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { Shift, FavoriteShift } from '@/lib/models';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parse } from 'date-fns';

export default function WeekPage() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [favorites, setFavorites] = useState<FavoriteShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    payRate: '',
    client: '',
    color: '#FFB3BA',
  });

  useEffect(() => {
    checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const checkAuthAndLoadData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      await Promise.all([loadShifts(), loadFavorites()]);
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadShifts = async () => {
    try {
      const weekStart = format(currentWeek, 'yyyy-MM-dd');
      const weekEnd = format(addDays(currentWeek, 6), 'yyyy-MM-dd');
      const response = await fetch(`/api/shifts?startDate=${weekStart}&endDate=${weekEnd}`);
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
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

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setIsAddModalOpen(true);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      title: shift.title,
      startTime: shift.startTime,
      endTime: shift.endTime,
      payRate: shift.payRate.toString(),
      client: shift.client || '',
      color: shift.color,
    });
    setIsEditModalOpen(true);
  };

  const handleAddFromFavorite = async (favorite: FavoriteShift) => {
    if (!selectedDate) return;

    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          favoriteShiftId: favorite._id,
          title: favorite.title,
          startTime: favorite.startTime,
          endTime: favorite.endTime,
          payRate: favorite.payRate,
          client: favorite.client,
          color: favorite.color,
        }),
      });

      if (response.ok) {
        await loadShifts();
        setIsAddModalOpen(false);
        setSelectedDate(null);
      } else {
        alert('Failed to add shift');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleUpdateShift = async () => {
    if (!selectedShift?._id) return;

    try {
      const response = await fetch(`/api/shifts/${selectedShift._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          payRate: parseFloat(formData.payRate),
        }),
      });

      if (response.ok) {
        await loadShifts();
        setIsEditModalOpen(false);
        setSelectedShift(null);
      } else {
        alert('Failed to update shift');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift?._id) return;
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const response = await fetch(`/api/shifts/${selectedShift._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadShifts();
        setIsEditModalOpen(false);
        setSelectedShift(null);
      } else {
        alert('Failed to delete shift');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const getShiftsForDate = (date: Date) => {
    return shifts
      .filter((shift) => {
        // Parse date string as local date to avoid timezone issues
        const shiftDate = parse(shift.date, 'yyyy-MM-dd', new Date());
        return isSameDay(shiftDate, date);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-4 sm:mb-8">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base text-center sm:text-left"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base"
            >
              ← Previous
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </h1>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="sm:overflow-x-auto sm:-mx-2 sm:mx-0">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-4 sm:min-w-[700px] sm:min-w-0 sm:px-2 sm:px-0">
          {weekDays.map((day, index) => {
            const dayShifts = getShiftsForDate(day);
            return (
              <div key={index} className="bento-panel min-h-[200px] sm:min-h-[400px]">
                <button
                  onClick={() => handleDateClick(day)}
                  className="w-full text-left mb-3 sm:mb-4 p-2 sm:p-3 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                >
                  <div className="font-semibold text-base sm:text-lg">{format(day, 'EEE')}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{format(day, 'MMM d')}</div>
                </button>
                <div className="space-y-1.5 sm:space-y-2">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift._id}
                      onClick={() => handleShiftClick(shift)}
                      className="p-2 sm:p-3 rounded-lg cursor-pointer active:opacity-70 transition-opacity touch-manipulation"
                      style={{
                        backgroundColor: shift.color,
                        borderLeft: `3px solid ${shift.color}`,
                      }}
                    >
                      <div className="font-semibold text-xs sm:text-sm truncate">{shift.title}</div>
                      <div className="text-xs text-gray-700">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      {shift.client && (
                        <div className="text-xs text-gray-600 truncate">{shift.client}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDate(null);
          }}
          title={`Add Shift - ${selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : ''}`}
        >
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No favorite shifts available.</p>
              <Link
                href="/favorites"
                className="text-blue-600 hover:underline"
              >
                Create a favorite shift first
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((favorite) => (
                <button
                  key={favorite._id}
                  onClick={() => handleAddFromFavorite(favorite)}
                  className="w-full p-4 text-left rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: favorite.color,
                    borderLeft: `4px solid ${favorite.color}`,
                  }}
                >
                  <div className="font-semibold">{favorite.title}</div>
                  <div className="text-sm text-gray-700">
                    {favorite.startTime} - {favorite.endTime}
                  </div>
                  {favorite.client && (
                    <div className="text-sm text-gray-600">{favorite.client}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedShift(null);
          }}
          title="Edit Shift"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateShift();
            }}
            className="space-y-4"
          >
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
              <label className="block text-sm font-medium mb-2">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
              <button
                type="button"
                onClick={handleDeleteShift}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedShift(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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

