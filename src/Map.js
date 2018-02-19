import React from 'react';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import turf from 'turf';
import routeData from './jump-demo.geojson'

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FsaW1hciIsImEiOiJjajdhdmNtMjkwbGZlMzJyc2RvNmhjZXd3In0.tBIY2rRDHYt1VYeGTOH98g'


let animationData = turf.featureCollection([]);
let lineData = turf.featureCollection([]);
export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previousTimeStamp: 0,
      jump: {
        route: {},
        accumulatedDistance: 0,
      },
      car: {
        route: {},
        accumulatedDistance: 0
      }
    }
  }

  static propTypes = {
    setEta: PropTypes.func,
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/kalimar/cjdhi0v4128nk2srxchn3g94v'
    });

    this.animate = timeStamp => {
      const frameInfo = {
        timeStamp,
        previousTimeStamp: this.state.previousTimeStamp,
        deltaTime: (timeStamp - this.state.previousTimeStamp) / 1000
      }
      this.setState({previousTimeStamp: timeStamp})

      this.animateRoutes(frameInfo);
      requestAnimationFrame(this.animate);
    }

    this.animateRoutes = frameInfo => {
      const {jump, car} = this.state;
      const jumpRoute = jump.route;
      let jumpDistance = jump.accumulatedDistance;
      const carRoute = car.route;
      let carDistance = car.accumulatedDistance;

      jumpDistance += ((frameInfo.deltaTime / 3600) * 800); // To drive home the point, we make the bike a little faster than the car.
      carDistance += ((frameInfo.deltaTime / 3600) * 700);

      this.setState({
        jump: {
          route: jumpRoute,
          accumulatedDistance: jumpDistance
        },
        car: {
          route: carRoute,
          accumulatedDistance: carDistance
        }
      });

      let bikePoint = turf.along(jumpRoute, jumpDistance, 'kilometers');
      let carPoint = turf.along(carRoute, carDistance, 'kilometers');

      bikePoint.properties = {
        type: 'bike'
      }
      carPoint.properties = {
        type: 'car'
      }
      animationData.features[0] = bikePoint;
      animationData.features[1] = carPoint;
      this.map.getSource('animationData').setData(animationData);
    }

    this.map.on('load', () => {
      // contains the actual data to be used throught out
      this.map.addSource("pointData", {
        type: 'geojson',
        data: routeData
      });

      this.map.addSource('lineData', {
        type: 'geojson',
        data: lineData
      });

      this.map.addSource('animationData', {
        type: 'geojson',
        data: animationData
      });

      // fixed blue points
      this.map.addLayer({
        id: "startPoints",
        source: "pointData",
        type: "circle",
        paint: {
          "circle-color": "#2b8cbe",
          "circle-radius": {
            stops: [[3, 1], [22, 10]]
          }
        }
      });

      // JUMP and Car line layer
      this.map.addLayer({
        "id": "jumpRoute",
        "source": "lineData",
        "type": "line",
        "paint": {
          "line-width": 5,
          "line-color": [
            'match',
            ['get', 'type'],
            'bike', "#ff69b4",
            'green'
          ]
        }
      });

      // Car route layer
      // this.map.addLayer(
      // Animated JUMP & CAR Icon
      this.map.addLayer({
        "id": "animatedIcons",
        "type": "symbol",
        "source": "animationData",
        "layout": {
          'icon-image': [
            'match',
            ['get', 'type'],
            'bike', 'rocket-15',
            'car', 'car-15',
            'rocket-15'
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true
        }
      });

      this.map.on('click', 'startPoints', e => {
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: ['startPoints']
        });
        if (!features.length) return;
        const feature = features[0];

        // Adds JUMP Route to map and start jump icon animation
          let jumpPath = this.parseRouteGeometry(feature.properties['jump_geometry']);
          let carPath = this.parseRouteGeometry(feature.properties['car_geometry']);
          jumpPath.properties = {
            type: 'bike'
          }
          carPath.properties = {
            type: 'car'
          }
          lineData.features[0] = jumpPath
          lineData.features[1] = carPath
          this.map.getSource('lineData').setData(lineData);
          this.setState({
            jump: {
              route: lineData.features[0],
              accumulatedDistance: 0
            },
            car: {
              route: lineData.features[1],
              accumulatedDistance: 0
            }
          });
        requestAnimationFrame(this.animate);

        // Sends data to eta components
        const etas = {
          car: feature.properties.car_duration,
          jump: feature.properties.jump_duration
        }
        this.props.setEta(etas);
      });
    });
  }
  parseRouteGeometry = geometryString => {
    return JSON.parse(geometryString);
  }

  // Creates the JSON for a route
  buildRouteLayerData = route => {
    const {
      geometry,
      properties,
      type
    } = route;
    return {
      "type": "FeatureCollection",
      "features": [{
        geometry,
        properties,
        type
      }]
    }
  }

  // Creates the JSON for a given start point.
  setOriginPointData = feature => {
    const {geometry} = feature;
    const data = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            geometry.coordinates[0],
            geometry.coordinates[1]
          ]
        }
      }]
    }
    return data;
  }

  // Creates the JSON for a given destination point.
  setDestinationPointData = feature => {
    const {properties} = feature;
    const data = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            properties['dest_long'],
            properties['dest_lat'],
          ]
        }
      }]
    }
    return data;
  }

  render() {
    return ( <
      div ref = {
        el => this.mapContainer = el
      }
      className = "flex-child flex-child--grow viewport-twothirds viewport-full-ml" / >
    );
  }
}
