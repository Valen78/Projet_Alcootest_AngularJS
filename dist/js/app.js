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
var ref = new Firebase('https://alcootest-angular.firebaseio.com/');

app.factory('AuthFactory',function($firebaseAuth){
	return $firebaseAuth(ref);
});

app.factory('UsersFactory', function($firebaseArray){
	return $firebaseArray(ref);
});

app.controller('homeCtrl', function(AuthFactory,$rootScope,UsersFactory){
	
	var home = this;

	//tableau des utilisateurs
	home.users = UsersFactory;

	//initilisation de variables
	home.userData = null;
	$rootScope.connecte = false;

	//valeur de base du checkbox
	home.box = false;

	//Connexion
	home.signWithGoogle = function(){
		AuthFactory
		.$authWithOAuthPopup('google')
		.then(function(authData){
			console.log('Connexion Réussie ! ', authData);
			//stockage des infos de l'utilisateur
			home.userData = authData.google;
		})
		.catch(function(error){
			console.log('Connexion ratée... !! ', error);
			home.authError = error;
		});
	};

	//Authentification
	AuthFactory.$onAuth(function(authData){
		if (!authData){
			home.userData = null;
		}
		else{
			$rootScope.userName = authData.google.displayName;
			$rootScope.connecte = true;
		}
	});

	//Déconnexion
	home.signOut = function(){
		AuthFactory.$unauth();
		//on réinitialise le rootScope
		$rootScope.connecte = false;
		delete $rootScope.userName;
		delete $rootScope.score;
	};
});
app.factory('quizzFactory', function() {
	return {
		nbQuestion : 5,
		timer : 7000,
		score : 1,
		questions : [
			{
				question: "Si je suis muet, aveugle et sourd, combien de sens me reste-t-il ?",
				reponses: ["2", "5", "3", "un seul", "c'est quoi un sens ?"],
				answer: "3"
			},
			{
				question: "Dans une course à pied je double le 2ème, je suis donc ?",
				reponses: ["2ème", "1er", "Avant dernier", "j'ai gagné !", "trop dur de courir"],
				answer: "2ème"
			},
			{
				question: "Le père de mon oncle à un petit fils. Donc c'est mon ?",
				reponses: ["Grand Père", "Fils", "Neveu", "Cousin", "Frère"],
				answer: "Cousin"
			},
			{
				question: "La souris mange le fromage, le chat mange la souris. Qui reste-t-il ?",
				reponses: ["le fromage", "la table", "des dents", "le chat" ,"le chien"],
				answer: "le chat"
			},
			{	
				question: "Calculez 3+78370",
				reponses: ["3", "78373", "WTF", "Zéro", "je sais pas compter !"],
				answer: "78373"
			},
			{	
				question: "Quel est la couleur du cheval blanc d'henri 4 ?",
				reponses: ["jaune", "rouge", "vert", "bleu", "blanc"],
				answer: "blanc"
			},
			{	
				question: "Certains mois ont 31 jours. Combien en ont 28 ?",
				reponses: ["Bah 1 seul !!", "16", "6", "12", "7"],
				answer: "12"
			},
			{	
				question: "J'ai 48 ans mais j'ai fêté mon anniversaire que 12 fois, pourquoi ?",
				reponses: ["car t'as pas d'amis !", "je suis né un 29 février", "tes parents t'aimes pas", "hein ?!", "je suis né un vendredi 13"],
				answer: "je suis né un 29 février"
			},
			{	
				question: "Qu' est ce qu'y peut traverser une fenêtre qui est fermée ?",
				reponses: ["Chuck Norris", "l'homme invisble", "le soleil", "le rideau", "OSEF !"],
				answer: "le soleil"
			},
			{	
				question: "Un fermier à 17 vaches, elles meurent toutes sauf 9. Combien en reste-il ?",
				reponses: ["9", "8", "17-9", "tout un champs", "Aucune ce sont des vaches folles !"],
				answer: "9"
			}
		]
	};
});

