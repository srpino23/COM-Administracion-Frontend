import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import styles from "./miniMap.module.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3JwaW5vMjMiLCJhIjoiY20weTJ2OW9rMGl2czJucHFnYzdnOXd0eCJ9.ROcEsj7ffoAr6alk-UCoFw";

const MapaBasico = ({ id, onLocationChange, localReports }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [jurisdicciones, setJurisdicciones] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const apiKey = "pk.05231205ab7fad1fd5c62a788434de0e";
  const colors = [
    "#FFC5C5",
    "#C6F4D6",
    "#87CEEB",
    "#FFFFE0",
    "#FFB6C1",
    "#ADD8E6",
  ];
  const timeoutRef = useRef(null);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);
    clearTimeout(timeoutRef.current);
    if (query.length > 2) {
      timeoutRef.current = setTimeout(() => {
        fetch(
          `https://us1.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${query}&format=json&countrycode=ar&city=Buenos+Aires&state=Tres+de+Febrero`
        )
          .then((response) => response.json())
          .then((data) => {
            const filteredResults = data.filter((result) =>
              result.display_name.includes("Tres de Febrero")
            );
            setResults(filteredResults);
          })
          .catch((err) => console.error(err));
      }, 500);
    } else {
      setResults([]);
    }
  };

  const findNearbyCameras = (lat, lon, cameras, radius = 200) => {
    const nearbyCameras = cameras.filter((camera) => {
      const distance = Math.sqrt(
        Math.pow(camera.latitude - lat, 2) + Math.pow(camera.longitude - lon, 2)
      );
      return distance <= radius / 111000;
    });
    return nearbyCameras;
  };

  const handleResultClick = (result) => {
    setSearch("");
    const { lat, lon, display_name } = result;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [lon, lat], zoom: 16 });
      setSelectedLocation({ lat, lon });
      const jurisdiccion = findJurisdiccion(lat, lon);
      const localidad =
        result.address.neighbourhood ||
        result.address.suburb ||
        result.address.city ||
        result.address.town ||
        result.address.quarter ||
        result.address.village ||
        result.address.name ||
        "N/A";
      fetch("http://74280601d366.sn.mynetname.net:2300/api/camera/getCameras")
        .then((response) => response.json())
        .then((camerasData) => {
          const nearbyCameras = findNearbyCameras(lat, lon, camerasData);
          setLocationInfo({
            address: display_name,
            latitude: lat,
            longitude: lon,
            jurisdiccion: jurisdiccion ? jurisdiccion.properties.name : "N/A",
            localidad,
            nearbyCameras,
          });
          onLocationChange({
            address: display_name,
            latitude: lat,
            longitude: lon,
            jurisdiccion: jurisdiccion ? jurisdiccion.properties.name : "N/A",
            localidad,
            nearbyCameras,
          });
        })
        .catch((err) => console.error(err));
    }
  };

  const findJurisdiccion = (lat, lon) => {
    for (const feature of jurisdicciones) {
      if (
        feature.geometry.type === "Polygon" &&
        isPointInPolygon([lon, lat], feature.geometry.coordinates[0])
      ) {
        return feature;
      } else if (feature.geometry.type === "MultiPolygon") {
        for (const polygon of feature.geometry.coordinates) {
          if (isPointInPolygon([lon, lat], polygon[0])) {
            return feature;
          }
        }
      } else if (feature.geometry.type === "GeometryCollection") {
        for (const geometry of feature.geometry.geometries) {
          if (
            geometry.type === "Polygon" &&
            isPointInPolygon([lon, lat], geometry.coordinates[0])
          ) {
            return feature;
          } else if (geometry.type === "MultiPolygon") {
            for (const polygon of geometry.coordinates) {
              if (isPointInPolygon([lon, lat], polygon[0])) {
                return feature;
              }
            }
          }
        }
      }
    }
    return null;
  };

  const isPointInPolygon = (point, vs) => {
    let [x, y] = point.map(parseFloat);
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let [xi, yi] = vs[i].map(parseFloat);
      let [xj, yj] = vs[j].map(parseFloat);
      let intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`
    )
      .then((response) => response.json())
      .then((data) => {
        const display_name = data.display_name;
        setSelectedLocation({ lat, lon: lng });
        const jurisdiccion = findJurisdiccion(lat, lng);
        const localidad =
          data.address.neighbourhood ||
          data.address.suburb ||
          data.address.city ||
          data.address.town ||
          data.address.quarter ||
          data.address.village ||
          data.address.name ||
          "N/A";
        fetch("http://74280601d366.sn.mynetname.net:2300/api/camera/getCameras")
          .then((response) => response.json())
          .then((camerasData) => {
            const nearbyCameras = findNearbyCameras(lat, lng, camerasData);
            setLocationInfo({
              address: display_name,
              latitude: lat,
              longitude: lng,
              jurisdiccion: jurisdiccion ? jurisdiccion.properties.name : "N/A",
              localidad,
              nearbyCameras,
            });
            onLocationChange({
              address: display_name,
              latitude: lat,
              longitude: lng,
              jurisdiccion: jurisdiccion ? jurisdiccion.properties.name : "N/A",
              localidad,
              nearbyCameras,
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const fetchJurisdicciones = async () => {
      try {
        const response = await fetch("/jurisdicciones.geojson");
        const data = await response.json();
        setJurisdicciones(data.features);
      } catch (error) {
        console.error("Error fetching jurisdicciones:", error);
      }
    };
    fetchJurisdicciones();
  }, []);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapInstanceRef.current) {
        const mapInstance = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [-58.5833, -34.6057],
          zoom: 12,
          maxBounds: [
            [-58.75, -34.7],
            [-58.45, -34.45],
          ],
        });

        mapInstance.on("load", () => {
          mapInstance.addSource("geojson-source", {
            type: "geojson",
            data: "/tres_de_febrero_limits.geojson",
          });

          mapInstance.addLayer({
            id: "geojson-fill-layer",
            type: "fill",
            source: "geojson-source",
            paint: {
              "fill-color": "#00ff7f",
              "fill-opacity": 0.02,
            },
          });

          mapInstance.addLayer({
            id: "geojson-line-layer",
            type: "line",
            source: "geojson-source",
            paint: {
              "line-color": "#00ff7f",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });

          mapInstance.on("click", handleMapClick);

          if (localReports && typeof localReports === "object") {
            const report = localReports[id];
            if (report && report.latitude && report.longitude) {
              const { latitude, longitude } = report;
              setSelectedLocation({
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
              });
              mapInstance.flyTo({
                center: [parseFloat(longitude), parseFloat(latitude)],
                zoom: 16,
              });
              if (markerRef.current) {
                markerRef.current.remove();
              }
              const locationMarker = new mapboxgl.Marker()
                .setLngLat([parseFloat(longitude), parseFloat(latitude)])
                .addTo(mapInstance);
              markerRef.current = locationMarker;
            }
          }
        });

        mapInstanceRef.current = mapInstance;
      }
    };

    if (jurisdicciones.length > 0) {
      initializeMap();
    }
  }, [jurisdicciones, id, localReports]);

  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      const locationMarker = new mapboxgl.Marker()
        .setLngLat([selectedLocation.lon, selectedLocation.lat])
        .addTo(mapInstanceRef.current);
      markerRef.current = locationMarker;
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (localReports && typeof localReports === "object") {
      const report = localReports[id];
      if (report && report.latitude && report.longitude) {
        const { latitude, longitude } = report;
        setSelectedLocation({
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [parseFloat(longitude), parseFloat(latitude)],
            zoom: 16,
          });
          if (markerRef.current) {
            markerRef.current.remove();
          }
          const locationMarker = new mapboxgl.Marker()
            .setLngLat([parseFloat(longitude), parseFloat(latitude)])
            .addTo(mapInstanceRef.current);
          markerRef.current = locationMarker;
        }
      } else {
        setSelectedLocation(null);
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      }
    }
  }, [id, localReports]);

  return (
    <div className={styles.mapContainer}>
      <input
        type="search"
        value={search}
        onChange={handleSearch}
        placeholder="Buscar ubicacion"
        className={styles.searchInput}
      />
      {search && (
        <ul>
          {results.length > 0 ? (
            results.map((result, index) => (
              <li key={index} onClick={() => handleResultClick(result)}>
                {result.display_name}
              </li>
            ))
          ) : (
            <li>Sin resultados</li>
          )}
        </ul>
      )}
      <div ref={mapRef} id={id} className={styles.map} />
    </div>
  );
};

export default MapaBasico;
