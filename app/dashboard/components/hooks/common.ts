const SVG_WIDTH = 420;
const SVG_HEIGHT = 200;

interface MarginSpec {
    left: number, right: number, top: number, bottom: number
}

const margin: MarginSpec = {
    left: 20,
    right: 50,
    top: 10,
    bottom: 25
}

const minChartWidth = 100;
const minChartHeight = 100;

export {SVG_HEIGHT, SVG_WIDTH, margin, minChartWidth, minChartHeight};