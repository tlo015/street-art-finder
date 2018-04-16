// Initialize Firebase
var config = {
  apiKey: "AIzaSyA3AZ7qHSzHU0at4cDM2BmxnFozscFwQ1s",
  authDomain: "streetartfinder-d85b6.firebaseapp.com",
  databaseURL: "https://streetartfinder-d85b6.firebaseio.com",
  projectId: "streetartfinder-d85b6",
  storageBucket: "streetartfinder-d85b6.appspot.com",
  messagingSenderId: "961947549075"
};
firebase.initializeApp(config);


var database = firebase.database(), snapshotGlobal, apiKey = '5484bba206bf2c1e6f6d38bb57c2af5e', mapLatLng, map, markerArray = [], starRating;
var lat = "34.04117";
var lon = "-118.23298";
var radius = "25";
var per_page = "25";


function filterFirebase() {
  //console.log(snapshotGlobal);
  for (const key in snapshotGlobal) {
    //console.log(snapshotGlobal[key]);
    if (!snapshotGlobal[key].hasOwnProperty("comments")) {
      database.ref(key).remove();
    }
  }
}

database.ref().on("value", function (snapshot) {
  snapshotGlobal = snapshot.val();
  console.log("firebase updated");
});

$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCIBnMitsKmINmFl7FNOyFFI0nCh4cLNq0", () => {

  mapLatLng = {
    lat: parseFloat(lat),
    lng: parseFloat(lon)
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: mapLatLng
  });
});


function generatePin(id, latitude, longitude, title, rating, url) {
  //console.log("generating...",id,latitude,longitude,title,rating,url);
  var myLatLng = {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude)
  };
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: title
  })
  markerArray.push(marker);
  var infowindow = new google.maps.InfoWindow({

    content: "<div style='width:150px; text-align: left;'>" + "<font color='black'>Title: <b>" + title +
      "</b></font><BR/><font color='black'>Rating: <b>" + rating +
      "</b></font><BR/><br><center><img class='clickable-image' id=" + id + " data-image=" + url +
      " data-lat=" + latitude + " data-lon=" + longitude + " data-rating=" + rating +
      " data-toggle='modal' data-target='#info-modal' src='" + url +
      "' alt='" + title + "' height='100' width='100'></center>" + "</div>"

  });

  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });

  map.addListener("click", function () {
    infowindow.close();
  })


}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(map);
  }
}

$("#search-btn").on("click", function (event) {
  event.preventDefault();
  filterFirebase();

  // Removes the markers from the map, and deletes them from the array.
  setMapOnAll(null);
  markerArray.length = 0;


  var currentPosition = map.getBounds();
  lat = (currentPosition.f.b + currentPosition.f.f) / 2;
  lon = (currentPosition.b.b + currentPosition.b.f) / 2;
  radius = (currentPosition.f.f - currentPosition.f.b) * 111;
  console.log(lat, lon, radius);
  if (radius > 20) {
    radius = 20;
  }

  var photoURL = "", photoID = "", tags = $("#search-bar").val().trim();

  // QUERY TERMS --> COULD BE DYNAMICALLY PASSED BY USER IN THE FUTURE


  var jsonRequest = 'http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + apiKey + '&format=json&jsoncallback=?&sort=relevance&lat=' + lat + '&lon=' + lon + '&radius=' + radius + '&per_page=' + per_page + '&tags=streetart';

  if (tags !== "") {
    jsonRequest += "," + tags;
  }
  console.log(jsonRequest);
  // This is a shorthanded AJAX function --> Our initial JSON request to Flickr
  $.getJSON(jsonRequest, function (data) {
    // Loop through the results with the following function
    $.each(data.photos.photo, function (i, item) {
      // Build + store in var the url of the photo in order to link to it
      photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
      // console.log(photoURL);
      photoID = item.id;
      //console.log(item.id);
      // Create the imgContainer with string variable which will hold all the link location,
      // title, author link, and author name into a text string. 
      geotagging(photoID, photoURL);
    });
  });
});

