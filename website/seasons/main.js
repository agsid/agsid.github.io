// main.js

async function loadHTML(id, path) {
    try {
        const res = await fetch(path);
        if (res.ok) {
            document.getElementById(id).innerHTML = await res.text();
        }
    } catch (err) {
        console.warn(`Failed to load ${path}`, err);
    }
}

function renderCurrentSeason(season) {
    const el = document.getElementById("current-season");

    el.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-center">Current Season: ${season.year}</h2>

        <div class="bg-white text-black rounded-xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

            <div class="text-center">
                <p>Hours Spent</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.hoursSpent}</h2>
            </div>

            <div class="text-center">
                <p>People Impacted</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.peopleImpacted}</h2>
            </div>

            <div class="text-center">
                <p>Missions Completed</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.missionsCompleted}</h2>
            </div>
        </div>

        <div class="max-w-4xl mx-auto text-lg">
            <h4 class="text-2xl font-semibold mb-2">${season.title}</h4>
            <p>${season.description}</p>
        </div>
    `;
}

function renderPastSeasons(seasons) {
    const container = document.getElementById("past-seasons-container");
    container.innerHTML = "";

    seasons.forEach((s, i) => {
        const reverse = i % 2 ? "md:flex-row-reverse" : "md:flex-row";

        container.innerHTML += `
            <div class="bg-white rounded-xl shadow-xl overflow-hidden mb-8 transform transition hover:-translate-y-1 hover:shadow-2xl flex flex-col ${reverse}">
                <img src="${s.image}" class="w-full md:w-1/2 object-cover max-h-80" />
                <div class="p-6 md:w-1/2">
                    <h1 class="text-3xl font-bold text-blue-900 mb-2">${s.year}</h1>
                    <h4 class="text-xl font-semibold text-gray-700 mb-4">${s.title}</h4>
                    <p class="text-gray-600">${s.description}</p>
                </div>
            </div>
        `;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    loadHTML("includedContent", "../layout/navbar.html");
    loadHTML("Content", "../layout/footer.html");

    try {
        const seasons = await buildSeasonsData();
        renderCurrentSeason(seasons[0]);
        renderPastSeasons(seasons.slice(1));
    } catch (err) {
        console.error("Page failed to render:", err);
    }
});
