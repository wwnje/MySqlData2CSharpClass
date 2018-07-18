var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var os = require('os');

var OUTPUT_PATH = path.join(process.cwd(), 'output');
var OUTPUT_PATH_USER = path.join(process.cwd(), 'output/User');
var OUTPUT_PATH_WORLD = path.join(process.cwd(), 'output/World');
var OUTPUT_PATH_CONFIG = path.join(process.cwd(), 'output/Config');

var connection = mysql.createConnection({
	host		: '127.0.0.1',
	user		: 'root',
	password	: '',
	database	: 'dhd3'
});
connection.connect();

var tables = new Array();
var task = 0;
var finished = 0;

function mystring(value) {
	return "\"" + value + "\"";
}

function TaskFinish() 
{
	finished++;
	if (task == finished) {
		process.exit();
	};
}

function ReadableName(name)
{
	var newname = name[0].toUpperCase() + name.substr(1);
	var index = 0;
	while(true)
	{
		index = newname.indexOf('_', index);
		if (index == -1) {
			break;
		};

		index++;
		if (index >= newname.length - 1) {
			break;
		};

		newname = newname.substr(0, index - 1) + newname[index].toUpperCase() + newname.substr(index + 1);
	}
	return newname;
}

function GetSpaceNameAndPath(name)
{
	var names = new Array();
	var spaceName = "";
	var path = "";

	if (0 == name.indexOf('c_')) {
		spaceName = "Config";
		path = OUTPUT_PATH_CONFIG;
	}else if (0 == name.indexOf('w_')) {
		spaceName = "World";
		path = OUTPUT_PATH_WORLD;
	}else if (0 == name.indexOf('u_')) {
		spaceName = "User";
		path = OUTPUT_PATH_USER;
	}

	names.push(spaceName);
	names.push(path);
	return names;
}

function OutputTable(name) {
	task++;
	
	console.log("OutputTable Start:"+ name);

	var names = GetSpaceNameAndPath(name);

	var readableName = ReadableName(name.substr(2));
	var spaceName = names[0];
	var outputPath = names[1];
		
	connection.query('SHOW FULL COLUMNS FROM ' + name, function (err, rows, fields) {
		if (err) {throw err;};

		var comment = {};
		var comment_def = {};
		for (var i = 0; i < rows.length; i++) {
			comment[rows[i].Field] = rows[i].Comment;
			comment_def[rows[i].Field] = rows[i].Default;
		};
		

		connection.query('SELECT * FROM ' + name, function (err, rows, fields) {
			if (err) {throw err;};

			var stringfield = {}

			var priKeyName = "";
			var autoAdd = false;
			var headClass = "";
			var contentClass = "";

			contentClass += "	public class " + readableName + os.EOL;
			contentClass += "	{" + os.EOL;

			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				stringfield[field.name] = false;

				contentClass += "		public ";

				var unsighed = (field.flags & mysql.FieldFlag.UNSIGNED_FLAG) == 0 ? "" : "u";

				if((field.flags & mysql.FieldFlag.PRI_KEY_FLAG ) != 0)
				{
					priKeyName = field.name;
					autoAdd = (field.flags & mysql.FieldFlag.AUTO_INCREMENT_FLAG ) != 0;
				}

				if (fields[i].type == mysql.Types.TINY) {
					contentClass += 'char ';
				}
				else if (fields[i].type == mysql.Types.SHORT) {
					contentClass += unsighed + 'short ';
				}		
				else if (fields[i].type == mysql.Types.LONG) {
					contentClass += unsighed + 'int ';
				}
				else if (fields[i].type == mysql.Types.LONGLONG) {
					contentClass += unsighed + 'long ';
				}
				else if (fields[i].type == mysql.Types.FLOAT || fields[i].type == mysql.Types.DOUBLE) {
					contentClass += 'double ';
				}
				else if (fields[i].type == mysql.Types.VAR_STRING || fields[i].type == mysql.Types.STRING || fields[i].type == mysql.Types.BLOB ) {
					contentClass += 'string ';
					stringfield[field.name] = true;
				}
				else if (fields[i].type == mysql.Types.VAR_STRING || fields[i].type == mysql.Types.STRING) {
					contentClass += 'string ';
					stringfield[field.name] = true;
				}
				
				var def = "";
				if(spaceName !== 'Config')
				{
					// console.log(field.name);
					// console.log(comment_def[field.name]);

					def = comment_def[field.name]
					def = def == "" ? '"' + def + '"' : def;
					def = def != null ? ' = ' + def + ';' : "";
				}

				contentClass += field.name + ' { get; set; }' + def;
				contentClass += '// ' + comment[field.name] + os.EOL;
			};

			contentClass += "	}" + os.EOL;
			contentClass += "}" + os.EOL;

			headClass += "using PetaPoco;" + os.EOL + os.EOL;
			headClass += "namespace Game.Entity." + spaceName + os.EOL + "{" + os.EOL;
			headClass += "	[TableName(\"" + name + "\")]" + os.EOL;
			headClass += "	[PrimaryKey(\"" +  priKeyName + "\", AutoIncrement = " + autoAdd + ")]" + os.EOL;

			fs.open(path.join(outputPath, readableName + ".cs"), 'w+', function (ferr, fd) {
				if (ferr) 
				{
					console.log(ferr);
					throw ferr;
				};
				fs.write(fd, headClass + contentClass);
				console.log("write:"+ readableName);
				TaskFinish();
			})
		});
	});
}

function OnShowTables(err, rows, fields) {
	if (err) {throw err;};

	for (var i = rows.length - 1; i >= 0; i--) {
		for (var key in rows[i]) {
			tables.push(rows[i][key]);
			break;
		};
	};
	
	for (var i = 0; i < tables.length; i++) {
		OutputTable(tables[i]);
	};

	 //process.exit();
}

rimraf.sync(OUTPUT_PATH_USER);
rimraf.sync(OUTPUT_PATH_CONFIG);
rimraf.sync(OUTPUT_PATH_WORLD);

fs.mkdirSync(OUTPUT_PATH_USER);
fs.mkdirSync(OUTPUT_PATH_CONFIG);
fs.mkdirSync(OUTPUT_PATH_WORLD);

connection.query('SHOW TABLES', OnShowTables)