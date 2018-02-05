'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const QuestionSchema = mongoose.schema([{
  question: { type: String },
  answer: { type: String }
}]);

const Question = mongoose.model('Question', QuestionSchema);

module.exports = { Question };