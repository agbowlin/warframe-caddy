/* global $ */
/* global io */
/* global angular */


var app = angular.module('MyWarframeApp', ['ngCookies']);


app.controller('MainController',
	function MainController($scope, $cookies) {
		var socket = io.connect();


		//==========================================
		//	Socket.IO Messages
		//==========================================


		//==========================================
		socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});


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
		//		Member Signup
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.member_signup_request = function member_signup_request(MemberName, MemberEmail, MemberPassword) {
			if (!MemberName) {
				$scope.notice = "No membership credentials provided.";
				return;
			}

			$scope.notice = "Generating membership ...";
			$scope.errors = [];
			$scope.member_data = null;
			$scope.member_name = null;
			$scope.member_email = null;
			$scope.member_password = null;

			// Authenticate the member with the server.
			socket.emit('member_signup_request', MemberName, MemberEmail, MemberPassword);
			return;
		};


		//==========================================
		socket.on('member_signup_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_data = MemberData;
			$scope.member_name = MemberData.member_name;
			$scope.member_email = MemberData.member_email;
			$scope.member_password = MemberData.member_password;
			$cookies.put('my-warframe.member_name', $scope.member_name);
			$scope.$apply();
			return;
		});


		//==========================================
		$scope.do_member_signup = function do_member_signup() {
			$scope.member_signup_request($scope.member_name, $scope.member_email, $scope.member_password);
			return;
		};


		//=====================================================================
		//=====================================================================
		//
		//		Member Login
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.member_login_request = function member_login_request(MemberName, MemberEmail, MemberPassword) {
			$scope.notice = "Authenticating membership credentials ...";
			$scope.errors = [];
			$scope.member_data = null;
			$scope.member_name = null;
			$scope.member_email = null;
			$scope.member_password = null;
			if (!MemberName) {
				$scope.notice = "No membership credentials provided.";
				return;
			}

			// Authenticate the member with the server.
			socket.emit('member_login_request', MemberName, MemberEmail, MemberPassword);
			return;
		};


		//==========================================
		socket.on('member_login_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_data = MemberData;
			$scope.member_name = MemberData.member_name;
			$scope.member_email = MemberData.member_email;
			$scope.member_password = MemberData.member_password;
			$scope.item_list = null;
			$cookies.put('my-warframe.member_name', $scope.member_name);
			$scope.$apply();
			return;
		});


		//==========================================
		$scope.do_member_login = function do_member_login() {
			$scope.member_login_request($scope.member_name, $scope.member_email, $scope.member_password);
			return;
		};


		//==========================================
		$scope.do_member_logout = function do_member_logout() {
			$scope.notice = "Logging out ...";
			$scope.member_data = null;
			$scope.member_name = null;
			$scope.member_email = null;
			$scope.member_password = null;
			$cookies.remove('my-warframe.member_name');
			// $scope.$apply();
			return;
		};


		//=====================================================================
		//=====================================================================
		//
		//		Member Data
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.member_data_request = function member_data_request(MemberName) {
			$scope.notice = "Retrieving membership data ...";
			$scope.errors = [];
			socket.emit('member_data_request', MemberName);
			return;
		};


		//==========================================
		socket.on('member_data_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_data = MemberData;
			$scope.member_name = MemberData.member_name;
			$scope.member_email = MemberData.member_email;
			$scope.member_password = MemberData.member_password;
			$scope.$apply();
			return;
		});

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


		//=====================================================================
		//=====================================================================
		//
		//		App Startup
		//
		//=====================================================================
		//=====================================================================

		$scope.notice = "";
		$scope.errors = [];
		$scope.member_data = null;
		$scope.member_name = null;

		//==========================================
		//	Setup Member Data
		//==========================================

		// Get the member info from a browser cookie.
		$scope.member_name = $cookies.get('my-warframe.member_name');
		if ($scope.member_name) {
			// Retrieve the member data from the server.
			$scope.member_data_request($scope.member_name);
		}

		//==========================================
		//	Initialize Worldstate
		//==========================================

		$scope.get_worldstate_request();

	});
