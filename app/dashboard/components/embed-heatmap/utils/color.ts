// utils/colors.ts
import * as d3 from 'd3';

type ColorScheme = 'blues' | 'viridis' | 'rdbu' | 'yellowBlue' | 'spectral' | 'greens' | 'oranges' | 'purples' | 'reds' | 'YlGnBu';

const getColorInterpolator = (scheme: ColorScheme) => {
    switch (scheme) {
        case 'blues':
            return d3.interpolateBlues;
        case 'viridis':
            return d3.interpolateViridis;
        case 'rdbu':
            return d3.interpolateRdBu;
        case 'spectral':
            return d3.interpolateSpectral;
        case 'yellowBlue':
            return d3.interpolateRdYlBu;
        case 'greens':
            return d3.interpolateGreens;
        case 'oranges':
            return d3.interpolateOranges;
        case 'purples':
            return d3.interpolatePurples;
        case 'reds':
            return d3.interpolateReds;
        case 'YlGnBu':
            return d3.interpolateYlGnBu;
        default:
            return d3.interpolateBlues;
    }
};

const getColorScale = (
    scheme: ColorScheme,
    minScore: number,
    maxScore: number,
    padding: number = 10
) => {
    const paddingValue = ((maxScore - minScore) * padding) / 100;
    return d3.scaleSequential()
        .interpolator(getColorInterpolator(scheme))
        .domain([minScore - paddingValue, maxScore + paddingValue]);
};

const getDiscreteColorScale = (
    scheme: ColorScheme,
    bins: number = 5
) => {
    // Create an array of evenly spaced numbers for binning
    const interpolator = getColorInterpolator(scheme);
    const colors = Array.from({ length: bins }, (_, i) => 
        interpolator(i / (bins - 1))
    );
    
    return d3.scaleQuantize<string>()
        .domain([0, 1])
        .range(colors);
};

export type { ColorScheme };

export { getColorInterpolator, getColorScale, getDiscreteColorScale };