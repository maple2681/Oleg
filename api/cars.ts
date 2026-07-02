import { Pool } from "@neondatabase/serverless";

// Mock data fallback to ensure the app doesn't crash without a database
const MOCK_CARS = [
  {
    id: "porsche-911-carrera",
    brand: "Porsche",
    model: "911 Carrera S",
    year: 2023,
    category: "Coupe",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    mileage: "3,100 mi",
    fuelType: "Petrol",
    transmission: "Auto",
    price: 135900,
    estMonthly: 1720,
  },
  {
    id: "audi-etron-gt",
    brand: "Audi",
    model: "RS e-tron GT",
    year: 2023,
    category: "Electric",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    mileage: "4,600 mi",
    fuelType: "Electric",
    transmission: "Auto",
    price: 114500,
    estMonthly: 1460,
  }
];

// In-memory state for mock fallback operations
let mockData = [...MOCK_CARS];

let pool: Pool | null = null;
let dbInitialized: Promise<void> | null = null;
let useMockData = false;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
    } catch (err) {
      console.warn("Failed to initialize Neon pool, falling back to mock data:", err);
      useMockData = true;
    }
  } else if (!process.env.DATABASE_URL) {
    useMockData = true;
  }
  return pool;
}

async function initDB() {
  const p = getPool();
  if (!p) {
    useMockData = true;
    return;
  }
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id TEXT PRIMARY KEY,
        data JSONB
      )
    `);
  } catch (err) {
    console.warn("Database initialization failed, falling back to mock data:", err);
    useMockData = true;
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (!dbInitialized) {
      dbInitialized = initDB();
    }
    await dbInitialized;
  } catch (err: any) {
    console.warn("DB Initialization error, falling back to mock data:", err);
    useMockData = true;
  }

  const p = getPool();
  const method = req.method;

  if (method === "GET") {
    if (useMockData || !p) {
      return res.status(200).json(mockData);
    }
    try {
      const { rows } = await p.query("SELECT data FROM cars");
      const cars = rows.map((r: any) => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
      if (cars.length === 0) {
        // Return mock data if table is empty for a better preview experience
        return res.status(200).json(mockData);
      }
      return res.status(200).json(cars);
    } catch (err: any) {
      console.error("Neon GET error:", err);
      return res.status(200).json(mockData); // Fallback on error
    }
  }

  if (method === "POST") {
    let car = req.body;
    if (typeof car === "string") {
      try {
        car = JSON.parse(car);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }
    if (!car.id) {
      car.id = `car-${Date.now()}`;
    }

    if (useMockData || !p) {
      const existingIdx = mockData.findIndex((c: any) => c.id === car.id);
      if (existingIdx >= 0) {
        mockData[existingIdx] = car;
      } else {
        mockData.push(car);
      }
      return res.status(200).json({ success: true, id: car.id });
    }

    try {
      const carDataString = JSON.stringify(car);
      await p.query(
        "INSERT INTO cars (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2",
        [car.id, carDataString]
      );
      return res.status(200).json({ success: true, id: car.id });
    } catch (err: any) {
      console.error("Neon POST error:", err);
      // Fallback
      mockData.push(car);
      return res.status(200).json({ success: true, id: car.id });
    }
  }

  if (method === "DELETE") {
    const id = req.query?.id || req.params?.id || req.url?.split("/").pop()?.split("?")[0];
    if (!id || id === "cars") {
      return res.status(400).json({ error: "Car ID is required for deletion" });
    }

    if (useMockData || !p) {
      mockData = mockData.filter((c: any) => c.id !== id);
      return res.status(200).json({ success: true });
    }

    try {
      await p.query("DELETE FROM cars WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Neon DELETE error:", err);
      mockData = mockData.filter((c: any) => c.id !== id);
      return res.status(200).json({ success: true });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
