// Data for the missions.
const missionsData = [
    {
        name: "UNEARTHED Mission 01",
        points: "20",
        videoLink: "https://www.youtube.com/embed/3DnDIzPDk4Q",
        description: "The robot performs a simple movement to complete mission #1 called the surface brushing.",
        image: "./images/missions/Screenshot 2025-09-10 203034.png",
        alt: "FIRST LEGO League UNEARTHED M01"
    },
    {
        name: "UNEARTHED Mission 02",
        points: "30",
        videoLink: null, 
        description: "The robot preforms a complex sequence to score points.",
        image: "./images/missions/Mission_02.png",
        alt: "FIRST LEGO League UNEARTHED M02"
    },
    {
        name: "UNEARTHED Mission 03",
        points: "40",
        videoLink: null,
        description: "The robot solves a difficult challenge for a high score.",
        image: null, // This image will not be displayed
        alt: "FIRST LEGO League UNEARTHED M03"
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

        // Conditionally render a video or image
        let mediaContent = '';
        if (mission.videoLink) {
            mediaContent = `
                <div class="card-media">
                   <iframe width="462" height="821" src= ${mission.video} title="FLL Mission #1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
            `;
        } else if (mission.image) {
            mediaContent = `<img src="${mission.image}" alt="${mission.alt}" class="card-media">`;
        } else {
            mediaContent = `<div class="card-media media-placeholder">No media available.</div>`;
        }

        card.innerHTML = `
            ${mediaContent}
            <div class="mission-content">
                <h1 class="mission-name">${mission.name}</h1>
                <h4 class="mission-points">Points: ${mission.points}</h4>
                <p class="mission-description">${mission.description}</p>
                ${mission.videoLink ? `<a href="${mission.videoLink}" target="_blank" class="video-link">Watch on YouTube</a>` : ''}
            </div>
        `;
        missionsContainer.appendChild(card);
    });
}

// Run this function when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', renderMissions);  
