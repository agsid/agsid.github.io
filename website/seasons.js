// Data for the missions. 
const seasonsData= [
    {
        title: "UNEARTHED Mission 01",
        points: "20",
        videoLink: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=iX9f_2bWd_XjNq2z", // Replace with your YouTube embed link
        description: "The robot performs a simple movement to complete mission #1. This was a challenging mission due to the delicate nature of the models and the precision required for placement. We experimented with several arm designs before finding one that could reliably move both pieces without knocking them over. It was hard to get the alignment just right, but the team put in a lot of effort!",
        image: "./images/missions/Screenshot 2025-09-10 203034.png"
    },
    {
        title: "UNEARTHED Mission 02",
        points: "35",
        videoLink: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with your YouTube embed link
        description: "The robot must knock over the audience model and the augmented reality models. This mission tested our robot's pushing power and ability to target specific elements on the mat. We used a simple push attachment, but getting the robot to approach from the correct angle without disturbing other missions was tricky.",
        image: "https://placehold.co/400x250/0d47a1/FFFFFF?text=Mission+2+Pic"
    },
    {
        title: "UNEARTHED Mission 03",
        points: "30",
        videoLink: "http://googleusercontent.com/youtube.com/3", // Replace with your YouTube embed link
        description: "The robot must get the Augmented Reality models past the augmented reality line. Precision was key here. Our robot needed to gently guide the models across a specific line without pushing them too far or losing control. We utilized a light sensor to detect the line and ensure accurate movement.",
        image: "https://placehold.co/400x250/0d47a1/FFFFFF?text=Mission+3+Pic"
    },
    {
        title: "UNEARTHED Mission 04",
        points: "20",
        videoLink: "http://googleusercontent.com/youtube.com/4", // Replace with your YouTube embed link
        description: "The robot must return the Augmented Reality models to the Audience. This was a simpler retrieval mission, but still required careful navigation. We programmed a path that avoided obstacles and ensured a smooth return to the designated area. The team focused on making this mission highly repeatable.",
        image: "https://placehold.co/400x250/0d47a1/FFFFFF?text=Mission+4+Pic"
    },
    {
        title: "UNEARTHED Mission 05",
        points: "25",
        videoLink: "http://googleusercontent.com/youtube.com/5", // Replace with your YouTube embed link
        description: "The robot must transport a team member from the backstage area to the backstage area (referring to a model piece). This mission was unique and required a creative solution. We designed a small platform on the robot that could safely carry the 'team member' model without it falling off during movement. It was a fun engineering challenge!",
        image: "https://placehold.co/400x250/0d47a1/FFFFFF?text=Mission+5+Pic"
    }
];

function renderMissions() {
    const missionsContainer = document.getElementById('missions-container');
    if (!missionsContainer) {
        console.error("Missions container not found.");
        return;
    }

    missionsContainer.innerHTML = '';

    missionsData.forEach((mission, index) => {
        const card = document.createElement('div');
        card.className = `mission-card`;

        let mediaContent = '';
        let pointsLinkHtml = '';

        if (mission.videoLink) {
            // For a video, we use an iframe and create a link
            mediaContent = `
                <div class="mission-video-wrapper">
                    <iframe src="${mission.videoLink}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen></iframe>
                </div>
            `;
            pointsLinkHtml = `
                <a href="${mission.videoLink}" target="_blank" rel="noopener noreferrer" class="link-text">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.242-1.242m5.243-5.243a4.5 4.5 0 017.244 1.242l4.5 4.5a4.5 4.5 0 01-6.364 6.364l-1.242-1.242m-5.243-5.243l1.242-1.242" />
                    </svg>
                    Link to Video
                </a>
                <p class="oswald-font text-lg text-white mt-2">Points earned: ${mission.points}</p>
            `;
        } else {
            // For an image, we just use the img tag
            mediaContent = `<img src="${mission.image}" alt="${mission.title}" class="mission-media-image" />`;
            pointsLinkHtml = `
                <p class="oswald-font text-lg text-white">Points earned: ${mission.points}</p>
            `;
        }

        card.innerHTML = `
            <div class="mission-content-wrapper">
                <div class="mission-left">
                    <div class="mission-media-container">
                        ${mediaContent}
                    </div>
                    ${pointsLinkHtml}
                </div>
                <div class="mission-right">
                    <h2>FIRST LEGO League</h2>
                    <h1>${mission.title}</h1>
                    <p>${mission.description}</p>
                </div>
            </div>
        `;
        missionsContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderMissions();
});
