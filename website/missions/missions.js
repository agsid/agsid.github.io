// Data for the missions.
const missionsData = [
    {
        name: "Mission 1: Ancient Artifacts",
        description: "In this mission, we explored ancient civilizations and their artifacts. We designed a robot to navigate through a maze representing an archaeological site, collecting artifacts along the way.",
        missionvideo: "https://www.youtube.com/shorts/JMRZ-gbSolc",
    },
    {
        name: "Mission 2: Fossil Excavation",
        description: "This mission focused on the excavation of fossils. Our robot was programmed to carefully extract fossil pieces from a designated area without damaging them, simulating a real-life paleontological dig.",
        missionvideo: "https://www.youtube.com/shorts/JMRZ-gbSolc",
    }
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

        // Conditionally render a video or image
        let mediaContent = '';
        if (mission.missionvideo) {
            mediaContent = `
                <div class="card-media">
                    <iframe src="${mission.missionvideo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else {
            mediaContent = `<div class="card-media media-placeholder">No media available.</div>`;
        }

        // Render the mission content
        card.innerHTML = `
            ${mediaContent}
            <div class="mission-content">
                <h1 class="mission-name">${mission.name}</h1>
                <p class="mission-description">${mission.description}</p>
                <a href="${mission.missionvideo}" target="_blank">Visit YouTube Video</a>
            </div>
        `;
        missionsContainer.appendChild(card);
    });
}

// Run this function when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', renderMissions);
