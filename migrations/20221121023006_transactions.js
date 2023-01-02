exports.up = function (knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id");
    table.integer("amount");
    table.string("reference");
    table.text("description");

    table.enu("type", ["withdrawal", "top-up", "transfer"]);
    table.enu("method", ["card", "wallet"]);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.integer("card_id").unsigned().references("cards.id");
    table.integer("user_id").unsigned().notNullable().references("users.id");
  });
};

exports.down = function (knex) {
  return knex.schema.referencesdropTable("transactions");
};
