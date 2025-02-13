import * as d3 from 'd3';
import React, {useEffect} from 'react';
import { SVG_HEIGHT, SVG_WIDTH, margin, minChartHeight, minChartWidth } from './common.ts';

function resizeSVG(
    containerRef: React.RefObject<SVGElement>,
    setWidth: (width: number) => void,
    setHeight: (height: number) => void
) {
    if (containerRef && containerRef.current) {
        // Get new dimensions from the container
        const newWidth = d3.select(containerRef.current)?.node()?.getBoundingClientRect().width;
        const newHeight = d3.select(containerRef.current)?.node()?.getBoundingClientRect().height;
        console.log(newWidth, newHeight, d3.select(containerRef.current).node());
        if (newWidth && newHeight) {
            setWidth(newWidth);
            setHeight(newHeight)
        }
    }
}

function useResizeSVG(
    containerRef: React.RefObject<SVGElement>,
    setWidth: (width: number) => void,
    setHeight: (height: number) => void
) {
    useEffect(() => {
        resizeSVG(containerRef, setWidth, setHeight);
    }, []);
    useEffect(() => {
        window.addEventListener('resize', () => resizeSVG(containerRef, setWidth, setHeight));

        return () => {
            window.removeEventListener('resize', () => resizeSVG(containerRef, setWidth, setHeight));
        }
    }, []);
    
}

function useResizedSVG(
    containerRef: React.RefObject<SVGElement>,
){
    const [width, setWidth] = React.useState<number>(200);
    const [height, setHeight] = React.useState<number>(130);
    useResizeSVG(containerRef, setWidth, setHeight);
    return {svgWidth: width, svgHeight: height, ref: containerRef};
}

function useResizedSVGRef(){
    const containerRef = React.useRef<SVGSVGElement>(null);
    return {...useResizedSVG(containerRef), ref: containerRef};
}


export { resizeSVG, useResizeSVG, useResizedSVG, useResizedSVGRef}