let DataTypes = require("sequelize").DataTypes;
let _User = require("./User");
let _answer = require("./answer");
let _keyword = require("./keyword");
let _keyword_question = require("./keyword_question");
let _question = require("./question");

function initModels(sequelize) {
  let User = _User(sequelize, DataTypes);
  let answer = _answer(sequelize, DataTypes);
  let keyword = _keyword(sequelize, DataTypes);
  let keyword_question = _keyword_question(sequelize, DataTypes);
  let question = _question(sequelize, DataTypes);

  keyword.belongsToMany(question, { as: 'questions', through: keyword_question, foreignKey: "keywordid", otherKey: "questionid" });
  question.belongsToMany(keyword, { as: 'keywords', through: keyword_question, foreignKey: "questionid", otherKey: "keywordid" });
  answer.belongsTo(User, { as: "user", foreignKey: "userid"});
  User.hasMany(answer, { as: "answers", foreignKey: "userid"});
  question.belongsTo(User, { as: "user", foreignKey: "userid"});
  User.hasMany(question, { as: "questions", foreignKey: "userid"});
  keyword_question.belongsTo(keyword, { as: "keyword", foreignKey: "keywordid"});
  keyword.hasMany(keyword_question, { as: "keyword_questions", foreignKey: "keywordid"});
  answer.belongsTo(question, { as: "question", foreignKey: "questionid"});
  question.hasMany(answer, { as: "answers", foreignKey: "questionid"});
  keyword_question.belongsTo(question, { as: "question", foreignKey: "questionid"});
  question.hasMany(keyword_question, { as: "keyword_questions", foreignKey: "questionid"});

  return {
    User,
    answer,
    keyword,
    keyword_question,
    question,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
