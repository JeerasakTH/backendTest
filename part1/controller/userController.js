const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const JWT_SECRET = "7c11ca869190c3a219d20f2a";

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return res.status(404).json({
      status: "fail",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.log(err);
  }

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: "User already exists! Login Instead",
    });
  }

  const hashedPassword = bcrypt.hashSync(password);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return new Error(err);
  }

  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "User not found. Sign up Please",
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid Email / Password",
    });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  // Remove password from output
  user.password = undefined;

  res.cookie(String(user._id), token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30d
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({
    status: "success",
    message: "Successfully Logged In",
    token,
  });
};

exports.verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    res.status(404).json({
      status: "fail",
      message: "Token not found",
    });
  }

  const token = cookies.split("=")[1];

  jwt.verify(String(token), JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid token",
      });
    }
    req.id = user.id;
  });
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = async (req, res, next) => {
  // 1. Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.id, filteredBody, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.uploadUserPhoto = upload.single("photo");
