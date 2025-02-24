import React from 'react';

const exportToJson = (data: any) => {
    const jsonData = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonData);
    const tempLink = document.createElement('a');
    tempLink.href = jsonUrl;
    tempLink.setAttribute('download', 'data.json');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
};

export { exportToJson };