var npm_process = require('process');
var npm_fs = require('fs');
var npm_path = require('path');


var jsondiffpatch_options = null;

// jsondiffpatch_options = {

// 	// used to match objects when diffing arrays, by default only === operator is used
// 	objectHash: function(obj) {
// 		// this function is used only to when objects are not equal by ref
// 		return obj.name;
// 	},

// 	arrays: {
// 		// default true, detect items moved inside the array (otherwise they will be registered as remove+add)
// 		detectMove: true,
// 		// default false, the value of items moved is not included in deltas
// 		includeValueOnMove: false
// 	},

// 	textDiff: {
// 		// default 60, minimum string length (left and right sides) to use text diff algorythm: google-diff-match-patch
// 		minLength: 60
// 	},

// 	propertyFilter: function(name, context) {
// 		/*
// 		this optional function can be specified to ignore object properties (eg. volatile data)
// 		name: property name, present in either context.left or context.right objects
// 		context: the diff context (has context.left and context.right objects)
// 		*/
// 		return name.slice(0, 1) !== '$';
// 	},

// 	/*
// 	default false. if true, values in the obtained delta will be cloned
// 	(using jsondiffpatch.clone by default), to ensure delta keeps no references
// 	to left or right objects. this becomes useful if you're diffing and patching
// 	the same objects multiple times without serializing deltas.
// 	instead of true, a function can be specified here to provide a custom clone(value)
// 	*/
// 	cloneDiffValues: false

// };


var jsondiffpatch = require('jsondiffpatch');
var diffpatch = jsondiffpatch.create(jsondiffpatch_options);


var left = null;
var right = null;
var delta = null;

// left = { a: 3, b: 4 };
// right = { a: 5, c: 9 };
// delta = diffpatch.diff(left, right);


var filename = npm_path.join(__dirname, 'data/all-items-data.json');
left = JSON.parse(npm_fs.readFileSync(filename));
left = left.slice(0, 9);
right = diffpatch.clone(left);
right[0].item_type = 'Changed name from Mod to this.';
delta = diffpatch.diff(left, right);
delta = jsondiffpatch.diff(left, right);

jsondiffpatch.console.log(delta);

npm_process.exit(0);
