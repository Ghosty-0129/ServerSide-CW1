const cron   = require("node-cron");
const Bid    = require("../models/bid.model");
const User   = require("../models/user.model");
const { sendBidWinNotification, sendBidLoseNotification } = require("../utils/mailer");

async function selectDailyWinner(dateOverride = null) {
  const today = dateOverride || new Date().toISOString().split("T")[0];
  console.log(`[BidJob] Running winner selection for ${today}`);

  try {
    const bids = await Bid.getBidsForDateOrdered(today);

    if (!bids.length) {
      console.log(`[BidJob] No bids for ${today} — nothing to settle`);
      return;
    }

    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    let winnerBid = null;

    for (const bid of bids) {
      const atLimit = await Bid.hasReachedMonthlyLimit(bid.user_id, year, month);
      if (!atLimit) {
        winnerBid = bid;
        break;
      }
      console.log(`[BidJob] Skipping user ${bid.user_id} — monthly limit reached`);
    }

    if (!winnerBid) {
      await Bid.markAllLost(today);
      console.log(`[BidJob] All eligible bidders at monthly limit — no winner for ${today}`);
      return;
    }

    await Bid.settleDay(winnerBid.id, today);

    await Bid.activateProfile(winnerBid.profile_id);

    await Bid.incrementMonthlyWins(winnerBid.user_id, year, month);

    console.log(`[BidJob] Winner: user ${winnerBid.user_id} | bid £${winnerBid.amount} | profile ${winnerBid.profile_id}`);

    try {
      const winnerUser = await User.findByEmail_orById(winnerBid.user_id);
      if (winnerUser) {
        await sendBidWinNotification(winnerUser.email, today, winnerBid.amount);
      }
    } catch (e) {
      console.error("[BidJob] Failed to send win email:", e.message);
    }

    for (const bid of bids) {
      if (bid.id === winnerBid.id) continue;
      try {
        const loserUser = await User.findByEmail_orById(bid.user_id);
        if (loserUser) {
          await sendBidLoseNotification(loserUser.email, today);
        }
      } catch (e) {
        console.error(`[BidJob] Failed to send lose email to user ${bid.user_id}:`, e.message);
      }
    }

  } catch (err) {
    console.error("[BidJob] Fatal error during winner selection:", err.message);
  }
}

function registerBidJob() {
  cron.schedule("0 0 * * *", selectDailyWinner, {
    timezone: "Europe/London"
  });
  console.log("[BidJob] Midnight winner-selection cron registered (Europe/London)");
}

module.exports = { registerBidJob, selectDailyWinner };
