//to build a dropdown, visit one of the CTA mobile sites for a particular line
//(e.g. http://www.transitchicago.com/mobile/traintrackerstops.aspx?rid=310) and drop this baby in the console.  BOOM
(function () {
	var lines = document.getElementById('ttmobile_stopbuttons').children;
	for (var i = 0; i < lines.length; i++) {
		var href     = lines[i].childNodes[1].href,
		    stopId   = href.substr(href.lastIndexOf('?') + 5),
		    stopName = lines[i].childNodes[1].children[0].innerText;
		console.log('<option value="' + stopId + '">' + stopName + '</option>');
	}
})();