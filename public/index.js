const routes = [];
const route_combobox = document.getElementById("route_combobox");
const description_input = document.getElementById("description_input");
let map;
let cluster;
let routing_control;

const start = L.icon({
    iconUrl: 'assets/start.svg',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -17.5]
});

const finish = L.icon({
    iconUrl: 'assets/finish.svg',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -17.5]
});

const point = L.icon({
    iconUrl: 'assets/burger.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

const routingControlOptions = { 
    addWaypoints: true,
    draggableWaypoints: true,
    routeWhileDragging: true,
    createMarker
}

//returns a clickable green button
function createButton(label, container) {
    const btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-success');
    btn.innerHTML = label;
    return btn;
}

//appends a waypoint to the current route
function appendWaypoint(waypoint){
    const waypoints = routing_control.getWaypoints();
    if(waypoints.length == 2 && waypoints[0].latLng == null)
        routing_control.spliceWaypoints(0, 1, waypoint);
    else if(waypoints.length == 2 && waypoints[1].latLng == null)
        routing_control.spliceWaypoints(1, 1, waypoint);
    else{
        waypoints.push(waypoint);
        routing_control.setWaypoints(waypoints);
    }
}

//function used when the map is clicked
//to prompt the user for a new marker
function showAddMarkerDialog(e) {
    
    //create a button and a container
    const container = L.DomUtil.create('div');
    const addButton = createButton('Agregar', container);

    //set the button's function
    L.DomEvent.on(addButton, 'click', function() {
        appendWaypoint({latLng:e.latlng});
        map.closePopup();
    });

    //show the popup with the button
    L.popup().setContent(container).setLatLng(e.latlng).openOn(map);
}

//function used by routing machine to create markers
function createMarker(i, waypoint, n){
    //set the icon depending on start, intermediate point or finish
    let icon = null;
    if(i == 0)
        icon = start;
    else if(i == n-1)
        icon = finish;
    else
        icon = point;
    
    //create the marker
    marker = L.marker(waypoint.latLng, {draggable: true, icon}).bindPopup('<button class="btn btn-danger" onClick="removeMarker('+i+')" class="dropdown-item" type="button">Remover</button>');
    
    //create a new cluster on the first waypoint and add it to the map
    //delete old if any
    if(i == 0){
        if(cluster)
            map.removeLayer(cluster);
        cluster = L.markerClusterGroup();
        map.addLayer(cluster);
    }
    cluster.addLayer(marker);
    
    return marker;
}

//removes a marker at the ith element in the route's waypoints array
function removeMarker(i){
    routing_control.spliceWaypoints(i, 1);
}

//fetches all the routes from the database
async function fetchRoutes(){
    const response = await fetch("http://localhost:3000/routes");
    const json = await response.json();
    if(json.success){
        return json.routes;
    } else{
        throw json.error;
    }
}

//adds a route to the list of selectable routes
function addRoute(route){
    routes.push(route);
    route_combobox.innerHTML += '<button onClick=setRoute("'+route._id+'") class="dropdown-item" type="button">'+route.description+'</button>';
}

//sets the route on the map to the one indicated by its id
function setRoute(id){
    for(const route of routes){
        if(route._id === id){
            //set the route description name
            description_input.value = route.description;
            
            //put all the waypoints on routing machine
            waypoints = [];
            for(const point of route.points)
                waypoints.push({latLng:L.latLng(point.latitude, point.longitude)});
            routing_control.setWaypoints(waypoints);

            return;
        }
    }
}

//clears the current route displayed on the map
function clearRoute(){
    description_input.value = "";
    routing_control.setWaypoints([]);
    if(cluster)
            map.removeLayer(cluster);
}

//saves the current route displayed on the map to the database
function saveRoute(){
    const description = description_input.value;
    if(description){
        const points = [];
        const waypoints = routing_control.getWaypoints();
        for(const waypoint of waypoints)
            points.push({latitude: waypoint.latLng.lat, longitude: waypoint.latLng.lng});
        
        fetch("http://localhost:3000/routes", { 
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type" : "application/json; charset=UTF-8"
            }, 
            "body": JSON.stringify({ route: {description, points} }) 
        })
        .then(response => { return response.json(); })
        .then(json => { addRoute(json.route) })
        .catch(error => { console.log(error); });
    }
}

function main(){

    const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | Map icons by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>';
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    map = L.map('map');
    map.on('click', showAddMarkerDialog);
    L.tileLayer(tileUrl, { attribution }).addTo(map);
    routing_control = L.Routing.control(routingControlOptions).addTo(map);
    description_input.value = "";

    fetchRoutes().then(json =>{
        for(const route of json)
            addRoute(route);
        if(routes.length > 0)
            setRoute(routes[routes.length-1]._id);
        else
            map.setView([9.93224, -84.07952], 13);
    });
}