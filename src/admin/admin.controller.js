const User_Model = require("../user/user.model");
const bcrypt = require("bcrypt");
const shareCredential = require("../services/shareCredential.service");

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      name,
      isEmailVerified,
      status,
    } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};
    
    if (role) {
      filter.role = { $regex: role, $options: "i" };
    }

    if (name) {
      const nameRegex = { $regex: name, $options: "i" };

      const nameParts = name.split(" ");

      const conditions = [];
      if (nameParts.length > 1) {
        conditions.push(
          {
            firstName: { $regex: nameParts[0], $options: "i" },
            lastName: { $regex: nameParts[1], $options: "i" },
          },
          {
            firstName: { $regex: nameParts[1], $options: "i" },
            lastName: { $regex: nameParts[0], $options: "i" },
          }
        );
      }

      conditions.push({ firstName: nameRegex }, { lastName: nameRegex });

      filter.$or = conditions;
    }

    if (isEmailVerified !== undefined) {
      filter.isEmailVerified = isEmailVerified === "true";
    }
    if (status) {
      filter.status = { $regex: status, $options: "i" };
    }

    const totalUsersCount = await User_Model.countDocuments(filter);
    const users = await User_Model.find(filter).skip(skip).limit(pageSize);

    const totalPages = Math.ceil(totalUsersCount / pageSize);
    const remainingPages =
      totalPages - pageNumber > 0 ? totalPages - pageNumber : 0;

    const totalCustomers = await User_Model.countDocuments({
      role: "Customer",
    });
    const totalMembers = await User_Model.countDocuments({
      role: "Member",
    });
    const activeMembers = await User_Model.countDocuments({
      role: "Member",
      status: "Activate",
    });
    const activeCustomers = await User_Model.countDocuments({
      role: "Customer",
      status: "Activate",
    });
    const activeUsers = await User_Model.countDocuments({ status: "Activate" });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      meta: {
        totalUsersCount,
        currentPage: pageNumber,
        totalPages,
        remainingPages,
        pageSize: users.length,
        totalCustomers,
        activeCustomers,
        activeUsers,
        totalMembers,
        activeMembers
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User_Model.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User_Model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
      
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User_Model.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await User_Model.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


const generateRandomPassword = (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
};

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      profileImage,
      country,
      state,
      city,
      zipCode,
      deliveryAddress,
      role,
      restaurant,
      kitchen,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }
    const userId = req.userId;

    const existingUser = await User_Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const generatedPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = await User_Model.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      gender,
      profileImage,
      country,
      state,
      city,
      zipCode,
      deliveryAddress,
      role,
      restaurant,
      kitchen,
      createdBy: userId,
      isEmailVerified: true,
    });

    let name = `${firstName} ${lastName}`;

    if (newUser) {
      await shareCredential(
        name,
        email,
        generatedPassword,
        email,
        "Your Account Credentials",
        "../views/shareCredential.ejs"
      );
    }
    
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
    });
  }
};


module.exports = {
  getAllUsers,
  getById,
  updateById,
  deleteById,
  createUser,
};
