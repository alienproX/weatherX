#!/usr/bin/env node
var http = require('http');
var apiKey = 'cce11b255cd98d0d9bd73110ac1ea7df';
var width = 70;
var arg = [];
var i = 0;

var loading = setInterval(function() {
		  process.stdout.clearLine();
		  process.stdout.cursorTo(0);
		  i = (i + 1) % 4;
		  var dots = new Array(i + 1).join(".");
		  process.stdout.write("Waiting" + dots);
		}, 300);

function replaceAnsi(str){
	var text = '';
	var map = {'<black>':30, '<red>':31, '<green>':32, '<yellow>':33, '<blue>':34, '<magenta>':35, '<cyan>':36, '<white>':37, '<bright>':1, '<dim>':2, '<underscore>':4, '<blink>':5, '<reverse>':7, '<hidden>':8};
		text = str.toString().replace(/<black>|<red>|<green>|<yellow>|<blue>|<magenta>|<cyan>|<white>|<bright>|<dim>|<underscore>|<blink>|<reverse>|<hidden>/g, function(m) { return '\x1b[' + map[m] + 'm'; });
		text = text.replace(/<\/.*?>/g, '\x1b[0m');
	return text;
}

function log(text){
	console.log(replaceAnsi(text));
}

var table = {
	clone: function(str,n) {
		var space = '';
		for (var i = 0; i < n; i++) {
			space += str;
		}
		return space;
	},
	spaceRest: function(str,n) {
        var long = n || width;
		var num = long - str.replace(/(<([^>]+)>)/ig, '').length;
		var space = '';
		for (var i = 0; i < num; i++) {
			space += ' ';
		}
		return space;
	}
}

function outputCurrent (json) {
	var title = ' ' + json.name + ',' + json.sys.country + ' <dim>lon:' + json.coord.lon.toFixed(2) + ' lat:' + json.coord.lat.toFixed(2) + '</dim>    <bright>' + json.weather[0].main + '</bright> ' + '<dim>' + json.weather[0].description + '</dim>';
	log('<cyan>┌' + table.clone('─',width) + '┐</cyan>');
	log('<cyan>│</cyan>' + title + table.spaceRest(title) + '<cyan>│</cyan>');
	log('<cyan>├' + table.clone('─',14) + '┬' + table.clone('─',width-15) + '┤</cyan>');

	var temp = ' Temperature  │</cyan> ' + $.celsius(json.main.temp) + '°C <dim>/</dim> ' + $.fahrenheit(json.main.temp) + 'ºF' ;
	log('<cyan>│' + temp + table.spaceRest(temp) + '<cyan>│</cyan>');

	log('<cyan>├' + table.clone('─',14) + '┼' + table.clone('─',width-15) + '┤</cyan>');

	var humidity = ' Humidity     │</cyan> ' + json.main.humidity + '%';
	log('<cyan>│' + humidity + table.spaceRest(humidity) + '<cyan>│</cyan>');

	log('<cyan>├' + table.clone('─',14) + '┼' + table.clone('─',width-15) + '┤</cyan>');

	var wind = ' Wind Speed   │</cyan> ' + json.wind.speed + 'm/s';
	log('<cyan>│' + wind + table.spaceRest(wind) + '<cyan>│</cyan>');

	log('<cyan>├' + table.clone('─',14) + '┼' + table.clone('─',width-15) + '┤</cyan>');

	var sun =  ' Sun          │</cyan> <dim>Sunrise: </dim>' + $.time(json.sys.sunrise) + '     <dim>Sunset: </dim>' + $.time(json.sys.sunset);
	log('<cyan>│' + sun + table.spaceRest(sun) + '<cyan>│</cyan>');

	log('<cyan>└' + table.clone('─',14) + '┴' + table.clone('─',width-15) + '┘</cyan>');

}

