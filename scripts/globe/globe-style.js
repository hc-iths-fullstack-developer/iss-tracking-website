// The style of the globe on /globe/: real elevation, real imagery at every zoom, and the
// Sun where it is at `date`. Every source is free to use with credit and needs no key.
import { skyFor, subsolarPoint, sunAltitude, sunLight } from './sun.js';

/** A raster layer that fades in between two zoom levels, over the one before it. */
const fadeIn = (id, from, to, extra = {}) => ({
  id,
  type: 'raster',
  source: id,
  minzoom: from,
  paint: {
    'raster-opacity': ['interpolate', ['linear'], ['zoom'], from, 0, to, 1],
    ...extra,
  },
});

/** Tiles of the Sun's light at one moment, drawn by daylightProtocol (protocols.ts). */
const daylightTiles = (kind, date) => [
  `daylight://${kind}/{z}/{x}/{y}?time=${date.getTime()}`,
];

const globeStyle = (date, center) => {
  const sun = subsolarPoint(date);
  const sources = {
    // Mapterhorn: open elevation tiles, 30 m worldwide and down to 1 m where countries publish lidar.
    terrain: {
      type: 'raster-dem',
      url: 'https://tiles.mapterhorn.com/tilejson.json',
    },
    // From space: NASA's Blue Marble, a cloud-free mosaic of the whole Earth at 500 m.
    'blue-marble': {
      type: 'raster',
      tiles: [
        // NASA sends these with no-store, so browsers fetch them again on every visit: cached:// keeps
        // them in the site's tile cache, and asks NASA when the cache can't answer (src/tiles/client.ts).
        'cached://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
      ],
      tileSize: 256,
      maxzoom: 8,
      attribution:
        '<a href="https://earthobservatory.nasa.gov/features/BlueMarble">NASA Blue Marble</a>',
    },
    // Closer in: a cloud-free Sentinel-2 mosaic at 10 m. The 2016 edition is CC BY 4.0.
    'sentinel-2': {
      type: 'raster',
      tiles: [
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      minzoom: 5,
      maxzoom: 14,
      attribution:
        '<a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2016 &amp; 2017)',
    },
    shade: {
      type: 'raster',
      tiles: daylightTiles('shade', date),
      tileSize: 256,
      maxzoom: 6,
    },
    night: {
      type: 'raster',
      tiles: daylightTiles('night', date),
      tileSize: 256,
      maxzoom: 8,
      attribution:
        '<a href="https://earthobservatory.nasa.gov/features/NightLights">NASA Black Marble</a>',
    },
  };

  return {
    version: 8,
    projection: {
      type: 'globe',
    },
    sources,
    terrain: {
      source: 'terrain',
      exaggeration: 1,
    },
    light: sunLight(sun),
    sky: skyFor(sunAltitude(center, sun)),
    layers: [
      // Under the imagery while it loads: the deep blue of Blue Marble's oceans.
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'rgb(2, 5, 20)',
        },
      },
      {
        id: 'blue-marble',
        type: 'raster',
        source: 'blue-marble',
      },
      fadeIn('sentinel-2', 5, 7, {
        'raster-contrast': 0.1,
        'raster-saturation': 0.1,
      }),
      {
        id: 'shade',
        type: 'raster',
        source: 'shade',
        maxzoom: 7,
        // The low Sun's dimming is how the globe looks from space; up close the eye adapts.
        paint: {
          'raster-opacity': ['interpolate', ['linear'], ['zoom'], 4, 1, 7, 0],
          'raster-fade-duration': 0,
        },
      },
      {
        id: 'night',
        type: 'raster',
        source: 'night',
        paint: {
          'raster-fade-duration': 0,
        },
      },
    ],
  };
};

export { globeStyle };
