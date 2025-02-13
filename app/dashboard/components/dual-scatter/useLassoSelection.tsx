// hooks/useLassoSelection.ts
import { useState, useCallback, useRef } from 'react';
import * as d3 from 'd3';

interface Point {
    x: number;
    y: number;
}

export const useLassoSelection = () => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionPath, setSelectionPath] = useState<Point[]>([]);
    const [selectedArea, setSelectedArea] = useState<Point[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    const line = d3.line<Point>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasisClosed);

    const getRelativeCoordinates = useCallback((event: MouseEvent): Point => {
        const svg = svgRef.current;
        
        if (!svg) return { x: 0, y: 0 };

        const CTM = svg.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };

        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const transformed = point.matrixTransform(CTM.inverse());

        return { x: transformed.x, y: transformed.y };
    }, []);

    const startSelection = useCallback((event: React.MouseEvent) => {
        setIsSelecting(true);
        const point = getRelativeCoordinates(event.nativeEvent);
        setSelectionPath([point]);
    }, [getRelativeCoordinates]);

    const updateSelection = useCallback((event: React.MouseEvent) => {
        if (!isSelecting) return;
        const point = getRelativeCoordinates(event.nativeEvent);
        setSelectionPath(prev => [...prev, point]);
    }, [isSelecting, getRelativeCoordinates]);

    const endSelection = useCallback(() => {
        if (!isSelecting) return;
        setIsSelecting(false);
        setSelectedArea(selectionPath);
        setSelectionPath([]);
    }, [isSelecting, selectionPath]);

    const isPointInSelection = useCallback((point: Point): boolean => {
        if (selectedArea.length < 3) return false;
        
        // Convert Point[] to [number, number][] for d3.polygonContains
        const polygon = selectedArea.map(p => [p.x, p.y] as [number, number]);
        return d3.polygonContains(polygon, [point.x, point.y]);
    }, [selectedArea]);

    const clearSelection = useCallback(() => {
        setSelectedArea([]);
    }, []);

    return {
        svgRef,
        isSelecting,
        selectionPath,
        selectedArea,
        startSelection,
        updateSelection,
        endSelection,
        isPointInSelection,
        clearSelection,
        getPathData: useCallback((points: Point[]) => line(points) || '', [line])
    };
};