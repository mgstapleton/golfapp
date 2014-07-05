/**
 * @author Dick Marjanovic
 */
function initialize() {
	// Get URL for previous page for non-jQuery Mobile version
	if (typeof jQuery === "undefined") {
		document.getElementById('back').href = document.referrer;
	}
	
	// Get office coordinates and display map
	var club = clubList[locator.getLocation()];
	var myLocation = new google.maps.LatLng(office.location.lat, office.location.lon);
	var myOptions = {
		center : myLocation,
		zoom : 14,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
	// Display a marker on the map
	var marker = new google.maps.Marker({
		position: myLocation,
		map: map,
		title: "The " + club.club + " office is here!"
		});
}
