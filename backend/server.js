const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Add your routes
app.get("/", (req, res) => res.send("CityPulse backend is running"));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
  .catch(err => console.error(err));
