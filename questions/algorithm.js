'use strict';

class _Node {
  constructor(data) {
    this.data = data,
    this.next = null;
    this.prev = null;
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  enqueue(data) {
    const question = new _Node(data);
    if (this.first === null) {
      this.first = question;
    }
    if (this.last) {
      question.next = this.last;
      this.last.prev = question;
    }
    this.last = question;
  }

  dequeue() {
    if (this.first === null) {
      return;
    }

    const question = this.first;
    this.first = question.prev;

    if (question === this.last) {
      this.last = null;
    }
    return question.data;
  }
}

const helpers = {
  peek: queue => {
    return queue.first;
  },
  count: queue => {
    let count = 0;
    let temp = queue.first;
    while(queue.last.next !== null) {
      queue.last.next = temp;
      count++;
    }
    return count;
  }
};

const setQuestions = (question, isCorrect) => {
  //run this function in the responses endpoint when the response is posted to the User's record (inside the promise)
  questionQueue.dequeue();
  questionQueue.enqueue(question);
};

const populateQueue = (Model, queue) => {
  Model.find()
    .then(data => {
      return data.forEach(question => {
        queue.enqueue(question);
      });
    });
  return queue;
};

let questionQueue = new Queue();

module.exports = { helpers, setQuestions, populateQueue, questionQueue };

//Get the user's record; 
//if the performance array is empty, populate the queue
