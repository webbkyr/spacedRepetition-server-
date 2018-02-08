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
  return res.json({data: 'hooray!'});
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
      //if correct, move it to the back of the list
      //if incorrect move it back one
      user.performance.response = response;
      user.tail = (user.performance.length -1);

      //the index
      const answeredQuestionIndex = user.head;
      //the node
      const answeredQuestion = user.performance[answeredQuestionIndex];

      // if (answeredQuestion.answer === response) {
      //   answeredQuestion.correctCount++;
      // }
      if (user.head >= user.tail) {
        user.head = 0;
      }
      else {
        user.head = user.head+1;
      }

      if (answeredQuestion.answer === response) {
        answeredQuestion.correctCount++;
        //if correct, move the question to the tail's index
        answeredQuestion.next = user.tail;
      }
      else {
        //get a handle on the next question
        answeredQuestion.next = user.head;
        //go up to spots from answered question to set that node's prev to answered question
        user.performance[answeredQuestion.next].prev = answeredQuestion.next;
      }
    

      // answeredQuestion.next = user.tail;

      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    });
});

module.exports = { router };