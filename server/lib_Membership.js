"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_exec = require('child_process').exec;
var npm_string = require('string');
var npm_sanitize = require('sanitize-filename');


module.exports = Lib;


function Lib()
{
	return;
}


//---------------------------------------------------------------------
Lib.RootFolder = '../members';


//---------------------------------------------------------------------
Lib.GetMemberFolder =
	function GetMemberFolder(MemberName)
	{
		var folder_name = npm_sanitize(MemberName);
		var member_folder = npm_path.join(Lib.RootFolder, folder_name);
		return member_folder;
	};


//---------------------------------------------------------------------
Lib.IsMember =
	function IsMember(MemberName)
	{
		var member_folder = Lib.GetMemberFolder(MemberName);
		if (npm_fs.existsSync(member_folder))
		{
			return true;
		}
		return false;
	};


//---------------------------------------------------------------------
Lib.NewMember =
	function NewMember(MemberName, MemberEmail, MemberPassword)
	{
		// Create the Member Folder.
		// Fail if the folder already exists.
		var member_folder = Lib.GetMemberFolder(MemberName);
		if (npm_fs.existsSync(member_folder))
		{
			return false;
		}
		npm_fs.mkdirSync(member_folder);
		
		// Generate a new Member Data object.
		var member_data = {};
		member_data.member_name = MemberName;
		member_data.member_email = MemberEmail;
		member_data.member_password = MemberPassword;
		
		// Write the Member Data object.
		var member_data_filename = npm_path.join(member_folder, 'data.json');
		npm_fs.writeFileSync(member_data_filename, JSON.stringify(member_data, null, 4));

		return member_data;
	};


//---------------------------------------------------------------------
Lib.GetMemberData =
	function GetMemberData(MemberName)
	{
		// Find the Member Folder.
		// Fail if the folder doesn't exist.
		var member_folder = Lib.GetMemberFolder(MemberName);
		if (!npm_fs.existsSync(member_folder))
		{
			return false;
		}

		// Read the Member Data object.
		var member_data_filename = npm_path.join(member_folder, 'data.json');
		var member_data_content = npm_fs.readFileSync(member_data_filename);
		var member_data = JSON.parse(member_data_content);

		// Return the Member Data object.
		return member_data;
	};


//---------------------------------------------------------------------
Lib.PutMemberData =
	function PutMemberData(MemberData)
	{
		// Find the Member Folder.
		// Fail if the folder doesn't exist.
		var member_folder = Lib.GetMemberFolder(MemberData.member_name);
		if (!npm_fs.existsSync(member_folder))
		{
			return false;
		}

		// Write the Member Data object.
		var member_data_filename = npm_path.join(member_folder, 'data.json');
		npm_fs.writeFileSync(member_data_filename, JSON.stringify(MemberData, null, 4));

		return true;
	};


