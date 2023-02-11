/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", table => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.string("password").notNullable();
      table.string("full_name").notNullable();
      table.date("birth_date").notNullable();
      table.string("address").notNullable();
      table.string("country").notNullable();
      table.string("nationality").notNullable();
      table.string("phone").notNullable();
    });
};
  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("users");
};
