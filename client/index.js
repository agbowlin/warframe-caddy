/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */


var app = angular.module('MyWarframeApp', ['ngCookies']);

app.controller('MainController',
	function MainController($scope, $cookies) {
		var socket = io.connect();


		//=====================================================================
		//=====================================================================
		//
		//		Socket.IO Messages
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});

		$scope.errors = [];

		//==========================================
		socket.on('server_error', function(server_error) {
			console.log('> server_error', server_error);
			$scope.errors.push(server_error);

			$scope.$apply();
			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		Membership
		//
		//=====================================================================
		//=====================================================================


		// MembershipClient.WireMembership('warframe-caddy', $scope, socket, $cookies);
		$scope.Member = MembershipClient.GetMember('warframe-caddy', socket, $cookies);


		//==========================================
		$scope.Member.OnMemberSignup = function(Success)
		{
			// if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnMemberLogin = function(Success)
		{
			// if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnMemberReconnect = function(Success)
		{
			// if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnMemberLogout = function(Success)
		{
			// if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnGetMemberData = function(Success)
		{
			// if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnPutMemberData = function(Success)
		{
			// if (!Success) { return; }
			return;
		};


		//==========================================
		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in && !$scope.Member.member_data)
		{
			// $scope.Member.GetMemberData();
			$scope.Member.MemberReconnect();
		}


		//=====================================================================
		//=====================================================================
		//
		//		Warframe Worldstate
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.get_worldstate_request = function get_worldstate_request() {
			$scope.notice = "Getting worldstate ...";
			$scope.errors = [];
			$scope.worldstate = null;
			socket.emit('get_worldstate_request');
			return;
		};


		//==========================================
		socket.on('get_worldstate_response', function(Worldstate) {
			$scope.notice = "Got worldstate.";
			$scope.worldstate = Worldstate;
			$scope.$apply();
			return;
		});


		//==========================================
		//	Initialize Worldstate
		//==========================================

		$scope.get_worldstate_request();

	});
