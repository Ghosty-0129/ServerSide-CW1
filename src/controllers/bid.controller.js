const Bid     = require("../models/bid.model");
const { sendBidWinNotification, sendBidLoseNotification } = require("../utils/mailer");

function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

async function getTomorrowSlot(req, res, next) {
  try {
    const tomorrow = getTomorrowDateStr();
    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth() + 1;

    const [existingBid, monthlyStatus] = await Promise.all([
      Bid.findByUserAndDate(req.user.userId, tomorrow),
      Bid.getMonthlyLimit(req.user.userId, year, month)
    ]);

    let bidStatus = null;
    if (existingBid) {
      bidStatus = await Bid.getBidStatus(req.user.userId, tomorrow);
    }

    res.json({
      slot_date:      tomorrow,
      your_bid:       existingBid ? { id: existingBid.id, amount: existingBid.amount } : null,
      bid_status:     bidStatus ? (bidStatus.isWinning ? "winning" : "losing") : null,
      monthly_limit:  monthlyStatus
    });
  } catch (err) { next(err); }
}

async function placeBid(req, res, next) {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "A positive bid amount is required" });
    }

    const tomorrow = getTomorrowDateStr();
    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth() + 1;

    const atLimit = await Bid.hasReachedMonthlyLimit(req.user.userId, year, month);
    if (atLimit) {
      const status = await Bid.getMonthlyLimit(req.user.userId, year, month);
      return res.status(403).json({
        message: `Monthly limit reached. You have won ${status.wins}/${status.limit} times this month.`,
        monthly_limit: status
      });
    }

    const existing = await Bid.findByUserAndDate(req.user.userId, tomorrow);
    if (existing) {
      return res.status(409).json({
        message: "You already have a bid for tomorrow. Use PUT /api/bids/:id to increase it."
      });
    }

    const id         = await Bid.create(req.user.userId, tomorrow, Number(amount));
    const bidStatus  = await Bid.getBidStatus(req.user.userId, tomorrow);

    res.status(201).json({
      message:    "Bid placed successfully",
      bid_id:     id,
      amount:     Number(amount),
      bid_date:   tomorrow,
      bid_status: bidStatus.isWinning ? "winning" : "losing"
    });
  } catch (err) { next(err); }
}

async function updateBid(req, res, next) {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "A positive bid amount is required" });
    }

    const existing = await Bid.findByUserAndDate(req.user.userId, getTomorrowDateStr());
    if (!existing || existing.id !== Number(req.params.id)) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (Number(amount) <= existing.amount) {
      return res.status(400).json({
        message: `New amount must be greater than your current bid. You bid ${existing.amount}.`
      });
    }

    const rows = await Bid.increaseAmount(req.params.id, req.user.userId, Number(amount));
    if (!rows) return res.status(400).json({ message: "Could not update bid" });

    const bidStatus = await Bid.getBidStatus(req.user.userId, getTomorrowDateStr());

    res.json({
      message:    "Bid updated",
      new_amount: Number(amount),
      bid_status: bidStatus.isWinning ? "winning" : "losing"
    });
  } catch (err) { next(err); }
}

async function cancelBid(req, res, next) {
  try {
    const rows = await Bid.cancelBid(req.params.id, req.user.userId);
    if (!rows) return res.status(404).json({ message: "Bid not found or already settled" });
    res.json({ message: "Bid cancelled" });
  } catch (err) { next(err); }
}

async function getBidStatus(req, res, next) {
  try {
    const tomorrow  = getTomorrowDateStr();
    const bidStatus = await Bid.getBidStatus(req.user.userId, tomorrow);

    if (!bidStatus) {
      return res.status(404).json({ message: "You have not placed a bid for tomorrow" });
    }

    res.json({
      bid_date:   tomorrow,
      your_bid:   bidStatus.yourBid,
      bid_status: bidStatus.isWinning ? "winning" : "losing"
      // highest_bid is intentionally omitted (blind bidding)
    });
  } catch (err) { next(err); }
}

async function getMyBids(req, res, next) {
  try {
    const bids = await Bid.findByUser(req.user.userId);
    res.json({ bids });
  } catch (err) { next(err); }
}

async function getMonthlyStatus(req, res, next) {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const status = await Bid.getMonthlyLimit(req.user.userId, year, month);

    res.json({
      year,
      month,
      wins_this_month: status.wins,
      monthly_limit:   status.limit,
      remaining_slots: status.remaining,
      event_bonus:     status.eventBonus
    });
  } catch (err) { next(err); }
}

async function grantEventBonus(req, res, next) {
  try {
    const { userId, year, month } = req.body;
    if (!userId || !year || !month) {
      return res.status(400).json({ message: "userId, year and month are required" });
    }
    await Bid.grantEventBonus(userId, year, month);
    res.json({ message: `Event bonus granted to user ${userId} for ${year}-${month}` });
  } catch (err) { next(err); }
}

module.exports = {
  getTomorrowSlot, placeBid, updateBid, cancelBid,
  getBidStatus, getMyBids, getMonthlyStatus, grantEventBonus
};
