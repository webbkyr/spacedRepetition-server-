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
      user.performance.response = response;
      user.tail = (user.performance.length -1);

      const answeredQuestionIndex = user.head;
      const answeredQuestion = user.performance[answeredQuestionIndex];

      let assignNextPointer = 0;
      let assignPrevPointer = 0;

      if (answeredQuestion.answer === response) {
        answeredQuestion.correctCount++; 
        user.tail = answeredQuestion;

      }

      for (let i=0; i <= user.tail; i++) {
        console.log('BEGINNING','i >>', i, 'i.next >>>>', user.performance[i].next, 'i.prev >>>,', user.performance[i].prev)
        if (i === 0) {
          user.performance[i].prev = user.tail;
        }
        else {
          if (i === user.tail) {
            user.performance[i].next = 0;
            user.performance[i].prev = assignPrevPointer-1;
  
            console.log('Next pointer', assignNextPointer)
            console.log('Prev pointer', assignPrevPointer)
          }
          else {
    
            user.performance[i].next = assignNextPointer++;
            user.performance[i].prev = assignPrevPointer++;
          }
        }
      }

      // console.log(user.performance);
      console.log('answered q', answeredQuestion)
      console.log('head', user.head)

      // user.head = answeredQuestion.next;

      // if (answeredQuestion.answer === response) {
      //   answeredQuestion.correctCount++; 
      // }
      // else {
      //   // 0 1 0 2 3
      //   let insertIndex = 
        
      // }

      console.log(user.performance);


      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    }).catch(err => console.log(err));
});

module.exports = { router };