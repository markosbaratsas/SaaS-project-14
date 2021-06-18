const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('keyword', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    keyword: {
      type: DataTypes.STRING(127),
      allowNull: false,
      unique: "keyword_keyword_key"
    }
  }, {
    sequelize,
    tableName: 'keyword',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "keyword_keyword_key",
        unique: true,
        fields: [
          { name: "keyword" },
        ]
      },
      {
        name: "keyword_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
