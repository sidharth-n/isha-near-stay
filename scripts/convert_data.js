const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../Isha_Accommodations');
const outputFile = path.join(__dirname, '../src/data/stays.json');

function parseMarkdownTable(lines) {
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const data = [];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line.startsWith('|')) continue;
        
        const values = line.split('|').map(v => v.trim());
        // Remove first and last empty strings from split if they exist (due to leading/trailing |)
        if (values[0] === '') values.shift();
        if (values[values.length - 1] === '') values.pop();

        if (values.length === 0) continue;

        const entry = {};
        headers.forEach((header, index) => {
            if (index < values.length) {
                entry[header] = values[index];
            }
        });
        data.push(entry);
    }
    return data;
}

function convertData() {
    try {
        const content = fs.readFileSync(inputFile, 'utf8');
        const lines = content.split('\n');
        
        const stays = [];
        let currentCategory = '';
        let tableBuffer = [];
        let inTable = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect Category
            if (line.startsWith('## Option')) {
                // If we were processing a table, parse it now
                if (tableBuffer.length > 0) {
                    const parsedStays = parseMarkdownTable(tableBuffer);
                    parsedStays.forEach(s => s.category = currentCategory);
                    stays.push(...parsedStays);
                    tableBuffer = [];
                    inTable = false;
                }
                // Extract category name (e.g., "Home Stays Near Isha Yoga Center")
                currentCategory = line.replace(/^## Option \d+: /, '').trim();
                continue;
            }

            // Detect Table Start
            if (line.startsWith('| S.No')) {
                inTable = true;
                tableBuffer.push(line);
                continue;
            }

            // Collect Table Rows
            if (inTable) {
                if (line.startsWith('|')) {
                    tableBuffer.push(line);
                } else if (line === '' && tableBuffer.length > 0) {
                    // End of table
                    const parsedStays = parseMarkdownTable(tableBuffer);
                    parsedStays.forEach(s => s.category = currentCategory);
                    stays.push(...parsedStays);
                    tableBuffer = [];
                    inTable = false;
                }
            }
        }

        // Catch any remaining table at the end
        if (tableBuffer.length > 0) {
            const parsedStays = parseMarkdownTable(tableBuffer);
            parsedStays.forEach(s => s.category = currentCategory);
            stays.push(...parsedStays);
        }

        // Clean and Normalize Data
        const cleanedStays = stays.map((stay, index) => {
            // Extract coordinates from Google Map Link if possible
            // Format: https://maps.app.goo.gl/Code or https://www.google.com/maps/...
            // Since we can't easily resolve shortlinks without network, we'll just keep the link.
            
            // Normalize keys
            const normalized = {
                id: index + 1,
                name: stay['Name'] || stay['Name of Home Stay'] || 'Unknown',
                category: stay.category,
                distance: stay['Distance from Isha (SarpaVasal Gate)'] || stay['Distance from SarpaVasal'] || '',
                contact: stay['Contact'] || stay['Contact (+91)'] || stay['Email'] || '',
                mapLink: stay['Google Map Location'] || stay['Location'] || stay['Booking Link'] || '',
                amenities: stay['Amenities'] ? stay['Amenities'].split('<br/>').map(a => a.replace(/^\d+\.\s*/, '').trim()) : [],
                transport: stay['How to Go to Ashram'] ? stay['How to Go to Ashram'].split('<br/>').map(t => t.replace(/^\d+\.\s*/, '').trim()) : [],
                description: '' // Placeholder for future
            };

            // Basic cleanup
            if (normalized.distance === '0') normalized.distance = 'Inside Ashram';
            
            return normalized;
        });

        fs.writeFileSync(outputFile, JSON.stringify(cleanedStays, null, 2));
        console.log(`Successfully converted ${cleanedStays.length} stays to ${outputFile}`);

    } catch (error) {
        console.error('Error converting data:', error);
        process.exit(1);
    }
}

convertData();
