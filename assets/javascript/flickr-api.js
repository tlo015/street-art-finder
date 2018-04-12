$(function(){
    
    // --------------
    // Settings
    // --------------

    // FLICKR API key
    var apiKey = '5484bba206bf2c1e6f6d38bb57c2af5e';

    // VARIABLES FOR DATABASE
    var photoURL = "";
    var photoID = ""

    // QUERY TERMS --> COULD BE DINAMICALLY PASSED BY USER IN THE FUTURE
    var lat = "34.04117"; 
    var lon = "-118.23298";
    var radius = "25";
    var per_page = "25"; 


    // Main API Query on request that we're sending to Flickr. 

    var jsonRequest = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + apiKey + '&format=json&jsoncallback=?&sort=relevance&tags=streetart&lat=' + lat + '&lon=' + lon + '&radius=' + radius + '&per_page=50'
    console.log(jsonRequest);  

    // This is a shorthanded AJAX function --> Our initial JSON request to Flickr
    $.getJSON(jsonRequest, function(data){
      console.log(data); // --> provides you with a snapshot of the object

    // Loop through the results with the following function
      $.each(data.photos.photo, function(i,item){

      // Build + store in var the url of the photo in order to link to it
        photoURL = 'https://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
        console.log(photoURL); 
        photoID = item.id; 
        console.log(item.id);
        geotagging(photoID); 

        // Create the imgContainer with string variable which will hold all the link location,
        // title, author link, and author name into a text string. 

        var imgCont = '\
        <div class="image-container"> \
        <a class="title" href="https://www.flickr.com/photos/' + photoURL + '"> \
          <img src="' + photoURL + '" /> \
        </a>';

        // Close the div in the 'imgCont' variable
        imgCont += '</div>';


        // For now we will append every image  Append the 'imgCont' variable to the document
        jQuery(imgCont).appendTo('#flickr-image');
        });
    });

    // GEO TAGGING AJAX CALLS
    function geotagging(inputID){
    
      var newRequest = 'https://api.flickr.com/services/rest/?&method=flickr.photos.geo.getLocation&api_key=' + apiKey + '&format=json&jsoncallback=?&photo_id=' + inputID ;
      console.log(newRequest); 
      // Another AJAX call using the shortcut --> 

      jQuery.getJSON(newRequest, function(data){

        console.log(data); // snapshot of the object
        console.log(data.photo.location.latitude)
        console.log(data.photo.location.longitude)
        
      });
    }
    // a snapshot of the location query object

  });
