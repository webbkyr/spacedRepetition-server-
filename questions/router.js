'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../users/models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { questionQueue, helpers } = require('./algorithm');

const jwtAuth = passport.authenticate('jwt', { session: false});

router.get('/dashboard', jwtAuth, (req, res) => {
  User.findById(req.user.id) 
    .then(user => {
      res.json(user.performance);
    });
});

router.get('/questions', jwtAuth, (req, res) => {
 
  User.findById(req.user.id) 
    .then(user => {
      res.json(user.performance[user.head]);
    });
});

router.get('/next', jwtAuth, (req, res) => {
  User.findById(req.user.id) 
    .then(user => {
      // console.log('USER HEAD IN NEXT ENDPOINT>>>>>>', user.head)
      res.json(user.performance[user.head]);
    });
});

router.post('/responses', jwtAuth, jsonParser, (req, res) => {
  const { response } = req.body;
  User.findById(req.user.id)
    .then(user => {
      user.performance.response = response;
      user.tail = (user.performance.length -1);

      const answeredQuestionIndex = user.head;
      const answeredQuestion = user.performance[answeredQuestionIndex];

      answeredQuestion.attempts++;

      if (answeredQuestion.answer === response) {
        answeredQuestion.correctCount++;
        answeredQuestion.next = user.tail;
      }
      else {
        let wrongAnswerIndex = answeredQuestionIndex;
        let insertLocation = answeredQuestion.next+1;
        for (let i=0; i <= insertLocation; i++) {
          answeredQuestion.next = wrongAnswerIndex;
          // answeredQuestion.next = wrongAnswerIndex;
          // wrongAnswerIndex = user.head+1;
          // user.performance[insertLocation].prev = wrongAnswerIndex;
        

        }
      }
      if (user.head >= user.tail) {
        user.head = 0;
      }
      else {
        user.head = user.head+1;
      }
      

      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    });
});

module.exports = { router };