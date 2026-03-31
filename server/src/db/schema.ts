import { z } from 'zod';

export const TruckSchema = z.object({
  id: z.number().optional(),
  plate_number: z.string(),
  model: z.string(),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
});

export const DriverSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  license_number: z.string(),
  phone: z.string(),
  status: z.enum(['available', 'on_trip', 'off_duty']).default('available'),
});

export const ClientSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  balance: z.number().default(0),
});

export const TripSchema = z.object({
  id: z.number().optional(),
  truck_id: z.number(),
  driver_id: z.number(),
  client_id: z.number(),
  start_date: z.string(),
  end_date: z.string().optional(),
  origin: z.string(),
  destination: z.string(),
  revenue: z.number(),
  cost: z.number(),
  profit: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
});

export const ExpenseSchema = z.object({
  id: z.number().optional(),
  trip_id: z.number().optional(),
  type: z.enum(['fuel', 'maintenance', 'salary', 'toll', 'other']),
  amount: z.number(),
  date: z.string(),
  description: z.string().optional(),
});

export type Truck = z.infer<typeof TruckSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
