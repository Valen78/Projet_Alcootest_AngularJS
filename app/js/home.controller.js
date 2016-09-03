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