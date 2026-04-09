const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUrl =
  process.env.MONGO_URL ||
  "mongodb://admin:password@localhost:27017/?authSource=admin";
const dbName = process.env.MONGO_DB_NAME || "user-account";
const collectionName = "users";

let client;
let usersCollection;
let dbConnected = false;

async function connectToMongo() {
  if (usersCollection) {
    return usersCollection;
  }

  client = new MongoClient(mongoUrl);
  await client.connect();

  const db = client.db(dbName);
  usersCollection = db.collection(collectionName);
  dbConnected = true;

  return usersCollection;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (_req, res) => {
  try {
    await connectToMongo();
    res.json({ ok: true, database: dbName, connected: dbConnected });
  } catch (error) {
    dbConnected = false;
    res.status(500).json({
      ok: false,
      connected: dbConnected,
      error: "Database connection failed"
    });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const collection = await connectToMongo();
    const users = await collection
      .find({}, { projection: { name: 1, email: 1, age: 1 } })
      .sort({ _id: -1 })
      .toArray();

    res.json(users);
  } catch (error) {
    dbConnected = false;
    res.status(500).json({ message: "Unable to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const collection = await connectToMongo();
    const newUser = {
      name: String(name).trim(),
      email: String(email).trim(),
      age: age ? Number(age) : null,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newUser);
    res.status(201).json({ _id: result.insertedId, ...newUser });
  } catch (error) {
    dbConnected = false;
    res.status(500).json({ message: "Unable to save user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  if (client) {
    await client.close();
  }
  process.exit(0);
});
