const routes = require("express").Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../middlewares/auth");
const validator = require("../middlewares/validator");
const schemas = require("../validators/wallet.validator");
const middleware = require("../middlewares/wallet");

routes.get("/balance", [auth], walletController.balance);

routes.get("/card", [auth], walletController.cards);
routes.post(
  "/card",
  [auth, validator(schemas.addCard)],
  walletController.addCard
);

routes.get("/card/:id", [auth], walletController.singleCard);
routes.post("/card/default/:id", [auth], walletController.setDefault);

routes.delete("/card/:id", [auth], walletController.removeCard);

routes.post(
  "/fund",
  [auth, validator(schemas.fund), middleware.checkCardOwner],
  walletController.fund
);
routes.post(
  "/card-pay",
  [
    auth,
    validator(schemas.cardPay),
    middleware.checkCardOwner,
    middleware.checkAmount,
  ],
  walletController.cardPayment
);
routes.post(
  "/transfer",
  [
    auth,
    validator(schemas.walletPay),
    middleware.checkAmount,
    middleware.checkUserWallet,
  ],
  walletController.walletPayment
);

routes.get("/transaction", [auth], walletController.transaction);
routes.get("/transaction/:id");

routes.get("/card-history/:id", [auth], walletController.cardHistory);
routes.get("/wallet-history", [auth], walletController.walletHistory);

routes.post(
  "/verifyOtp",
  [auth, validator(schemas.verifyOtp)],
  walletController.verifyOtp
);
routes.post(
  "/verifyPin",
  [auth, validator(schemas.verifyPin)],
  walletController.verifyPin
);

routes.get("/banks", walletController.banks);

routes.post(
  "/withdraw",
  [auth, middleware.checkUserWallet],
  walletController.withdraw
);

routes.post("/verify", walletController.verifyAcct);

module.exports = routes;
