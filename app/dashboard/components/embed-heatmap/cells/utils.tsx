import { CellData } from "./types";

function isCandidateEqual(a: CellData, b: CellData) {
    return a.sourceColumn === b.sourceColumn && a.targetColumn === b.targetColumn;
}

function isCellEqual(a: CellData, b: CellData) {
    return a.sourceColumn === b.sourceColumn && a.targetColumn === b.targetColumn && a.matcher === b.matcher;
}

export { isCandidateEqual, isCellEqual };