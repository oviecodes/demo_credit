exports.up = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.string("token");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("token");
  });
};
