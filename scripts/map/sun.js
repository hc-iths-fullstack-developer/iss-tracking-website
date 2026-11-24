// Where the Sun is, and what it does to the sky.
// The subsolar point for any moment, the Sun's altitude seen from any place,
// the light position that points MapLibre's atmosphere at it,
// and sky colors for the Sun's altitude.

const RAD = Math.PI / 180;
const J2000 = Date.UTC(2000, 0, 1, 12);
const DAY = 86_400_000;

const wrap = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;

/**
 * The point where the Sun is straight overhead at `date`, as [lng, lat] in degrees. The
 * low-precision solar position of the Astronomical Almanac: good to about 0.01° for
 * centuries either side of 2000, far finer than a map can show.
 */
const subsolarPoint = (date) => {
  const d = (date.getTime() - J2000) / DAY;
  const meanAnomaly = (357.529 + 0.98560028 * d) * RAD;
  const meanLongitude = 280.459 + 0.98564736 * d;
  const eclipticLongitude =
    (meanLongitude +
      1.915 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly)) *
    RAD;
  const obliquity = (23.439 - 0.00000036 * d) * RAD;
  const rightAscension = Math.atan2(
    Math.cos(obliquity) * Math.sin(eclipticLongitude),
    Math.cos(eclipticLongitude),
  );
  const declination = Math.asin(
    Math.sin(obliquity) * Math.sin(eclipticLongitude),
  );
  // Greenwich mean sidereal time: how far the Earth has turned under the stars.
  const siderealTime = 280.46061837 + 360.98564736629 * d;
  return [wrap(rightAscension / RAD - siderealTime), declination / RAD];
};

/** The angle between two places, seen from the Earth's center, in degrees. */
const arc = ([lng1, lat1], [lng2, lat2]) => {
  const cosine =
    Math.sin(lat1 * RAD) * Math.sin(lat2 * RAD) +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos((lng2 - lng1) * RAD);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) / RAD;
};

/** The Sun's altitude above the horizon at `place`, in degrees: 90 overhead, negative at night. */
const sunAltitude = (place, subsolar) => 90 - arc(place, subsolar);

const HOUR = 3_600_000;

/**
 * The moment nearest `from`, at most 12 hours either way, when the local solar time at `lng`
 * is `hour`: noon is when the Sun is highest there.
 */
const nearestSolarTime = (from, hour, lng) => {
  const local = (from.getTime() / HOUR + lng / 15) % 24;
  const ahead = ((((hour - local) % 24) + 36) % 24) - 12;
  return new Date(from.getTime() + ahead * HOUR);
};

const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * How bright the ground looks from space, 0 to 1, for `h`, the sine of the Sun's altitude.
 * Under a low Sun it is darker, roughly with the square root of `h`, as the air scatters some
 * light onto it; twilight fades out until the Sun is 6° down.
 */
const groundLight = (h) =>
  h > 0 ? 0.1 + 0.9 * Math.sqrt(h) : 0.1 * smoothstep(Math.sin(-6 * RAD), 0, h);

/** How far night has fallen, 0 to 1: city lights come on from 2° below the horizon and are all on at 9°. */
const nightfall = (h) => smoothstep(Math.sin(-2 * RAD), Math.sin(-9 * RAD), h);

/**
 * The style's `light`, placed so the globe's atmosphere is lit from the subsolar point.
 * With `anchor: "map"`, MapLibre turns the light with the globe: the position is an
 * [radial, azimuthal, polar] direction in a frame fixed to the Earth.
 */
const sunLight = ([lng, lat]) => {
  // The atmosphere shader looks for the Sun opposite the light's position,
  // at (cos lat sin lng, sin lat, cos lat cos lng) in that frame
  const x = -Math.cos(lat * RAD) * Math.sin(lng * RAD);
  const y = -Math.sin(lat * RAD);
  const z = -Math.cos(lat * RAD) * Math.cos(lng * RAD);
  const polar = Math.acos(z) / RAD;
  // MapLibre counts the azimuth from north, 90° on from the x axis.
  const azimuthal = Math.atan2(y, x) / RAD - 90;
  return {
    anchor: 'map',
    position: [1.5, azimuthal, polar],
  };
};

/** Sky colors at a few altitudes of the Sun, from deep night to full day. */
const SKY_STOPS = [
  { altitude: -18, sky: [2, 4, 10], horizon: [6, 9, 20], fog: [3, 5, 12] },
  { altitude: -10, sky: [8, 14, 36], horizon: [26, 32, 62], fog: [14, 18, 36] },
  {
    altitude: -4,
    sky: [28, 44, 96],
    horizon: [176, 104, 92],
    fog: [72, 62, 82],
  },
  {
    altitude: 1,
    sky: [56, 92, 160],
    horizon: [246, 162, 96],
    fog: [196, 150, 124],
  },
  {
    altitude: 8,
    sky: [70, 124, 196],
    horizon: [236, 214, 178],
    fog: [208, 196, 182],
  },
  {
    altitude: 25,
    sky: [64, 128, 212],
    horizon: [204, 222, 240],
    fog: [196, 212, 228],
  },
];

const mix = (a, b, t) => {
  // Blend in linear light, as light adds up, then back to sRGB.
  const toLinear = (c) => (c / 255) ** 2.2;
  const toSrgb = (c) => Math.round(255 * c ** (1 / 2.2));
  const [r, g, bl] = a.map((c, i) =>
    toSrgb(toLinear(c) + (toLinear(b[i]) - toLinear(c)) * t),
  );
  return `rgb(${r}, ${g}, ${bl})`;
};

/**
 * The style's `sky` for the Sun's altitude where the camera looks: blue by day, warm near
 * sunrise and sunset, deep blue through twilight, dark at night. The sky shows when the map
 * tilts toward the horizon; from space, the atmosphere shader takes over.
 */
const skyFor = (altitude) => {
  const last = SKY_STOPS.length - 1;
  let i = 0;
  while (i < last - 1 && altitude > SKY_STOPS[i + 1].altitude) {
    i++;
  }
  const a = SKY_STOPS[i];
  const b = SKY_STOPS[i + 1];
  const t = Math.max(
    0,
    Math.min(1, (altitude - a.altitude) / (b.altitude - a.altitude)),
  );
  return {
    'sky-color': mix(a.sky, b.sky, t),
    'horizon-color': mix(a.horizon, b.horizon, t),
    'fog-color': mix(a.fog, b.fog, t),
    // Haze thickens toward the horizon: far ridges fade into the fog, the fog into the sky.
    'fog-ground-blend': 0.6,
    'horizon-fog-blend': 0.6,
    'sky-horizon-blend': 0.7,
    'atmosphere-blend': 0.6,
  };
};

export {
  subsolarPoint,
  arc,
  sunAltitude,
  nearestSolarTime,
  groundLight,
  nightfall,
  sunLight,
  skyFor,
};
