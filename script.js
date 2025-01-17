let data2024 = [];
let data2023 = [];
const adminPhones = ["01011111111", "01022222222", "01033333333", "01044444444", "01055555555"];
const loginScreen = document.getElementById("login-screen");
const dataScreen = document.getElementById("data-screen");
const comparisonTable = document.getElementById("comparison-table").querySelector("tbody");
const chartCanvas = document.getElementById("chart");
const unitFilter = document.getElementById("unit-filter");
let chartInstance;

async function fetchData() {
    try {
        const response2024 = await fetch('data2024.json');
        const response2023 = await fetch('data2023.json');
        const rawData2024 = await response2024.json();
        const rawData2023 = await response2023.json();

        data2024 = rawData2024["ورقة1"] || [];
        data2023 = rawData2023["Sheet2"] || [];
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        alert("حدث خطأ أثناء تحميل البيانات");
    }
}

function renderComparisonTable(data2024, data2023) {
    comparisonTable.innerHTML = "";

    data2024.forEach(row2024 => {
        const unitNumber = row2024["Column5"];
        const row2023 = data2023.find(row => row["رقم الوحدة"] === unitNumber);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${unitNumber || "-"}</td>
            <td>${row2024["Column2"] || "-"}</td>
            <td>${row2023 ? row2023["نوع العقد"] : "-"}</td>
            <td>${row2024["Column3"] || "-"}</td>
            <td>${row2023 ? row2023["المشروع"] : "-"}</td>
            <td>${row2024["Column4"] || "-"}</td>
            <td>${row2023 ? row2023["عدد الغرف"] : "-"}</td>
            <td>${row2024["Column6"] || "-"}</td>
            <td>${row2023 ? row2023["المياة"] : "-"}</td>
            <td>${row2024["Column7"] || "-"}</td>
            <td>${row2023 ? row2023["الكهرباء"] : "-"}</td>
            <td>${row2024["Column8"] || "-"}</td>
            <td>${row2023 ? row2023["الإدارة"] : "-"}</td>
            <td>${row2024["Column12"] || 0}</td>
            <td>${row2023 ? row2023["نقدي للمالك"] : 0}</td>
        `;
        comparisonTable.appendChild(tr);
    });
}

function renderChart(data2024, data2023) {
    const labels = data2024.map(row => row["Column5"]);
    const data2024Values = data2024.map(row => row["Column12"] || 0);
    const data2023Values = labels.map(unit => {
        const row2023 = data2023.find(row => row["رقم الوحدة"] === unit);
        return row2023 ? row2023["نقدي للمالك"] : 0;
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'الصافي للمالك (2024)',
                    data: data2024Values,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'الصافي للمالك (2023)',
                    data: data2023Values,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


async function login() {
    await fetchData();
    const phone = document.getElementById("phone").value.trim();

    if (adminPhones.includes(phone)) {
        loginScreen.classList.add("hidden");
        dataScreen.classList.remove("hidden");
        unitFilter.classList.remove("hidden");
        renderComparisonTable(data2024, data2023);
        renderChart(data2024, data2023);
    } else {
        const ownerData2024 = data2024.filter(row => String(row["Column14"]) === phone);
        if (ownerData2024.length > 0) {
            const ownerData2023 = filterUnitsBy2024(ownerData2024);
            loginScreen.classList.add("hidden");
            dataScreen.classList.remove("hidden");
            renderComparisonTable(ownerData2024, ownerData2023);
            renderChart(ownerData2024, ownerData2023);
        } else {
            alert("رقم الموبايل غير مسجل.");
        }
    }
}

function filterUnitsBy2024(ownerData2024) {
    const ownerUnits = ownerData2024.map(row => String(row["Column5"]));
    return data2023.filter(row => ownerUnits.includes(String(row["رقم الوحدة"])));
}

function logout() {
    loginScreen.classList.remove("hidden");
    dataScreen.classList.add("hidden");
    document.getElementById("phone").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("phone").focus();
});
