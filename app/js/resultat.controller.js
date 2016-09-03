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