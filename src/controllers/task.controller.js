const { Task } = require("../models");

const { Op } = require("sequelize");

// POST /api/tasks/create
exports.create = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const task = await Task.create({ title, userId: req.user.id });
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
};
// POST /api/tasks/list
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.body.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.body.limit ?? 20, 10))
    );
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };

    // filter by done
    if (typeof req.body.done === "boolean") {
      where.done = req.body.done;
    }

    // NEW: filter by title search
    if (req.body.search && req.body.search.trim() !== "") {
      where.title = { [Op.like]: `%${req.body.search.trim()}%` };
    }

    const { rows, count } = await Task.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (e) {
    next(e);
  }
};

// src/controllers/task.controller.js
exports.update = async (req, res, next) => {
  try {
    const { id, title, done } = req.body;
    if (!id) return res.status(400).json({ message: "id is required" });

    // ensure user can only update their own task
    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = !!done;

    await task.save();
    res.json(task);
  } catch (e) {
    next(e);
  }
};

exports.removePost = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id is required" });

    // ensure the task belongs to the authenticated user
    const count = await Task.destroy({ where: { id, userId: req.user.id } });
    if (!count) return res.status(404).json({ message: "Task not found" });

    // 204 = success, no content
    // return res.status(204).send();
    return res
      .status(200)
      .json({ ok: true, message: "Task deleted successfully", deletedId: id });
  } catch (e) {
    next(e);
  }
};
