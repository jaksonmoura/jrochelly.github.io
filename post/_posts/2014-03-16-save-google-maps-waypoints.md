---
comments: true
layout: post
date: 2014-03-16 10:31:00
title: "Saving Google Maps waypoints into database"
---

Currently I'm building an app that shows bus routes and it's important for the project to save the waypoints, instead of just start point and end point. Thus, I'm capable to replicate the route exactly same as saved.

So, let's see the basic code.

<pre rel="html">
&lt;div class="map"&gt;
  &lt;div id="map-canvas"/&gt;
&lt;/div&gt;
&lt;!-- footer --&gt;
&lt;script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDc7y0hbNmHzHKgaqe7VCl6a--P4VAW2lU&sensor=false"&gt;
&lt;/script&gt;
&lt;script src="maps.js"&gt;&lt;/script&gt;
&lt;script&gt;
  $( document ).ready(function() {
    initialize(true);
    calcRoute();
  })
&lt;/script&gt;
</pre>

The above code is used to create a new one, it allows you to edit the route and save it. To be clear I'm using google maps V3.

Now let's go to important thing. Don't forget to call the script as well. Obs.: I also use jQuery, so put it on the line.

The code I'm using takes basically two steps, <code>initialize()</code> which is responsable for the definitions of the map (ie. center, maxZoomLevel, panControl, boundaries, etc.), it also receive one boolean parameter used to define whether the route can be draggleble or not. I set false for the show route page, where you can navigate the map, but cannot edit. The <code>calcRoute()</code> has a simple task: take a default route to show.

Bellow, the map script:

<pre rel="javascript">
1  var rendererEditOptions = {
2    draggable: true
3  };
4  var rendererOptions = {
5    draggable: false,
6    suppressMarkers: true
7  };
8  var ren,
9      ser = new google.maps.DirectionsService(),
10      data = {},
11      map, marker,
12      palmas = new google.maps.LatLng(-10.204164, -48.3332),
13      minZoomLevel = 12;
14  
15  function initialize(edit) {
16    var mapOptions = {
17      center: palmas,
18      zoom: 14,
19      panControl:false,
20      streetViewControl:false,
21      maxZoom: 18,
22      minZoom: minZoomLevel
23    };
24    var map = new google.maps.Map(document.getElementById("map-canvas"),
25        mapOptions);
26    // Get's the boolean parameter to set the route to be draggable or not.
27    if (edit) {
28      ren = new google.maps.DirectionsRenderer(rendererEditOptions);
29    } else {
30      ren = new google.maps.DirectionsRenderer(rendererOptions);
31    };
32    
33    ren.setMap(map); // Make map shows up
34    google.maps.event.addListener(ren, 'directions_changed', function() {
35      computeTotalDistance(ren.getDirections());
36    });
37  
38    // Limit bounds to Palmas
39    var limitBounds = new google.maps.LatLngBounds(
40      new google.maps.LatLng(-13.2906, -51.0310167),
41      new google.maps.LatLng(-4.6734667, -45.2803667)
42    );
43  
44    // Listen for the dragend event
45     google.maps.event.addListener(map, 'drag', function() {
46       if (limitBounds.contains(map.getCenter())) return;
47       // When on the bound limit - Move the map back within the bounds
48       var c = map.getCenter(),
49           x = c.lng(),
50           y = c.lat(),
51           maxX = limitBounds.getNorthEast().lng(),
52           maxY = limitBounds.getNorthEast().lat(),
53           minX = limitBounds.getSouthWest().lng(),
54           minY = limitBounds.getSouthWest().lat();
55  
56       if (x < minX) x = minX;
57       if (x > maxX) x = maxX;
58       if (y < minY) y = minY;
59       if (y > maxY) y = maxY;
60  
61       map.setCenter(new google.maps.LatLng(y, x));
62     });
63     
64     // Limit the zoom level
65    google.maps.event.addListener(map, 'zoom_changed', function() {
66      if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
67    });
68  
69  }
70  
71  // Shows a default route so we can drag and edit the way we want.
72  function calcRoute() {
73    var request = {
74        origin: "Quadra 101 Norte, Av. Teotônio Segurada, Palmas - TO",
75        destination: "Quadra 1102 Sul, Av. Teotônio Segurada, Palmas - TO",
76        travelMode: google.maps.TravelMode.DRIVING
77    };
78    ser.route(request, function(response, status) {
79      if (status == google.maps.DirectionsStatus.OK) { ren.setDirections(response) }
80    });
81  }
82  
83  // Used for editing the saved route
84  function loadRoute(os){
85    var wp = [];
86      for(var i=0;i &lt; os.waypoints.length;i++)
87          wp[i] = {'location': new google.maps.LatLng(os.waypoints[i][0], os.waypoints[i][1]),'stopover':false }
88      ser.route({'origin':new google.maps.LatLng(os.start.lat,os.start.lng),
89      'destination':new google.maps.LatLng(os.end.lat,os.end.lng),
90      'waypoints': wp,
91      'travelMode': google.maps.DirectionsTravelMode.DRIVING},function(res,sts) {
92          if(sts=='OK')ren.setDirections(res);
93      })
94  }
95  
96  function saveWaypoints(){
97    var w=[],wp;
98    var rleg = ren.directions.routes[0].legs[0];
99    data.start = {'lat': rleg.start_location.lat(), 'lng':rleg.start_location.lng()}
100    data.end = {'lat': rleg.end_location.lat(), 'lng':rleg.end_location.lng()}
101    var wp = rleg.via_waypoints
102    for(var i=0;i&lt;wp.length;i++)w[i] = [wp[i].lat(),wp[i].lng()]
103    data.waypoints = w;
104  
105    var str = JSON.stringify(data);
106    // Send data to fields
107    $('#going_start_location').val(data.start.lat+','+data.start.lng);
108    $('#going_waypoints').val(JSON.stringify(w));
109    $('#going_end_location').val(data.end.lat+','+data.end.lng);
110  }
111  
112  $(function(){
113    $('#save_going').click(function(e) { saveWaypoints() });
114  });
</pre>

