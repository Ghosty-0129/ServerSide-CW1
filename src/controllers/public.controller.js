const Bid = require("../models/bid.model");

async function getTodaysAlumnus(req, res, next) {
  try {
    const alumnus = await Bid.getTodaysFeatured();

    if (!alumnus) {
      return res.status(404).json({
        message: "No featured alumnus for today. Check back after midnight."
      });
    }

    res.json({ date: new Date().toISOString().split("T")[0], alumnus });
  } catch (err) { next(err); }
}

module.exports = { getTodaysAlumnus };
