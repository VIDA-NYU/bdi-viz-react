import React from 'react';

const exportToJson = (data: string) => {
    const jsonData = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonData);
    const tempLink = document.createElement('a');
    tempLink.href = jsonUrl;
    tempLink.setAttribute('download', 'data.json');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
};

const exportCsv = (data: string) => {
    const csvData = new Blob([data], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvUrl;
    tempLink.setAttribute('download', 'data.csv');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

export { exportToJson, exportCsv };