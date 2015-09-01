// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),  // for data from the request body
    mongoose = require('mongoose'),
    Question = require('./models/question'),
    Answer = require('./models/answer');       // to interact with our db

// connect to mongodb
mongoose.connect(
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/q_and_a'
);

// configure body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// route (index.html)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});

// send back all questions
app.get('/api/questions', function (req, res) {
  Question.find({}, function (err, questions) {
    res.json(questions);
  });
});

// create new question
app.post('/api/questions', function (req, res) {
  // create new question with data from the body of the request (`req.body`)
  // body should contain the question text itself
  var newQuestion = new Question(req.body);

  // save new question
  newQuestion.save(function (err, savedQuestion) {
  	if (err) {
  		res.status(422).send(err.errors.text.message);
  	} else {
    	res.json(savedQuestion);
  	}
  });
});

// route for single id
app.get('/api/questions/:id', function (req, res) {
	//set the value of the id
    var targetId = req.params.id;
    //find correct question in the db by id
    Question.findOne({_id: targetId}, function (err, foundQuestion) {
      res.json(foundQuestion);
    });
  });

// update question, but only the part(s) passed in in the request body
// not currently that exciting when question has only one attribute
app.put('/api/questions/:id', function (req, res) {
  // set the value of the id
  var targetId = req.params.id;

  // find question in db by id
  Question.findOne({_id: targetId}, function (err, foundQuestion) {
    // update the question's text, if the new text passed in was truthy
    // otherwise keep the same text
    foundQuestion.text = req.body.text;

    // save updated question in db
    foundQuestion.save(function (err, savedQuestion) {
    	if (err) {
    		res.status(422).send(err.errors.text.message);
    	} else {
      	res.json(savedQuestion);
      }
    });
  });
});

// route to delete a specific question
app.delete('/api/questions/:id', function (req, res) {
    //set the value of the desired id
    var targetId = req.params.id;
    //find the correct post in the db and remove it
    Question.findOneAndRemove({_id: targetId}, function (err, deletedQuestion) {
      res.json(deletedQuestion);
    });
  });

// create new answer embedded in question
app.post('/api/questions/:questionId/answers', function (req, res) {
  // create new question with data from the body of the request (`req.body`)
  // body should contain the question text itself
  var questionId = req.params.questionId;
  var newAnswer = new Answer(req.body);

  // save new answer
 Question.findOne({_id: questionId}, function (err, foundQuestion) {
    foundQuestion.answers.push(newAnswer);
    foundQuestion.save(function (err, savedQuestion) {
      res.json(newAnswer);
    });
	});
});

// update answer embedded in question
app.put('/api/questions/:questionId/answers/:id', function (req, res) {
  // set the value of the list and todo ids
  var questionId = req.params.questionId;
  var answerId = req.params.id;

  // find list in db by id
  Question.findOne({_id: questionId}, function (err, foundQuestion) {
    // find todo embedded in list
    var foundAnswer = foundQuestion.answers.id(answerId);
    // update answer content and completed with data from request body
    foundAnswer.content = req.body.content;
    foundQuestion.save(function (err, savedQuestion) {
      res.json(foundAnswer);
    });
  });
});

// update answer embedded in question
app.delete('/api/questions/:questionId/answers/:id', function (req, res) {
  // set the value of the list and todo ids
  var questionId = req.params.questionId;
  var answerId = req.params.id;

  // find list in db by id
  Question.findOne({_id: questionId}, function (err, foundQuestion) {
    // find todo embedded in list
    var foundAnswer = foundQuestion.answers.id(answerId);
    // update answer content and completed with data from request body
    foundAnswer.remove();
    foundQuestion.save(function (err, savedQuestion) {
      res.json(foundAnswer);
    });
  });
});

// set location for static files
app.use(express.static(__dirname + '/public'));

// load public/index.html file (angular app)
app.get('*', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});

// listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('server started on localhost:3000');
});