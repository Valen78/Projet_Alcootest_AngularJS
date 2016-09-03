var app = angular.module('AlcooTestApp', ['ui.router','firebase']);

app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: 'views/home.html',
		controller: 'homeCtrl',
		controllerAs: 'home'
	})
	.state('tableau', {
		url: '/tableau',
		templateUrl: 'views/tableau.html',
		controller: 'tableauCtrl',
		controllerAs: 'tableau'
	})
	.state('questions', {
		url: '/questions',
		templateUrl: 'views/questions.html',
		controller: 'questionsCtrl',
		controllerAs: 'questions'
	})
	.state('resultat', {
		url: '/resultat',
		templateUrl: 'views/resultat.html',
		controller: 'resultatCtrl',
		controllerAs: 'resultat'
	});

	$urlRouterProvider.otherwise('/');
});

app.run(function($rootScope,$state) {
	$rootScope.$on('$stateChangeStart',
	function(event,toState){
		//si utilisateur pas connecté
	    if(!$rootScope.connecte){
	    	//tentavie d'accès aux questions ou resultat alors retour à l'accueil
	    	if (toState.name === "questions" || toState.name === "resultat"){
	    		event.preventDefault();
	    		$state.go('home');
	    	}
	    }
	    //si connecté mais tentative d'accès aux résultats alors retour à l'accueil
	    if(angular.isUndefined($rootScope.score) && toState.name === "resultat"){
			event.preventDefault();
	    	$state.go('home');
	    }
	})
});