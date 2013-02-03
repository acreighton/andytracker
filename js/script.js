(function () {
	
	"use strict";

	var baseUrl = 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx',
	    key = '',
	    button = $('#button'),
	    output = $('#output'),
	    proxy = 'http://andywebdev.com/CTA/proxy.php?url=',
	    lineSelect = $('#lines'),
	    stops = $('.stops');

	lineSelect.change(function() {
		stops.addClass('hidden').removeClass('current');
	    var lineSelection = $('#lines option:selected').val();
		$('select#' + lineSelection).addClass('current').removeClass('hidden');
	});

	$(button).click(function (e) {
		e.preventDefault();
		var mapId = $('select.stops.current option:selected').val();
		var path = baseUrl + '?key=' + key + '&mapid=' + mapId;
		var url = proxy + encodeURIComponent(path) + '&mode=native';
		if (mapId === '--') {
			$(output).html('<p class="error">Please select a stop.</p>');
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
			$(output).html('<p>No scheduled arrivals at this time</p>');
			console.log('eta is undefined');
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

			//using this date pattern to accommodate Safari:
			etas[i].arrT = etas[i].arrT.replace(/\D/g, '');
			etas[i].arrT = new Date(etas[i].arrT.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
			etas[i].prdt = etas[i].prdt.replace(/\D/g, '');
			etas[i].prdt = new Date(etas[i].prdt.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
			etas[i].arrivalTime = etas[i].arrT - etas[i].prdt;
			etas[i].arrivalTime = Math.floor(etas[i].arrivalTime / 100000);

			//converting isApp to number/boolean
			etas[i].isApp = Number(etas[i].isApp);

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
})();
