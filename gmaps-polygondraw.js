// True for Draggable Drawing, false for click drawing
var useDraggableDraw = true;

var lineStrokeColor = "#FF0000";
var lineStrokeOpacity = 1;
var lineStrokeWeight = 2;
var polygonStrokeColor = "#FF0000";
var polygonStrokeOpacity = 0.8;
var polygonStrokeWeight = 2;
var fillColor = "#FF0000";
var fillOpacity = 0.35;

var map = null;

function initMap() {
  var position = {lat: 48.856579, lng: 2.330389};

  if (!useDraggableDraw) {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: position
    });
    initClickableDraw(map);
  }
  else {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: position,
      draggable:false
    });
    google.maps.event.addDomListener(window, 'load', initDraggableDraw);
  }
}

function initClickableDraw() {
  var update_timeout = null;
  var firstMaker = null;
  var isPolygonClosed = false;

  var polygon = new google.maps.Polyline({ map: map, path: [], strokeColor: lineStrokeColor, strokeOpacity: lineStrokeOpacity, strokeWeight: lineStrokeWeight });
  google.maps.event.addListener(map, 'click', function (clickEvent) {
    update_timeout = setTimeout(function(){
      if (isPolygonClosed)
        return;
      var markerIndex = polygon.getPath().length;
      var isFirstMarker = markerIndex === 0;
      var marker = new google.maps.Marker({ map: map, position: clickEvent.latLng, draggable: true });
      if (isFirstMarker) {
        firstMarker = marker;
        google.maps.event.addListener(marker, 'click', function () {
          if (isPolygonClosed)
            return;
          var path = polygon.getPath();
          polygon.setMap(null);
          polygon = new google.maps.Polygon({ map: map, path: path, strokeColor: polygonStrokeColor, strokeOpacity: polygonStrokeOpacity, strokeWeight: polygonStrokeWeight, fillColor: fillColor, fillOpacity: fillOpacity });
          isPolygonClosed = true;
        });
      }
      google.maps.event.addListener(marker, 'drag', function (dragEvent) {
        polygon.getPath().setAt(markerIndex, dragEvent.latLng);
      });
      polygon.getPath().push(clickEvent.latLng);
    }, 200);  
  });

      // Add an event to prevent adding a marker when double-clicking (zooming)
      google.maps.event.addListener(map, 'dblclick', function(doubleClickEvent) {
        clearTimeout(update_timeout);
      });
    }

    function initDraggableDraw() {
      var isDoneDrawing = false;
      var finishedPolygon = null;
      google.maps.event.addDomListener(map.getDiv(),'mousedown',function(e){
        // Left click only (right click = 2)
        if(e.button != 0)
          return;
        if (isDoneDrawing)
          finishedPolygon.setMap(null);
        var polyline = new google.maps.Polyline({ map: map, path: [], clickable:false, strokeColor: lineStrokeColor, strokeOpacity: lineStrokeOpacity, strokeWeight: lineStrokeWeight });
        var moveListener=google.maps.event.addListener(map,'mousemove',function(e){
          polyline.getPath().push(e.latLng);
        });

        google.maps.event.addListenerOnce(map,'mouseup',function(e){
          google.maps.event.removeListener(moveListener);
          // Remove the polyline
          var path=polyline.getPath();
          polyline.setMap(null);
          // Create a polygon from the polyline
          finishedPolygon=new google.maps.Polygon({map:map,path:path, strokeColor: polygonStrokeColor, strokeOpacity: polygonStrokeOpacity, strokeWeight: polygonStrokeWeight, fillColor: fillColor, fillOpacity: fillOpacity});
          isDoneDrawing = true;
        });
      });
    }