export interface User {
  _id?: string;
  email: string;
  password: string;
  name?: string;
  createdAt?: Date;
}

export interface FavoriteShift {
  _id?: string;
  userId: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  payRate: number;
  client?: string;
  color: string; // hex color code
  createdAt?: Date;
}

export interface Shift {
  _id?: string;
  userId: string;
  favoriteShiftId?: string;
  date: string; // YYYY-MM-DD format
  title: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  payRate: number;
  client?: string;
  color: string; // hex color code
  createdAt?: Date;
}

// Pastel color options
export const PASTEL_COLORS = [
  '#FFB3BA', // Pastel Pink
  '#BAFFC9', // Pastel Green
  '#BAE1FF', // Pastel Blue
  '#FFFFBA', // Pastel Yellow
  '#FFDFBA', // Pastel Orange
  '#E0BBE4', // Pastel Purple
];

