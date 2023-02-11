module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: '6001',
      user: 'db_admin',
      password: 'mypasswd',
      database: 'careersnap',
    },
    debug: false,
    migrations: {
      directory: 'src/migrations/test',
    },
    seeds: {
      directory: 'src/seed/test',
    },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
  prod: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: '7001',
      user: 'db_admin',
      password: 'mypasswd',
      database: 'careersnap',
    },
    debug: false,
    migrations: {
      directory: 'src/migrations/production',
    },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
};
