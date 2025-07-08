const request = require("supertest");
const { createTestServer, cleanupTestDatabase } = require("./setup/testServer");

describe("Health Check API Tests", () => {
  let app;
  let db;

  beforeAll(async () => {
    const testServer = await createTestServer();
    app = testServer.app;
    db = testServer.db;
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  describe("GET /api/test", () => {
    test("should return API status", async () => {
      const response = await request(app).get("/api/test");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("POS API is running!");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("database");
      expect(response.body.database).toBe("Connected");
    });

    test("should return valid timestamp", async () => {
      const response = await request(app).get("/api/test");

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe("GET /api/test/database", () => {
    test("should confirm database connection", async () => {
      const response = await request(app).get("/api/test/database");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Database connection successful!");
      expect(response.body).toHaveProperty("productCount");
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.productCount).toBe("number");
      expect(response.body.productCount).toBe(6); // From seed data
    });

    test("should return product count from seed data", async () => {
      const response = await request(app).get("/api/test/database");

      expect(response.status).toBe(200);
      expect(response.body.productCount).toBeGreaterThan(0);
    });
  });

  describe("API Response Format", () => {
    test("should return consistent response format across endpoints", async () => {
      const endpoints = [
        "/api/test",
        "/api/test/database",
        "/api/products",
        "/api/sales",
        "/api/inventory/low-stock",
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("timestamp");
        expect(typeof response.body.timestamp).toBe("string");

        // Verify timestamp is a valid ISO string
        const timestamp = new Date(response.body.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
      }
    });

    test("should return JSON content type", async () => {
      const response = await request(app).get("/api/test");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    test("should handle CORS headers", async () => {
      const response = await request(app).get("/api/test");

      expect(response.status).toBe(200);
      // CORS headers should be present (depending on configuration)
      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent endpoints", async () => {
      const response = await request(app).get("/api/nonexistent");

      expect(response.status).toBe(404);
    });

    test("should handle malformed requests gracefully", async () => {
      const response = await request(app)
        .post("/api/products")
        .send("invalid json")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });
});