function outputFive (json) {
    var title = ' ' + json.city.name + ',' + json.city.country + '  <dim>lon:' + json.city.coord.lon.toFixed(2) + ' lat:' + json.city.coord.lat.toFixed(2) + '</dim>';
	log('<cyan>┌' + table.clone('─',width) + '┐</cyan>');
	log('<cyan>│</cyan>' + title + table.spaceRest(title) + '<cyan>│</cyan>');
    log('<cyan>├' + table.clone('─',14) + '┬' + table.clone('─',width-15) + '┤</cyan>');

    for(i = 0; i < json.list.length; i++){
        var wea = json.list[i];
        var day = ' <cyan>' + $.fullTime(wea.dt) + '</cyan>';
        var weades = wea.weather[0].main + ' <dim>' + wea.weather[0].description +'</dim>';
        var temp = $.celsius(wea.main.temp) + '°C <dim>/</dim> ' + $.fahrenheit(wea.main.temp) + 'ºF' ;
        log('<cyan>│</cyan>' + day + table.spaceRest(day,14) + '<cyan>│</cyan> ' +  weades + table.spaceRest(weades,38) +  temp + table.spaceRest(temp,16) + '<cyan>│</cyan>');

        if (i === json.list.length-1){
            log('<cyan>└' + table.clone('─',14) + '┴' + table.clone('─',width-15) + '┘</cyan>');
        }
        else{
            log('<cyan>├' + table.clone('─',14) + '┼' + table.clone('─',width-15) + '┤</cyan>');
        }
    }
}

function errorLog (json) {
	log('<red><bright>' + json.message + '</bright></red>');
    help();
}

function help(){
    log(' ');
    log('<bright>Tips!!</bright>');
    log(' ');
    log('<cyan>weather cityName</cyan>');
    log('<dim>Access current weather of cityName.</dim>');
    log(' ');
    log('<cyan>weather cityName -5</cyan>');
    log('<dim>Seach weather forecast for 5 days with data every 3 hours by cityName.</dim>');
    log(' ');
    log('<cyan>weather lat118 lon24.4 -geo</cyan>');
    log('<dim>lat, lon coordinates of the location of your interest!</dim>');
    log(' ');
    log('<cyan>weather lat118 lon24.4 -geo -5</cyan>');
    log('<dim>Seach weather forecast for 5 days with data every 3 hours by geographic coordinates.</dim>');
}

function latlon(arr){
	var lat, lon;
    arr.forEach(function (val) {
    	if(/^lat-?(?=\d)/.test(val)) lat = val.replace('lat','');
    	if(/^lon-?(?=\d)/.test(val)) lon = val.replace('lon','');
    })
    return 'lat=' + lat + '&lon=' + lon;
}

var $ = {
	getWeather: function (param,type) {
		var urlType = {
			'five': {
				'url': 'http://api.openweathermap.org/data/2.5/forecast?q=' + param.join(''),
				'output': outputFive
			},
			'geo': {
				'url': 'http://api.openweathermap.org/data/2.5/weather?' + latlon(param),
				'output': outputCurrent
			},
			'geoFive': {
				'url': 'http://api.openweathermap.org/data/2.5/forecast?' + latlon(param),
				'output': outputFive
			},
			'default' : {
				'url': 'http://api.openweathermap.org/data/2.5/weather?q=' + param.join(''),
				'output': outputCurrent
			}
		}
		var url = urlType[type].url + '&appid=' + apiKey;
		http.get(url , function(res){
		    var body = '';
		    res.on('data', function(chunk){
		        body += chunk;
		    });
		    res.on('end', function(){
						process.stdout.write('\r');
						clearInterval(loading);
						var json = JSON.parse(body);
		        json.cod == 404 ? errorLog (json) : urlType[type].output(json);
		    });
		}).on('error', function(e){
		      console.log("Got an error: ", e);
		});
	},
	celsius: function(t) {
		return (t-273.15).toFixed(1);
	},
	fahrenheit: function(t){
		return ((t - 273.15)* 1.8000 + 32.00).toFixed(1);
	},
	time: function(t){
		var time = new Date(t * 1000);
		return $.fixTwo(time.getHours()) + ':' + $.fixTwo(time.getMinutes());
	},
    fullTime: function(t){
		var time = new Date(t * 1000);
		return $.fixTwo(time.getMonth()+1) + '-' + $.fixTwo(time.getDate()) + ' ' + $.fixTwo(time.getHours()) + ':' + $.fixTwo(time.getMinutes());
	},
	fixTwo: function(num) {
		return num > 9 ? num : '0' + num;
	}
}

process.argv.forEach(function (val, index) {
	if(index < 2) return;
    arg.push(val);
});

if(arg.indexOf('-5') >= 0){
	arg[arg.indexOf('-5')] = '';
	$.getWeather(arg,'five');
}
else if(arg.indexOf('-geo') >= 0){
	arg[arg.indexOf('-geo')] = '';
	$.getWeather(arg,'geo');
}
else if(arg.indexOf('-geo') >= 0 || arg.indexOf('-5') >= 0){
	arg[arg.indexOf('-5')] = '';
	arg[arg.indexOf('-geo')] = '';
	$.getWeather(arg,'geo');
}
else{
	$.getWeather(arg,'default');
}
