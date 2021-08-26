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

function populateTotal() {
    // Reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total + parseInt(t.value);
    }, 0);

    let totalE1 = document.querySelector("#total");
    totalE1.textContent = total;
}

function populateTable() {
    let tbody = document.querySelector("#tbody"); 
    tbody.innerHTML = "";

transactions.forEach(transaction => {
    // Create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML =`
        <td>${transaction.name}</td>
        <td>${transaction.value}</td>
        `;

        tbody.appendChild(tr);
    });
}

function populateChart() {
    // Copy the array and reverse it 
    let reversed = transactions.slice().reverse();
    let sum = 0;

    // Create Date labels
    let labels = reversed.map(t => {
        let date = new Date(t.date);
        return `${date.getMonth() + 1}/${date.getData()}/${date.getFullYear()}`;
    });

    // Create incremental values for chart
    let data = reversed.map(t => {
        sum += parseInt(t.value);
        return sum;
    });

    // Remove old chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new CharacterData(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: "Total over time",
                fill: true,
                backgroundColor: "#566573",
                data
            }]
        }
    });
}