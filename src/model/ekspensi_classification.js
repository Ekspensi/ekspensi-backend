import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EkspensiClassification = sequelize.define(
  "ekspensi_classification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    klasifikasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "ekspensi_classification",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default EkspensiClassification;
