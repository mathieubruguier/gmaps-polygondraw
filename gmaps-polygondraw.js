// True for Draggable Drawing, false for click drawing
var useDraggableDraw = false;

// Draggable Drawing only : Use left click to draw. If true, moving the map will be impossible.
// If false, right click will be used.
var useLeftClickDraggableDrawing = false;

// Displays a button to remove all the points previously created in click drawing
var showRemovePointButton = true;
var removePointsButtonLabel = 'Clear points';
var removePointsButtonTooltip = 'Clear all drawn points';

// Customization options for the Stroke/Line
var lineStrokeColor = "#FF0000";
var lineStrokeOpacity = 1;
var lineStrokeWeight = 2;

//Customization options for the Polygon/Area
var polygonStrokeColor = "#FF0000";
var polygonStrokeOpacity = 0.8;
var polygonStrokeWeight = 2;
var fillColor = "#FF0000";
var fillOpacity = 0.35;

var map = null;
var markers = [];
var clickableDrawPolygon = null;
var isPolygonClosed = false;

function initMap() {
  var position = {lat: 48.856579, lng: 2.330389};

  if (!useDraggableDraw) {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: position,
      clickableIcons: false
    });
    initClickableDraw(map);
    if (showRemovePointButton) {
      var removeMarkersDiv = document.createElement('div');
      var centerControl = new clearMarkers(removeMarkersDiv, map);

      removeMarkersDiv.index = 1;
      map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(removeMarkersDiv);
    }
  }
  else {
    if (useLeftClickDraggableDrawing)
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: position,
        draggable:false
      });
    else
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: position
      });
    google.maps.event.addDomListener(window, 'load', initDraggableDraw);
  }
}

function clearMarkers(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '5px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '50px';
        controlUI.style.textAlign = 'center';
        controlUI.title = removePointsButtonTooltip;
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = removePointsButtonLabel;
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          deleteMarkers();
          clickableDrawPolygon.setMap(null);
          clickableDrawPolygon = new google.maps.Polyline({ map: map, path: [], strokeColor: lineStrokeColor, strokeOpacity: lineStrokeOpacity, strokeWeight: lineStrokeWeight });
          isPolygonClosed = false;
        });

      }

      function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      function deleteMarkers() {
        setMapOnAll(null);
        markers = [];
      }

      function initClickableDraw() {
        var update_timeout = null;
        var firstMaker = null;
        isPolygonClosed = false;

        clickableDrawPolygon = new google.maps.Polyline({ map: map, path: [], strokeColor: lineStrokeColor, strokeOpacity: lineStrokeOpacity, strokeWeight: lineStrokeWeight });
        google.maps.event.addListener(map, 'click', function (clickEvent) {
          update_timeout = setTimeout(function(){
            if (isPolygonClosed)
              return;
            var markerIndex = clickableDrawPolygon.getPath().length;
            var isFirstMarker = markerIndex === 0;
            var marker = new google.maps.Marker({ map: map, position: clickEvent.latLng, draggable: true });
            markers.push(marker);
            if (isFirstMarker) {
              firstMarker = marker;
              google.maps.event.addListener(marker, 'click', function () {
                if (isPolygonClosed)
                  return;
                var path = clickableDrawPolygon.getPath();
                clickableDrawPolygon.setMap(null);
                clickableDrawPolygon = new google.maps.Polygon({ map: map, path: path, strokeColor: polygonStrokeColor, strokeOpacity: polygonStrokeOpacity, strokeWeight: polygonStrokeWeight, fillColor: fillColor, fillOpacity: fillOpacity });
                isPolygonClosed = true;
              });
            }
            google.maps.event.addListener(marker, 'drag', function (dragEvent) {
              clickableDrawPolygon.getPath().setAt(markerIndex, dragEvent.latLng);
            });
            clickableDrawPolygon.getPath().push(clickEvent.latLng);
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
        if(useLeftClickDraggableDrawing && e.button != 0)
          return;
        else if (!useLeftClickDraggableDrawing && e.button != 2)
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