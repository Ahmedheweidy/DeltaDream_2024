let data2024 = [];
let data2023 = [];
const adminPhones = ["01011111111", "01022222222", "01033333333", "01044444444", "01055555555"];
const tableBody2024 = document.querySelector("#data-table-2024 tbody");
const tableBody2023 = document.querySelector("#data-table-2023 tbody");
const loginScreen = document.getElementById("login-screen");
const dataScreen = document.getElementById("data-screen");
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

        if (!Array.isArray(data2024) || !Array.isArray(data2023)) {
            throw new Error("تنسيق JSON غير صحيح.");
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
    }
}

function filterUnits() {
    const filterValue = unitFilter.value.trim();
    const filtered2024 = data2024.filter(row => String(row["Column5"]).includes(filterValue));
    const filtered2023 = data2023.filter(row => String(row["رقم الوحدة"]).includes(filterValue));
    renderTables(filtered2024, filtered2023);
}

function filter2023ByUnits(ownerData2024) {
    const ownerUnits = ownerData2024.map(row => String(row["Column5"]).trim());
    return data2023.filter(row => ownerUnits.includes(String(row["رقم الوحدة"]).trim()));
}

function renderTables(ownerData2024, ownerData2023) {
    renderTable(ownerData2024, tableBody2024, "2024");
    renderTable(ownerData2023, tableBody2023, "2023");
    renderChart(ownerData2024, ownerData2023);
}

function renderTable(data, tableBody, year) {
    tableBody.innerHTML = "";
    const fragment = document.createDocumentFragment();

    data.forEach((row, index) => {
        const tr = document.createElement("tr");

        const columns = [
            index + 1,
            row["Column2"] || row["نوع العقد"],
            row["Column3"] || row["المشروع"],
            row["Column4"] || row["عدد الغرف"],
            row["Column5"] || row["رقم الوحدة"],
            row["Column6"] || row["المياة"],
            row["Column7"] || row["الكهرباء"],
            row["Column8"] || row["الإدارة"],
            row["Column9"] || row["تصاريح"],
            row["Column10"] || row["مصاريف عمومية"],
            row["Column12"] || row["نقدي للمالك"],
            row["Column13"] || row["مبيعات الشالية"]
        ];

        columns.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value || "-";
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tableBody.appendChild(fragment);
}

function renderChart(data2024, data2023) {
    const labels2024 = data2024.map(row => row["Column5"]);
    const labels2023 = data2023.map(row => row["رقم الوحدة"]);

    const data2024Values = data2024.map(row => row["Column12"] || 0);
    const data2023Values = data2023.map(row => row["نقدي للمالك"] || 0);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: [...labels2024, ...labels2023],
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
        renderTables(data2024, data2023);
    } else {
        const ownerData2024 = data2024.filter(row => String(row["Column14"]) === phone);
        if (ownerData2024.length > 0) {
            const ownerData2023 = filter2023ByUnits(ownerData2024);
            alert("مرحبًا بك!");
            loginScreen.classList.add("hidden");
            dataScreen.classList.remove("hidden");
            unitFilter.classList.add("hidden");
            renderTables(ownerData2024, ownerData2023);
        } else {
            alert("رقم الموبايل غير مسجل.");
        }
    }
}

function logout() {
    loginScreen.classList.remove("hidden");
    dataScreen.classList.add("hidden");
    unitFilter.classList.add("hidden");
    document.getElementById("phone").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("phone").focus();
});
