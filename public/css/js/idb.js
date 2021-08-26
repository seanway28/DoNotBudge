let db;

const request = indexedDB.open('budget_tracker', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.results;

    db.CreaetObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.results;

    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.oneerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');

    budgetObjectStore.add(record);
};

function uploadTransactions() {
    const transaction =db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.results.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_transaction');

                budgetObjectStore.clear();;

                alert('Saved budget items added to tracker.');    
            })
            .catch(err => {
                console.log(err);
            })
        }
    };
};

window.addEventListener('online', uploadTransactions);