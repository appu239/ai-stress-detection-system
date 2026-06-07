const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ============================
   MOCK USERS (TEMP DATABASE)
============================ */
const users = [
  {
    id: "u1",
    email: "admin@stressai.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    id: "u2",
    email: "user@stressai.com",
    password: "user123",
    role: "USER",
  },
];

/* ============================
   TEST ROUTE
============================ */
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

/* ============================
   LOGIN API
============================ */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // TEMP token (later JWT)
  const token = `token-${user.id}`;

  res.json({
    token,
    role: user.role,
    userId: user.id,
  });
});

/* ============================
   SERVER START
============================ */
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});