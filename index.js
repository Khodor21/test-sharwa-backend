const express = require("express");
const app = express();

const categoriesRoutes = require("./routes/categoriesRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mainSectionRoutes = require("./routes/mainSectionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const configurationRoutes = require("./routes/configurationRoutes");
const heroRoutes = require("./routes/heroRoutes");

const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://sharwa-frontend.vercel.app",
    "https://www.sharwalb.com",
    "https://sharwa-frontend-gules.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api", categoriesRoutes);
app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", mainSectionRoutes);
app.use("/api", orderRoutes);
app.use("/api", configurationRoutes);
app.use("/api", heroRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
