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
