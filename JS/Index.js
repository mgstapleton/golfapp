/**
 * @author Michael Stapleton
 */
//

$(document).ready(function () {
    console.log("loaded index.js");
	addClub();
	createDb();
    $(logo).attr('align', 'absmiddle');
    dateFormat();
	bounds = new google.maps.LatLngBounds();

	if (typeof jQuery === "undefined") {
		alert("Jquery not present");
	}

	if (typeof jQuery !== "undefined") {
		console.log("jQuery binding initialization called");
		// Initialization that runs when each page loads for the first time

		$(document).on("pageshow", "#home_page", function (event) {
			// Do stuff now that the DOM is ready
			console.log("home pageshow triggered from document");
			console.log("event target id is: " + event.target.id);
			// $(".map_button").on('click', function (event, ui) {
			// getMap();
			// });
        });
			$(document).on("pagebeforeshow", "#map_page", function () {
				console.log("Other pagecreate for #map_page triggered");
				getMap();
			});
			$(document).on("pageshow", "#map_page", function () {
				console.log("map resize triggered");
				google.maps.event.trigger(map, 'resize');
				map.setOptions(myOptions);
			});
			$(document).on("pageshow", "#all_clubs_map_page", function () {
				console.log("map page show all resize triggered");
				showAllClubs();
				//google.maps.event.trigger(mapAll, 'resize');
				//mapAll.setOptions(myOptions);
			});
		//});
	} ;
});


function createDb () {
	db = null;
	//var resultJSON;
	db = window.openDatabase("golfapp_db", "1.0", "golfapp", 1000000);
	console.log("Database created");
	insertIntoDB();
	// });
}

// Populate index page list with golf club locations
function addClub () {
	console.log("addclub triggered (from body onload)");
	var inx, node;
	var newId, newLink,	newPage;
	if (typeof jQuery === "undefined") {
		console.log('jQuery Mobile not defined.');
		for (inx = 0; inx < clubList.length; inx++) {
			node = document.createElement("a");
			document.getElementById("clubs").appendChild(document.createElement("li")).appendChild(node);
			node.setAttribute('href', 'HTML/Club.html');
			node.setAttribute('onclick', 'locationClicked(' + inx + ')');
			node.innerHTML = clubList[inx].club
		}
	} else {
		// Iterate through list of clubs
		$.each(clubList, function (i, item) {
			newId = '#' + item.club.split(" ").join('_');
			// Populate list of clubs
			newLink = $("<a>").text(item.club).attr("href", newId).attr("onclick", 'locationClicked(' + i + ')');
			$("<li>").append(newLink).appendTo('#clubs');
            
			newPage = $("#sub_page").clone().attr("id", item.club.split(" ").join('_')).appendTo("body");
			// Clone template page and populate with club details
			$(newId + ">header>h1").html(item.club);
			$(newId + ">nav>img").attr("src", "images/" + item.image);
            //$(newId + ">nav>img#image").html(item.image);
			$(newId + ">nav>p#address").html(item.address);
            $(newId + ">nav>p#phone").html("<a href=tel:" + item.phone + ">" + item.phone + "</a>");
		});
		$("#clubs").listview('refresh');
		$("#clubs").trigger('create'); // TODO: Needed?
	}
};

function dateFormat (){
    var fullDate = new Date()
    //Thu May 19 2011 17:25:38 GMT+1000 {}
    //convert month to 2 digits
    var twoDigitMonth = ((fullDate.getMonth().length+1) === 1) ?(fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1); 
    var twoDigitDate = ((fullDate.getDate().length+1) === 1) ? (fullDate.getDate()) : '0' + (fullDate.getDate());
    currentDate = twoDigitDate + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
    var tomorrowCalc = parseInt(twoDigitDate) + 1;
        if (tomorrowCalc < 10) {tomorrowCalc = "0"+tomorrowCalc }
            tomorrow = tomorrowCalc + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
    currentDateArit = fullDate.getFullYear() + twoDigitMonth + twoDigitDate;
    tomorrowArit = parseInt(currentDateArit) + 1; 
};

