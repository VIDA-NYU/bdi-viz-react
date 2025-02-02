import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import React, { useRef, useEffect, useMemo } from "react";

interface UpsetPlotProps {
    data: Candidate[];
    matchers: Matcher[];
    filters?: {
        selectedCandidate?: Candidate;
        sourceColumn: string;
        candidateType: string;
        candidateThreshold: number;
    }
}

const fullWidth = 820;
const lowerBarChartWidth = 190;
const lowerSetChartHeight = 200;

const UpsetPlot: React.FC<UpsetPlotProps> = ({ data, matchers, filters }) => {
    const upperColumnChartRef = useRef<HTMLDivElement>(null);
    const lowerBarChartRef = useRef<HTMLDivElement>(null);
    const lowerSetChartRef = useRef<HTMLDivElement>(null);

    // Get filtered data
    const filteredData = useMemo(() => {
        let filteredData = [...data];
            
        if (filters?.sourceColumn) {
            filteredData = filteredData.filter(d => d.sourceColumn === filters.sourceColumn);
        }
    
        if (filters?.candidateThreshold) {
            filteredData = filteredData.filter(d => d.score >= filters.candidateThreshold);
        }

        return filteredData;
    }, [data, matchers, filters]);


    useEffect(() => {
        if (upperColumnChartRef.current) {
            upperColumnChartRef.current.innerHTML = '';
            upperColumnChartRef.current.appendChild(upperColumnChart({ data: filteredData, matchers }));
        }
        if (lowerBarChartRef.current) {
            lowerBarChartRef.current.innerHTML = '';
            lowerBarChartRef.current.appendChild(lowerBarChart({ data: filteredData, matchers }));
        }
        if (lowerSetChartRef.current) {
            lowerSetChartRef.current.innerHTML = '';
            lowerSetChartRef.current.appendChild(lowerSetChart({ data: filteredData, matchers }));
        }
    }, [data, matchers, filters]);

    return (
        <div style={{ overflowX: 'scroll' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: `${fullWidth}px` }}>
                <div ref={upperColumnChartRef}></div>
                <div style={{ display: 'flex', position: 'relative', top: '-50px', alignItems: 'flex-start' }}>
                    <div ref={lowerBarChartRef}></div>
                    <div ref={lowerSetChartRef}></div>
                </div>
            </div>
        </div>
    );
};

function upperColumnChart({ data, matchers }: UpsetPlotProps) {
    const groupedData = Object.entries(data.reduce((acc, curr) => {
        const { targetColumn, score } = curr;
        const weight = matchers.find(m => m.name === curr.matcher)?.weight ?? 1;
        if (!acc[targetColumn]) {
            acc[targetColumn] = 0;
        }
        acc[targetColumn] += score * weight;
        return acc;
    }, {} as Record<string, number>)).map(([targetColumn, accScore]) => ({
        targetColumn,
        accScore
    }));
    const columnChart = Plot.barY(
        groupedData,
        {
            y: d => d.accScore,
            x: d => d.targetColumn,
        }
    );
    return Plot.plot({
        width: fullWidth - lowerBarChartWidth,
        marginLeft: 20,
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

function lowerBarChart({ matchers }: UpsetPlotProps) {
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
            padding: 0.2,
            align: 0,
        },
        width: lowerBarChartWidth,
        height: lowerSetChartHeight + 22,
        marginRight: 58,
        style: {
            background: '#ffffff00'
        }
    });
}

function lowerSetChart({ data, matchers }: UpsetPlotProps) {
    const groupedData = Array.from(d3.group(data, d => d.targetColumn), ([targetColumn, items]) => {
        const groupedBySource = d3.group(items, d => d.sourceColumn);
        return Array.from(groupedBySource, ([sourceColumn, items]) => ({
            targetColumn,
            sourceColumn,
            matchers: items.map(d => d.matcher),
            accScore: d3.sum(items, d => d.score * (matchers.find(m => m.name === d.matcher)?.weight ?? 1))
        }));
    }).flat().sort((a, b) => b.accScore - a.accScore).map((d, idx) => ({ id: idx + 1, ...d }));

    const dataPerMatcher = groupedData.flatMap(
        (d) => d.matchers.map((matcher) => ({
            id: d.id,
            matchers: matcher ?? '',
            accScore: d.accScore,
        }))
    );

    // Removed unused variable 'accScoresPerMatcher'

    interface DataPerMatcher {
        id: number;
        matchers: string;
        accScore: number;
    }

    function crossProduct(data: DataPerMatcher[]) {
        const n = d3.max(data, (d) => d.id) as number;
        const ids = [...Array(n).keys()].map((idx) => idx + 1);
        const categories = [...new Set(data.map((d) => d.matchers))];

        return d3.cross(categories, ids).map((d) => ({ matchers: d[0], id: d[1] }));
    }

    const dataCrossProduct = crossProduct(dataPerMatcher);

    const evenMatchers = matchers.filter((_, idx) => idx % 2 == 0);

    const backgroundStripeChart = Plot.cell(
        matchers.filter(d => evenMatchers.includes(d)),
        {
            x: d => d.id,
            y: d => d.name,
            fill: '#efefef',
            stroke: 'white',
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
            fill: '#333333',
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
            stroke: '#333333'
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
            axis: null,
            padding: 0,
            round: false,
            insetRight: 1,
            insetLeft: 1
        },
        y: {
            axis: null,
            tickSize: 0
        },
        width: fullWidth - lowerBarChartWidth - 20,
        height: lowerSetChartHeight,
        marginTop: 28,
        style: {
            background: '#ffffff00'
        },
    });
}

export default UpsetPlot;