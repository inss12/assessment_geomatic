import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Expand from '@arcgis/core/widgets/Expand';
import LayerList from '@arcgis/core/widgets/LayerList';
import Sketch from '@arcgis/core/widgets/Sketch';
import Editor from '@arcgis/core/widgets/Editor';
import Search from '@arcgis/core/widgets/Search';
import Legend from '@arcgis/core/widgets/Legend';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import Home from '@arcgis/core/widgets/Home';
import Viewpoint from '@arcgis/core/Viewpoint';
import Extent from '@arcgis/core/geometry/Extent';

import '@arcgis/core/assets/esri/themes/light/main.css';
import './MapContainer.css';

const MapContainer = React.forwardRef(
  (
    {
      filter,
      proximityRadius,
      setRegionOptions,
      setProvinceOptions,
      setTransportOptions,
      selectedFclass,
      setChartData
    },
    ref
  ) => {
    const mapRef = useRef(null);
    const viewRef = useRef(null);
    const transportLayerRef = useRef(null);
    const regionLayerRef = useRef(null);
    const provinceLayerRef = useRef(null);
    const queryResultsLayerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    // New state to control the tooltip/hint visibility
    const [showProximityHint, setShowProximityHint] = useState(false);

    // Refs for user-drawn features.
    const pointLayerRef = useRef(null);
    const lineLayerRef = useRef(null);
    const polygonLayerRef = useRef(null);

    // Keep an updated value for the proximity radius.
    const proximityRef = useRef(proximityRadius);
    useEffect(() => {
      proximityRef.current = proximityRadius;
    }, [proximityRadius]);

    const displayQueryResults = (features) => {
      const resultsLayer = queryResultsLayerRef.current;
      resultsLayer.removeAll();
      features.forEach((feature) => {
        const graphic = new Graphic({
          geometry: feature.geometry,
          attributes: feature.attributes,
          symbol: {
            type: 'simple-marker',
            color: [255, 255, 0, 0.8],
            size: 10,
            outline: { color: [0, 0, 0], width: 1 }
          }
        });
        resultsLayer.add(graphic);
      });
    };

    // After querying, zoom to the filtered features and update the chart.
    const applySpatialQuery = (geometry, attributeWhere = "") => {
      if (!transportLayerRef.current) return;
      const query = transportLayerRef.current.createQuery();
      query.geometry = geometry;
      query.spatialRelationship = 'intersects';
      if (attributeWhere) {
        query.where = attributeWhere;
      }
      transportLayerRef.current.queryFeatures(query).then((result) => {
        // Hide original layer and display filtered results.
        transportLayerRef.current.visible = false;
        displayQueryResults(result.features);
        // Zoom to filtered features.
        if (result.features.length > 0 && viewRef.current) {
          const geometries = result.features.map(feature => feature.geometry);
          viewRef.current.goTo(geometries);
        }
        // Update chart data based on filtered transport station types.
        const counts = {};
        result.features.forEach((feature) => {
          const type = feature.attributes?.fclass;
          if (type != null) {
            counts[type] = (counts[type] || 0) + 1;
          }
        });
        setChartData(counts);
      });
    };

    // Applies region or province filter and runs the spatial query.
    const applyFilter = (currentFilter, filterByRegion) => {
      if (filterByRegion) {
        if (currentFilter.region) {
          const query = regionLayerRef.current.createQuery();
          query.where = `NOM_REG = '${currentFilter.region}'`;
          regionLayerRef.current.queryFeatures(query).then((result) => {
            if (result.features.length > 0) {
              const regionGeometry = result.features[0].geometry;
              applySpatialQuery(regionGeometry);
            }
          });
        }
      } else {
        if (currentFilter.province) {
          const query = provinceLayerRef.current.createQuery();
          query.where = `Nom = '${currentFilter.province}'`;
          provinceLayerRef.current.queryFeatures(query).then((result) => {
            if (result.features.length > 0) {
              const provinceGeometry = result.features[0].geometry;
              applySpatialQuery(provinceGeometry);
            }
          });
        }
      }
    };

    const activateProximitySearch = () => {
      // Validate that the radius is set and valid.
      const radiusValue = parseFloat(proximityRef.current);
      if (!proximityRef.current || isNaN(radiusValue) || radiusValue <= 0) {
        alert("Please enter a valid radius (in km) before activating proximity search.");
        return;
      }
      // Show tooltip/hint telling the user to click on the map.
      setShowProximityHint(true);
      if (viewRef.current) {
        const clickHandler = viewRef.current.on('click', (event) => {
          // Once the user clicks on the map, hide the tooltip.
          setShowProximityHint(false);
          const point = event.mapPoint;
          // Create a buffer around the clicked point (convert km to meters).
          const buffer = geometryEngine.buffer(point, radiusValue * 1000, 'meters');
          const bufferGraphic = new Graphic({
            geometry: buffer,
            symbol: {
              type: 'simple-fill',
              color: [0, 0, 255, 0.2],
              outline: { color: [0, 0, 255], width: 2 }
            }
          });
          queryResultsLayerRef.current.removeAll();
          queryResultsLayerRef.current.add(bufferGraphic);
          const attributeWhere = selectedFclass ? `fclass = '${selectedFclass}'` : "";
          applySpatialQuery(buffer, attributeWhere);
          // Remove the click handler after one use.
          clickHandler.remove();
        });
      }
    };

    const activateDrawPoint = () => {
      if (viewRef.current && pointLayerRef.current) {
        const sketch = new Sketch({
          view: viewRef.current,
          layer: pointLayerRef.current,
          creationMode: 'update'
        });
        sketch.on('create', (event) => {
          if (event.state === 'complete') {
            sketch.destroy();
          }
        });
        viewRef.current.ui.add(sketch, { position: "top-left", index: 0 });
      }
    };

    const activateDrawLine = () => {
      if (viewRef.current && lineLayerRef.current) {
        const sketch = new Sketch({
          view: viewRef.current,
          layer: lineLayerRef.current,
          creationMode: 'update'
        });
        sketch.on('create', (event) => {
          if (event.state === 'complete') {
            sketch.destroy();
          }
        });
        viewRef.current.ui.add(sketch, 'top-left');
      }
    };

    const activateDrawPolygon = () => {
      if (viewRef.current && polygonLayerRef.current) {
        const sketch = new Sketch({
          view: viewRef.current,
          layer: polygonLayerRef.current,
          creationMode: 'update'
        });
        sketch.on('create', (event) => {
          if (event.state === 'complete') {
            sketch.destroy();
          }
        });
        viewRef.current.ui.add(sketch, 'top-left');
      }
    };

    // Clear filters, restore full transport data and update the chart.
    const clearFilter = () => {
      if (transportLayerRef.current) {
        transportLayerRef.current.visible = true;
      }
      if (queryResultsLayerRef.current) {
        queryResultsLayerRef.current.removeAll();
      }
      // Re-query all transport stations to reset chartData.
      if (transportLayerRef.current) {
        transportLayerRef.current.queryFeatures().then((result) => {
          const counts = {};
          result.features.forEach((feature) => {
            const type = feature.attributes.fclass;
            if (type != null) {
              counts[type] = (counts[type] || 0) + 1;
            }
          });
          setChartData(counts);
        });
      }
    };

    // Expose key map actions to parent components.
    useImperativeHandle(ref, () => ({
      applyFilter: (currentFilter, filterByRegion) =>
        applyFilter(currentFilter, filterByRegion),
      activateProximitySearch,
      clearFilter,
      activateDrawPoint,
      activateDrawLine,
      activateDrawPolygon
    }));

    useEffect(() => {
      // Initialize regions layer.
      const regionsLayer = new GeoJSONLayer({
        url: 'http://localhost:8000/regions',
        title: 'Regions',
        popupTemplate: {
          title: 'Region: {NOM_REG}',
          content: 'Province: {NOM_PROV}'
        },
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [255, 255, 255, 0.3],
            outline: { color: [0, 0, 0], width: 1 }
          }
        }
      });
      regionLayerRef.current = regionsLayer;

      // Initialize provinces layer.
      const provincesLayer = new GeoJSONLayer({
        url: 'http://localhost:8000/provinces',
        title: 'Provinces',
        popupTemplate: {
          title: 'Province: {Nom}',
          content: [{
            type: "fields",
            fieldInfos: [{ fieldName: "NAME", label: "Nom" }]
          }]
        },
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [200, 200, 200, 0.3],
            outline: { color: [0, 0, 0], width: 1 }
          }
        }
      });
      provinceLayerRef.current = provincesLayer;

      // Update region filter options.
      regionsLayer.when(() => {
        const query = regionsLayer.createQuery();
        query.returnDistinctValues = true;
        query.outFields = ['NOM_REG'];
        regionsLayer.queryFeatures(query).then((result) => {
          const values = result.features.map((f) => f.attributes.NOM_REG);
          const distinctValues = [...new Set(values)].sort();
          setRegionOptions(distinctValues);
        });
      });

      // Update province filter options.
      provincesLayer.when(() => {
        const query = provincesLayer.createQuery();
        query.returnDistinctValues = true;
        query.outFields = ['Nom'];
        provincesLayer.queryFeatures(query).then((result) => {
          const values = result.features.map((f) => f.attributes.Nom);
          const distinctValues = [...new Set(values)].sort();
          setProvinceOptions(distinctValues);
        });
      });

      // Set up user-drawn layers.
      const pointLayer = new FeatureLayer({
        source: [],
        objectIdField: "ObjectID",
        fields: [
          { name: "ObjectID", alias: "ObjectID", type: "oid" },
          { name: "Type", alias: "Type", type: "string" }
        ],
        geometryType: "point",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: "blue",
            size: "8px",
            outline: { color: "white", width: 1 }
          }
        },
        title: "User Points"
      });
      pointLayerRef.current = pointLayer;

      const lineLayer = new FeatureLayer({
        source: [],
        objectIdField: "ObjectID",
        fields: [
          { name: "ObjectID", alias: "ObjectID", type: "oid" },
          { name: "Type", alias: "Type", type: "string" }
        ],
        geometryType: "polyline",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: "green",
            width: 2
          }
        },
        title: "User Lines"
      });
      lineLayerRef.current = lineLayer;

      const polygonLayer = new FeatureLayer({
        source: [],
        objectIdField: "ObjectID",
        fields: [
          { name: "ObjectID", alias: "ObjectID", type: "oid" },
          { name: "Type", alias: "Type", type: "string" }
        ],
        geometryType: "polygon",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [255, 255, 0, 0.3],
            outline: { color: "black", width: 1 }
          }
        },
        title: "User Polygons"
      });
      polygonLayerRef.current = polygonLayer;

      // Create graphics layer for query results.
      const queryResultsLayer = new GraphicsLayer({ title: 'Query Results' });
      queryResultsLayerRef.current = queryResultsLayer;

      // Assemble the web map.
      const webmap = new WebMap({
        basemap: 'streets',
        layers: [
          regionsLayer,
          provincesLayer,
          pointLayer,
          lineLayer,
          polygonLayer,
          queryResultsLayer
        ]
      });
      // Initial extent focusing on Morocco.
      const moroccoExtent = {
        xmin: -17,
        ymin: 14,
        xmax: -1,
        ymax: 37,
        spatialReference: { wkid: 4326 }
      };

      const view = new MapView({
        container: mapRef.current,
        map: webmap,
        extent: moroccoExtent
      });
      viewRef.current = view;
      view.on('double-click', (event) => {
        event.stopPropagation();
        event.preventDefault();
      });
      Promise.all([
        view.when(),
        regionsLayer.when(),
        provincesLayer.when(),
        pointLayer.when(),
        lineLayer.when(),
        polygonLayer.when()
      ]).then(() => {
        setLoading(false);
      });

      // Add ArcGIS widgets.
      const basemapGallery = new BasemapGallery({ view });
      const bgExpand = new Expand({ view, content: basemapGallery });
      view.ui.add(bgExpand, 'top-right');

      const layerList = new LayerList({ view });
      const llExpand = new Expand({ view, content: layerList, expanded: false });
      view.ui.add(llExpand, 'top-right');

      const sketch = new Sketch({
        view,
        layer: queryResultsLayer,
        creationMode: 'update'
      });
      const sketchExpand = new Expand({
        view,
        content: sketch,
        expanded: false
      });
      view.ui.add(sketchExpand, 'top-left');
      sketch.on('create', (event) => {
        if (event.state === 'complete' && event.graphic.geometry.type === 'polygon') {
          applySpatialQuery(event.graphic.geometry);
        }
      });

      const editor = new Editor({ view, allowedWorkflows: ['update'] });
      const editorExpand = new Expand({ view, content: editor, expanded: false });
      view.ui.add(editorExpand, 'top-right');

      const search = new Search({
        view: view,
        sources: [
          {
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            placeholder: "Search in Morocco",
            singleLineFieldName: "SingleLine",
            name: "Morocco",
            searchExtent: moroccoExtent
          }
        ]
      });
      view.ui.add(search, { position: "top-left", index: 1 });

      view.when(() => {
        view.ui.move("zoom", { position: "top-left", index: 2 });
        const homeWidget = new Home({
          view,
          viewpoint: new Viewpoint({ targetGeometry: new Extent(moroccoExtent) })
        });
        view.ui.add(homeWidget, { position: "top-left", index: 3 });
      });

      const legendWidgetRef = { current: null };
      const updateLegendLayerInfos = () => {
        const layerInfos = [];
        [pointLayer, lineLayer, polygonLayer].forEach((layer) => {
          if (layer.source && layer.source.length > 0) {
            layerInfos.push({ layer: layer, title: layer.title });
          }
        });
        if (legendWidgetRef.current) {
          legendWidgetRef.current.layerInfos = layerInfos;
        } else {
          legendWidgetRef.current = new Legend({
            view,
            layerInfos: layerInfos
          });
          view.ui.add(legendWidgetRef.current, "bottom-left");
        }
      };
      pointLayer.watch("source", updateLegendLayerInfos);
      lineLayer.watch("source", updateLegendLayerInfos);
      polygonLayer.watch("source", updateLegendLayerInfos);

      // Load transport stations data.
      fetch('http://localhost:8000/transport-stations')
        .then((res) => res.json())
        .then((data) => {
          const featureCollection = {
            type: 'FeatureCollection',
            features: data.map((item) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [item.longitude, item.latitude]
              },
              properties: {
                osm_id: item.osm_id,
                code: item.code,
                fclass: item.fclass,
                name: item.name
              }
            }))
          };
          const blob = new Blob([JSON.stringify(featureCollection)], { type: 'application/json' });
          const blobUrl = URL.createObjectURL(blob);
          const transportLayer = new GeoJSONLayer({
            url: blobUrl,
            title: 'Transport Stations',
            popupTemplate: {
              title: 'Station: {name}',
              content: 'Type: {fclass}'
            },
            renderer: {
              type: "simple",
              symbol: {
                type: "simple-marker",
                style: "circle",
                color: "red",
                size: "8px",
                outline: { color: "white", width: 1 }
              }
            }
          });
          transportLayerRef.current = transportLayer;
          webmap.add(transportLayer);
          transportLayer.when(() => {
            const query = transportLayer.createQuery();
            query.returnDistinctValues = true;
            query.outFields = ['fclass'];
            transportLayer.queryFeatures(query).then((result) => {
              const values = result.features
                .map((f) => f.attributes?.fclass)
                .filter((val) => val !== null && val !== undefined);
              const distinctValues = [...new Set(values)].sort();
              setTransportOptions(distinctValues);
            });
            // Initially, set chart data using all transport stations.
            transportLayer.queryFeatures().then((result) => {
              const counts = {};
              result.features.forEach((feature) => {
                const type = feature.attributes.fclass;
                if (type != null) {
                  counts[type] = (counts[type] || 0) + 1;
                }
              });
              setChartData(counts);
            });
          });
        })
        .catch((error) =>
          console.error('Error loading transport stations:', error)
        );

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }, [setRegionOptions, setProvinceOptions, setTransportOptions]);

    return (
      <div className="map-container">
        {loading && <div className="loader">Loading...</div>}
        <div ref={mapRef} className="map-view"></div>
        {showProximityHint && (
          <div className="tooltip-hint">
            Please click on the map to complete your proximity search.
          </div>
        )}
      </div>
    );
  }
);

export default MapContainer;
