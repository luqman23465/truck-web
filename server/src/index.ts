import express from 'express';
import cors from 'cors';
import db from './db/database';
import { TruckSchema, DriverSchema, ClientSchema, TripSchema, ExpenseSchema } from './db/schema';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const monthlyRevenue = db.prepare("SELECT SUM(revenue) as total FROM trips WHERE start_date >= date('now', 'start of month') AND status = 'completed'").get() as any;
    const monthlyProfit = db.prepare("SELECT SUM(profit) as total FROM trips WHERE start_date >= date('now', 'start of month') AND status = 'completed'").get() as any;
    const clientBalances = db.prepare("SELECT SUM(balance) as total FROM clients").get() as any;
    const payablesDue = db.prepare("SELECT SUM(amount) as total FROM expenses WHERE date >= date('now', 'start of month')").get() as any;

    const activeTrucks = db.prepare("SELECT COUNT(*) as count FROM trucks WHERE status = 'active'").get() as any;
    const totalTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE start_date >= date('now', 'start of month')").get() as any;
    const activeClients = db.prepare("SELECT COUNT(DISTINCT client_id) as count FROM trips WHERE status IN ('pending', 'in_progress')").get() as any;
    const unpaidPayables = db.prepare("SELECT COUNT(*) as count FROM expenses WHERE trip_id IS NULL").get() as any;

    const recentTrips = db.prepare(`
      SELECT t.*, c.name as client_name, d.name as driver_name, tr.plate_number as truck_plate
      FROM trips t
      JOIN clients c ON t.client_id = c.id
      JOIN drivers d ON t.driver_id = d.id
      JOIN trucks tr ON t.truck_id = tr.id
      ORDER BY t.start_date DESC LIMIT 5
    `).all();

    res.json({
      revenue: monthlyRevenue.total || 0,
      profit: monthlyProfit.total || 0,
      balances: clientBalances.total || 0,
      payables: payablesDue.total || 0,
      quickStats: {
        activeTrucks: activeTrucks.count || 0,
        totalTrips: totalTrips.count || 0,
        activeClients: activeClients.count || 0,
        unpaidPayables: unpaidPayables.count || 0
      },
      recentTrips
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trucks CRUD
app.get('/api/trucks', (req, res) => {
  const trucks = db.prepare('SELECT * FROM trucks').all();
  res.json(trucks);
});

app.post('/api/trucks', (req, res) => {
  try {
    const data = TruckSchema.parse(req.body);
    const result = db.prepare('INSERT INTO trucks (plate_number, model, status) VALUES (?, ?, ?)').run(data.plate_number, data.model, data.status);
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Drivers CRUD
app.get('/api/drivers', (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers').all();
  res.json(drivers);
});

app.post('/api/drivers', (req, res) => {
  try {
    const data = DriverSchema.parse(req.body);
    const result = db.prepare('INSERT INTO drivers (name, license_number, phone, status) VALUES (?, ?, ?, ?)').run(data.name, data.license_number, data.phone, data.status);
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Clients CRUD
app.get('/api/clients', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients').all();
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  try {
    const data = ClientSchema.parse(req.body);
    const result = db.prepare('INSERT INTO clients (name, contact_person, phone, email, balance) VALUES (?, ?, ?, ?, ?)').run(data.name, data.contact_person, data.phone, data.email, data.balance);
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Trips CRUD
app.get('/api/trips', (req, res) => {
  const trips = db.prepare(`
    SELECT t.*, c.name as client_name, d.name as driver_name, tr.plate_number as truck_plate
    FROM trips t
    JOIN clients c ON t.client_id = c.id
    JOIN drivers d ON t.driver_id = d.id
    JOIN trucks tr ON t.truck_id = tr.id
  `).all();
  res.json(trips);
});

app.post('/api/trips', (req, res) => {
  try {
    const data = TripSchema.parse(req.body);
    const result = db.prepare('INSERT INTO trips (truck_id, driver_id, client_id, start_date, end_date, origin, destination, revenue, cost, profit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      data.truck_id, data.driver_id, data.client_id, data.start_date, data.end_date, data.origin, data.destination, data.revenue, data.cost, data.profit, data.status
    );
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Expenses CRUD
app.get('/api/expenses', (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses').all();
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  try {
    const data = ExpenseSchema.parse(req.body);
    const result = db.prepare('INSERT INTO expenses (trip_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(
      data.trip_id, data.type, data.amount, data.date, data.description
    );
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