//displays the corresponding image and assigns all relevant data attributes to image
$("#map").on("click", ".clickable-image", function () {
  starRating = null;
  console.log(starRating);
  var url = $(this).attr("data-image"), id = $(this).attr("id");
  $("#input-comments").val("");
  $("#rating-header").text($(this).attr("data-rating"));
  $("#title-header").text($(this).attr("alt"));
  $("#input-title").val($(this).attr("alt"));
  $("#flickr-image").attr("src", url).attr("data-id", id).attr("data-lon", $(this).attr("data-lon"))
    .attr("data-lat", $(this).attr("data-lat")).attr("data-url", $(this).attr("data-image"))
    .attr("alt", $(this).attr("alt")).attr("data-rating", $(this).attr("data-rating"));
  $("#stored-comments").empty();
  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == id) {
      const comments = snapshotGlobal[key].comments;
      for (const key in comments) {
        const newComment = "<div class='card-body'><p>" + comments[key] + "</p></div>";
        $("#stored-comments").append(newComment);
      }

    };

  }
});

function pushtoFirebase() {
  var existsAlready = false, comment = $("#input-comments").val().trim(), title = $("#input-title").val().trim();
  //console.log(snapshotGlobal);
  console.log(title);
  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == $("#flickr-image").attr("data-id")) {
      if (comment != "") { database.ref(key + "/comments").push(comment); }
      database.ref(key).update({
        title: title
      });
      $("#title-header").text(title);
      if (starRating != null) { database.ref(key + "/rating").push(starRating) };
      existsAlready = true;
      console.log("it exists in firebase");
    }
  }
  if (!existsAlready) {
    console.log("pushing to firebase");
    database.ref().push({
      id: $("#flickr-image").attr("data-id"),
      url: $("#flickr-image").attr("data-url"),
      latitude: $("#flickr-image").attr("data-lat"),
      longitude: $("#flickr-image").attr("data-lon"),
      title: title,
      rating: $("#flickr-image").attr("data-rating")
    }, function () {
      $("#title-header").text(title);
      for (const key in snapshotGlobal) {
        if (snapshotGlobal[key].id == $("#flickr-image").attr("data-id")) {
          if (comment != "") { database.ref(key + "/comments").push(comment); }
          if (starRating != null) { database.ref(key + "/rating").push(starRating) };
        }
      }
    });

  }
  if (comment != "") {
    const newComment = "<div class='card-body'><p>" + comment + "</p></div>";
    $("#stored-comments").append(newComment);
    $("#input-comments").val("");
  }
}

$(".stars").on("click", ".star", function () {
  starRating = $(this).attr("data-rating");
  console.log(starRating);
})

//submits comments to firebase
$("#submit-btn").on("click", function () {
  pushtoFirebase();
});




// GEO TAGGING AJAX CALLS
function geotagging(inputID, inputURL) {

  var newRequest = 'http://api.flickr.com/services/rest/?&method=flickr.photos.geo.getLocation&api_key=' + apiKey + '&format=json&jsoncallback=?&photo_id=' + inputID, existsAlready = false, existingKey, lat, lon, existingRating = 0, ratingCount = 0, ratingDisplay = "none";
  //console.log(newRequest);
  // Another AJAX call using the shortcut --> 

  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == inputID) {
      existsAlready = true;
      existingKey = key;

    }
  };
  $.getJSON(newRequest, function (data) {

    //console.log(data); // snapshot of the object
    //console.log(data.photo.location.latitude)
    //console.log(data.photo.location.longitude)
    if (!existsAlready) {
      generatePin(inputID, data.photo.location.latitude, data.photo.location.longitude, "none", "none", inputURL)
    } else {
      if (snapshotGlobal[existingKey].rating != "none") {
        for (const key in snapshotGlobal[existingKey].rating) {
          existingRating += parseFloat(snapshotGlobal[existingKey].rating[key]);
          ratingCount++;
        }
        existingRating /= ratingCount;
        ratingDisplay = existingRating.toFixed(2);
      }
      generatePin(snapshotGlobal[existingKey].id, snapshotGlobal[existingKey].latitude, snapshotGlobal[existingKey].longitude, snapshotGlobal[existingKey].title, ratingDisplay, snapshotGlobal[existingKey].url);
    }
  });
};