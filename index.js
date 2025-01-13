const express = require("express");
const app = express();
const categoriesRoutes = require("./routes/categoriesRoutes");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use("/api", categoriesRoutes);

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
