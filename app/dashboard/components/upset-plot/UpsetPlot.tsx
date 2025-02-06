import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { Card } from "@mui/material";
import React, { useRef, useEffect, useMemo, useState } from "react";

interface GroupedData {
    targetColumn: string;
    sourceColumn: string;
    matchers: (string | undefined)[];
    accScore: number;
    id: number;
    isSelected: boolean;
}

interface DataPerMatcher {
    id: number;
    targetColumn: string;
    matchers: string;
    accScore: number;
    isSelected: boolean;
}

interface UpsetPlotProps {
    data: Candidate[];
    matchers: Matcher[];
    selectedCandidate?: Candidate;
}

const upperChartHeight = 200;
const lowerSetChartHeight = 200;
const upperMarginLeft = 30;
const lowerMarginBottom = 60;
const lowerBarChartWidth = 200;

const UpsetPlot: React.FC<UpsetPlotProps> = ({ data, matchers, selectedCandidate }) => {
    const upperColumnChartRef = useRef<HTMLDivElement>(null);
    const lowerBarChartRef = useRef<HTMLDivElement>(null);
    const lowerSetChartRef = useRef<HTMLDivElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [fullWidth, setFullWidth] = useState(containerRef.current ? containerRef.current.clientWidth : 0);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setFullWidth(containerRef.current.clientWidth);
            }
        };
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { filteredData, filteredMatchers } = useMemo(() => {
        let filteredData = [...data];

        if (selectedCandidate) {
            filteredData = filteredData.filter(d => d.sourceColumn === selectedCandidate.sourceColumn);
        }

        const existingMatchers = filteredData.map(d => d.matcher);
        const filteredMatchers = matchers.filter(m => existingMatchers.includes(m.name)).sort((a, b) => a.weight - b.weight);

        return { filteredData, filteredMatchers };
    }, [data, matchers, selectedCandidate]);

    const groupedData = useMemo(() => {
        return Array.from(d3.group(filteredData, d => d.targetColumn), ([targetColumn, items]) => {
            const groupedBySource = d3.group(items, d => d.sourceColumn);
            return Array.from(groupedBySource, ([sourceColumn, items]) => ({
                targetColumn,
                sourceColumn,
                matchers: items.map(d => d.matcher),
                accScore: d3.sum(items, d => d.score * (matchers.find(m => m.name === d.matcher)?.weight ?? 1)),
                isSelected: selectedCandidate ? items.some(d => d.sourceColumn === selectedCandidate.sourceColumn && d.targetColumn == selectedCandidate.targetColumn) : false
            }));
        }).flat().sort((a, b) => b.accScore - a.accScore).map((d, idx) => ({ id: idx + 1, ...d }));
    }, [filteredData, matchers, selectedCandidate]);

    const dataPerMatcher = useMemo(() => {
        return groupedData.flatMap(
            (d) => d.matchers.map((matcher) => ({
                id: d.id,
                targetColumn: d.targetColumn,
                matchers: matcher ?? '',
                accScore: d.accScore,
                isSelected: d.isSelected,
            }))
        );
    }, [groupedData]);

    const dataCrossProduct = useMemo(() => crossProduct(dataPerMatcher), [dataPerMatcher]);

    // const evenMatchers = useMemo(() => filteredMatchers.filter((_, idx) => idx % 2 === 0), [filteredMatchers]);
    // const evenMatcherNames = useMemo(() => evenMatchers.map(matcher => matcher.name), [evenMatchers]);

    const weightPerMatcher = useMemo(() => {
        return Array.from(d3.group(dataPerMatcher, d => d.matchers), ([matcher, _]) => ({
            name: matcher,
            weight: filteredMatchers.find(m => m.name === matcher)?.weight ?? 1,
        })).sort((a, b) => b.weight - a.weight);
    }, [dataPerMatcher, filteredMatchers]);

    useEffect(() => {
        if (upperColumnChartRef.current) {
            upperColumnChartRef.current.innerHTML = '';
            upperColumnChartRef.current.appendChild(upperColumnChart(groupedData, fullWidth));
        }
        if (lowerBarChartRef.current) {
            lowerBarChartRef.current.innerHTML = '';
            lowerBarChartRef.current.appendChild(lowerBarChart(weightPerMatcher));
        }
        if (lowerSetChartRef.current) {
            lowerSetChartRef.current.innerHTML = '';
            lowerSetChartRef.current.appendChild(lowerSetChart({ dataCrossProduct, dataPerMatcher }, fullWidth));
        }
    }, [groupedData, weightPerMatcher, dataCrossProduct, dataPerMatcher, fullWidth]);

    return (
        <Card ref={containerRef}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: `${fullWidth}px` }}>
                <div ref={upperColumnChartRef}></div>
                <div style={{ display: 'flex', position: 'relative', top: '-50px', alignItems: 'flex-start' }}>
                    <div ref={lowerBarChartRef}></div>
                    <div ref={lowerSetChartRef}></div>
                </div>
            </div>
        </Card>
    );
};

