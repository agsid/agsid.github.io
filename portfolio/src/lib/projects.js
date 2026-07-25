/* Single source of truth for every project stop along the drive.
   To add a project: append an object here — the road automatically
   spaces stops evenly and alternates which side of the street they're
   on. `color` drives the station's neon sign, glow, and DOM accent. */
export const PROJECTS = [
	{
		id: "robolyst",
		label: "ROBOLYST",
		title: "Robolyst",
		desc: "A robotics-team operations suite from the Robotics Catalyst Foundation — rosters, scouting, and season tools in one place.",
		tags: ["Svelte", "Postgres", "Canva"],
		url: "https://robolyst.org/",
		color: "#4fd1ff",
	},
	{
		id: "singultech",
		label: "SINGULTECH",
		title: "SingulTech",
		desc: "The public site and hub for SingulTech Robotics — team info, sponsors, and season updates.",
		tags: ["Svelte", "Server", "Tailwind"],
		url: "https://singul.tech/",
		color: "#ffb84f",
	},
	{
		id: "ctftc",
		label: "CTFTC",
		title: "CTFTC",
		desc: "A capture-the-flag training ground for cybersecurity practice, with authentication and AI-assisted hints.",
		tags: ["Svelte", "Auth", "AI"],
		url: "https://ctftc.robotics-catalyst.org",
		color: "#ff6f91",
	},
	{
		id: "alliedalgos",
		label: "ALLIEDALGOS",
		title: "AlliedAlgos",
		desc: "A community site for algorithm and competitive-programming enthusiasts, shipped straight to GitHub Pages.",
		tags: ["Astro", "GitHub Pages", "TOML"],
		url: "https://alliedalgos.org",
		color: "#7ee08a",
	},
];

/* even spacing along the usable middle of the road (leaves room at the
   start to get up to speed and at the end for the torii finale), sides
   alternating left/right automatically regardless of project count */
export function deriveStations(projects) {
	return projects.map((project, i) => ({
		...project,
		index: i,
		t: 0.12 + (i / Math.max(1, projects.length - 1 || 1)) * 0.76,
		side: i % 2 === 0 ? 1 : -1,
	}));
}
