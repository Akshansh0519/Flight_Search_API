'use strict';
const {
  Model
} = require('sequelize');

const { ENUMS } = require('../utils');
module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Airplane, {
        foreignKey: 'airplaneId',
        as: 'airplane',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Seat.init({
    airplaneId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    row: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    col: {
      type: DataTypes.STRING,
      allowNull: false
    },
    class: {
      type: DataTypes.ENUM(...Object.values(ENUMS.seat_type)),
      defaultValue: ENUMS.seat_type.ECONOMY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Seat',
  });
  return Seat;
};
