/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */
/* global MembershipClientRsvp */
/* global AppClient */
/* global RSVP */

'use strict';


var TheApplication = angular.module('TheApplication', ['ngCookies']);


var TheController = TheApplication.controller('TheController',
	function($rootScope, $scope, $http, $compile, $injector, $sce, $cookies) {
		var socket = io.connect();


		//==========================================
		$scope.ThisApp = {};

		$scope.ThisApp.AppConfig = {
			app_title: 'Application',
			content_selector: '#content',
			intiial_view: 'site-home', // Loaded when the user is not logged in or initially logs in.
			partials_path: '/partials'
		};


		//------------------------------------------
		$scope.ThisApp.IsSidebarCollapsed = false;
		$scope.ThisApp.ToggleSidebarCollapsed =
			function() {
				$scope.ThisApp.IsSidebarCollapsed = !$scope.ThisApp.IsSidebarCollapsed;
				if ($scope.ThisApp.IsSidebarCollapsed) {
					$('#sidebar').addClass('collapsed');
				}
				else {
					$('#sidebar').removeClass('collapsed');
				}
			};


		//------------------------------------------
		$scope.ThisApp.InjectContent =
			function(ContentSelector, ContentUrl) {
				$http.get(ContentUrl)
					.then(
						function(http_get_result) {
							var linker = $compile(http_get_result.data);
							var linker_result = linker($scope);
							$(ContentSelector).html(linker_result).show();
						});
			};


		//------------------------------------------
		$scope.ThisApp.LoadContent =
			function(ContentUrl) {
				$scope.ThisApp.InjectContent('#content-partial-container', ContentUrl);
			};

		//------------------------------------------
		$scope.ThisApp.LoadPartial =
			function(PartialName) {
				var url = $scope.ThisApp.AppConfig.partials_path + '/' + PartialName + '.html';
				$scope.ThisApp.InjectContent('#content-partial-container', url);
			};


		//------------------------------------------
		$scope.ThisApp.SidebarItems = [];


		//------------------------------------------
		$scope.ThisApp.OnSidebarItemClick =
			function(ItemName) {
				var item = $scope.ThisApp.SidebarItems[ItemName];
				if (item) {
					if (item.on_click) {
						item.on_click(item);
					}
				}
			};


		//------------------------------------------
		$scope.ThisApp.NewSidebarItem =
			function(Item) {
				$scope.ThisApp.SidebarItems[Item.item_name] = Item;

				var html = '<li';
				html += ' id="' + Item.item_name + '"';
				html += ' class="sidebar-item"';
				html += '>';

				html += '<a';
				html += ' class="sidebar-item"';
				if (Item.is_group) {
					html += ' href="#' + Item.item_name + '_items"';
					html += ' data-toggle="collapse"';
					html += ' aria-expanded="false"';
				}
				else {
					html += ' href="#"';
				}
				if (Item.requires_login) {
					html += ' ng-show="Member.member_logged_in"';
				}
				html += ' ng-click="ThisApp.OnSidebarItemClick(\'' + Item.item_name + '\')"';
				html += '>';

				if (Item.icon_class) {
					html += '<i class="' + Item.icon_class + '"></i>';
				}

				html += Item.caption;
				if (Item.is_group) {
					html += '<ul class="collapse list-unstyled" id="' + Item.item_name + '_items">';
					html += '</ul>';
				}

				html += '</li>';
				var linker = $compile(html);
				var linker_result = linker($scope);
				return linker_result;
			};


		//------------------------------------------
		$scope.ThisApp.AddSidebarItem =
			function(Item) {
				$('#app-sidebar-list').append(
					$scope.ThisApp.NewSidebarItem(Item)
				);
			};


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
		//		Membership Messages
		//
		//=====================================================================
		//=====================================================================


		$scope.Member = MembershipClient.GetMember('Application', socket, $cookies);
		$rootScope.Member = $scope.Member;
		MembershipClientRsvp.WireMembershipWithRsvpPromises($scope.Member);


		$scope.Member.OnMemberSignup = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			var date = new Date();
			$scope.Member.member_data.signup_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.ThisApp.LoadPartial($scope.ThisApp.AppConfig.intiial_view);
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogin = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			var date = new Date();
			$scope.Member.member_data.login_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.ThisApp.LoadPartial($scope.ThisApp.AppConfig.intiial_view);
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberReconnect = function(Success) {
			$scope.ThisApp.LoadPartial($scope.ThisApp.AppConfig.intiial_view);
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogout = function(Success) {
			$scope.$apply();
			return;
		};

		// $scope.Member.OnGetMemberData = function(Success) {
		// 	if (!Success) {
		// 		$scope.$apply();
		// 		return;
		// 	}
		// 	// `$scope.Member.member_data` has been updated.
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPutMemberData = function(Success) {
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathList = function(Path, List) {
		// 	$scope.current_path = Path;
		// 	$scope.path_list = List;
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathRead = function(Path, Content) {
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathWrite = function(Path, Success) {
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathMake = function(Path, Success) {
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathClean = function(Path, Success) {
		// 	$scope.$apply();
		// 	return;
		// };

		// $scope.Member.OnPathDelete = function(Path, Success) {
		// 	$scope.$apply();
		// 	return;
		// };


		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in) {
			$scope.Member.MemberReconnect();

			// // Test the path functions.
			// $scope.Member.PathWrite_Promise('/example1-test.dat', "This is my test data.")
			// 	.then(function() {
			// 		return $scope.Member.PathRead_Promise('/example1-test.dat');
			// 	})
			// 	.then(function(Content) {
			// 		console.log("Content 1: " + Content);
			// 	})
			// 	.then(function() {
			// 		return $scope.Member.PathWrite_Promise('/example1-test.dat', [1, 3, 5, 7, 11]);
			// 	})
			// 	.then(function() {
			// 		return $scope.Member.PathRead_Promise('/example1-test.dat');
			// 	})
			// 	.then(function(Content) {
			// 		console.log("Content 2: " + Content);
			// 	})
			// 	.then(function() {
			// 		return $scope.Member.PathDelete_Promise('/example1-test.dat');
			// 	})
			// 	.catch(function(error) {
			// 		console.log("Error: " + error);
			// 	})
			// 	.finally(function() {});

		}
		else {
			$scope.ThisApp.LoadPartial($scope.ThisApp.AppConfig.intiial_view);
		}


		AppClient.Connect($scope, $scope.ThisApp, $scope.Member, socket, null);


	});
