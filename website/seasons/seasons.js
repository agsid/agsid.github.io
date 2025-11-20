// combined.js

async function buildSeasonsData() {
    let total = 100; // fallback for people impacted
    try {
        const sheetId = "11Ewk7kva0PqYLphyYKyIXz63uBwmDFp1Nks6qKfx_LQ";
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        const res = await fetch(url);
        if (res.ok) {
            const text = await res.text();
            const rows = text.split("\n").map(r => r.split(","));
            const totalRow = rows.find(r => r[0]?.toLowerCase().includes("total"));
            total = totalRow ? parseInt(totalRow[1]) : total;
        }
    } catch (err) {
        console.warn("Google Sheet fetch failed:", err);
    }

    return [
        {
            year: "2025-2026",
            title: "Unearthed",
            description: `This year we reached 2,000 people through YouTube, 3D models, and our website.`,
            image: "../images/seasons/yr_25-26.jpg",
            alt: "Team Allied Algorithms in 2025-2026",
            hoursSpent: "1500",
            peopleImpacted: "2000",
            missionsCompleted: "13"
        },
        {
            year: "2024-2025",
            title: "Submerged",
            description: "Our team dedicated this year to the development of a new robot design, alongside our innovation project. We had no changes to the team. We were lucky enough to have a chance to present our robot and innovation project to our board of education who were not only amazed, but informed about FIRST in their community.",
            image: "../images/seasons/yr_24-25.jpg",
            alt: "Team Wilton Lego Team in 2024-2025 Submerged season"
        },
        {
            year: "2023-2024",
            title: "Masterpiece",
            description: "The 2023-2024 Masterpiece season was truly unforgettable! Our robotics team poured countless hours into designing, building, and programming our robot to tackle the art-themed challenges with precision and creativity. The dedication and teamwork truly paid off, as we made it to states.",
            image: "../images/seasons/yr_23-24.jpg",
            alt: "Team Wilton Lego Team in 2023-2024 Masterpiece season"
        },
        {
            year: "2022-2023",
            title: "SUPERPOWERED",
            description: "In this high-energy season, our team explored the future of energy, innovating solutions and refining our robot game strategy. We focused on teamwork and problem-solving, leading to significant growth in our programming and collaboration skills.",
            image: "../images/seasons/yr_22-23.jpg",
            alt: "Team Wilton Lego Team in 2022-2023 SUPERPOWERED season"
        },
        {
            year: "2021-2022",
            title: "CARGO CONNECT",
            description: "This season was all about reimagining global transportation. Our team designed innovative solutions for efficient cargo delivery and built a robust robot to navigate complex missions. We learned a lot about supply chains and logistics.",
            image: "../images/seasons/yr_21-22.jpg",
            alt: "Team Golden Eagles in 2021-2022 CARGO CONNECT season"
        },
        {
            year: "2020-2021",
            title: "RePlay",
            description: "This season was our very first! We focused on learning the basics of building, programming, and collaborating as a team. It was an amazing experience and set the foundation for future success.",
            image: "../images/seasons/yr_20-21.jpg",
            alt: "Team Golden Eagles in 2020-2021 RePlay season"
        }
    ];
}

// ----- Render Functions -----
function renderCurrentSeason(season) {
    const el = document.getElementById("current-season");
    if (!el) return;

    el.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-center">Current Season: ${season.year}</h2>
        <div class="bg-white text-black rounded-xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div class="text-center">
                <p>Hours Spent</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.hoursSpent || "N/A"}</h2>
            </div>
            <div class="text-center">
                <p>People Impacted</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.peopleImpacted || "N/A"}</h2>
            </div>
            <div class="text-center">
                <p>Missions Completed</p>
                <h2 class="text-4xl font-bold text-blue-700">${season.missionsCompleted || "N/A"}</h2>
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
    if (!container) return;

    container.innerHTML = "";
    seasons.slice(1).forEach((s, i) => {
        const reverse = i % 2 ? "md:flex-row-reverse" : "md:flex-row";
        container.innerHTML += `
            <div class="bg-white rounded-xl shadow-xl overflow-hidden mb-8 transform transition hover:-translate-y-1 hover:shadow-2xl flex flex-col ${reverse}">
                <img src="${s.image}" class="w-full md:w-1/2 object-cover max-h-80" alt="${s.alt}" />
                <div class="p-6 md:w-1/2">
                    <h1 class="text-3xl font-bold text-blue-900 mb-2">${s.year}</h1>
                    <h4 class="text-xl font-semibold text-gray-700 mb-4">${s.title}</h4>
                    <p class="text-gray-600">${s.description}</p>
                </div>
            </div>
        `;
    });
}

// ----- Init -----
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const seasons = await buildSeasonsData();
        renderCurrentSeason(seasons[0]);
        renderPastSeasons(seasons);
    } catch (err) {
        console.error("Failed to render seasons:", err);
    }
});
