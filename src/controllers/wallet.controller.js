const createError = require("http-errors");
const walletService = require("../services/wallet.service");

class WalletController {
  static async balance(req, res, next) {
    try {
      const data = await walletService.getBalance(req.user.id);

      return res.status(200).json({
        status: true,
        message: "Wallet balance",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async banks(req, res, next) {
    try {
      console.log("controller");
      const data = await walletService.banks();

      return res.status(200).json({
        status: true,
        message: "All banks",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async withdraw(req, res, next) {
    req.body.userId = req.user.id;

    try {
      const data = await walletService.withdraw(req.body);

      return res.status(200).json({
        status: true,
        message: "Withdrawal successful",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async cards(req, res, next) {
    try {
      const data = await walletService.cards(req.user.id);

      return res.status(200).json({
        status: true,
        message: "User Cards",
        data,
      });
    } catch (e) {
      console.log(e);
      return next(createError(e.statusCode, e.message));
    }
  }

  static async addCard(req, res, next) {
    req.body.user_id = req.user.id;

    try {
      const data = await walletService.addCard(req.body);

      return res.status(200).json({
        status: true,
        message:
          data.message != null ? data.message : "card added successfully",
        data,
      });
    } catch (e) {
      // console.log('error', e)

      return next(createError(e.statusCode, e.message));
    }
  }

  static async singleCard(req, res, next) {
    try {
      const data = await walletService.singleCard(req.params.id);

      return res.status(200).json({
        status: true,
        message: "Single card",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async verifyOtp(req, res, next) {
    try {
      const data = await walletService.verifyOtp(req.user.id, req.body);

      return res.status(200).json({
        status: true,
        message: data.message != null ? data.message : "Otp verified",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async verifyPin(req, res, next) {
    try {
      const data = await walletService.verifyPin(req.user.id, req.body);

      return res.status(200).json({
        status: true,
        message: data.message != null ? data.message : "Pin verified",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async fund(req, res, next) {
    req.body.userId = req.user.id;

    try {
      const data = await walletService.fund(req.body);

      return res.status(200).json({
        status: true,
        message: data.message != null ? data.message : "Funding successful",
        data,
      });
    } catch (e) {
      console.log(e);
      return next(createError(e.statusCode, e.message));
    }
  }

  static async verifyAcct(req, res, next) {
    try {
      const data = await walletService.verifyAcct(req.body);

      return res.status(200).json({
        status: true,
        message: "Account details",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async cardPayment(req, res, next) {
    req.body.userId = req.user.id;

    try {
      const data = await walletService.chargeSavedCard(req.body);

      return res.status(200).json({
        status: true,
        message: data.message != null ? data.message : "Payment successful",
        data,
      });
    } catch (e) {
      console.log("error", e);
      return next(createError(e.statusCode, e.message));
    }
  }

  static async walletPayment(req, res, next) {
    req.body.userId = req.user.id;

    try {
      const data = await walletService.walletPayment(req.body);

      return res.status(200).json({
        status: 200,
        message: "Payment successful",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async cardHistory(req, res, next) {
    try {
      const data = await walletService.cardHistory(req.params.id);

      return res.status(200).json({
        status: true,
        message: "Card History",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async walletHistory(req, res, next) {
    try {
      const data = await walletService.walletHistory(req.user.id);

      return res.status(200).json({
        status: true,
        message: "Wallet history",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async setDefault(req, res, next) {
    req.body.userId = req.user.id;
    req.body.card_id = req.params.id;

    try {
      const data = await walletService.setDefault(req.body);

      return res.status(200).json({
        status: true,
        message: "Default card updated",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async removeCard(req, res, next) {
    req.body.userId = req.user.id;
    req.body.card_id = req.params.id;

    try {
      const data = await walletService.removeCard(req.body);

      return res.status(200).json({
        status: true,
        message: "Card removed successfully",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }

  static async transaction(req, res, next) {
    try {
      const data = await walletService.getTransactions(req.user.id);

      return res.status(200).json({
        status: true,
        message: "Transaction history",
        data,
      });
    } catch (e) {
      return next(createError(e.statusCode, e.message));
    }
  }
}

module.exports = WalletController;
