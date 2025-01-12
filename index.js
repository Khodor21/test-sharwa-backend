const express = require("express");
const app = express();
const imagesTesting = require("./routes/imagesTesting");
const productRoutes = require("./routes/productRoutes"); 
const PORT = process.env.PORT || 5000; 
const connectDB = require("./config/db");

app.use(express.json()); 

// Set up your routes
app.use("/api", imagesTesting);
app.use("/api/products", productRoutes); 

// Connect to database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
