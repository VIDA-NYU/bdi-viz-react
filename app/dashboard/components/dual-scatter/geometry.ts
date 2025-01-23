// utils/geometry.ts
export function computeConvexHull(points: Array<{x: number, y: number}>) {
    if (points.length < 3) return points;

    // Graham scan algorithm
    const pivot = points.reduce((min, p) => 
        p.y < min.y || (p.y === min.y && p.x < min.x) ? p : min
    );

    const sorted = points
        .filter(p => p !== pivot)
        .sort((a, b) => {
            const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
            const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
            return angleA - angleB;
        });

    const hull = [pivot, sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
        while (hull.length > 1 && !isLeftTurn(
            hull[hull.length - 2],
            hull[hull.length - 1],
            sorted[i]
        )) {
            hull.pop();
        }
        hull.push(sorted[i]);
    }

    return hull;
}

function isLeftTurn(p1: {x: number, y: number}, 
                   p2: {x: number, y: number}, 
                   p3: {x: number, y: number}) {
    return ((p2.x - p1.x) * (p3.y - p1.y) - 
            (p2.y - p1.y) * (p3.x - p1.x)) > 0;
}

// Add padding to convex hull
export function padHull(hull: Array<{x: number, y: number}>, padding: number) {
    if (hull.length < 3) return hull;

    const center = hull.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
        { x: 0, y: 0 }
    );
    center.x /= hull.length;
    center.y /= hull.length;

    return hull.map(p => ({
        x: center.x + (p.x - center.x) * (1 + padding),
        y: center.y + (p.y - center.y) * (1 + padding)
    }));
}