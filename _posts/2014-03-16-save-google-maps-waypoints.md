---
comments: true
layout: post
date: 2014-03-16 10:31:00
title: "Saving Google Maps waypoints into database"
categories:
- en
---

Currently I'm building an app that shows bus routes and it's important for the project to save the waypoints, instead of just start point and end point. Thus, I'm capable to replicate the route exactly same as saved.

So, let's see the basic code.

{% highlight html linenos %}<div class="map">
  <div id="map-canvas"/>
</div>
<!-- footer -->
<script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDc7y0hbNmHzHKgaqe7VCl6a--P4VAW2lU&sensor=false">
</script>
<script src="maps.js"></script>
<script>
  $( document ).ready(function() {
    initialize(true);
    calcRoute();
  })
</script>
{% endhighlight %}

The above code is used to create a new one, it allows you to edit the route and save it. To be clear I'm using google maps V3.

Now let's go to important thing. Don't forget to call the script as well. Obs.: I also use jQuery, so put it on the line.

The code I'm using takes basically two steps, <code class="code">initialize()</code> which is responsable for the definitions of the map (ie. center, maxZoomLevel, panControl, boundaries, etc.), it also receive one boolean parameter used to define whether the route can be draggleble or not. I set false for the show route page, where you can navigate the map, but cannot edit. The <code class="code">calcRoute()</code> has a simple task: take a default route to show.

Bellow, the map script:

{% highlight javascript linenos %}
var rendererEditOptions = {
  draggable: true
};
var rendererOptions = {
  draggable: false,
  suppressMarkers: true
};
var ren,
    ser = new google.maps.DirectionsService(),
    data = {},
    map, marker,
    palmas = new google.maps.LatLng(-10.204164, -48.3332),
    minZoomLevel = 12;
function initialize(edit) {
  var mapOptions = {
    center: palmas,
    zoom: 14,
    panControl:false,
    streetViewControl:false,
    maxZoom: 18,
    minZoom: minZoomLevel
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  // Get's the boolean parameter to set the route to be draggable or not.
  if (edit) {
    ren = new google.maps.DirectionsRenderer(rendererEditOptions);
  } else {
    ren = new google.maps.DirectionsRenderer(rendererOptions);
  };
  ren.setMap(map); // Make map shows up
  google.maps.event.addListener(ren, 'directions_changed', function() {
    computeTotalDistance(ren.getDirections());
  });
  // Limit bounds to Palmas
  var limitBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-13.2906, -51.0310167),
    new google.maps.LatLng(-4.6734667, -45.2803667)
  );
  // Listen for the dragend event
   google.maps.event.addListener(map, 'drag', function() {
     if (limitBounds.contains(map.getCenter())) return;
     // When on the bound limit - Move the map back within the bounds
     var c = map.getCenter(),
         x = c.lng(),
         y = c.lat(),
         maxX = limitBounds.getNorthEast().lng(),
         maxY = limitBounds.getNorthEast().lat(),
         minX = limitBounds.getSouthWest().lng(),
         minY = limitBounds.getSouthWest().lat();
     if (x < minX) x = minX;
     if (x > maxX) x = maxX;
     if (y < minY) y = minY;
     if (y > maxY) y = maxY;
     map.setCenter(new google.maps.LatLng(y, x));
   });
   // Limit the zoom level
  google.maps.event.addListener(map, 'zoom_changed', function() {
    if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
  });
}
// Shows a default route so we can drag and edit the way we want.
function calcRoute() {
  var request = {
      origin: "Quadra 101 Norte, Av. Teotônio Segurada, Palmas - TO",
      destination: "Quadra 1102 Sul, Av. Teotônio Segurada, Palmas - TO",
      travelMode: google.maps.TravelMode.DRIVING
  };
  ser.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) { ren.setDirections(response) }
  });
}
// Used for editing the saved route
function loadRoute(os){
  var wp = [];
    for(var i=0;i < os.waypoints.length;i++)
        wp[i] = {'location': new google.maps.LatLng(os.waypoints[i][0], os.waypoints[i][1]),'stopover':false }
    ser.route({'origin':new google.maps.LatLng(os.start.lat,os.start.lng),
    'destination':new google.maps.LatLng(os.end.lat,os.end.lng),
    'waypoints': wp,
    'travelMode': google.maps.DirectionsTravelMode.DRIVING},function(res,sts) {
        if(sts=='OK')ren.setDirections(res);
    })
}
function saveWaypoints(){
  var w=[],wp;
  var rleg = ren.directions.routes[0].legs[0];
  data.start = {'lat': rleg.start_location.lat(), 'lng':rleg.start_location.lng()}
  data.end = {'lat': rleg.end_location.lat(), 'lng':rleg.end_location.lng()}
  var wp = rleg.via_waypoints
  for(var i=0;i<wp.length;i++)w[i] = [wp[i].lat(),wp[i].lng()]
  data.waypoints = w;
  var str = JSON.stringify(data);
  // Send data to fields
  $('#going_start_location').val(data.start.lat+','+data.start.lng);
  $('#going_waypoints').val(JSON.stringify(w));
  $('#going_end_location').val(data.end.lat+','+data.end.lng);
}
$(function(){
  $('#save_going').click(function(e) { saveWaypoints() });
});
{% endhighlight %}

The <code class="code">initialize()</code> is commented in the important parts and excepts the bounds the rest is kind of standard to show a map, so I will pass it and explain about the <code class="code">loadRoute(os)</code> and <code class="code">saveWaypoints()</code> functions.

###The Bounds
The bounds is a way I find really good to limit the area where the user can navigate, He doesn't need to see China once my app is in one state only.
On line 36 I set the limit coordinates and add a drag listener to verify if the user dragged until the limit. The code is simple so I won't go into details.

###Saving the route

When you save the way points into database using this script, it end like this: <code class="code">[[-10.1977188,-48.338372400000026],[-10.204542,-48.34220600000003],[-10.2108154,-48.3414487],[-10.2108614,-48.3248532001],[-10.2238141,-48.3255121999],[-10.2195964,-48.34521760001]]</code>

Arrays within an array, each waypoints you create on dragging the route has coordinates, this set above is all of them chained into one line.

On line 87 <code class="code">rleg</code> receive <code class="code">legs[0]</code>. This <code class="code">legs[0]</code> means the route you've created. We are going to work with it. The app saves the start/end location and the waypoints as you can see on the lines 88-89 and 90-92 respectively. Lines 90-92 are responsable to make the waypoints look the same you saw in the beginning  of this session. On line 93 the <code class="code">JSON.stringfy</code> turn the data to literal string so it can be save into DB. At the end I just set the values to the fields in the form.

###Loading the route

Loading the route is basically the inverse of saving, so you need to get the strings saved into db and put them in the function by passing the values through the parameter:

{% highlight html linenos %}
<script>
  $( document ).ready(function() {
    initialize(true);
    loadRoute(<%= raw '{"start":{"lat":'+@going.start_location.split(",")[0].to_s+',"lng":'+@going.start_location.split(",")[1].to_s+'},"end":{"lat":'+@going.end_location.split(",")[0].to_s+',"lng":'+@going.end_location.split(",")[1].to_s+'},"waypoints":'+@going.waypoints.to_s+'}' %>);
  });
  </script>
{% endhighlight %}

As you can see I use Ruby to pass the values.

Well, after all this you can save/load you waypoints.