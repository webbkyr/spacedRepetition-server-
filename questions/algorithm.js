'use strict';

class _Node {
  constructor(data) {
    this.data = data,
    this.next = null,
    this.prev = null;
  }
}

class Queue {
  constructor() {
    this.first = null,
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
    return queue.first.data;
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

const setQuestions = (question) => {
  //run this function in the responses endpoint when the response is posted to the User's record (inside the promise)
  questionQueue.dequeue();
  questionQueue.enqueue(question);
};

//the singular function for this currently isn't working
// const populateQueue = (Model, queue) => {
//   return Model.find()
//     .then(data => {
//       return data.forEach(question => {
//         console.log('Queue in populate fn', queue);
//         return queue.enqueue(question);
//       });
//     });
// };

let questionQueue = new Queue();

module.exports = { Queue, helpers, setQuestions, questionQueue };

//Get the user's record; 
//if the performance array is empty, populate the queue
