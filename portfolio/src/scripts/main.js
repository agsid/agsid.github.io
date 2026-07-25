import { animate, onScroll } from "animejs";
import { TougeWorld } from "../lib/world.js";
import { PROJECTS } from "../lib/projects.js";

function buildStationSections() {
	const track = document.getElementById("stations-track");
	PROJECTS.forEach((p, i) => {
		const color = p.color;
		const section = document.createElement("section");
		section.className = `section station-section${i % 2 ? " align-right" : ""}`;
		section.id = `station-${p.id}`;
		section.innerHTML = `
			<div class="station-panel" style="--accent-color:${color}">
				<p class="station-index">Stop ${i + 1} / ${PROJECTS.length}</p>
				<h2>${p.title}</h2>
				<p>${p.desc}</p>
				<div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
				<a class="station-link" href="${p.url}" target="_blank" rel="noopener">Visit ${p.title} →</a>
			</div>
		`;
		track.appendChild(section);
	});
}

function spawnPetals() {
	const field = document.querySelector(".petal-field");
	if (!field) return;
	const count = 26;
	for (let i = 0; i < count; i++) {
		const petal = document.createElement("span");
		petal.className = "petal";
		const size = 8 + Math.random() * 10;
		petal.style.left = `${Math.random() * 100}%`;
		petal.style.width = `${size}px`;
		petal.style.height = `${size * 0.8}px`;
		petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
		petal.style.animationDuration = `${7 + Math.random() * 6}s`;
		petal.style.animationDelay = `${Math.random() * -12}s`;
		field.appendChild(petal);
	}
}

function buildOrbitNav() {
	const nav = document.getElementById("orbit-nav");
	const ids = ["overview", ...PROJECTS.map((p) => `station-${p.id}`), "outro"];
	ids.forEach((id) => {
		const dot = document.createElement("a");
		dot.href = `#${id}`;
		dot.dataset.target = id;
		dot.setAttribute("aria-label", id);
		nav.appendChild(dot);
	});
	return { nav, ids };
}

function initSectionObserver(world, ids) {
	const dots = document.querySelectorAll("#orbit-nav a");
	const revealed = new WeakSet();

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const id = entry.target.id;
				if (entry.isIntersecting) {
					dots.forEach((d) => d.classList.toggle("active", d.dataset.target === id));

					world.setChaseDistance(id === "overview" || id === "outro" ? 12 : 9);

					const panel = entry.target.querySelector(".station-panel");
					if (panel && !revealed.has(panel)) {
						revealed.add(panel);
						animate(panel, {
							opacity: [0, 1],
							translateY: [28, 0],
							duration: 700,
							ease: "outQuad",
						});
					}
				}
			});
		},
		{ threshold: 0.45 }
	);

	ids.forEach((id) => {
		const el = document.getElementById(id);
		if (el) observer.observe(el);
	});
}

function playIntro(world) {
	world.car.scale.setScalar(0.001);
	animate(world.car.scale, {
		x: 1,
		y: 1,
		z: 1,
		duration: 900,
		delay: 300,
		ease: "outElastic(1, .6)",
	});

	animate(".hero-topbar", {
		opacity: [0, 1],
		translateY: [-16, 0],
		duration: 700,
		delay: 250,
		ease: "outQuad",
	});
	animate(".hero-headline", {
		opacity: [0, 1],
		translateY: [22, 0],
		duration: 800,
		delay: 450,
		ease: "outQuad",
	});
	animate(".hero-side .lede", {
		opacity: [0, 1],
		translateY: [18, 0],
		duration: 800,
		delay: 650,
		ease: "outQuad",
	});
	animate(".hero-side .scroll-cue", {
		opacity: [0, 1],
		translateY: [12, 0],
		duration: 700,
		delay: 850,
		ease: "outQuad",
	});
	animate(".hero-name", {
		opacity: [0, 1],
		duration: 1000,
		delay: 350,
		ease: "outQuad",
	});
	animate(".hero-portrait img", {
		opacity: [0, 1],
		translateY: [40, 0],
		duration: 1000,
		delay: 500,
		ease: "outExpo",
	});
}

function bindScrollDrive(world) {
	const driveState = { t: 0 };
	animate(driveState, {
		t: 1,
		ease: "linear",
		onUpdate: () => world.setProgress(driveState.t),
		autoplay: onScroll({
			target: "#stations-track",
			enter: "top top",
			leave: "bottom bottom",
			sync: 0.15,
		}),
	});
}

function init() {
	const canvas = document.getElementById("planet-canvas");
	const mount = document.getElementById("planet-mount");
	const world = new TougeWorld({
		canvas,
		mount,
		projects: PROJECTS,
	});
	world.setChaseDistance(12);

	buildStationSections();
	const { ids } = buildOrbitNav();
	initSectionObserver(world, ids);
	bindScrollDrive(world);
	playIntro(world);
	spawnPetals();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
