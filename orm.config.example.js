const isProd = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'prod';

module.exports = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PROT,
  username: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/entity/*{.ts,.js}'],
  migrations: ['migration/*.{.ts,.js}'],
  cli: { migrationsDir: 'migration' },
  autoLoadEntities: true,
  synchronize: !isProd,
  keepConnectionAlive: true,
  logger: isProd ? 'advanced-console' : 'advanced-console',
  logging: isProd ? ['warn', 'error'] : ['query', 'error', 'warn'],
};
