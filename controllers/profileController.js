const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find();
    res.status(200).json(customers);
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};

const getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, district, city, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.district = district || user.district;
    user.city = city || user.city;
    user.address = address || user.address;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByIdAndDelete(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getAllCustomers, getProfile, updateProfile, deleteAccount };
