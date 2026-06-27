// Coordenadas de Buenos Aires
var coordPrincipal = { lat: 21.5015293, lng: -104.9046031 };
var map, marker;

var estiloOscuro = [
  { elementType: "geometry",        stylers: [{ color: "#0d1b2a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1b2a" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#78909c" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#90a4ae" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#546e7a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0e2233" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2f45" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0a1628" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1565C0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0d47a1" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0e1e30" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#060d18" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#263e52" }],
  },
];

function iniciarMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: coordPrincipal,
    styles: estiloOscuro,
    disableDefaultUI: true,
    gestureHandling: "cooperative",
  });

  // Marcador personalizado con ícono cyan
  marker = new google.maps.Marker({
    position: coordPrincipal,
    map: map,
    title: "Tepic, Nayarit",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#00BCD4",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10,
    },
    animation: google.maps.Animation.DROP,
  });

  // Info window al hacer click en el marcador
  var infoWindow = new google.maps.InfoWindow({
    content:
      '<div style="font-family:Inter,sans-serif;color:#0A1628;padding:4px 2px">' +
      '<strong style="font-size:14px">Tepic, Nayarit</strong>' +
      '<p style="font-size:12px;color:#546e7a;margin:4px 0 0">Ciudad en el estado de Nayarit, México</p>' +
      "</div>",
  });

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });
}

// Cambiar tipo de mapa
function cambiarTipo(tipo) {
  if (!map) return;
  var tipos = {
    roadmap:   google.maps.MapTypeId.ROADMAP,
    satellite: google.maps.MapTypeId.SATELLITE,
    hybrid:    google.maps.MapTypeId.HYBRID,
    terrain:   google.maps.MapTypeId.TERRAIN,
  };
  map.setMapTypeId(tipos[tipo] || google.maps.MapTypeId.ROADMAP);

  // Quitar estilo oscuro en satélite/híbrido
  if (tipo === "satellite" || tipo === "hybrid") {
    map.setOptions({ styles: [] });
  } else {
    map.setOptions({ styles: estiloOscuro });
  }

  // Actualizar botones activos
  document.querySelectorAll(".map-type-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.tipo === tipo);
  });
}

// Zoom
function acercar()  { if (map) map.setZoom(map.getZoom() + 1); }
function alejar()   { if (map) map.setZoom(map.getZoom() - 1); }

// Búsqueda simple (re-centra el mapa — requiere Geocoding API en producción)
function buscar() {
  var query = document.getElementById("search-input").value.trim();
  if (!query) return;
  // Simulación: mostrar aviso (en producción usar Geocoding API con tu clave)
  alert('Para buscar "' + query + '" activa la Geocoding API en tu proyecto de Google Cloud.');
}

document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") buscar();
    });
  }
});