const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(511),
      allowNull: false,
      unique: "question_title_key"
    },
    questiontext: {
      type: DataTypes.STRING(4095),
      allowNull: false
    },
    dateasked: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'question',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "question_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "question_title_key",
        unique: true,
        fields: [
          { name: "title" },
        ]
      },
    ]
  });
};
