const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to fetch and parse the HTML
async function fetchAndParseTable() {
    // Replace with the URL of the page where the table is located
    const url = 'https://docs.google.com/spreadsheets/d/1B7Y0KsN3WYZ64EbqflmD2flhBQqNY4umt00USSYGW34/htmlview#'; // e.g., 'https://example.com/your-page';

    try {
        // Fetch the HTML of the page
        const { data } = await axios.get(url);

        // Load the HTML into cheerio for parsing
        const $ = cheerio.load(data);

        // Select the table
        const table = $('.waffle');  // The class for the table

        // Initialize an array to store the table data
        let tableData = [];

        // Get table headers
        const headers = [];
        table.find('thead th').each((index, element) => {
            if (index > 0) {  // Skip the first header cell (empty)
                headers.push($(element).text().trim());
            }
        });

        // Extract table rows
        table.find('tbody tr').each((index, row) => {
            const rowData = {};
            $(row).find('td').each((i, cell) => {
                if (i > 0) { // Skip the first column cell (SNo)
                    rowData[headers[i - 1]] = $(cell).text().trim();
                }
            });
            tableData.push(rowData);
        });

        // Convert the data to JSON and write to a file
        const jsonData = JSON.stringify(tableData, null, 2);

        // Save to a JSON file
        fs.writeFileSync('table-data.json', jsonData);

        console.log('Data has been saved to table-data.json');
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}

// Run the function to fetch and parse the table
fetchAndParseTable();
