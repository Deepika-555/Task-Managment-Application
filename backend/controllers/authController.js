import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// export const register =
//   async (req, res) => {
//     try {
//       const {
//         username,
//         email,
//         password,
//         role,
//         manager,
//         teamLead,
//       } = req.body;

//       const exists =
//         await User.findOne({
//           email,
//         });

//       if (exists) {
//         return res.status(400).json({
//           message:
//             "User already exists",
//         });
//       }

//       const salt =
//         await bcrypt.genSalt(10);

//       const hashedPassword =
//         await bcrypt.hash(
//           password,
//           salt
//         );

//       const user =
//         await User.create({
//           username,
//           email,
//           password:
//             hashedPassword,
//           role,
//           manager,
//           teamLead,
//         });

//       res.status(201).json(user);
//     } catch (error) {
//       res.status(500).json({
//         message:
//           error.message,
//       });
//     }
//   };



export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      manager,
      teamLead,
    } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
    };

    // Only add these fields if they contain a value
    if (manager && manager.trim()) {
      userData.manager = manager;
    }

    if (teamLead && teamLead.trim()) {
      userData.teamLead = teamLead;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const login =
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      });

    if (
      user &&
      (await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      return res.json({
        _id: user._id,
        username:
          user.username,
        role: user.role,
        token:
          generateToken(
            user._id,
            user.role
          ),
      });
    }

    res.status(401).json({
      message:
        "Invalid Credentials",
    });
  };

export const getRegisterHelpers = async (req, res) => {
  try {
    const managers = await User.find({ role: "Manager" }).select("username _id");
    const teamLeads = await User.find({ role: "TeamLead" }).select("username _id");
    res.json({ managers, teamLeads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};