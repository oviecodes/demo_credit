const crypto = require("crypto");
const createError = require("http-errors");
const knex = require("../../knexfile");
const Knex_func = require("knex");
const paystack = require("./paystack.service");

const db = Knex_func(knex[process.env.NODE_ENV]);

class walletService {
  static async banks() {
    const banks = await paystack.getBanks();
    return banks.data.data;
  }

  static async verifyAcct(data) {
    try {
      const verify = await paystack.resolveAccount(data);
      return verify.data;
    } catch (error) {
      throw createError.UnprocessableEntity("Invalid Credentials");
    }
  }

  static async withdraw(data) {
    try {
      const verify = await paystack.resolveAccount(data);

      data.amount = parseInt(data.amount * 100);
      if (verify.data.status == true) {
        const recipient = await paystack.transferRecipient(data);
        data.recipient = recipient.data.data.recipient_code;

        const withdrawal = await paystack.withdraw(data);
        // return withdrawal.data;
        await this.updateBalance(data.userId, data.amount / 100, "deduct");

        const reference = crypto.randomBytes(5).toString("hex");
        const { amount, userId, description } = data;

        await this.addTransaction({
          amount: parseInt(amount) / 100,
          user_id: userId,
          reference,
          description,
          type: "Withdrawal",
        });

        return;
      }
    } catch (e) {
      throw createError.UnprocessableEntity("cannot process transaction");
    }
  }

  static async cards(user_id) {
    return db.table("cards").where("user_id", user_id);
  }

  static async singleCard(id, trx = db) {
    return trx.table("cards").where("id", id);
  }

  // static async removeCard(card_id) {
  //     return db.table('cards').where('id', card_id).delete()
  // }

  static async addCard(cardDetails) {
    const [expiry_month, expiry_year] = cardDetails.expiry_date.split("/");

    let { email, cvv, number, user_id, pin, name } = cardDetails;

    const reference = crypto.randomBytes(5).toString("hex");
    //charge the user 50 naira to validate the card;
    let cardPayload = {
      email,
      amount: 50 * 100, // charge the user 50 bucks
      reference,
      card: {
        cvv,
        number,
        expiry_month,
        expiry_year,
        pin,
      },
    };

    const chargeResponse = await paystack.charge(cardPayload);

    if (!chargeResponse.data.status)
      throw createError.BadRequest("Unable to add card at the moment");

    if (chargeResponse.data.data.status === "send_otp")
      return {
        message: chargeResponse.data.data.status,
        reference,
        name,
        email,
      };

    if (chargeResponse.data.data.status === "send_pin")
      return {
        message: chargeResponse.data.data.status,
        reference,
        name,
        email,
      };

    await paystack.refund({
      transaction: reference,
      amount: 50 * 100,
    });

    return this.saveCard(user_id, chargeResponse, reference, name, email);
  }

  static async saveCard(userId, chargeResponse, reference, name, email) {
    //if charge was successful, refund users money sharp o
    if (!chargeResponse.data.status)
      throw createError.BadRequest("Unable to add card at the moment");

    let {
      authorization_code,
      card_type,
      last4,
      exp_month,
      exp_year,
      bin,
      bank,
      signature,
    } = chargeResponse.data.data.authorization;

    // await paystack.refund({
    //     transaction: reference
    // })

    const cardExists = await this.findSignature(signature);

    if (cardExists.length)
      throw createError.Conflict("Card Details already Exist");

    const cardAuthDetails = {
      user_id: userId,
      authorization_code,
      bin,
      last4,
      exp_month,
      exp_year,
      card_type,
      signature,
      bank,
      name,
      email,
    };

    return await this.addCardToDb(cardAuthDetails);
  }

  static async verifyOtp(userId, data) {
    const chargeResponse = await paystack.submit_otp(data);

    const { reference, email, name } = data;

    await paystack.refund({
      transaction: reference,
      amount: 50 * 100,
    });

    return await this.saveCard(userId, chargeResponse, reference, name, email);
  }

  static async verifyPin(userId, data) {
    const chargeResponse = await paystack.submit_pin(data);

    const { reference, email, name } = data;

    if (chargeResponse.data.data.status === "send_otp")
      return {
        message: chargeResponse.data.data.status,
        reference,
        name,
        email,
      };

    await paystack.refund({
      transaction: reference,
      amount: 50 * 100,
    });

    return await this.saveCard(userId, chargeResponse, reference, name, email);
  }

  /*static async fix() {
        let reference = '29f0ea81ad'

        const refund = await paystack.refund({
            transaction: reference
        })

        console.log(refund.data.data.transaction.authorization);
    }*/

  static async addCardToDb(data) {
    return db.table("cards").insert(data);
  }

  static async findSignature(signature) {
    return db.table("cards").where("signature", signature);
  }

  static async getTransactions(userId) {
    return db
      .table("transactions")
      .where("user_id", userId)
      .orderBy("id", "desc");
  }

  static async getBalance(userId) {
    const user = await db.table("users").where("id", userId);
    return user[0].wallet;
  }

  static async updateBalance(userId, amount, type, trx = db) {
    const oldBalance = await this.getBalance(userId);
    const wallet = type == "deduct" ? oldBalance - amount : oldBalance + amount;
    await trx("users").where("id", userId).update({ wallet });
  }

