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