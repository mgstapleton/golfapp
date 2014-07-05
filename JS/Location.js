/**
 * @author Dick Marjanovic
 * These functions are exposed as a module named "locator"
 */

var locator = (function () {
	// Private members	
	var setLoc = function (loc) {
		if(typeof(Storage) !== "undefined") {
		  sessionStorage.location = loc;
		}
		else {
		  alert("Can't set location - there is no local storage support on this browser.");
		}
	};
	
	var getLoc = function () {
		if(typeof(Storage) !== "undefined") {
		  return sessionStorage.location;
		}
		else {
		  alert("Can't get location - there is no local storage support on this browser.");
		}
	};

	return { 
		// Exposed functions
        setLocation: setLoc,
        getLocation: getLoc
   };

}());
