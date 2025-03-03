
function isCandidateEqual(a: Candidate, b: Candidate) {
    return a.sourceColumn === b.sourceColumn && a.targetColumn === b.targetColumn;
}

function isCellEqual(a: Candidate, b: Candidate) {
    return a.sourceColumn === b.sourceColumn && a.targetColumn === b.targetColumn && a.matcher === b.matcher;
}

export { isCandidateEqual, isCellEqual };