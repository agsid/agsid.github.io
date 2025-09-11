// Data for the missions. 
const missionsData = [
    {
        name: "UNEARTHED Mission 01",
        points: "20",
        videoLink: "https://youtube.com/shorts/3DnDIzPDk4Q?feature=share",
        description: "The robot preforms a simple movement to complete mission #1.",
        image: "./images/missions/missions", 
        alt: "FIRST LEGO League UNEARTHED M01"
    },
];

// This function renders the missions dynamically on the page.
function renderMissions() {
    const missionsContainer = document.getElementById('missions-container');
    if (!missionsContainer) {
        console.error("Missions container not found.");
        return;
    }

    missionsContainer.innerHTML = ''; // Clear existing content

    missionsData.forEach((mission, index) => {
        const card = document.createElement('div');
        const orderClass = (index % 2 === 0) ? '' : 'reverse-order';
        card.className = `mission-card ${orderClass}`;

        card.innerHTML = `
            <img src="${mission.image}" alt="${mission.alt}">
            <div class="mission-content">
                <h1>${mission.name}</h1>
                <h4>Points: ${mission.points}</h4>
                <p>${mission.description}</p>
            </div>
        `;
        missionsContainer.appendChild(card);
    });
}

// Run this function when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', renderMissions);
