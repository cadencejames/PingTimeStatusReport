// Function to parse the CSV data into an object structure
const parseCSV = (data) => {
    // Splitting the raw CSV data into rows
    const rows = data.trim().split("\n");
    // Taking the first row as the header;
    const header = rows[0].split(",");
    // Processing the remaining rows as the body and splitting them by commas
    const body = rows.slice(1).map(row => row.split(","));
    return { header, body };
}

// Parsing the CSV data
const csv = parseCSV(csvData);

// Grouping the CSV data by tier and then by site
const tieredData = {};
csv.body.forEach(row => {
    const tier = row[1]; // Assuming the tier is the second column
    if (!tieredData[tier]) {
        tieredData[tier] = {};
    }
    const site = row[0];
    if (!tieredData[tier][site]) {
        tieredData[tier][site] = [];
    }
    tieredData[tier][site].push(row.slice(2));
});

// Row labels for the remote sites
const rowLabels = ["SITEA", "SITEB"];

// Create the grid wrapper with vertical layout
const gridWrapper = document.createElement('div');
gridWrapper.className = 'grid-wrapper';
document.body.appendChild(gridWrapper);

// Sorting tiers
const sortedTiers = Object.keys(tieredData).sort();

// Looping through each sorted tier
sortedTiers.forEach(tier => {
    const sites = tieredData[tier];

    // Create a tier container
    const tierContainer = document.createElement('div');
    tierContainer.className = 'tier-container';

    // Create a tier header with a collapsible arrow
    const tierHeader = document.createElement('h2');
    tierHeader.className = 'tier-header';
    tierHeader.textContent = `Tier ${tier} `;
    const arrow = document.createElement('span');
    arrow.textContent = '▼';
    arrow.className = 'collapse-arrow';
    tierHeader.appendChild(arrow);

    // Create a container for the site elements
    const siteContainerWrapper = document.createElement('div');
    siteContainerWrapper.className = 'site-container-wrapper';

    // Looping through each site in the tier
    for (const [site, entries] of Object.entries(sites)) {
        const siteContainer = document.createElement('div');
        siteContainer.className = 'site-container';

        // Adding the site name label
        const siteName = document.createElement('div');
        siteName.className = 'site-name';
        siteName.textContent = site;
        siteContainer.appendChild(siteName);

        // Processing each entry (row) for the site
        entries.forEach((entry, index) => {
            const tableRow = document.createElement('div');
            tableRow.className = 'uptime-table-row';

            // Add the row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = rowLabels[index] + ">";
            tableRow.appendChild(rowLabel);

            // Create a container for blocks
            const blockContainer = document.createElement('div');
            blockContainer.className = 'block-container';

            // Process each block's value in the row
            let avgIsX = entry[0] == "x";
            let avg = avgIsX ? "x" : parseFloat(entry[0]);
            for (let i = 1; i < entry.length; i++) {
                let blockColor = '';
                let blockText = `${csv.header[i + 2]}: `;
                if (avgIsX || entry[i] === "x") {
                    blockColor = 'darkgray';
                    blockText += 'N/A';
                } else {
                    const blockValue = parseFloat(entry[i]);
                    blockText += entry[i];
                    if (blockValue > (avg + 0.1 * avg + 5)) {
                        blockColor = 'red';
                    } else if (blockValue < (avg - 0.1 * avg - 5)) {
                        blockColor = 'blue';
                    } else {
                        blockColor = 'green';
                    }
                }
                const block = document.createElement('div');
                block.className = `block ${blockColor}`;
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = avgIsX || entry[i] === "x" ? blockText : `${blockText} ms`;
                block.appendChild(tooltip);
                blockContainer.appendChild(block);
            }

            tableRow.appendChild(blockContainer);

            // Adding the average value label below the row
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = avgIsX ? 'N/A' : `Average Ping: ${entry[0]} ms`;
            siteContainer.appendChild(tableRow);
            siteContainer.appendChild(label);
        });

        siteContainerWrapper.appendChild(siteContainer);
    }

    // Add the click event listener to the tier header
    tierHeader.addEventListener('click', () => {
        siteContainerWrapper.classList.toggle('collapsed');
        arrow.textContent = siteContainerWrapper.classList.contains('collapsed') ? '▶' : '▼';
    });

    tierContainer.appendChild(tierHeader);
    tierContainer.appendChild(siteContainerWrapper);
    gridWrapper.appendChild(tierContainer);
});
