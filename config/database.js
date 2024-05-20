  // config/database.js

  const { Sequelize } = require('sequelize');

  const sequelize = new Sequelize('postgres.lpbemkbhuorqvxspeooo','Sup3rSecr3tP2ssw0rd','postgres',{
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    dialect: 'postgres',
  });

  module.exports = sequelize;
