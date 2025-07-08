const createApp = require("../../src/server");
const {
  initTestDatabase,
  seedTestData,
  cleanupTestDatabase,
} = require("./database");

// Create test server using the production app factory
const createTestServer = async () => {
  // Initialize test database
  const db = await initTestDatabase();
  await seedTestData(db);

  // Create the app using the production factory function
  const app = createApp(db);

  return { app, db };
};

module.exports = { createTestServer, cleanupTestDatabase };
