const { Country, State } = require("../models");
const { success, error } = require("../utils/response");
const { sequelize } = require("../db");

const { Op } = require("sequelize");
const { createBundleSchema } = require("../validators/country.validators");

// POST /api/countries/create
exports.create = async (req, res, next) => {
  try {
    console.log(req.body, "req.body", res, "res", next, "next");
    const { name, isoCode, isActive } = req.body;
    if (!name) return error(res, "name is required", 400);

    const exists = await Country.findOne({ where: { name } });
    if (exists) return error(res, "Country already exists", 409);

    const country = await Country.create({
      name,
      isoCode: isoCode?.toUpperCase(),
      isActive: isActive ?? true,
    });
    return success(res, "Country added.", 201);
  } catch (e) {
    next(e);
  }
};

// POST /api/countries/list  (simple list + optional search/active filter)
exports.list = async (req, res, next) => {
  try {
    const { search, isActive } = req.body || {};
    const where = {};
    if (typeof isActive === "boolean") where.isActive = isActive;
    if (search && search.trim())
      where.name = { [Op.like]: `%${search.trim()}%` };

    const rows = await Country.findAll({ where, order: [["name", "ASC"]] });
    return success(res, rows);
  } catch (e) {
    next(e);
  }
};

// POST /api/countries/list-with-states (LEFT OUTER JOIN countries → states)
exports.listWithStates = async (req, res, next) => {
  try {
    const { includeInactiveStates = false } = req.body || {};
    const rows = await Country.findAll({
      order: [
        ["name", "ASC"],
        [{ model: State, as: "states" }, "name", "ASC"],
      ],
      include: [
        {
          model: State,
          as: "states",
          required: false, // LEFT JOIN (outer) → countries even if no states
          where: includeInactiveStates ? undefined : { isActive: true },
          attributes: [
            "id",
            "name",
            "code",
            "isActive",
            "countryId",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });
    return success(res, rows);
  } catch (e) {
    next(e);
  }
};

// Atomically create a country and its states in ONE transaction
exports.createBundle = async (req, res, next) => {
  try {
    // 1) Validate input
    const { value, error: valErr } = createBundleSchema.validate(req.body);
    if (valErr) return error(res, valErr.message, 400);

    // 2) Enforce unique country name
    const exists = await Country.findOne({ where: { name: value?.name } });
    if (exists) return error(res, "Country already exists", 409);

    // 3) Run the bundle inside a managed transaction
    await sequelize.transaction(async (t) => {
      // console.log("Transaction started...", t.id);
      // 3a) Create country
      const country = await Country.create(
        {
          name: value.name,
          isoCode: value.isoCode || null,
          isActive: value.isActive ?? true,
        },
        { transaction: t }
      );

      // 3b) Prepare states (attach FK)
      const statesPayload = (value.states || [])
        .filter((s) => s && s.name && s.name.trim() !== "")
        .map((s) => ({
          name: s.name.trim(),
          code: s.code?.trim() || null,
          isActive: s.isActive ?? true,
          countryId: country.id,
        }));

      // 3c) Bulk insert states if provided
      let states = [];
      if (statesPayload.length) {
        states = await State.bulkCreate(statesPayload, {
          transaction: t,
          returning: true,
        });
      }

      // 3d) Optionally do side-effects AFTER the commit
      t.afterCommit(() => {
        // e.g., enqueue a job/emit event
        // console.log('Country bundle committed:', country.id);
      });

      // What the transaction returns becomes the API response data
      return { country, states };
    });

    return success(
      res,
      "Bulk addition of Countries & States completed successfully.",
      200
    );
  } catch (e) {
    // Any error thrown inside the callback auto-ROLLS BACK the transaction
    next(e);
  }
};