The <code>initialize()</code> is commented in the important parts and excepts the bounds the rest is kind of standard to show a map, so I will pass it and explain about the <code>loadRoute(os)</code> and <code>saveWaypoints()</code> functions.

###The Bounds
The bounds is a way I find really good to limit the area where the user can navigate, He doesn't need to see China once my app is in one state only.
On line 40 I set the limit coordinates and add a drag listener to verify if the user dragged until the limit. The code is simple so I won't go into details.

###Saving the route

When you save the way points into database using this script, it end like this: <code>[[-10.1977188,-48.338372400000026],[-10.204542,-48.34220600000003],[-10.2108154,-48.3414487],[-10.2108614,-48.3248532001],[-10.2238141,-48.3255121999],[-10.2195964,-48.34521760001]]</code>

Arrays within an array, each waypoints you create on dragging the route has coordinates, this set above is all of them chained into one line.

On line 98 <code>rleg</code> receive <code>legs[0]</code>. This <code>legs[0]</code> means the route you've created. We are going to work with it. The app saves the start/end location and the waypoints as you can see on the lines 99-100 and 101-103 respectively. Lines 101-103 are responsable to make the waypoints look the same you saw in the beginning  of this session. On line 105 the <code>JSON.stringfy</code> turn the data to literal string so it can be save into DB. At the end I just set the values to the fields in the form.

###Loading the route

Loading the route is basically the inverse of saving, so you need to get the strings saved into db and put them in the function by passing the values through the parameter:

<pre rel="html">
&lt;script&gt;
  $( document ).ready(function() {
    initialize(true);
    loadRoute(&lt;%= raw '{"start":{"lat":'+@going.start_location.split(",")[0].to_s+',"lng":'+@going.start_location.split(",")[1].to_s+'},"end":{"lat":'+@going.end_location.split(",")[0].to_s+',"lng":'+@going.end_location.split(",")[1].to_s+'},"waypoints":'+@going.waypoints.to_s+'}' %&gt;);
  });
  &lt;/script&gt;
</pre>

As you can see I use Ruby to pass the values.

Well, after all this you can save/load you waypoints.