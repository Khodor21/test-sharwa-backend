const express = require("express");
const app = express();
const categoriesRoutes = require("./routes/categoriesRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mainSectionRoutes = require("./routes/mainSectionRoutes");
const orderRoutes = require("./routes/orderRoutes");

const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());

app.use("/api", categoriesRoutes);
app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", mainSectionRoutes);
app.use("/api", orderRoutes);

connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
