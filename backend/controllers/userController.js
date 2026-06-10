import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    let users = [];
    if (req.user.role === "Manager") {
      users = await User.find().select("-password");
    } else if (req.user.role === "TeamLead") {
      users = await User.find({ teamLead: req.user._id }).select("-password");
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};