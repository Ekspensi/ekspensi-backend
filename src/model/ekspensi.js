import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Ekspensi = sequelize.define(
  "ekspensi",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nominal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    klasifikasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: "ekspensi", createdAt: "created_at", updatedAt: "updated_at" }
);

export default Ekspensi;
