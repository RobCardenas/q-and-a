angular.module('questionApp', ['ngRoute', 'ngResource'])

	.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/templates/home.html',
				controller: 'HomeCtrl'
			})
			.when('/:id', {
				templateUrl: 'views/templates/answers.html',
				controller: "AnswersCtrl"
			})
			.otherwise({
				redirectTo: '/'
			});

			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});
	}])

	.service('Question', ['$resource', function ($resource) {
		return $resource('/api/questions/:id', {id: '@_id'}, {
	    update: {
	      method: 'PUT'
	    }
	  });
	}])

	.controller('HomeCtrl', ['$scope', 'Question', function ($scope, Question) {
		$scope.allQuestions = Question.query();
		$scope.question = {};
		$scope.createQuestion = function () {
			Question.save($scope.question);
			$scope.allQuestions.push($scope.question);
			$scope.viewForm = false;
		}
	}])




;