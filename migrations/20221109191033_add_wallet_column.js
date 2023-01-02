exports.up = function (knex) {
  return knex.schema.alterTable("users", function (table) {
    table.dropColumn("token");
    table.integer("wallet").defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", function (table) {
    table.string("token");
    table.dropColumn("wallet");
  });
};
