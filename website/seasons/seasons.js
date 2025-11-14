async function getTotalPeople() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/11Ewk7kva0PqYLphyYKyIXz63uBwmDFp1Nks6qKfx_LQ/edit?usp=sharing";

  const res = await fetch(csvUrl);
  const text = await res.text();
  const rows = text.trim().split("\n").map(r => r.split(","));
  
  // Find "Total" row
  const totalRow = rows.find(row => row[0].toLowerCase().includes("total"));
  const totalPeople = totalRow ? parseInt(totalRow[1]) : 0;

  return totalPeople;
}

async function buildSeasonsData() {
  const totalPeople = await getTotalPeople();

  const seasonsData = [
    {
      year: "2025-2026",
      title: "Future Season Theme",
      description: `This year we reached ${totalPeople} people through YouTube, 3D models, and our website.`,
      image: "../images/seasons/yr_25-26.jpg",
      alt: "Team Allied Algorithms in the 2025-2026 season",
      hoursSpent: "125",
      peopleImpacted: totalPeople.toString(),
      missionsCompleted: "1"
    },
    {
        year: "2024-2025",
        title: "Submerged",
        description: "Our team dedicated this year to the development of a new robot design, alongside our innovation project. We had no changes to the team. We were lucky enough to have a chance to present our robot and innovation project to our board of education who were not only amazed, but informed about FIRST in their community.",
        image: "../images/seasons/yr_24-25.jpg",
        alt: "Team Wilton Lego Team in the 2024-2025 Submerged season. Scored 2nd place in points at our first competition! During the off season we presented our robot and innovation project to the board of education in our school district."
    },
    {
        year: "2023-2024",
        title: "Masterpiece",
        description: "The 2023-2024 Masterpiece season was truly unforgettable! Our robotics team poured countless hours into designing, building, and programming our robot to tackle the art-themed challenges with precision and creativity. The dedication and teamwork truly paid off, as we made it to states.",
        image: "../images/seasons/yr_23-24.jpg",
        alt: "Team Wilton Lego Team in the 2023-2024 Masterpiece season. We made it to states this year!"
    },
    {
        year: "2022-2023",
        title: "SUPERPOWERED",
        description: "In this high-energy season, our team explored the future of energy, innovating solutions and refining our robot game strategy. We focused on teamwork and problem-solving, leading to significant growth in our programming and collaboration skills. *Add specific accomplishments like awards or project details here.*",
        image: "../images/seasons/yr_22-23.jpg",
        alt: "Team Wilton Lego Team in the 2022-2023 season. We enter the Challenge level for the first time this year, and change our team name from Golden Eagles."
    },
    {
        year: "2021-2022",
        title: "CARGO CONNECT",
        description: "This season was all about reimagining global transportation. Our team designed innovative solutions for efficient cargo delivery and built a robust robot to navigate complex missions. We learned a lot about supply chains and logistics, earning *mention any specific awards or achievements*.",
        image: "../images/seasons/yr_21-22.jpg",
        alt: "Team Golden Eagles in the 2021-2022 season"
    },
     {
        year: "2020-2021",
        title: "RePlay",
        description: "This season was all about reimagining global transportation. Our team designed innovative solutions for efficient cargo delivery and built a robust robot to navigate complex missions. We learned a lot about supply chains and logistics, earning *mention any specific awards or achievements*.",
        image: "../images/seasons/yr_20-21.jpg",
        alt: "Team Golden Eagles in the 2020-2021 season. This was our 1st season as a team."
    }
  ];

  console.log(seasonsData);
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
