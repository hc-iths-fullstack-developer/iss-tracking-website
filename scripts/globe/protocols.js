// A tile protocol for the globe, registered with maplibregl.addProtocol.
//
// daylight://{kind}/{z}/{x}/{y}?time={ms} draws the Sun's light on the Earth for one
// moment, a tile at a time: "shade" darkens the day side as the Sun sinks toward the
// horizon, "night" lays NASA's Black Marble over the night side. Each pixel gets the
// Sun's altitude at its own lng/lat, so the terminator is exact at every zoom.
import { groundLight, nightfall, subsolarPoint } from './sun.js';

const SIZE = 256;
const RAD = Math.PI / 180;

/** VIIRS city lights, 2016, from NASA GIBS. Its tiles go to zoom 8 (500 m a pixel). */
const BLACK_MARBLE =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png';

/** The sine of the Sun's altitude at every pixel of a tile, row by row. */
const sunHeights = (z, x, y, time) => {
  const [sunLng, sunLat] = subsolarPoint(new Date(time));
  const sinSun = Math.sin(sunLat * RAD);
  const cosSun = Math.cos(sunLat * RAD);
  const tiles = 2 ** z;
  const cosHourAngle = new Float32Array(SIZE);
  for (let col = 0; col < SIZE; col++) {
    const lng = ((x + (col + 0.5) / SIZE) / tiles) * 360 - 180;
    cosHourAngle[col] = Math.cos((lng - sunLng) * RAD);
  }
  const heights = new Float32Array(SIZE * SIZE);
  for (let row = 0; row < SIZE; row++) {
    const lat = Math.atan(
      Math.sinh(Math.PI * (1 - (2 * (y + (row + 0.5) / SIZE)) / tiles)),
    );
    const a = Math.sin(lat) * sinSun;
    const b = Math.cos(lat) * cosSun;
    for (let col = 0; col < SIZE; col++) {
      heights[row * SIZE + col] = a + b * cosHourAngle[col];
    }
  }
  return heights;
};

/** Dims the ground under a low Sun, as it looks from space. The warm glow along the terminator is MapLibre's atmosphere. */
const shade = (heights) => {
  const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let i = 0; i < heights.length; i++) {
    pixels[i * 4 + 3] = 255 * (1 - groundLight(heights[i]));
  }
  return pixels;
};

/** Black Marble where night has fallen. Its moonlit ground is darkened more than its lights, so the night stays dark. */
const night = (heights, lights) => {
  const pixels = new Uint8ClampedArray(lights.length);
  for (let i = 0; i < heights.length; i++) {
    const r = lights[i * 4];
    const g = lights[i * 4 + 1];
    const b = lights[i * 4 + 2];
    const keep = (Math.max(r, g, b) / 255) ** 0.8;
    pixels[i * 4] = r * keep;
    pixels[i * 4 + 1] = g * keep;
    pixels[i * 4 + 2] = b * keep;
    pixels[i * 4 + 3] = 255 * nightfall(heights[i]);
  }
  return pixels;
};

const decode = async (blob) => {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const context = canvas.getContext('2d', {
    willReadFrequently: true,
  });
  context.drawImage(bitmap, 0, 0, SIZE, SIZE);
  bitmap.close();
  return context.getImageData(0, 0, SIZE, SIZE).data;
};

// GIBS tells browsers not to keep its tiles, so the page keeps the last few itself:
// moving the Sun redraws every tile, but the lights under them stay the same.
const lightTiles = new Map();
const KEEP = 64;

const blackMarble = (z, x, y) => {
  const key = `${z}/${x}/${y}`;
  let tile = lightTiles.get(key);
  if (tile) {
    // Move the tile to the end of the Map (most recently used).
    lightTiles.delete(key);
  } else {
    const url = BLACK_MARBLE.replace('{z}', `${z}`)
      .replace('{x}', `${x}`)
      .replace('{y}', `${y}`);
    // Not aborted with the tile that asked first: other tiles may be waiting for it too.
    tile = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Black Marble ${key}: ${response.status}`);
      }
      return decode(await response.blob());
    });
    tile.catch(() => lightTiles.delete(key));
  }
  lightTiles.set(key, tile);
  if (lightTiles.size > KEEP) {
    const oldestKey = lightTiles.keys().next().value;
    lightTiles.delete(oldestKey);
  }
  return tile;
};

const daylightProtocol = async (request) => {
  const match =
    /^daylight:\/\/(shade|night)\/(\d+)\/(\d+)\/(\d+)\?time=(\d+)$/.exec(
      request.url,
    );
  if (!match) {
    throw new Error(`Not a daylight tile: ${request.url}`);
  }
  const [, kind, z, x, y, time] = match;
  const heights = sunHeights(+z, +x, +y, +time);
  const pixels =
    kind === 'shade'
      ? shade(heights)
      : night(heights, await blackMarble(+z, +x, +y));

  // MapLibre blends raster tiles with premultiplied alpha, and an ImageBitmap isn't premultiplied for it on upload.
  const image = new ImageData(pixels, SIZE, SIZE);
  return {
    data: await createImageBitmap(image, {
      premultiplyAlpha: 'premultiply',
    }),
  };
};

export { daylightProtocol };