var insertIntoDB = function () {
     console.log("insert called");
	 db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS open_comps');
		tx.executeSql('CREATE TABLE IF NOT EXISTS open_comps (club , format, fixture, holes, start_date, cost, info)');
		$.each(fixtures, function (i, comp) {
			tx.executeSql('INSERT INTO open_comps (club , format, fixture, holes, start_date, cost, info) VALUES (?, ?, ?, ?, ?, ?, ?)', [comp.Club, comp.Format, comp.Fixture, comp.Holes, comp.Start_date, comp.Cost, comp.Info]);
		  }
		)
	})
     $('.readyToGo').fadeIn(400).delay(2000).fadeOut(400);
     console.log("table created");
}

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
   alert('Error: ' + error.message + ' code: ' + error.code);
 
}

function nullHandler(){};

function searchResults() {
 var line;
 if (!window.openDatabase) {
  alert('Databases are not supported in this browser.');
  return;
 }
 
// this line clears out any content in the #searchResult element on the page so that the next few lines will show updated content and not just keep repeating lines
 $('#searchResults').html('');
 
// this next section will select all the content from the comps table and then go through it row by row appending the selected cols to the  #searchResults element on the page
 db.transaction(function(transaction) {
     console.log("currentD " + currentDate,currentDateArit,"tom " + tomorrow, tomorrowArit);
   transaction.executeSql('SELECT * FROM open_comps where start_date in ("'+ tomorrow + '","' + currentDate + '") limit 40;', [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
            line = row.club + ' ' + row.fixture+ ' ' + row.start_date + ' Cost: ' + row.cost;
            $("<li>").append(line).appendTo('#searchResults');
        }
      }
     },errorHandler);
 },errorHandler,nullHandler);
 
 return;
 $("#searchResults").listview('refresh');
 $("#searchResults").trigger('create');
}

function searchResultsTable() {
    console.log("Table Called");
    // clear div
    $('#resultsTable').html('');
    var myTableDiv = document.getElementById("resultsTable")
    
    var cols = getHeaders(fixtures);
    
     if (!window.openDatabase) {
      alert('Databases are not supported in this browser.');
      return;
     }
    
     db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM open_comps where start_date in ("'+ tomorrow + '","' + currentDate + '") limit 40;', [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        $('#resultsTable').html(createTable(result, cols));  
//          var tr = document.createElement('TR');
//            tableBody.appendChild(tr);
//            for (i = 0; i < result.rows.length; i++) {
//                var th = document.createElement('TH')
//                th.width = '75';
//                th.appendChild(document.createTextNode(result.row[i]));
//                tr.appendChild(th);
//            }
//        for (var j = 0; j < 40; j++) {  //result.rows.length
//            
//            var row = result.rows.item(j);
//            
//            var tr = document.createElement('TR');
//                for (k = 0; k < row.length; k++) { //row[k].length
//                    console.log("rowLen" + row.length);
//                    var td = document.createElement('TD')
//                    td.appendChild(document.createTextNode(row[k]));
//                    tr.appendChild(td)
//    }
//    tableBody.appendChild(tr);
        }
      },errorHandler);
     },errorHandler,nullHandler);
    
    $("#resultsTable").table('refresh');
    $("#resultsTable").trigger('create');
 };
// return;
//};

function getHeaders(obj) {
        var cols = new Array();
        var p = obj[0];
        for (var key in p) {
            //alert(' name=' + key + ' value=' + p[key]);
            cols.push(key);
        }
    console.log(cols);
        return cols;
    };