app.controller('questionsCtrl', function(quizzFactory,$interval,$rootScope,$state){

	var quizz = this;

	//tableau des index des questions
	var iquestion = [];

	quizz.userName = $rootScope.userName;
	quizz.textSubmit = "Question suivante >>";

	//initialisation du timer
	quizz.timer = quizzFactory.timer;
	quizz.progress = 100;
	
	//mise en place du Timer
	quizz.setTimer = function (){
		quizz.over = false;
		quizz.temps = $interval(function(){
			if(quizz.timer>0){
				quizz.timer -= 1000/60;
				quizz.progress = quizz.timer*(100/7000);
				quizz.duree = Math.round(quizz.timer/1000);
			} else {
				quizz.rep = true;
				quizz.over = true;
				$interval.cancel(quizz.temps);
			}
		},1000/60);
	}

	//calcul du score
	quizz.getScore = function (index){
		if (quizz.rep != false){
			if (quizz.rep === quizzFactory.questions[index].answer){
				if (quizz.progress <= 50){
					quizz.score += 1;
				}
				if (quizz.progress > 50){
					quizz.score += 2;
				}
				if (quizz.progress == 0){
					quizz.score -= 2;
				}
			}
			else{
				quizz.score -= 2;
			}
		}
		$rootScope.score = quizz.score;
	}

	//variable du nombre total de questions
	var nbTotQuestion = quizzFactory.questions.length;

	//variable du nombre de questions à montrer
	var nbQuestion = quizzFactory.nbQuestion;

	//on vérifie que le nombre de question saisie est pas supérieur au nombre total de question existante
	if (nbQuestion > nbTotQuestion){
		var nbQuestion = nbTotQuestion;
	}

	//initialisation du N°de la question
	quizz.numQ = 1;

	//on cache le bouton
	quizz.rep = false;

	//génération d'un index aléatoire et on le stocke dans un tableau
	quizz.indexQ = Math.floor(Math.random()*(nbTotQuestion));
	iquestion.push(quizz.indexQ);

	//variable pour acceder à la 1ère question
	var q = quizzFactory.questions[quizz.indexQ];

	//initialisation du score
	quizz.score = quizzFactory.score;

	//on stocke la 1ère question et ses réponses
	quizz.getQuestion = q.question;
	quizz.getReponses = q.reponses;

	//lancement du timer
	quizz.setTimer();

	//nouvelle question
	quizz.nextQuestion = function(index){

		//calcul du score
		quizz.getScore(index);

		//on cache le bouton question suivante
		quizz.rep = false;

		//on réinitialise le timer
		quizz.temps = $interval.cancel(quizz.temps);
		quizz.timer = quizzFactory.timer;
		quizz.progress = 100;

		//tant qu'on est pas à la dernière question
		if (quizz.numQ <= nbQuestion){

			//lancement du timer
			quizz.setTimer();

			//incrémentation du N° de la question
			quizz.numQ++;

			//génération d'un nouvel index
			quizz.indexQ = Math.floor(Math.random()*nbTotQuestion);

			//tant qu'on à index déjà existant on en génère un autre
			while (iquestion.indexOf(quizz.indexQ) !== -1){
				quizz.indexQ = Math.floor(Math.random()*nbTotQuestion);
			}

			//stockage du nouvel index de question
			iquestion.push(quizz.indexQ);
			
			//variable pour acceder à la question suivante
			var qN = quizzFactory.questions[quizz.indexQ];

			//on stocke la question suivante et ses réponses
			quizz.getQuestion = qN.question;
			quizz.getReponses = qN.reponses;

			//si on est a la dernière question, on change le text du bouton
			if(quizz.numQ == nbQuestion){
				quizz.textSubmit = "Voir le résultat...";
			}
		}

		//quand on est arrivé à la dernière question
		if (quizz.numQ === nbQuestion+1){

			//on calcul le score final
			quizz.getScore(index);
			
			//on redirige vers la page de résultat
			$state.go('resultat');
		}
	};
});

app.controller('resultatCtrl', function($rootScope,$state,UsersFactory,AuthFactory){
	var resultat = this;

	//tableau des utilisateurs
	resultat.users = UsersFactory;

	resultat.score  = $rootScope.score;
	resultat.userName = $rootScope.userName;
	resultat.ok = false;
	resultat.ko = false;

	//message à afficher en fonction du score
	if (resultat.score > 4){
		resultat.ok = true;
		resultat.message = "James Bond peut aller se rhabiller, Bonne route !";
	}

	if ((resultat.score >= 0)&&(resultat.score <= 4)){
		resultat.ok = true;
		resultat.message = "Vous semblez un peu stressé. Détendez vous, tout vas bien ! Vous pouvez y aller, et surtout roulez sécure.";
	}

	if ((resultat.score < 0)&&(resultat.score >= -2)){
		resultat.ko=true;
		resultat.message = "Avec des réponses pareilles, mieux vaut être prudent ! Patientez encore avant de reprendre la route";
	}

	if (resultat.score < -2){
		resultat.ko = true;
		resultat.message = "Bon et bien le temps est venu d'aller dissiper cet alcool !!! Oubliez la voiture et laissez vos clés à vos hotes...";
	}
	
	//ajout des données dnas le tableau des utilisateurs
	resultat.users.$add({
		user: $rootScope.userName,
		score: $rootScope.score
	});

	//Déconnexion
	resultat.signOut = function(){
		AuthFactory.$unauth();
		$rootScope.connecte = false;
		delete $rootScope.userName;
		delete $rootScope.score;
		$state.go('home');
	};
	
});
app.controller('tableauCtrl', function($rootScope,$scope,$filter,UsersFactory){
	var tableau = this;

	//tableau des utilisateurs
	tableau.users = UsersFactory;

	//initialisation du filtre de tri
	var orderBy = $filter('orderBy');
	var reverse = false;

	//tri du tableau en fonction du clic de l'utilisateur
	tableau.order = function(crit){
		reverse = (reverse) ? !reverse : true;
		tableau.users = orderBy(tableau.users,crit,reverse);
	}
});