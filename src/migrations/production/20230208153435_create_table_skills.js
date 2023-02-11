/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("skills", table => {
      table.increments("id").primary();
      table.string("designation").notNullable();
      table.integer("start_year").notNullable();
      table.integer("completion_year").notNullable();
      table.string("institution").notNullable();
      table.string("field_of_study").notNullable();
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
    return knex.schema.dropTable("skills");
};
  
