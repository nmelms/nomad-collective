import mapboxgl from "mapbox-gl";

const initMap = (shopData, isMapSet, setIsMapSet, router) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (isMapSet) return;
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-80.812992, 35.344192],
    zoom: 9,
  });
  setIsMapSet(true);

  map.on("load", () => {
    if (!map.getSource("coffeeshops")) {
      map.addSource("coffeeshops", {
        type: "geojson",
        data: shopData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "coffeeshops",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "coffeeshops",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "coffeeshops",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 8,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });
  });

  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const popup = new mapboxgl.Popup().setLngLat(coordinates).setHTML(
      `${e.features[0].properties.name} <br>
      <button id="myPopupButton" type="button">
      Dashboard
      </button>`
    );

    popup.on("open", () => {
      const button = document.getElementById("myPopupButton");
      if (button) {
        button.addEventListener("click", () => {
          router.push("/store/32");
        });
      }
    });

    popup.addTo(map);

    // Add an event listener when the popup opens

    // new mapboxgl.Popup()
    //   .setLngLat(coordinates)
    //   .setHTML(
    //     `${e.features[0].properties.name} <br>
    //     <button id="myPopupButton" type="button">
    //     Dashboard
    //   </button>`
    //   )
    //   .addTo(map);
  });

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("coffeeshops")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
  );
};

export default initMap;