function crossProduct(data: DataPerMatcher[]) {
    const n = d3.max(data, (d) => d.id) as number;
    const ids = [...Array(n).keys()].map((idx) => idx + 1);
    const categories = [...new Set(data.map((d) => d.matchers))];

    return d3.cross(categories, ids).map((d) => ({ matchers: d[0], id: d[1] }));
}

function upperColumnChart(groupedData: GroupedData[], fullWidth: number) {
    const columnChart = Plot.barY(
        groupedData,
        {
            y: d => d.accScore,
            x: d => d.id,
            fill: d => d.isSelected ? 'red' : 'steelblue', // Highlight selected candidate
        }
    );
    return Plot.plot({
        width: fullWidth - lowerBarChartWidth + upperMarginLeft,
        height: upperChartHeight,
        marginLeft: upperMarginLeft,
        style: {
            background: '#ffffff00'
        },
        grid: true,
        x: {
            axis: null,
            padding: 0.2,
            round: false
        },
        y: {
            tickPadding: 2,
            line: true
        },
        marks: [
            Plot.ruleY([0], { fill: '#333333' }),
            columnChart,
        ]
    });
}

function lowerBarChart(matchers: Matcher[]) {
    const matcherData = Plot.barX(
        matchers,
        {
            x: d => d.weight,
            y: d => d.name,
        }
    );

    return Plot.plot({
        marks: [
            matcherData
        ],
        x: {
            axis: 'top',
            line: true,
            reverse: true,
        },
        y: {
            axis: 'right',
            tickSize: 0,
            tickPadding: 7,
            insetTop: 2,
            round: false,
            padding: 0.1,
            align: 0,
        },
        width: lowerBarChartWidth,
        height: lowerSetChartHeight + lowerMarginBottom,
        marginRight: 58,
        marginBottom: lowerMarginBottom,
        style: {
            background: '#ffffff00'
        }
    });
}

interface LowerSetChartProps {
    dataCrossProduct: { matchers: string, id: number }[];
    // evenMatcherNames: string[];
    dataPerMatcher: DataPerMatcher[];
}

function lowerSetChart({ dataCrossProduct, dataPerMatcher }: LowerSetChartProps, fullWidth: number) {
    const backgroundStripeChart = Plot.cell(
        dataCrossProduct,
        {
            x: d => d.id,
            y: d => d.matchers,
            fill: '#efefef',
            stroke: '#efefef',
            strokeWidth: 3,
        }
    );

    const backgroundDotChart = Plot.dot(
        dataCrossProduct,
        {
            x: d => d.id,
            y: d => d.matchers,
            fill: '#dedede',
            r: 3.5,
        }
    );

    const dotChart = Plot.dot(
        dataPerMatcher,
        {
            x: d => d.id,
            y: d => d.matchers,
            fill: d => d.isSelected ? 'red' : '#333333', // Highlight selected candidate
            r: 3.5,
        }
    );

    const lineChart = Plot.line(
        dataPerMatcher,
        {
            x: d => d.id,
            y: d => d.matchers,
            z: d => d.id,
            strokeWidth: 2,
            stroke: d => d.isSelected ? 'red' : '#333333', // Highlight selected candidate
        }
    );

    return Plot.plot({
        marks: [
            backgroundStripeChart,
            backgroundDotChart,
            dotChart,
            lineChart
        ],
        x: {
            axis: 'bottom',
            padding: 0,
            round: false,
            insetRight: 1,
            insetLeft: 1,
            tickFormat: (d) => dataPerMatcher.find(item => item.id === d)?.targetColumn ?? d,
            tickRotate: 45, // Rotate the tick labels to be vertical
            labelAnchor: 'left', // Align the labels to the end
        },
        y: {
            axis: null,
            tickSize: 0
        },
        width: fullWidth - lowerBarChartWidth,
        height: lowerSetChartHeight + lowerMarginBottom,
        marginTop: 28,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: lowerMarginBottom,
        style: {
            background: '#ffffff00'
        },
    });
}

export default UpsetPlot;
