const members = [
    {
        name: "Sid Agrawal",
        description: "I am an 8th grader with 6 years of experience in FLL. I love to play with things that move. Outside of robotics I also play the trumpet, and practice Taekwondo.",
        image: "path/to/sid-agrawal-image.jpg" // Replace with a link to your image
    },
    {
        name: "Tanush",
        description: "Description",
        image: "path/to/default-image.jpg"
    },
    {
        name: "Aariv",
        description: "Description",
        image: "path/to/default-image.jpg"
    },
    {
        name: "Sarthek",
        description: "Description",
        image: "path/to/default-image.jpg"
    },
    {
        name: "Mr.Ganesh",
        description: "Description",
        image: "path/to/default-image.jpg"
    },
    {
        name: "Mr.Amit",
        description: "Description",
        image: "path/to/default-image.jpg"
    },
    {
        name: "Mr.Nareddy",
        description: "Description",
        image: "path/to/default-image.jpg"
    }
];

function renderMembers() {
    const membersContainer = document.getElementById('members-container');
    
    // Clear existing content
    membersContainer.innerHTML = '';
    
    members.forEach((member, index) => {
        const memberCard = document.createElement('div');
        memberCard.className = `member-card p-8 text-center flex flex-col justify-center h-full animate-fade-in`;
        memberCard.style.animationDelay = `${index * 0.1}s`; // Stagger animation

        memberCard.innerHTML = `
            <div class="flex-shrink-0 flex justify-center mb-4">
                <div class="profile-icon flex items-center justify-center">
                    <img src="${member.image}" alt="${member.name}" class="w-24 h-24 rounded-full object-cover">
                </div>
            </div>
            <div>
                <h2 class="text-3xl font-bold mb-2">${member.name}</h2>
                <p class="text-lg text-gray-300">${member.description}</p>
            </div>
        `;
        membersContainer.appendChild(memberCard);
    });
}