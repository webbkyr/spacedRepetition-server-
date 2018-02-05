'use strict';

const express = require('express');
const router = express.Router();
const { Question } = require('./models');

router.get('/', (req, res) => {
  return Question.find().then(question => {
    res.json(question);
  });
});

module.exports = { router };