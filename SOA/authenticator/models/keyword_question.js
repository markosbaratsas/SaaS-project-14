const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('keyword_question', {
    keywordid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'keyword',
        key: 'id'
      }
    },
    questionid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'question',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'keyword_question',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "keyword_question_pkey",
        unique: true,
        fields: [
          { name: "keywordid" },
          { name: "questionid" },
        ]
      },
    ]
  });
};
