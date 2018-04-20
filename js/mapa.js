var geocoder;
var map;
var marker;
var bounds;
var service;
var directionsService;
var routingList = []; 
var listMarkers = [];
//icones
var iconTemporary;
var iconSalvo;
var iconNo;
var iconHub;


var places = [];
var matrizDistancia = [];
var iteracoesPorLinha;
var iteration;
var numLines;
var curLine;



function initialize() {
	//Initial Coordinates (IFMG)
	var latlng = new google.maps.LatLng(30.1187,31.6106);
	var options = {
		zoom: 16,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP //road map
	};
	
	//initializes map instance and div selection
	map = new google.maps.Map(document.getElementById("mapa"), options);
	
	//initializes  geographic locator
	geocoder = new google.maps.Geocoder();

	//initializes boundary marker used on the map to zoom
	bounds = new google.maps.LatLngBounds();

	//initializes distance Matrix service
	service = new google.maps.DistanceMatrixService();

	//initializes service for calculating routes for printing
	directionsService = new google.maps.DirectionsService();

	iconHub = new google.maps.MarkerImage("img/icon_concentrador.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconNo = new google.maps.MarkerImage("img/icon_no.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconTemporary = new google.maps.MarkerImage("img/icon_base.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconSalvo = new google.maps.MarkerImage("img/icon_salvo.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	
	//initializes temporary position marker
	marker = new google.maps.Marker({
		map: map,
		draggable: true,
		icon: iconTemporary
	});
}


// add a bookmark to the list of map markers
function adicionarMarcador(location, title) {
	marcador = new google.maps.Marker({
		position: location,
		map: map,
		title: title,
		icon: iconSalvo
	});
	return listMarkers.push(marcador) - 1;
}

//it reads all the markers and zooms so that all the narcs appear
function fitMap(){
	bounds = new google.maps.LatLngBounds();
	for(var i = 0; i < listMarkers.length; i++){
		if(listMarkers[i].getMap() != null){
			bounds.extend(listMarkers[i].getPosition());
		}		
	}
	map.fitBounds(bounds);
}


function sleep(milliseconds) {
	var start = new Date().getTime();
	while(true) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

$(document).ready(function () {

	initialize(); //initializes google maps services
	
	//saves point in map via formatted address

	
	//loads definite address bookmark after clicking button
	$("#btnEndereco").click(function() {
		if($("#txtEndereco").val() != ""){
			if(document.getElementById("origins").innerHTML == "")
			document.getElementById("origins").innerHTML = document.getElementById("origins").innerHTML +$("#txtEndereco").val() ;
			else 
				document.getElementById("origins").innerHTML = document.getElementById("origins").innerHTML +"|"+ $("#txtEndereco").val() ;
			document.getElementById("destinations").innerHTML = document.getElementById("origins").innerHTML ;
		}			
	});
	

	

	//envento de click para posicionar marcador temporário
	google.maps.event.addListener(map, 'click', function(event) {		
		geocoder.geocode({ 'latLng': event.latLng }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					marker.setPosition(event.latLng);
					$('#txtEndereco').val(results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng());
				}
			}
		});
	});
	
	//evento de arraste do marcador temporário
	google.maps.event.addListener(marker, 'drag', function () {
		geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {  
					$('#txtEndereco').val(results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng());
				}
			}
		});
	});

	

	//auto complete em endereço digitado
	$("#txtEndereco").autocomplete({
		source: function (request, response) {
			geocoder.geocode({ 'address': request.term + ', Egypt', 'region': 'EG' }, function (results, status) {
				response($.map(results, function (item) {
					return {
						label: item.formatted_address,
						value: item.formatted_address,
						latitude: item.geometry.location.lat(),
						longitude: item.geometry.location.lng()
					}
				}));
			});
		},
		select: function (event, ui) {
			var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
			marker.setPosition(location);
			map.setCenter(location);
			map.setZoom(15);
		}
	});
	
	$("form").submit(function(event) {
		event.preventDefault();
	});
});