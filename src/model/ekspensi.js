const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ekspensi = sequelize.define(
  "ekspensi",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nominal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    klasifikasi: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { tableName: "ekspensi", createdAt: "created_at", updatedAt: "updated_at" }
);

module.exports = Ekspensi;
