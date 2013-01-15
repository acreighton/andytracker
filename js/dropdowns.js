//to build a dropdown, visit one of the CTA mobile sites for a particular line
//(e.g. http://www.transitchicago.com/mobile/traintrackerstops.aspx?rid=310) and drop this baby in the console.  BOOM
// This also requires the jQuerify bookmarklet: http://www.learningjquery.com/2009/04/better-stronger-safer-jquerify-bookmarklet
var divs = $('#ttmobile_stopbuttons').find('div');
$.each(divs, function (){
	var stopName = $(this).find('span').text();
	var id = $(this).find('a').attr('href');
	var index = id.indexOf('?');
	var string = id.substr(index + 5);
	stopName = stopName.replace(/\n/g, '');
	stopName = stopName.replace(/\s/g, '');
	console.log('<option value="' + string + '">' + stopName + '</option>');
});