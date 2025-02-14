const getColumns = (candidates: Candidate[]) => {
    const sourceColumns = [...new Set(candidates.map(c => c.sourceColumn))];
    const targetColumns = [...new Set(candidates.map(c => c.targetColumn))];
    return {
            sourceColumns,
            targetColumns
    }
}

export {getColumns};