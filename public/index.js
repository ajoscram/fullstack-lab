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
    draggableWaypoints: false,
    createMarker
}

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
    marker = L.marker(waypoint.latLng, {icon}).bindPopup("<b> Parada #" + (i+1).toString() + "<b>");
    
    //add the marker to the cluster, if any
    if(cluster)
        cluster.addLayer(marker);
    
    return marker;
}

async function fetchRoutes(){
    const response = await fetch("http://localhost:3000/routes");
    const json = await response.json();
    if(json.success){
        return json.routes;
    } else{
        throw json.error;
    }
}

function addRoute(route){
    routes.push(route);
    route_combobox.innerHTML += '<button onClick=setRoute("'+route._id+'") class="dropdown-item" type="button">'+route.description+'</button>';
}

function setRoute(id){
    for(const route of routes){
        if(route._id === id){
            //set the route description name
            description_input.value = route.description;
            
            //create a new cluster, delete old if any
            if(cluster)
                map.removeLayer(cluster);
            cluster = L.markerClusterGroup();
            
            //put all the waypoints on routing machine
            waypoints = [];
            for(const point of route.points)
                waypoints.push({latLng:L.latLng(point.latitude, point.longitude)});
            routing_control.setWaypoints(waypoints);
            
            //add cluster to map
            map.addLayer(cluster);
            return;
        }
    }
}

function main(){

    const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | Map icons by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>';
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    description_input.value = "";

    map = L.map('map');
    L.tileLayer(tileUrl, { attribution }).addTo(map);
    routing_control = L.Routing.control(routingControlOptions).addTo(map);

    fetchRoutes().then(json =>{
        for(const route of json)
            addRoute(route);
        if(routes.length > 0)
            setRoute(routes[0]._id);
        else
            map.setView([9.93224, -84.07952], 13);
    });
}