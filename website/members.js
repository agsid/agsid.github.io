const members = [
    {
        id: 1,
        name: "Sid Agrawal",
        role: "Build and Code",
        bio: "I am an 8th grader with 6 years of experience in FLL. I love to play with things that move. Outside of robotics I also play the trumpet and practice Taekwondo.",
        image: "images/aboutus/sid.jpg"
    },
    {
        id: 2,
        name: "Ariv Mulki",
        role: "Design Lead",
        bio: "",
        image: "images/aboutus/aariv.png"
    },
    {
        id: 3,
        name: "Tanush Nardeddy",
        role: "Code Lead",
        bio: "",
        image: "images/aboutus/tanush.jpg"
    },
    {
        id: 4,
        name: "Ganesh Mulki",
        role: "Coach",
        bio: "Drives brand growth",
        image: "https://cdn.dribbble.com/userupload/24896180/file/original-c250b2ac5ee879252e2b7703f70ed95a.gif"
    },
    {
        id: 5,
        name: "Amit Agrawal",
        role: "Coach",
        bio: "Bridges the gap between technical teams",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    },
    {
        id: 6,
        name: "Shashi Nareddy",
        role: "Mentor",
        bio: "",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    },
    {
        id: 7,
        name: "Sarthak Shetty",
        role: "Coach",
        bio: "Bridges the gap between technical teams",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    },
    {
        id: 8,
        name: "Sandeep Shetty",
        role: "Mentor",
        bio: "Bridges the gap between technical teams",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    }
];

function renderMembers() {
    const container = document.getElementById('members-container');
    if (!container) return;

    container.innerHTML = members.map(member => `
        <div class="member-card animate-fade-in">
            <div class="profile-icon">
                <img src="${member.image}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9999px;">
            </div>
            <div class="card-content">
                <h3>${member.name}</h3>
                <p style="color: #00fff9; font-weight: 500;">${member.role}</p>
                ${member.bio ? `<p>${member.bio}</p>` : ""}
            </div>
        </div>
    `).join('');
}

// (Optional, if you want to support direct script loading)
// document.addEventListener('DOMContentLoaded', renderMembers);
