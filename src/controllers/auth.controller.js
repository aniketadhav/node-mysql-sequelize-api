const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validators");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await User.findOne({ where: { email: value.email } });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await User.create({
      name: value.name,
      email: value.email,
      passwordHash,
    });

    return res
      .status(201)
      .json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const user = await User.findOne({ where: { email: value.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(value.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

// src/controllers/auth.controller.js
exports.me = async (req, res, next) => {
  try {
    // req.user is set by auth middleware after verifying JWT
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "createdAt"],
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
};
