(function ($) {
	
	"use strict";

	var baseUrl = 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx',
	    key = '',
	    button = $('#button'),
	    output = $('#output'),
	    proxy = 'http://andywebdev.com/CTA/proxy.php?url=',
	    lineSelect = $('#lines'),
	    stops = $('.stops');

	lineSelect.change(function() {
	    var lineSelection = $('#lines option:selected').val();
		$(output).empty();
		stops.addClass('hidden').removeClass('current');
		$('select#' + lineSelection).addClass('current').removeClass('hidden');
	});

	$(button).click(function (e) {
		e.preventDefault();
		var mapId = $('select.stops.current option:selected').val(),
		    line  = $('#lines option:selected').val(),
		    path  = baseUrl + '?key=' + key + '&mapid=' + mapId + '&rt=' + line,
		    url   = proxy + encodeURIComponent(path) + '&mode=native';
		    
		if (mapId === '--') {
			$(output).html('<p class="error">Please select a stop.</p>');
		} else if (line === '--'){
			$(output).html('<p class="error">Please select a line.</p>');
		} else {
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'xml',
				success: showData,
				error: showError
			});
		}
	});
	
	function parseDate (data) {
		//using this date pattern to accommodate Safari:
		data.arrT = data.arrT.replace(/\D/g, '');
		data.arrT = new Date(data.arrT.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
		data.prdt = data.prdt.replace(/\D/g, '');
		data.prdt = new Date(data.prdt.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
		data.arrivalTime = data.arrT - data.prdt;
		data.arrivalTime = Math.floor(data.arrivalTime / 100000);
		//converting isApp to number/boolean
		data.isApp = Number(data.isApp);
	}

	function showData (xml) {
		$(output).empty();

		var json = $.xml2json(xml),
		    jsonString = JSON.stringify(json, null, '\t'),
		    eta = json.eta,
		    etas = [],
			times = {
				northBound: [],
				southBound: []
			};
		    
		console.log(jsonString);

		if (typeof eta === 'undefined') {
			$(output).html('<p class="null">No scheduled arrivals at this time</p>');
			return false;
		} else {
			//response sometimes returns eta as object instead of array, so push everything into an array
			if (typeof eta.length === 'undefined') {
				etas.push(eta);
			} else {
				for (var i = 0; i < eta.length; i++) {
					etas.push(eta[i]);
				}
			}
		}

		for (var i = 0, len = etas.length; i < len; i++) {
			parseDate(etas[i]);

			//looping over operational direction
			var direction = etas[i].trDr;

			if (direction == 1) {
				times.northBound.push(etas[i]);
			} else {
				times.southBound.push(etas[i]);
			}
		}

		function checkSouth () {
			if (typeof times.southBound[0] === 'undefined') {
				return '';
			} else {
				return '<h2>' + times.southBound[0].stpDe + '</h2>';
			}
		}

		function checkNorth () {
			if (typeof times.northBound[0] === 'undefined') {
				return '';
			} else {
				return '<h2>' + times.northBound[0].stpDe + '</h2>';
			}
		}

		var template = checkNorth() + 
		 			   '{{#northBound}}' +
				       '<div class="incoming {{rt}}"><p>{{#isApp}}Approaching{{/isApp}}{{^isApp}}{{arrivalTime}} min{{/isApp}}</p></div>' +
					   '{{/northBound}}' + 
					   checkSouth() + 
					   '{{#southBound}}' +
				       '<div class="incoming {{rt}}"><p>{{#isApp}}Approaching{{/isApp}}{{^isApp}}{{arrivalTime}} min{{/isApp}}</p></div>' +
					   '{{/southBound}}';

		var html = Mustache.to_html(template, times);

		$(output).html(html);
	}

	function showError () {
		$(output).empty();
		$(output).html('<p>There has been an error.</p>');
	}
})(jQuery);