function createTable(result, cols) {
    var table = document.createElement('TABLE')
    var tableBody = document.createElement('TBODY')
    table.border = '1'
    table.appendChild(tableBody);
    console.log("Table Created");
    console.log(result.rows);
        var table = $('<table border=1 data-role="table" data-mode="columntoggle" class="ui-responsive"></table>');
        var th = $('<tr></tr>');
        for (var i = 0; i < cols.length; i++) {
            th.append('<th>' + cols[i] + '</th>');
        }
        table.append(th);
    
    for (var j = 0; j < 40; j++) {  //result.rows.length
            
            var row = result.rows.item(j);
            
            var tr = document.createElement('TR');
                for (k = 0; k < row.length; k++) { //row[k].length
                    console.log("rowLen" + row.length);
                    var td = document.createElement('TD')
                    td.appendChild(document.createTextNode(row[k]));
                    tr.appendChild(td)
    }
    tableBody.appendChild(tr);
    }
    return table;
};

// Save index of selected location
var locationClicked = function (locat) {
	(locat !== "") ? locator.setLocation(locat) : locator.setLocation("blank");
};

// Populate club details
var loadData = function () {
	console.log("loadData triggered (from doc)");
	var i = locator.getLocation();
	document.title = clubList[i].club + ' golf club';
	document.getElementById("header").innerHTML = clubList[i].club;
	//document.getElementById("flag").src = clubList[i].image;
	document.getElementById("address").innerHTML = clubList[i].address;
};

// Initialize and display map
var getMap = function () {
	// Get URL for previous page for non-jQuery Mobile version
	console.log("getMap triggered from document");
	if (typeof jQuery === "undefined") {
		document.getElementById('back').href = document.referrer;
	}

	// Get club coordinates and display map
	var club = clubList[locator.getLocation()];
	var clubLocation = new google.maps.LatLng(club.location.lat, club.location.lon);
	myOptions = {
		center : clubLocation,
		zoom : 12,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	// Display a marker on the map
	var marker = new google.maps.Marker({
			position : clubLocation,
			map : map,
			title : club.club + " golf club is here!"
		});
};

var showAllClubs = function () {
	console.log("showAllClubs triggered from document");
	var bounds = new google.maps.LatLngBounds();
	myOptions = {
		zoom : 7,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	}
	mapAll = new google.maps.Map(document.getElementById("map_canvas2"), myOptions);

	// Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;
	for (i = 0; i < clubList.length; i++) {
		locator.setLocation(i);
		var club1 = clubList[locator.getLocation()];
		var position = new google.maps.LatLng(club1.location.lat, club1.location.lon);
		bounds.extend(position);
		marker = new google.maps.Marker({
				position : position,
				map : mapAll,
				title : club1.club + " Golf Club"
			});
        
		// Allow each marker to have an info window
        bindInfoWindow(marker, mapAll, infoWindow, club1.club);

		// Automatically center the map fitting all markers on the screen
		mapAll.fitBounds(bounds);
	}
	// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
//	var boundsListener = google.maps.event.addListener((mapAll), 'bounds_changed', function (event) {
//			this.setZoom(5);
//			google.maps.event.removeListener(boundsListener);
//		});
}
//};

function bindInfoWindow(marker, map, infowindow, strDescription) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(strDescription + " Golf Club");
        infowindow.open(map, marker);
    });
}

// These functions are exposed as a module named "locator"
var locator = (function () {
	// Private members
	var setLoc = function (loc) {
		if (typeof(Storage) !== "undefined") {
			sessionStorage.location = loc;
		} else {
			alert("Can't set location - there is no local storage support on this browser.");
		}
	}

	var getLoc = function () {
		if (typeof(Storage) !== "undefined") {
			return sessionStorage.location;
		} else {
			alert("Can't get location - there is no local storage support on this browser.");
		}
	}
    
    var getFix = function () {
		if (typeof(Storage) !== "undefined") {
			return sessionStorage.fixtures;
		} else {
			alert("Can't get fixtures - there is no local storage support on this browser.");
		}
	}

	return {
		// Exposed functions
		setLocation : setLoc,
		getLocation : getLoc,
        getFixtures : getFix
	};
}

	());