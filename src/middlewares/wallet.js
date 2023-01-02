const walletService = require("../services/wallet.service");
const createError = require("http-errors");
const knex = require("../../knexfile");
const Knex_func = require("knex");

const db = Knex_func(knex[process.env.NODE_ENV]);

module.exports = {
  async checkCardOwner(req, res, next) {
    const { card_id } = req.body;

    const card = await walletService.singleCard(card_id);

    if (!card.length)
      return next(
        createError.NotFound("Cannot process transaction - Invalid card")
      );

    if (card[0].user_id != req.user.id)
      return next(createError.Unauthorized("Cannot process transaction"));

    return next();
  },

  async checkAmount(req, res, next) {
    const { recipient } = req.body;

    const exists = await db.table("users").where("email", recipient);

    if (!exists.length) return next(createError.NotFound("User not found"));
    if (exists[0].id == req.user.id)
      return next(createError.NotFound("Cannot transfer funds to yourself"));
    return next();
  },

  async checkUserWallet(req, res, next) {
    const { amount } = req.body;

    const user = await db.table("users").where("id", req.user.id);

    if (amount > user[0].wallet || user[0].wallet == 0)
      return next(createError.BadRequest("Insufficient Wallet Balance"));

    return next();
  },
};
