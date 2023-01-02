const paystack_secrete = process.env.PAYSTACK_SECRETE_KEY;
const axios = require("axios");
const url = "https://api.paystack.co";
const config = {
  headers: { Authorization: `Bearer ${paystack_secrete}` },
};
const createError = require("http-errors");

class paystackService {
  static async charge(data) {
    try {
      const res = await axios.post(`${url}/charge`, data, config);

      return res;
    } catch (e) {
      throw createError.BadRequest(e.response.data.message);
    }
  }

  static async submit_otp(data) {
    try {
      return await axios.post(`${url}/charge/submit_otp`, data, config);
    } catch (e) {
      throw createError.BadRequest(e.response.data.data.message);
    }
  }

  static async submit_pin(data) {
    try {
      return await axios.post(`${url}/charge/submit_pin`, data, config);
    } catch (e) {
      console.log(e.response.data.data);
      throw createError.BadRequest(e.response.data.data.message);
    }
  }

  static async chargeAuthorization(data) {
    try {
      return await axios.post(
        `${url}/transaction/charge_authorization`,
        data,
        config
      );
    } catch (e) {
      throw createError.BadRequest(e.response.data.message);
    }
  }

  static async refund(data) {
    try {
      return await axios.post(`${url}/refund`, data, config);
    } catch (e) {
      console.log("error", e);
      throw createError.BadRequest(e.response.data.message);
    }
  }

  static async getBanks() {
    return axios({
      method: "get",
      url: "https://api.paystack.co/bank",
    });
  }

  static async resolveAccount(payload) {
    return await axios({
      method: "get",
      url: `https://api.paystack.co/bank/resolve?account_number=${payload.account_number}&bank_code=${payload.bank_code}`,
      headers: {
        Authorization: `Bearer ${paystack_secrete}`,
        "Content-Type": "application/json",
      },
    });
  }

  static async transferRecipient(data) {
    return await axios({
      method: "post",
      url: "https://api.paystack.co/transferrecipient",
      headers: {
        Authorization: `Bearer ${paystack_secrete}`,
        "Content-Type": "application/json",
      },
      data,
    });
  }

  static async withdraw(data) {
    return await axios({
      method: "post",
      url: "https://api.paystack.co/transfer",
      headers: {
        Authorization: `Bearer ${paystack_secrete}`,
        "Content-Type": "application/json",
      },
      data,
    });
  }
}

module.exports = paystackService;
