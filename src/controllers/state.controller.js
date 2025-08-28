const { Country, State } = require("../models");
const { success, error } = require("../utils/response");
const { Op } = require("sequelize");

// POST /api/states/create
exports.create = async (req, res, next) => {
  try {
    const { name, code, countryId, isActive } = req.body;
    if (!name) return error(res, "name is required", 400);
    if (!countryId) return error(res, "countryId is required", 400);

    // Ensure country exists
    const country = await Country.findByPk(countryId);
    if (!country) return error(res, "Invalid countryId", 400);

    const state = await State.create({
      name,
      code,
      countryId,
      isActive: isActive ?? true,
    });
    return success(res, state, 201);
  } catch (e) {
    next(e);
  }
};

// POST /api/states/list (INNER JOIN states → country when join="inner")
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.body.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.body.limit ?? 20, 10))
    );
    const offset = (page - 1) * limit;

    const { search, isActive, countryId, join } = req.body || {};
    const where = {};
    if (typeof isActive === "boolean") where.isActive = isActive;
    if (search && search.trim())
      where.name = { [Op.like]: `%${search.trim()}%` };
    if (countryId) where.countryId = countryId;

    const { rows, count } = await State.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
      include: [
        {
          model: Country,
          as: "country",
          required: join === "inner" ? true : false, // INNER vs LEFT join
          attributes: ["id", "name", "isoCode", "isActive"],
        },
      ],
    });

    return success(res, {
      items: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      joinType: join === "inner" ? "INNER" : "LEFT",
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/states/get-by-id  → include its country
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return error(res, "id is required", 400);

    const state = await State.findOne({
      where: { id },
      include: [
        {
          model: Country,
          as: "country",
          attributes: ["id", "name", "isoCode", "isActive"],
        },
      ],
    });
    if (!state) return error(res, "State not found", 404);

    return success(res, state);
  } catch (e) {
    next(e);
  }
};
