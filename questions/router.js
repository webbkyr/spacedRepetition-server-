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
      console.log('user.head >>>>>>', user.head);
      //answeredQuestion.attempts++;
      // answeredQuestion.prev = (answeredQuestionIndex > 0 ? answeredQuestionIndex-1 : user.tail);
      //answeredQuestion.next++;
      user.head = answeredQuestion.next;
      // console.log(user.performance);

      let currentQ = answeredQuestion;
      console.log('current Q', currentQ)
      if (answeredQuestion.answer === response) {
        let rightLocation;
        rightLocation *= 2;
        let i;
        for(i= 0; i<rightLocation; i++){
          console.log('current Q.next in the loop', currentQ.next)

          // const nextIdx = currentQ.next;
          currentQ = user.performance[i];
        }
        currentQ.next = i;
        console.log('current Q after for loop in correct>>>>>>', currentQ)

        answeredQuestion.next = currentQ.next;
        currentQ.next = answeredQuestionIndex;
        // console.log('The array if correct', user.performance)
        
      }
      else {
        let insertLocation = 2;
        
        let i;
        for(i= 0; i<insertLocation; i++){
          // const nextIdx = currentQ.next;
          currentQ= user.performance[i];
        }
        currentQ.next = i;

        console.log('current Q after for loop in wrong>>>>>>', currentQ)

        answeredQuestion.next = currentQ.next;
        currentQ.next = answeredQuestionIndex;
        // console.log('The array if wrong', user.performance)

      }
        
      /*
        answeredQuestion.correctCount++;
        //change correct answer pointer to 9
        answeredQuestion.next = user.tail;
      }
      else {
        let wrongAnswerIndex = answeredQuestionIndex;
        let insertLocation = 2;
        for (let i=0; i < insertLocation; i++) {
          user.performance[insertLocation].prev = wrongAnswerIndex;
        }

        //         Given a list of questions:
        // Take the first question in the list
        // Ask the question
        // If the answer was correct:
        // Put the question at the back of the list
        // If the answer was wrong:
        // Move the question back one in the list
        // You can use a doubly linked list to do this

        
      }
      */
      // if ((user.head >= user.tail) || (user.head === null))  {
      //   user.head = 0;
      // }
      // else {
      //   // answeredQuestion.next = user.head+1;
      //   user.head = user.head+1;
      // }
      
      console.log('HEAD',user.head, 'TAIL', user.tail);
      
      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    }).catch(err => console.log(err))
});

module.exports = { router };