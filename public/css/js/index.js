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

function sendTransaction(isAdding) {
    let nameE1 = document.querySelector("#t-name");
    let amountE1 = document.querySelector("#t-amount");
    let errorE1 = document.querySelector(".form.error");

    // Value Form
    if (nameE1.value === "" || amountE1.value === "") {
        errorE1.textContent = "Missing Information!";
        return;
    } else {
        errorE1.textContent = "";
    }    

    // Create Record
    let transaction = {
        name: nameE1.value,
        value: amountE1.value,
        date: new Date().toISOString()
    };
    // If subtracting funds, covert to a negative number
    if (!isAdding) {
        transaction.value *= -1;
    }
    // Add to the begining of the array of data
    transaction.unshift(transaction);
    // Rerun Logic
    populateChart();
    populateTable();
    populateTotal();
    // Send to server

    fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: {
            Accept: "application/json, text/plain. */*",
            "Content-Type": "applicaiton/json"
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data, errors) {
            errorE1.textContent = "Missing Information";
        }
        else {
            // Clear the Form
            nameE1.value = "";
            amountE1.value = "";
        }
    })
    .catch(err => {
        // Fetch failed. Save in Indexed db
        saveRecord(transaction);

        // Clear form
        nameE1.value = "";
        amountE1.value + "";
    });
}

document.querySelector("#add-btn").onclick = function () {
    sendTransaction(true);
};
document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
};