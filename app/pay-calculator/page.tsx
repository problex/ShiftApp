'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parse, differenceInMinutes } from 'date-fns';
import { Shift } from '@/lib/models';

export default function PayCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [totalPay, setTotalPay] = useState<number | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [calculatedShifts, setCalculatedShifts] = useState<Shift[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    checkAuthAndLoadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadShifts = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      await loadAllShifts();
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadAllShifts = async () => {
    try {
      // Load a wide range to get all shifts, we'll filter client-side
      const response = await fetch('/api/shifts?startDate=2020-01-01&endDate=2030-12-31');
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  // Get unique clients from all shifts
  const getUniqueClients = (): string[] => {
    const clients = shifts
      .map((shift) => shift.client)
      .filter((client): client is string => Boolean(client))
      .filter((client, index, self) => self.indexOf(client) === index)
      .sort();
    return clients;
  };

  const calculatePay = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setIsCalculating(true);

    try {
      const start = parse(startDate, 'yyyy-MM-dd', new Date());
      const end = parse(endDate, 'yyyy-MM-dd', new Date());

      if (start > end) {
        alert('Start date must be before end date');
        setIsCalculating(false);
        return;
      }

      // Filter shifts within the date range and by client if selected
      const filteredShifts = shifts.filter((shift) => {
        const shiftDate = parse(shift.date, 'yyyy-MM-dd', new Date());
        const inDateRange = shiftDate >= start && shiftDate <= end;
        
        // If client filter is selected, also filter by client
        if (selectedClient) {
          return inDateRange && shift.client === selectedClient;
        }
        
        return inDateRange;
      });

      // Calculate total pay and hours
      let total = 0;
      let hours = 0;

      filteredShifts.forEach((shift) => {
        // Parse times (HH:mm format)
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        const startTime = new Date(2000, 0, 1, startHour, startMin);
        const endTime = new Date(2000, 0, 1, endHour, endMin);
        
        // Calculate minutes difference for precise calculation
        let minutesDiff = differenceInMinutes(endTime, startTime);
        
        // Handle overnight shifts (end time before start time)
        if (minutesDiff < 0) {
          minutesDiff = (24 * 60) + minutesDiff; // Overnight shift (24 hours in minutes)
        }
        
        // Convert minutes to hours (with decimals)
        const shiftHours = minutesDiff / 60;
        const shiftPay = shiftHours * shift.payRate;
        total += shiftPay;
        hours += shiftHours;
      });

      setTotalPay(total);
      setTotalHours(hours);
      setCalculatedShifts(filteredShifts);
    } catch (error) {
      console.error('Error calculating pay:', error);
      alert('Error calculating pay. Please try again.');
    } finally {
      setIsCalculating(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg transition-all text-sm sm:text-base text-center sm:text-left"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Pay Calculator</h1>
        </div>

        <div className="bento-panel mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Calculate Total Pay</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Filter by Client (Optional)</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Clients</option>
              {getUniqueClients().map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={calculatePay}
            disabled={isCalculating || !startDate || !endDate}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Total Pay'}
          </button>
        </div>

        {totalPay !== null && (
          <div className="bento-panel">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Calculation Results</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center sm:text-left">
                <div className="text-sm text-gray-600 mb-1">Total Hours</div>
                <div className="text-2xl sm:text-3xl font-bold">{totalHours?.toFixed(2)}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-sm text-gray-600 mb-1">Number of Shifts</div>
                <div className="text-2xl sm:text-3xl font-bold">{calculatedShifts.length}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-sm text-gray-600 mb-1">Total Pay</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  ${totalPay.toFixed(2)}
                </div>
              </div>
            </div>

            {calculatedShifts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Shifts Included</h3>
                <div className="space-y-2">
                  {calculatedShifts.map((shift) => {
                    const [startHour, startMin] = shift.startTime.split(':').map(Number);
                    const [endHour, endMin] = shift.endTime.split(':').map(Number);
                    const startTime = new Date(2000, 0, 1, startHour, startMin);
                    const endTime = new Date(2000, 0, 1, endHour, endMin);
                    let minutesDiff = differenceInMinutes(endTime, startTime);
                    if (minutesDiff < 0) {
                      minutesDiff = (24 * 60) + minutesDiff;
                    }
                    const shiftHours = minutesDiff / 60;
                    const shiftPay = shiftHours * shift.payRate;

                    return (
                      <div
                        key={shift._id}
                        className="p-3 rounded-lg border border-gray-200"
                        style={{
                          borderLeft: `4px solid ${shift.color}`,
                        }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="font-semibold">{shift.title}</div>
                            <div className="text-sm text-gray-600">
                              {format(parse(shift.date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')} • {shift.startTime} - {shift.endTime}
                            </div>
                            {shift.client && (
                              <div className="text-sm text-gray-500">{shift.client}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {shiftHours.toFixed(2)} hrs × ${shift.payRate.toFixed(2)}/hr
                            </div>
                            <div className="font-semibold text-lg">
                              ${shiftPay.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

