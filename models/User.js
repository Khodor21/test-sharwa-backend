const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    district: { type: String },
    city: { type: String },
    address: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

User.syncIndexes()
  .then(() => {
    console.log("User indexes successfully synchronized with MongoDB.");
  })
  .catch((err) => {
    console.error("Failed to sync User indexes:", err);
  });

module.exports = User;