  static async addTransaction(data, trx = db) {
    return trx.table("transactions").insert(data);
  }

  static async chargeSavedCard(details) {
    const { amount, userId, card_id, orderId } = details;

    const [card] = await this.singleCard(card_id);

    const { authorization_code, email } = card;

    const data = {
      email,
      amount: parseInt(amount) * 100,
      authorization_code,
    };

    const response = await paystack.chargeAuthorization(data);
    if (!response.data.status)
      throw createError.BadRequest("Unable to charge card at the moment");

    const { reference } = response.data.data;

    if (details.subscription == true) return { reference, authorization_code };

    const order = await db.table("orders").where("id", orderId);
    const balance = order[0].balance - parseInt(amount);

    const payment_type = amount == order[0].balance ? 1 : 0;

    await db.table("orders").where("id", orderId).update({ balance });
    // await this.updateBalance(userId, parseInt(amount), 'deduct')

    const [transaction] = await this.addTransaction({
      amount: parseInt(amount),
      userId,
      authorization_code,
      reference,
      description: `Invoice:${order[0].orderId}`,
      type: 1,
      orderId: order[0].id,
    });

    await this.addCardHistory({
      amount: parseInt(amount),
      transaction_id: transaction,
      userId,
      authorization_code,
      description: `Invoice:${order[0].orderId}`,
      transaction_type: 1,
      order_id: order[0].id,
    });

    // await this.createPayment({
    //   amount: parseInt(amount),
    //   userId,
    //   authorization_code,
    //   payment_type,
    //   debt: balance,
    //   reference,
    //   method: "card",
    //   orderId: order[0].id,
    //   description: `Invoice:${order[0].orderId}`,
    // });

    // await this.addWalletHistory({
    //   amount: parseInt(amount),
    //   userId,
    //   description: `Service Payment`,
    //   order_id: order[0].id,
    //   method: "card",
    //   status: "Successful",
    // });

    return response.data.data;
  }

  static async fund(details) {
    let response;
    try {
      await db.transaction(async (trx) => {
        const { amount, userId, email, card_id } = details;
        const [card] = await this.singleCard(card_id, trx);
        const { authorization_code } = card;

        const data = {
          email,
          amount: parseInt(amount) * 100,
          authorization_code,
        };

        response = await paystack.chargeAuthorization(data);

        if (!response.data.status || response.data.status == "failed")
          throw createError.BadRequest("Unable to charge card at the moment");

        const { reference } = response.data.data;

        await this.updateBalance(userId, parseInt(amount), trx);

        await this.addTransaction(
          {
            amount: parseInt(amount),
            user_id: userId,
            card_id,
            reference,
            description: "Fund wallet",
            type: "top-up",
            method: "card",
          },
          trx
        );
      });
    } catch (e) {
      throw e;
    }

    // await this.addCardHistory({
    //   amount: parseInt(amount),
    //   transaction_id: transaction,
    //   userId,
    //   authorization_code,
    //   description: "Wallet deposit",
    //   transaction_type: 1,
    // });

    return response.data.data;
  }

  static async walletPayment(details) {
    const { amount, userId, recipient, description } = details;

    //use transactions
    try {
      await db.transaction(async (trx) => {
        const recipient_details = await trx("users").where("email", recipient);
        const wallet = recipient_details[0].wallet + parseInt(amount);

        const reference = crypto.randomBytes(5).toString("hex");

        await trx("users").where("email", recipient).update({ wallet });

        await this.updateBalance(userId, parseInt(amount), "deduct", trx);
        await this.addTransaction(
          {
            amount: parseInt(amount),
            reference,
            user_id: userId,
            description,
            type: "transfer",
            method: "wallet",
          },
          trx
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    }

    // await this.addTransaction({
    //   amount: parseInt(amount),
    //   reference,
    //   userId,
    //   description: `Invoice:${order[0].orderId}`,
    //   type: "",
    // });

    // await this.addWalletHistory({
    //   amount: parseInt(amount),
    //   userId,
    //   description: `Service Payment`,
    //   order_id: order[0].id,
    //   method: "Wallet",
    //   status: "Successful",
    // });

    return;
  }

  static async addCardHistory(data) {
    await db.table("card_history").insert(data);
  }

  static async addWalletHistory(data) {
    await db.table("wallet_history").insert(data);
  }

  static async cardHistory(id) {
    const [card] = await db.table("cards").where("id", id);

    return db
      .table("card_history")
      .where("authorization_code", card.authorization_code);
  }

  static async walletHistory(id) {
    return db.table("wallet_history").where("userId", id);
  }

  static async setDefault(data) {
    const { userId, card_id } = data;

    //disable default on all other user cards where defult is true
    await db
      .table("cards")
      .where("userId", userId)
      .where("default", 1)
      .update({ default: 0 });

    //set default true on selected user card
    await db.table("cards").where("id", card_id).update({ default: 1 });

    return;
  }

  static async removeCard(data) {
    const { userId, card_id } = data;

    await db
      .table("cards")
      .where("userId", userId)
      .andWhere("id", card_id)
      .del();
    return;
  }

  static async createPayment(data) {
    await db.table("payments").insert(data);
  }
}

module.exports = walletService;
