import db from "./db.js";

export default function handler(req: any, res: any) {
  const method = req.method;

  if (method === "GET") {
    try {
      const rows = db.prepare("SELECT * FROM cars").all();
      const cars = rows.map((r: any) => JSON.parse(r.data));
      return res.status(200).json(cars);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to load cars" });
    }
  }

  if (method === "POST") {
    try {
      const car = req.body || {};
      if (!car.id) {
        car.id = `car-${Date.now()}`;
      }
      const carDataString = JSON.stringify(car);
      db.prepare("INSERT OR REPLACE INTO cars (id, data) VALUES (?, ?)").run(car.id, carDataString);
      return res.status(200).json({ success: true, id: car.id });
    } catch (err: any) {
      console.error("Database Error on save car:", err);
      return res.status(500).json({ error: err.message || "Failed to save car to database" });
    }
  }

  if (method === "DELETE") {
    try {
      const id = req.query.id || req.params?.id || req.url?.split("/").pop()?.split("?")[0];
      if (!id || id === "cars") {
        return res.status(400).json({ error: "Car ID is required for deletion" });
      }
      db.prepare("DELETE FROM cars WHERE id = ?").run(id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to delete car" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
