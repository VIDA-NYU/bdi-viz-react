const getMockData = () => {
    const mockData: Candidate[] = [
        {
            sourceColumn: 'A',
            targetColumn: 'B',
            score: 0.5,
            matcher: 'matcher1'
        },
        {
            sourceColumn: 'A',
            targetColumn: 'C',
            score: 0.2,
            matcher: 'matcher2'
        },
        {
            sourceColumn: 'B',
            targetColumn: 'A',
            score: 0.1,
            matcher: 'matcher1'
        },
        {
            sourceColumn: 'B',
            targetColumn: 'C',
            score: 0.6,
            matcher: 'matcher2'
        },
        {
            sourceColumn: 'C',
            targetColumn: 'A',
            score: 0.9,
            matcher: 'matcher1'
        },
        {
            sourceColumn: 'C',
            targetColumn: 'B',
            score: 0.4,
            matcher: 'matcher2'
        },
        {
            sourceColumn: 'A',
            targetColumn: 'D',
            score: 0.7,
            matcher: 'matcher1'
        },
        {
            sourceColumn: 'B',
            targetColumn: 'D',
            score: 0.3,
            matcher: 'matcher2'
        },
        {
            sourceColumn: 'C',
            targetColumn: 'D',
            score: 0.8,
            matcher: 'matcher1'
        },
        {
            sourceColumn: 'A',
            targetColumn: 'E',
            score: 0.1,
            matcher: 'matcher2'
        },
        {
            sourceColumn: 'A',
            targetColumn: 'F',
            score: 0.8,
            matcher: 'matcher1'
        },
    ]
    return mockData;
}

export {getMockData};