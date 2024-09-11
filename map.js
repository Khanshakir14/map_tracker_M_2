let map, directionsService, directionsRenderer, marker, trafficLayer;
let animationInterval;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 3
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    trafficLayer = new google.maps.TrafficLayer();

    const sourceAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('source')
    );
    const destAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('destination')
    );

    marker = new google.maps.Marker({
        map: map,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
            rotation: 0
        }
    });

    document.getElementById('startTracking').addEventListener('click', startTracking);
    document.getElementById('showAlternate').addEventListener('click', showAlternateRoute);
}

function startTracking() {
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    if (!source || !destination) {
        showError('Please enter both source and destination');
        return;
    }

    const request = {
        origin: source,
        destination: destination,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: new Date(Date.now() + 10000),
            trafficModel: 'bestguess'
        }
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            animateRoute(result.routes[0].overview_path);
            updateRouteInfo(result.routes[0].legs[0]);
            getWeatherInfo(result.routes[0].legs[0].end_location);
        } else {
            showError('Directions request failed due to ' + status);
        }
    });

    trafficLayer.setMap(map);
}

function animateRoute(path) {
    let i = 0;
    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(() => {
        if (i >= path.length - 1) {
            clearInterval(animationInterval);
            return;
        }
        const p1 = path[i];
        const p2 = path[i+1];
        marker.setPosition(p1);
        
        // Calculate heading
        const heading = google.maps.geometry.spherical.computeHeading(p1, p2);
        marker.setIcon({...marker.getIcon(), rotation: heading});

        map.panTo(p1);
        i++;
    }, 50);
}

function showAlternateRoute() {
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    if (!source || !destination) {
        showError('Please enter both source and destination');
        return;
    }

    const request = {
        origin: source,
        destination: destination,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
        drivingOptions: {
            departureTime: new Date(Date.now() + 10000),
            trafficModel: 'bestguess'
        }
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK' && result.routes.length > 1) {
            directionsRenderer.setDirections(result);
            directionsRenderer.setRouteIndex(1);
            animateRoute(result.routes[1].overview_path);
            updateRouteInfo(result.routes[1].legs[0]);
        } else {
            showError('No alternate route available or directions request failed');
        }
    });
}

function updateRouteInfo(leg) {
    document.getElementById('distance').textContent = leg.distance.text;
    document.getElementById('duration').textContent = leg.duration.text;
    document.getElementById('traffic').textContent = leg.duration_in_traffic ? 
        leg.duration_in_traffic.text + ' (with traffic)' : 'No traffic data available';
}

function getWeatherInfo(location) {
    // In a real application, you would make an API call to a weather service here
    // For this example, we'll just use mock data
    const mockWeather = {
        temperature: '22°C',
        conditions: 'Partly Cloudy'
    };

    document.getElementById('temperature').textContent = mockWeather.temperature;
    document.getElementById('conditions').textContent = mockWeather.conditions;
}

function showError(message) {
    alert(message);
}

document.addEventListener('DOMContentLoaded', initMap);