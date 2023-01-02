exports.up = function (knex) {
  return knex.schema.createTable("cards", (table) => {
    table.increments("id");
    table.string("name");
    table.string("authorization_code");
    table.boolean("default").defaultTo("false");
    table.string("last4");
    table.string("exp_month");
    table.string("exp_year");
    table.string("email");
    table.string("bin");
    table.string("bank");
    table.string("signature");
    table.string("card_type");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.integer("user_id").unsigned().notNullable().references("users.id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("cards");
};
