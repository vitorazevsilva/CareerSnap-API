/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("experiences", table => {
      table.increments("id").primary();
      table.string("role").notNullable();
      table.date("start_date").notNullable();
      table.date("end_date").notNullable();
      table.string("company").notNullable();
      table.string("description").notNullable();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("experiences");
};
