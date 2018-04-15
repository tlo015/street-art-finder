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


var database = firebase.database(), snapshotGlobal,apiKey = '5484bba206bf2c1e6f6d38bb57c2af5e';

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
});

$("#search-btn").on("click", function (event) {
  event.preventDefault();
  $("#mapWrapper").empty();
  filterFirebase();
  // Main API Query on request that we're sending to Flickr. 

  // --------------
  // Settings
  // --------------

  // VARIABLES FOR DATABASE
  var photoURL = "";
  var photoID = ""

  // QUERY TERMS --> COULD BE DYNAMICALLY PASSED BY USER IN THE FUTURE
  var lat = "34.04117";
  var lon = "-118.23298";
  var radius = "25";
  var per_page = "5";

  var jsonRequest = 'http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + apiKey + '&format=json&jsoncallback=?&sort=relevance&tags=streetart&lat=' + lat + '&lon=' + lon + '&radius=' + radius + '&per_page=' + per_page;
  //console.log(jsonRequest);

  // This is a shorthanded AJAX function --> Our initial JSON request to Flickr
  $.getJSON(jsonRequest, function (data) {
    //console.log(data); // --> provides you with a snapshot of the object


    // Loop through the results with the following function
    $.each(data.photos.photo, function (i, item) {

      // Build + store in var the url of the photo in order to link to it
      photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
     // console.log(photoURL);
      photoID = item.id;
      //console.log(item.id);
      geotagging(photoID);

      // Create the imgContainer with string variable which will hold all the link location,
      // title, author link, and author name into a text string. 

      var newPin = ' <button type="button" class="btn btn-primary" id=' + photoID + ' data-image=' + photoURL + ' data-toggle="modal" data-target="#info-modal">' + photoID + '</button></a>';
      
      // For now we will append every image  Append the 'newPin' variable to the document
      $('#mapWrapper').append(newPin);
    });
  });



  
});

//displays the corresponding image and assigns all relevant data attributes to image
$("#mapWrapper").on("click", "button", function () {
  var url = $(this).attr("data-image"), id = $(this).attr("id");
  $("#input-comments").val("");
  $("#flickr-image").attr("src", url).attr("data-id", id);
  $("#stored-comments").empty();
  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == id) {
      const comments = snapshotGlobal[key].comments;
      $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCIBnMitsKmINmFl7FNOyFFI0nCh4cLNq0", () => {
        $lat = parseFloat(snapshotGlobal[key].latitude);
        $lng = parseFloat(snapshotGlobal[key].longitude);
        var myLatLng = {
          lat: $lat,
          lng: $lng
        }
    
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 11,
          center: myLatLng
        })
    
        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: snapshotGlobal[key].title
        })

        var infowindow = new google.maps.InfoWindow({
          content: "<div style='width:150px; text-align: left;'>"+ "<font color='black'>Title: <b>" + snapshotGlobal[key].title + "</b></font><BR/><font color='black'>Rating: <b>" + snapshotGlobal[key].rating + "</b></font><BR/><br><center><img src='" + url + "' alt='" + snapshotGlobal[key].title + "' height='100' width='100'></center>" +"</div>"
        });


        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

        
      });




      for (const key in comments) {
        const newComment = "<div class='card-body'><p>" + comments[key] + "</p></div>";
        $("#stored-comments").append(newComment);
      }

    };

  }
});

//submits comments to firebase
$("#submit-btn").on("click", function () {
  //console.log(snapshotGlobal);
  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == $("#flickr-image").attr("data-id")) {
      database.ref(key + "/comments").push($("#input-comments").val().trim());
    }
  }
  const newComment = "<div class='card-body'><p>" + $("#input-comments").val().trim() + "</p></div>";
  $("#stored-comments").append(newComment);
});




// GEO TAGGING AJAX CALLS
function geotagging(inputID) {

  var newRequest = 'http://api.flickr.com/services/rest/?&method=flickr.photos.geo.getLocation&api_key=' + apiKey + '&format=json&jsoncallback=?&photo_id=' + inputID, existsAlready = false;
  //console.log(newRequest);
  // Another AJAX call using the shortcut --> 

  for (const key in snapshotGlobal) {
    if (snapshotGlobal[key].id == inputID) {
      existsAlready = true;
    }
  }
  $.getJSON(newRequest, function (data) {

    //console.log(data); // snapshot of the object
    //console.log(data.photo.location.latitude)
    //console.log(data.photo.location.longitude)
    if (!existsAlready) {
      database.ref().push({
        id: inputID,
        url: newRequest,
        latitude: data.photo.location.latitude,
        longitude: data.photo.location.longitude,
        title: "none",
        rating: "none"
      })
    }

  });
};
