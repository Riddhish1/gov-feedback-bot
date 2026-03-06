import * as fs from 'fs';
import * as d3Geo from 'd3-geo';

function analyzeMap() {
    try {
        const data = JSON.parse(fs.readFileSync('public/maharashtra.json', 'utf8'));

        // Calculate bounding box using d3-geo
        // d3.geoBounds takes a GeoJSON object and returns [[left, bottom], [right, top]]
        const bounds = d3Geo.geoBounds(data);
        console.log("Bounds:", bounds);

        const center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
        console.log("Optimal Center:", center);

        // Approximation for scale based on view size (e.g., 800x600)
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        console.log("Width in degrees:", dx, "Height in degrees:", dy);

    } catch (err) {
        console.error("Error:", err);
    }
}

analyzeMap();
