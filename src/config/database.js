// config/database.js

import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "postgres",
  "postgres.lpbemkbhuorqvxspeooo",
  "Sup3rSecr3tP2ssw0rd",
  {
    host: "aws-0-ap-southeast-1.pooler.supabase.com",
    dialect: "postgres",
    port: 5432,
    logging: false,
  }
);

export default sequelize;
