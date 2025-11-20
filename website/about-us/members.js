const members = [
    {
        id: 1,
        name: "Sid Agrawal",
        role: "Build and Website Lead",
        bio: "I am an 8th grader with 6 years of experience in FLL. I love to play with things that move. Outside of robotics I also play the trumpet and practice Taekwondo.",
        image: "https://st.depositphotos.com/1779253/5140/v/450/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg"
    },
    {
        id: 2,
        name: "Aariv Mulki",
        role: "Programming Lead",
        bio: "I have been doing FLL since the pandemic. Outside of FLL, I like math and social studies. I have played the clarinet and currently play the violin. I enjoy acting in the Wilton Children’s Theater and play tennis.",
        image: "https://st.depositphotos.com/1779253/5140/v/450/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg"
    },
    {
        id: 3,
        name: "Tanush Nardeddy",
        role: "Strategy Lead",
        bio: "I'm in 8th grade. I love to code and uild with legos. Outside of robotics I play the violin and do fencing.",
        image: "https://st.depositphotos.com/1779253/5140/v/450/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg"
    },
        {
        id: 4,
        name: "Sarthak Shetty",
        role: "Outreach and Research",
        bio: "I am a 7th grader who loves to read and do math. I am an extremely curious person and love to learn new things.I am new to FLL and have over 5 years of experience of coding in Scratch and Python.",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    },
    {
        id: 5,
        name: "Ganesh Mulki",
        role: "Coach",
        bio: "Drives brand growth",
        image: "https://cdn.dribbble.com/userupload/24896180/file/original-c250b2ac5ee879252e2b7703f70ed95a.gif"
    },
    {
        id: 6,
        name: "Amit Agrawal",
        role: "Coach",
        bio: "Bridges the gap between technical teams",
        image: "https://i.pinimg.com/originals/d9/92/64/d99264eefc942c2d10ef0521ab0656ff.gif"
    },
    {
        id: 7,
        name: "Shashi Nareddy",
        role: "Mentor",
        bio: "",
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