$(document).ready(function(){

$(".start-btn").click(function(){
  $(".carousel-container").replaceWith($(".main-body-container"));
  $(".main-body-container").show();
  $(".start-btn").hide();
});

});