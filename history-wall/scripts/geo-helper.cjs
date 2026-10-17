// Dev helper used while hand-tracing: points given in pixels of the 2000px-wide grid image.
const fs = require('fs');
module.exports = function write(section, W, H, list) {
  const hotspots = list.map(([frame, pts]) => ({
    frame,
    points: pts.map(([x, y]) => [+(x / W).toFixed(4), +(y / H).toFixed(4)]),
  }));
  fs.writeFileSync(`src/data/geometry/${section}.json`, JSON.stringify({ section, hotspots }, null, 1));
};
