import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../fleetops.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS trucks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    status TEXT CHECK(status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    status TEXT CHECK(status IN ('available', 'on_trip', 'off_duty')) DEFAULT 'available'
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    balance REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    revenue REAL NOT NULL,
    cost REAL NOT NULL,
    profit REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    FOREIGN KEY (truck_id) REFERENCES trucks (id),
    FOREIGN KEY (driver_id) REFERENCES drivers (id),
    FOREIGN KEY (client_id) REFERENCES clients (id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,
    type TEXT CHECK(type IN ('fuel', 'maintenance', 'salary', 'toll', 'other')) NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips (id)
  );
`);

export default db;
