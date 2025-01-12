const express = require("express");
const app = express();
const imagesTesting = require("./routes/imagesTesting");
const PORT = process.env.PORT;
const connectDB = require("./config/db");

app.use(express.json());
app.use("/api", imagesTesting);
connectDB();
app.listen(PORT, () => {
  console.log("Hey, Happy Hack");
});
