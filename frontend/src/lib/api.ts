import axios from 'axios';

// All Services → proxied through API Gateway Service (localhost:5000)
const flightsAPI = axios.create({ baseURL: '/api/v1' });
const bookingsAPI = axios.create({ baseURL: '/api/v1' });
const authAPI = axios.create({ baseURL: '/api/v1' });

// Helper to get token from localStorage safely in browser
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('skyelite_jwt_token');
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('skyelite_jwt_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('skyelite_jwt_token');
    localStorage.removeItem('skyelite_user_email');
  }
}

// Automatically inject JWT token into all requests sent through API Gateway
[flightsAPI, bookingsAPI, authAPI].forEach((client) => {
  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers['x-access-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
});

// ──────────────────────── Auth & JWT Queries ────────────────────────

export interface AuthUserResponse {
  success: boolean;
  data: any;
  message: string;
}

export async function signupUser(email: string, password: string): Promise<AuthUserResponse> {
  const res = await authAPI.post('/user/signup', { email, password });
  return res.data;
}

export async function signinUser(email: string, password: string): Promise<{ token: string }> {
  const res = await authAPI.post('/user/signin', { email, password });
  return res.data.data;
}

export async function verifyAuthToken(): Promise<any> {
  const res = await authAPI.get('/info');
  return res.data;
}

// ──────────────────────── Types ────────────────────────

export interface City {
  id: number;
  name: string;
}

export interface Airport {
  id: number;
  name: string;
  code: string;
  address: string;
  cityId: number;
  city?: City;
}

export interface Airplane {
  id: number;
  modelNumber: string;
  capacity: number;
}

export interface Flight {
  id: number;
  flightNumber: string;
  aeroplaneId: number;
  departureAirportId: string;   // airport code e.g. "DEL"
  arrivalAirportId: string;     // airport code e.g. "HYD"
  departureTime: string;
  arrivalTime: string;
  price: number;
  boardngGate: string;
  totalSeats: number;
  airplane?: Airplane;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
}

export interface Booking {
  id: number;
  flightId: number;
  userId: number;
  status: 'INITIATED' | 'BOOKED' | 'CANCELLED' | 'PENDING';
  noOfSeats: number;
  totalCost: number;
}

// ──────────────────────── Flight Queries ────────────────────────

export interface FlightSearchParams {
  trips?: string;        // "DEL-HYD"
  price?: string;        // "min-max"
  travellers?: number;
  departureDate?: string; // "YYYY-MM-DD"
  sort?: string;
}

export async function fetchAllFlights(params?: FlightSearchParams): Promise<Flight[]> {
  const res = await flightsAPI.get('/flights', { params });
  return res.data.data;
}

export async function fetchFlightById(id: number): Promise<Flight> {
  const res = await flightsAPI.get(`/flights/${id}`);
  return res.data.data;
}

export async function fetchAllAirports(): Promise<Airport[]> {
  const res = await flightsAPI.get('/airports');
  return res.data.data;
}

// ──────────────────────── Booking Queries ────────────────────────

export interface CreateBookingInput {
  flightId: number;
  userId: number;
  noOfSeats: number;
  idempotencyKey: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const res = await bookingsAPI.post('/bookings', {
    flightId: input.flightId,
    userId: input.userId,
    noOfSeats: input.noOfSeats
  }, {
    headers: {
      'x-idempotency-key': input.idempotencyKey
    }
  });
  return res.data.data;
}

export async function fetchBookingById(id: number): Promise<Booking> {
  const res = await bookingsAPI.get(`/bookings/${id}`);
  return res.data.data;
}

export interface MakePaymentInput {
  bookingId: number;
  userId: number;
  totalCost: number;
  idempotencyKey: string;
  recepientEmail?: string;
  travelDate?: string;
}

export async function makePayment(input: MakePaymentInput): Promise<Booking> {
  const res = await bookingsAPI.post('/bookings/payments', {
    bookingId: input.bookingId,
    userId: input.userId,
    totalCost: input.totalCost,
    recepientEmail: input.recepientEmail || 'akshanshranjan007@gmail.com',
    travelDate: input.travelDate
  }, {
    headers: {
      'x-idempotency-key': input.idempotencyKey
    }
  });
  return res.data.data;
}

// ──────────────────────── Helpers ────────────────────────

export function generateIdempotencyKey(): string {
  return `skyelite-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Takes a stored ISO flight time and rebases it onto the user's chosen travel date.
 * Keeps only the HH:mm from the stored value (the "schedule pattern") and grafts it
 * onto the chosen date so all flights are available on any future date.
 * If no travel date supplied, returns the original ISO string.
 */
export function applyTravelDate(isoString: string, travelDate: string | undefined): string {
  if (!isoString) return isoString;
  if (!travelDate) return isoString;
  const stored = new Date(isoString);
  const hours = stored.getUTCHours().toString().padStart(2, '0');
  const mins = stored.getUTCMinutes().toString().padStart(2, '0');
  return `${travelDate}T${hours}:${mins}:00.000Z`;
}

export function formatTime(isoString: string, travelDate?: string): string {
  if (!isoString) return '—';
  const effective = travelDate ? applyTravelDate(isoString, travelDate) : isoString;
  return new Date(effective).toLocaleString('en-IN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
}

export function flightDurationMins(departure: string, arrival: string): number {
  return Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000);
}
