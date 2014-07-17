/**
 * Created by Gimm on 7/17/14.
 */

var through = require("through2")
 	child_process = require("child_process");

var defaultOptions = {
	NODE_ENV: "development",
	SERVER_SCRIPT: "app.js"
};
module.exports = function (options) {
  	service = process._servers;
	var start = function(){
		var mode = options.NODE_ENV ? options.NODE_ENV : defaultOptions.NODE_ENV;
		var script = options.file ? options.file : defaultOptions.SERVER_SCRIPT;
		service = process._servers = child_process.spawn('node', [script], {
			NODE_ENV: mode
		});
		service.stdout.setEncoding('utf8');
		service.stdout.on('data', function(data) {
			console.log(data);
		});
		service.stderr.on('data', function(data) {
			console.log(data.toString());
		});
		service.on('exit', function (code, aa)
		{
			console.log('child process exited with code ' + code);
			console.log(aa);
		});
	};
	
	var end = function (file){
		if(service && service.kill){
			service.kill('SIGTERM');
			service = process._servers = null;
		}
		this.emit('end');
	};
	return through.obj(function(file, enc, cb) {
		console.log('done');
	});
};