'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { Shift, FavoriteShift } from '@/lib/models';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  parse,
} from 'date-fns';

export default function MonthPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
    highPriority: false,
  });

  useEffect(() => {
    checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

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
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const response = await fetch(`/api/shifts?startDate=${monthStart}&endDate=${monthEnd}`);
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
      highPriority: shift.highPriority || false,
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
          highPriority: favorite.highPriority || false,
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
    return shifts.filter((shift) => {
      // Parse date string as local date to avoid timezone issues
      const shiftDate = parse(shift.date, 'yyyy-MM-dd', new Date());
      return isSameDay(shiftDate, date);
    });
  };

  const getHighPriorityShiftForDate = (date: Date) => {
    const dayShifts = getShiftsForDate(date);
    return dayShifts.find((shift) => shift.highPriority === true);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 sm:p-4">
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
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base"
            >
              ← Previous
            </button>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">{format(currentMonth, 'MMMM yyyy')}</h1>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="bento-panel overflow-x-auto !px-0.5 !py-2 sm:!px-6 sm:!py-6">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2 min-w-[350px]">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 min-w-[350px]">
            {calendarDays.map((day, index) => {
              const dayShifts = getShiftsForDate(day);
              const highPriorityShift = getHighPriorityShiftForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] pt-0.5 sm:pt-1 px-0.5 sm:px-2 pb-1 sm:pb-2 rounded-lg border-2 transition-all touch-manipulation ${
                    isCurrentMonth
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100'
                  } ${isToday ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                >
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`w-full text-left mb-0.5 sm:mb-1 touch-manipulation ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'font-bold text-blue-600' : ''}`}
                  >
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className={`text-xs sm:text-sm ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {highPriorityShift && (
                        <span className="text-sm sm:text-base md:text-lg font-bold text-red-600 truncate">
                          {highPriorityShift.title}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift._id}
                        onClick={() => handleShiftClick(shift)}
                        className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded cursor-pointer active:opacity-70 transition-opacity truncate touch-manipulation"
                        style={{
                          backgroundColor: shift.color,
                        }}
                        title={shift.title}
                      >
                        {shift.title}
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className="text-[10px] sm:text-xs text-gray-500 text-center">
                        +{dayShifts.length - 3}
                      </div>
                    )}
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
              <Link href="/favorites" className="text-blue-600 hover:underline">
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

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.highPriority}
                  onChange={(e) => setFormData({ ...formData, highPriority: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">High Priority</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                High priority shifts will be prominently displayed in the month view
              </p>
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

