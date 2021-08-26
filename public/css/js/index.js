let transactions = {};
let myChart;

fetch("/api/transaction")
    .then(response => {
        return response.json();
    })
    .then(data => {
        // Save the db data on global variable
        transactions = data;

        populateTotal();
        populateTable();
        populateChart();

    });

function populateTotal();
    // Reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total
    })