(function () {
	
	"use strict";

	var baseUrl = 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx',
	    key = '',
	    button = $('#button'),
	    output = $('#output'),
	    proxy = 'http://andywebdev.com/CTA/proxy.php?url=';

	$(button).click(function (e) {
		e.preventDefault();
		var mapId = $('#stops option:selected').val();
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

		var json = $.xml2json(xml);
		var jsonString = JSON.stringify(json, null, '\t');
		console.log(jsonString);

		var eta = json.eta;
		var len = json.eta.length;

		var times = {
			northBound: [],
			southBound: []
		};
		
		for (var i = 0; i < len; i++) {

			//using this date pattern to accommodate Safari:
			eta[i].arrT = eta[i].arrT.replace(/\D/g, '');
			eta[i].arrT = new Date(eta[i].arrT.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
			eta[i].prdt = eta[i].prdt.replace(/\D/g, '');
			eta[i].prdt = new Date(eta[i].prdt.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$2/$3/$1 $4:$5:$6'));
			eta[i].arrivalTime = eta[i].arrT - eta[i].prdt;
			eta[i].arrivalTime = Math.floor(eta[i].arrivalTime / 100000);

			//converting isApp to number/boolean
			eta[i].isApp = Number(eta[i].isApp);

			//looping over operational direction
			var direction = eta[i].trDr;
			if (direction == 1) {
				times.northBound.push(eta[i]);
				console.log('northBound: ' + times.northBound);
				console.log(JSON.stringify(times.northBound));
			} else {
				times.southBound.push(eta[i]);
				console.log('southBound: ' + times.southBound);
				console.log(JSON.stringify(times.southBound));
			}
		}

		var template = '<h2>' + times.northBound[0].stpDe + '</h2>' + 
		 			   '{{#northBound}}' +
				       '<div class="incoming {{rt}}"><p>{{#isApp}}Approaching{{/isApp}}{{^isApp}}{{arrivalTime}} min{{/isApp}}</p></div>' +
					   '{{/northBound}}' + 
					   '<h2>' + times.southBound[0].stpDe + '</h2>' + 
					   '{{#southBound}}' +
				       '<div class="incoming {{rt}}"><p>{{#isApp}}Approaching{{/isApp}}{{^isApp}}{{arrivalTime}} min{{/isApp}}</p></div>' +
					   '{{/southBound}}';

		var html = Mustache.to_html(template, times);
		console.log(html);

		$(output).html(html);
	}

	function showError () {
		$(output).empty();
		$(output).html('<p>There has been an error.</p>');
	}
})();
