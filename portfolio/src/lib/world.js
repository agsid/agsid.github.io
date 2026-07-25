import * as THREE from "three";
import { deriveStations } from "./projects.js";

function mulberry32(seed) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rand = mulberry32(2024);

const ROAD_HALF_WIDTH = 3.2;
const TOTAL_LENGTH = 260;

/* the touge: a switchback mountain road climbing away from camera, built
   parametrically (S-curves + steady rise) rather than hand-authored */
function buildPathPoints() {
	const pts = [];
	const N = 48;
	for (let i = 0; i <= N; i++) {
		const u = i / N;
		const x = Math.sin(u * Math.PI * 3.1) * 22 * (0.35 + u * 0.65);
		const z = -u * TOTAL_LENGTH;
		const y = u * 34 + Math.sin(u * Math.PI * 5) * 1.1;
		pts.push(new THREE.Vector3(x, y, z));
	}
	return pts;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function makeLabelSprite(text, colorHex) {
	const cnv = document.createElement("canvas");
	cnv.width = 512;
	cnv.height = 150;
	const ctx = cnv.getContext("2d");
	drawRoundedRect(ctx, 6, 6, 500, 138, 32);
	ctx.fillStyle = "rgba(20,10,10,0.85)";
	ctx.fill();
	ctx.lineWidth = 8;
	ctx.strokeStyle = colorHex;
	ctx.stroke();
	ctx.fillStyle = "#fff8f0";
	ctx.font = "700 56px system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, 256, 78);
	const texture = new THREE.CanvasTexture(cnv);
	texture.anisotropy = 4;
	const sprite = new THREE.Sprite(
		new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
	);
	sprite.scale.set(4.4, 1.3, 1);
	sprite.renderOrder = 10;
	return sprite;
}

/* horizontal roll-shutter blinds for an upper-floor facade */
function makeShutterTexture(base, dark) {
	const cnv = document.createElement("canvas");
	cnv.width = 128;
	cnv.height = 128;
	const ctx = cnv.getContext("2d");
	for (let y = 0; y < cnv.height; y += 10) {
		ctx.fillStyle = y % 20 === 0 ? base : dark;
		ctx.fillRect(0, y, cnv.width, 9);
	}
	return new THREE.CanvasTexture(cnv);
}

/* a grid of warm, mostly-lit izakaya windows */
function makeWarmWindowTexture(cols, rows) {
	const cellW = 48,
		cellH = 48;
	const cnv = document.createElement("canvas");
	cnv.width = cols * cellW;
	cnv.height = rows * cellH;
	const ctx = cnv.getContext("2d");
	ctx.fillStyle = "#2a1c14";
	ctx.fillRect(0, 0, cnv.width, cnv.height);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const lit = rand() < 0.78;
			ctx.fillStyle = lit ? "rgba(255,205,120,0.95)" : "rgba(70,55,45,0.9)";
			const px = c * cellW + cellW * 0.14;
			const py = r * cellH + cellH * 0.16;
			ctx.fillRect(px, py, cellW * 0.72, cellH * 0.68);
		}
	}
	return new THREE.CanvasTexture(cnv);
}

/* scalloped two-tone awning stripes */
function makeAwningTexture(colorHex) {
	const cnv = document.createElement("canvas");
	cnv.width = 160;
	cnv.height = 32;
	const ctx = cnv.getContext("2d");
	for (let x = 0; x < cnv.width; x += 20) {
		ctx.fillStyle = (x / 20) % 2 === 0 ? colorHex : "#fff8f0";
		ctx.fillRect(x, 0, 20, cnv.height);
	}
	const tex = new THREE.CanvasTexture(cnv);
	tex.wrapS = THREE.RepeatWrapping;
	return tex;
}

/* dense office/apartment window grid for the city towers — cool-lit with
   a handful of warm windows breaking up the pattern */
function makeCityWindowTexture(cols, rows) {
	const cellW = 28,
		cellH = 24;
	const cnv = document.createElement("canvas");
	cnv.width = cols * cellW;
	cnv.height = rows * cellH;
	const ctx = cnv.getContext("2d");
	ctx.fillStyle = "#12141c";
	ctx.fillRect(0, 0, cnv.width, cnv.height);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const lit = rand() < 0.4;
			const warm = rand() < 0.3;
			ctx.fillStyle = lit ? (warm ? "rgba(255,205,130,0.9)" : "rgba(180,220,255,0.85)") : "rgba(30,34,46,0.9)";
			const px = c * cellW + cellW * 0.18;
			const py = r * cellH + cellH * 0.18;
			ctx.fillRect(px, py, cellW * 0.64, cellH * 0.64);
		}
	}
	const tex = new THREE.CanvasTexture(cnv);
	tex.anisotropy = 4;
	return tex;
}

/* an abstract glowing neon plaque — blocky glyph-like marks rather than
   real text, evoking Tokyo signage without pretending to translate it */
function makeNeonPlaqueTexture(colorHex) {
	const cnv = document.createElement("canvas");
	cnv.width = 300;
	cnv.height = 80;
	const ctx = cnv.getContext("2d");
	ctx.fillStyle = "rgba(8,6,14,0.9)";
	drawRoundedRect(ctx, 2, 2, 296, 76, 10);
	ctx.fill();
	ctx.shadowColor = colorHex;
	ctx.shadowBlur = 14;
	ctx.strokeStyle = colorHex;
	ctx.lineWidth = 4;
	drawRoundedRect(ctx, 8, 8, 284, 64, 8);
	ctx.stroke();
	ctx.fillStyle = colorHex;
	const glyphCount = 4 + Math.floor(rand() * 3);
	const gap = 260 / glyphCount;
	for (let i = 0; i < glyphCount; i++) {
		const gw = gap * (0.5 + rand() * 0.35);
		const gh = 30 + rand() * 16;
		drawRoundedRect(ctx, 20 + i * gap, 40 - gh / 2, gw, gh, 4);
		ctx.fill();
	}
	ctx.shadowBlur = 0;
	return new THREE.CanvasTexture(cnv);
}

/* the same neon-plaque idea, stacked top-to-bottom for the tall narrow
   freestanding signs common on Japanese city sidewalks */
function makeVerticalNeonTexture(colorHex) {
	const cnv = document.createElement("canvas");
	cnv.width = 90;
	cnv.height = 320;
	const ctx = cnv.getContext("2d");
	ctx.fillStyle = "rgba(8,6,14,0.9)";
	drawRoundedRect(ctx, 2, 2, 86, 316, 10);
	ctx.fill();
	ctx.shadowColor = colorHex;
	ctx.shadowBlur = 14;
	ctx.strokeStyle = colorHex;
	ctx.lineWidth = 4;
	drawRoundedRect(ctx, 8, 8, 74, 304, 8);
	ctx.stroke();
	ctx.fillStyle = colorHex;
	const glyphCount = 3 + Math.floor(rand() * 3);
	const gap = 290 / glyphCount;
	for (let i = 0; i < glyphCount; i++) {
		const gh = gap * (0.5 + rand() * 0.35);
		const gw = 34 + rand() * 18;
		drawRoundedRect(ctx, 45 - gw / 2, 20 + i * gap, gw, gh, 4);
		ctx.fill();
	}
	ctx.shadowBlur = 0;
	return new THREE.CanvasTexture(cnv);
}

function makeSkyTexture() {
	const cnv = document.createElement("canvas");
	cnv.width = 8;
	cnv.height = 256;
	const ctx = cnv.getContext("2d");
	const grad = ctx.createLinearGradient(0, 0, 0, 256);
	grad.addColorStop(0, "#1a1233");
	grad.addColorStop(0.42, "#3c2757");
	grad.addColorStop(0.68, "#a24b6b");
	grad.addColorStop(0.85, "#e8875f");
	grad.addColorStop(1, "#ffd1a8");
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, 8, 256);
	const tex = new THREE.CanvasTexture(cnv);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

function makeToonGradient() {
	const steps = new Uint8Array([80, 150, 210, 255]);
	const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat, THREE.UnsignedByteType);
	tex.minFilter = THREE.NearestFilter;
	tex.magFilter = THREE.NearestFilter;
	tex.needsUpdate = true;
	return tex;
}

export class TougeWorld {
	constructor({ canvas, mount, projects }) {
		this.canvas = canvas;
		this.mount = mount;
		this.timer = new THREE.Timer();
		this.progress = 0;
		this.pointer = { x: 0, y: 0 };
		this.pointerTarget = { x: 0, y: 0 };
		this.chaseDistance = 9;
		this.chaseDistanceTarget = 9;

		this.curve = new THREE.CatmullRomCurve3(buildPathPoints());
		this.curveLength = this.curve.getLength();

		this.scene = new THREE.Scene();
		this.toonGradient = makeToonGradient();

		this._buildSky();
		this.scene.fog = new THREE.FogExp2(0x2c2140, 0.0105);

		this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
		this.baseFov = 58;

		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;

		this._buildLights();
		this._buildGround();
		this._buildRoad();
		this._buildScenery();
		this._buildFlyovers();
		this._buildVerticalSigns();
		this._buildStreetProps();
		this._buildCar();

		this.stations = deriveStations(projects).map((s) => this._buildStation(s));

		this._buildEmbers();

		this._bindPointer();
		this.resize();
		window.addEventListener("resize", () => this.resize());

		this.setProgress(0);
		this._tick = this._tick.bind(this);
		this.renderer.setAnimationLoop(this._tick);
	}

	_buildSky() {
		const geo = new THREE.SphereGeometry(260, 24, 16);
		const mat = new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false });
		this.sky = new THREE.Mesh(geo, mat);
		this.scene.add(this.sky);
	}

	_buildLights() {
		const hemi = new THREE.HemisphereLight(0x8a6fae, 0x241a30, 0.75);
		this.scene.add(hemi);
		const sun = new THREE.DirectionalLight(0xffc38a, 1.2);
		sun.position.set(-40, 40, 20);
		sun.castShadow = true;
		sun.shadow.mapSize.set(1024, 1024);
		this.scene.add(sun);
		const rim = new THREE.DirectionalLight(0x5a6fd8, 0.55);
		rim.position.set(20, 10, -30);
		this.scene.add(rim);
	}

	_toon(color, extra) {
		return new THREE.MeshToonMaterial({ color, gradientMap: this.toonGradient, ...(extra || {}) });
	}

	/* a wide opaque ground/sidewalk ribbon that follows the same curve as
	   the road, sitting just below it — without this there's nothing
	   between the road edge and the buildings and you see straight
	   through to the fog/sky below */
	_buildGround() {
		const N = 220;
		const halfW = ROAD_HALF_WIDTH + 7;
		const positions = [];
		const indices = [];

		for (let i = 0; i <= N; i++) {
			const u = i / N;
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
			const left = p.clone().addScaledVector(side, halfW);
			const right = p.clone().addScaledVector(side, -halfW);
			left.y -= 0.09;
			right.y -= 0.09;
			positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
			if (i < N) {
				const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
				indices.push(a, b, c, b, d, c);
			}
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		const mat = this._toon(0x3d4250, { side: THREE.DoubleSide });
		this.ground = new THREE.Mesh(geo, mat);
		this.ground.receiveShadow = true;
		this.scene.add(this.ground);
	}

	_buildRoad() {
		const N = 220;
		const positions = [];
		const indices = [];
		const dashPositions = [];

		for (let i = 0; i <= N; i++) {
			const u = i / N;
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
			const left = p.clone().addScaledVector(side, ROAD_HALF_WIDTH);
			const right = p.clone().addScaledVector(side, -ROAD_HALF_WIDTH);
			positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

			if (i % 6 < 3) dashPositions.push({ p, side, tangent });

			if (i < N) {
				const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
				indices.push(a, b, c, b, d, c);
			}
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		const mat = this._toon(0x2a2733, { side: THREE.DoubleSide });
		this.road = new THREE.Mesh(geo, mat);
		this.road.receiveShadow = true;
		this.scene.add(this.road);

		const dashGeo = new THREE.BoxGeometry(0.35, 0.04, 1.6);
		const dashMat = this._toon(0xf4d35e);
		this.dashMesh = new THREE.InstancedMesh(dashGeo, dashMat, dashPositions.length);
		const dummy = new THREE.Object3D();
		dashPositions.forEach((d, i) => {
			dummy.position.copy(d.p).addScaledVector(new THREE.Vector3(0, 1, 0), 0.05);
			dummy.lookAt(d.p.clone().add(d.tangent));
			dummy.updateMatrix();
			this.dashMesh.setMatrixAt(i, dummy.matrix);
		});
		this.scene.add(this.dashMesh);
	}

	/* scatter roadside scenery — dense Tokyo blocks, lanterns, and
	   guardrail posts — across a ~260-unit-long elevated city road */
	_buildScenery() {
		const sampleCount = 90;
		const buildingSpecs = [];
		const lanternPositions = [];
		const postPositions = [];

		for (let i = 0; i < sampleCount; i++) {
			const u = 0.03 + (i / sampleCount) * 0.94;
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();

			[-1, 1].forEach((dir) => {
				const edge = p.clone().addScaledVector(side, dir * (ROAD_HALF_WIDTH + 0.6));
				postPositions.push({ pos: edge, tangent });

				if (rand() < 0.7) {
					const w = 3 + rand() * 3.5;
					const d = 3 + rand() * 3;
					const h = 6 + rand() * 20;
					const depth = ROAD_HALF_WIDTH + 1.6 + w / 2 + rand() * 3;
					const pos = p.clone().addScaledVector(side, dir * depth);
					buildingSpecs.push({ pos, roadPoint: p, w, d, h });
				}
				if (i % 6 === 0) {
					const depth = ROAD_HALF_WIDTH + 0.9;
					lanternPositions.push({ pos: p.clone().addScaledVector(side, dir * depth) });
				}
			});
		}

		this._buildCityBuildings(buildingSpecs);
		this._buildDistantSkyline();
		this._buildLanterns(lanternPositions);
		this._buildGuardposts(postPositions);
		this._buildEndTorii();
	}

	/* a Tokyo-style block: a boxy tower with a window-lit facade and 1-2
	   stacked neon plaques facing the road, in varied heights/widths so
	   the skyline reads as dense and irregular rather than repeated */
	_buildCityBuildings(list) {
		const NEON_COLORS = ["#ff4fd8", "#4fd1ff", "#ffb84f", "#ff6f6f", "#7ee08a", "#c792ff"];
		const BODY_TONES = [0x232733, 0x2a2f3d, 0x1e2230, 0x282c38, 0x333a4a];

		this.cityBuildings = list.map((b) => {
			const g = new THREE.Group();
			const bodyMat = new THREE.MeshToonMaterial({
				color: BODY_TONES[Math.floor(rand() * BODY_TONES.length)],
				map: makeCityWindowTexture(Math.max(3, Math.round(b.w * 1.4)), Math.max(5, Math.round(b.h * 1.1))),
				gradientMap: this.toonGradient,
			});
			const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bodyMat);
			body.position.y = b.h / 2;
			body.castShadow = true;
			body.receiveShadow = true;
			g.add(body);

			const cap = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.35, 0.7, b.d * 0.35), this._toon(0x14161c));
			cap.position.y = b.h + 0.35;
			g.add(cap);

			if (rand() < 0.35) {
				const antennaH = b.h * 0.22;
				const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, antennaH, 8), this._toon(0x14161c));
				antenna.position.y = b.h + antennaH / 2 + 0.6;
				g.add(antenna);
			}

			const signCount = 1 + Math.floor(rand() * 2);
			for (let i = 0; i < signCount; i++) {
				const nc = NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)];
				const signW = Math.min(b.w * 0.8, 2.4);
				const signH = 0.55;
				const signMat = new THREE.MeshBasicMaterial({
					map: makeNeonPlaqueTexture(nc),
					transparent: true,
					depthWrite: false,
				});
				const sign = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), signMat);
				sign.position.set((rand() - 0.5) * (b.w - signW), 1.4 + i * 1.5 + rand() * 0.6, -b.d / 2 - 0.03);
				g.add(sign);
			}

			g.position.copy(b.pos);
			g.lookAt(b.roadPoint);
			this.scene.add(g);
			return g;
		});
	}

	/* a scatter of hazy silhouette towers around the perimeter so the city
	   reads as endless in every direction, not just where real buildings
	   were placed — fog does the heavy lifting to sell the depth */
	_buildDistantSkyline() {
		const count = 16;
		const silhouetteMat = new THREE.MeshBasicMaterial({ color: 0x1b1830, fog: true });
		const litMat = new THREE.MeshBasicMaterial({ color: 0xffcf8a, transparent: true, opacity: 0.85 });

		this.distantSkyline = [];
		for (let i = 0; i < count; i++) {
			const u = rand();
			const p = this.curve.getPointAt(u);
			const angle = rand() * Math.PI * 2;
			const dist = 90 + rand() * 90;
			const w = 6 + rand() * 10;
			const h = 20 + rand() * 60;
			const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), silhouetteMat);
			tower.position.set(p.x + Math.cos(angle) * dist, h / 2 - 3, p.z + Math.sin(angle) * dist);
			this.scene.add(tower);
			this.distantSkyline.push(tower);

			for (let s = 0; s < 4; s++) {
				const dot = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), litMat);
				dot.position.set(
					tower.position.x + (rand() - 0.5) * w,
					rand() * h,
					tower.position.z + w / 2 + 0.1
				);
				this.scene.add(dot);
			}
		}
	}

	/* Shuto-expressway-style overpasses crossing above the main road —
	   a deck on stilts, angled across the road at a handful of points */
	_buildFlyovers() {
		const points = [0.22, 0.5, 0.78];
		const concrete = this._toon(0x565b66);
		const rail = this._toon(0x2a2e36);
		const deckLen = 46;
		const deckHeight = 9;

		this.flyovers = points.map((u) => {
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();

			const g = new THREE.Group();
			const deck = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, deckLen), concrete);
			deck.castShadow = true;
			deck.receiveShadow = true;
			g.add(deck);

			[-2.15, 2.15].forEach((sx) => {
				const railing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, deckLen), rail);
				railing.position.set(sx, 0.55, 0);
				g.add(railing);
			});

			const pillarCount = 4;
			for (let i = 0; i < pillarCount; i++) {
				const t = (i / (pillarCount - 1) - 0.5) * deckLen * 0.85;
				const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, deckHeight, 12), concrete);
				pillar.position.set(0, -deckHeight / 2, t);
				pillar.castShadow = true;
				g.add(pillar);
			}

			g.position.copy(p).addScaledVector(up, deckHeight);
			g.lookAt(g.position.clone().add(side));
			this.scene.add(g);
			return g;
		});
	}

	/* tall freestanding vertical neon signs planted along the sidewalk */
	_buildVerticalSigns() {
		const NEON_COLORS = ["#ff4fd8", "#4fd1ff", "#ffb84f", "#7ee08a", "#c792ff"];
		const poleMat = this._toon(0x24262c);
		const points = [0.08, 0.2, 0.32, 0.46, 0.58, 0.7, 0.83, 0.92];

		this.verticalSigns = points.map((u, i) => {
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
			const dir = i % 2 === 0 ? 1 : -1;
			const anchor = p.clone().addScaledVector(side, dir * (ROAD_HALF_WIDTH + 2.4));

			const g = new THREE.Group();
			const poleHeight = 4.6;
			const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, poleHeight, 8), poleMat);
			pole.position.y = poleHeight / 2;
			pole.castShadow = true;
			g.add(pole);

			const nc = NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)];
			const signMat = new THREE.MeshBasicMaterial({
				map: makeVerticalNeonTexture(nc),
				transparent: true,
				depthWrite: false,
			});
			const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 2.7), signMat);
			sign.position.set(0, poleHeight * 0.62, 0.05);
			g.add(sign);
			const signBack = sign.clone();
			signBack.rotation.y = Math.PI;
			g.add(signBack);

			g.position.copy(anchor);
			g.lookAt(p);
			this.scene.add(g);
			return g;
		});
	}

	/* small roadside flavor props — vending machines and mini shrines —
	   scattered along the sidewalk between the main project stops */
	_buildStreetProps() {
		const points = [0.05, 0.17, 0.28, 0.44, 0.55, 0.66, 0.74, 0.89, 0.96];
		const vendingPalettes = [
			[0xd6303a, 0xffffff],
			[0x2a6fd6, 0xffe08a],
			[0x2a9d5c, 0xffffff],
		];

		this.streetProps = points.map((u, i) => {
			const p = this.curve.getPointAt(u);
			const tangent = this.curve.getTangentAt(u);
			const up = new THREE.Vector3(0, 1, 0);
			const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
			const dir = i % 2 === 0 ? -1 : 1;
			const anchor = p.clone().addScaledVector(side, dir * (ROAD_HALF_WIDTH + 1.1));

			const g = new THREE.Group();

			if (i % 3 === 0) {
				/* mini roadside shrine gate, distinct from the big finale torii */
				const red = this._toon(0xb2352a);
				[-0.55, 0.55].forEach((sx) => {
					const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.6, 8), red);
					post.position.set(sx, 0.8, 0);
					g.add(post);
				});
				const beam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.18), red);
				beam.position.set(0, 1.45, 0);
				g.add(beam);
				const topBeam = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.22), red);
				topBeam.position.set(0, 1.62, 0);
				g.add(topBeam);
			} else {
				/* a small glowing vending machine */
				const [body, accent] = vendingPalettes[Math.floor(rand() * vendingPalettes.length)];
				const machine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.5), this._toon(body));
				machine.position.y = 0.75;
				machine.castShadow = true;
				g.add(machine);
				const panelMat = new THREE.MeshToonMaterial({
					color: accent,
					emissive: accent,
					emissiveIntensity: 0.6,
					gradientMap: this.toonGradient,
				});
				const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.9), panelMat);
				panel.position.set(0, 0.85, -0.26);
				g.add(panel);
			}

			g.position.copy(anchor);
			g.lookAt(p);
			this.scene.add(g);
			return g;
		});
	}

	_buildLanterns(list) {
		const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8);
		const postMat = this._toon(0x3a2a20);
		const headGeo = new THREE.SphereGeometry(0.26, 12, 8);
		const headMat = new THREE.MeshToonMaterial({
			color: 0xffd27a,
			emissive: 0xff9d3f,
			emissiveIntensity: 0.9,
			gradientMap: this.toonGradient,
		});
		this.lanternPosts = new THREE.InstancedMesh(postGeo, postMat, list.length);
		this.lanternHeads = new THREE.InstancedMesh(headGeo, headMat, list.length);
		const dummy = new THREE.Object3D();
		list.forEach((l, i) => {
			dummy.position.copy(l.pos).setY(l.pos.y + 0.85);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			this.lanternPosts.setMatrixAt(i, dummy.matrix);
			dummy.position.copy(l.pos).setY(l.pos.y + 1.75);
			dummy.updateMatrix();
			this.lanternHeads.setMatrixAt(i, dummy.matrix);
		});
		this.scene.add(this.lanternPosts, this.lanternHeads);
	}

	_buildGuardposts(list) {
		const geo = new THREE.BoxGeometry(0.14, 0.6, 0.14);
		const mat = this._toon(0xe8e8e8);
		this.guardposts = new THREE.InstancedMesh(geo, mat, list.length);
		const dummy = new THREE.Object3D();
		list.forEach((g, i) => {
			dummy.position.copy(g.pos).setY(g.pos.y + 0.3);
			dummy.updateMatrix();
			this.guardposts.setMatrixAt(i, dummy.matrix);
		});
		this.scene.add(this.guardposts);
	}

	/* a grand torii straddling the road right near the end of the drive —
	   the "journey complete" gate the car arrives at as the page reaches
	   the contact/outro section */
	_buildEndTorii() {
		const u = 0.975;
		const p = this.curve.getPointAt(u);
		const tangent = this.curve.getTangentAt(u);

		const g = new THREE.Group();
		const red = this._toon(0xb2352a);
		const black = this._toon(0x181210);
		const pillarHeight = 6.4;
		const halfSpan = ROAD_HALF_WIDTH + 1.1;

		[-1, 1].forEach((dir) => {
			const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, pillarHeight, 16), red);
			pillar.position.set(dir * halfSpan, pillarHeight / 2, 0);
			pillar.castShadow = true;
			g.add(pillar);
			const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.35, 16), black);
			ring.position.set(dir * halfSpan, pillarHeight * 0.8, 0);
			g.add(ring);
		});

		const nuki = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 2 + 0.7, 0.42, 0.5), red);
		nuki.position.set(0, pillarHeight * 0.62, 0);
		g.add(nuki);

		const kasagiUnder = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 2 + 1.2, 0.28, 0.55), black);
		kasagiUnder.position.set(0, pillarHeight + 0.06, 0);
		g.add(kasagiUnder);

		const kasagi = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 2 + 1.9, 0.42, 0.75), red);
		kasagi.position.set(0, pillarHeight + 0.38, 0);
		kasagi.castShadow = true;
		g.add(kasagi);

		[-1, 1].forEach((dir) => {
			const tip = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 0.7), red);
			tip.position.set(dir * (halfSpan + 1.0), pillarHeight + 0.62, 0);
			tip.rotation.z = -dir * 0.32;
			g.add(tip);
		});

		g.position.copy(p);
		g.lookAt(p.clone().add(tangent));
		this.scene.add(g);
		this.endTorii = g;
	}

	/* a boxy '99 Skyline GT-R silhouette: Bayside Blue paint, quad round
	   tails, and the signature rear wing — built low-poly/toon to match
	   the rest of the world rather than aiming for a literal replica */
	_buildCar() {
		const g = new THREE.Group();
		const body = this._toon(0x1a4fa0);
		const bodyDark = this._toon(0x123a7c);
		const glass = this._toon(0x141a24);
		const trim = this._toon(0x14161c);
		const gold = this._toon(0xc9a85c);
		const tire = this._toon(0x111214);
		const chromeMat = this._toon(0xd7dde6);

		const lower = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.5, 4.1), body);
		lower.position.y = 0.46;
		lower.castShadow = true;
		g.add(lower);

		/* rocker panels + fender flares give the silhouette a wider,
		   widebody stance instead of one flat slab */
		const rocker = new THREE.Mesh(new THREE.BoxGeometry(2.03, 0.16, 4.1), trim);
		rocker.position.y = 0.22;
		g.add(rocker);

		[-1.02, 1.02].forEach((sx) => {
			[-1.35, 1.35].forEach((sz) => {
				const flare = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.9), bodyDark);
				flare.position.set(sx, 0.42, sz);
				g.add(flare);
			});
		});

		/* character line: a thin darker strip along the doors */
		[-0.99, 0.99].forEach((sx) => {
			const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 2.4), bodyDark);
			line.position.set(sx, 0.66, -0.1);
			g.add(line);
		});

		const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.46, 1.95), glass);
		cabin.position.set(0, 0.98, -0.15);
		cabin.castShadow = true;
		g.add(cabin);

		/* raked windshield + rear glass instead of flat vertical panels */
		const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.5, 0.06), glass);
		windshield.position.set(0, 1.0, 0.78);
		windshield.rotation.x = 0.42;
		g.add(windshield);
		const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.46, 0.06), glass);
		rearGlass.position.set(0, 1.0, -1.08);
		rearGlass.rotation.x = -0.36;
		g.add(rearGlass);

		/* greenhouse pillars frame the glass for a more "finished" look */
		[-0.79, 0.79].forEach((sx) => {
			[-0.15, 0.9, -1.05].forEach((sz) => {
				const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.1), trim);
				pillar.position.set(sx, 0.98, sz);
				g.add(pillar);
			});
		});

		const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.45), body);
		roof.position.set(0, 1.24, -0.15);
		roof.castShadow = true;
		g.add(roof);

		[-0.5, 0.5].forEach((sx) => {
			const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.22), body);
			mirror.position.set(sx, 0.92, 0.95);
			g.add(mirror);
		});

		const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), trim);
		antenna.position.set(-0.6, 1.42, -0.9);
		antenna.rotation.z = -0.15;
		g.add(antenna);

		const nose = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.4, 0.9), body);
		nose.position.set(0, 0.44, 2.05);
		g.add(nose);

		const hoodVent = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), trim);
		hoodVent.position.set(0, 0.66, 1.75);
		g.add(hoodVent);

		const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.32, 0.32), trim);
		bumper.position.set(0, 0.28, 2.45);
		g.add(bumper);

		const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.05, 0.2), trim);
		splitter.position.set(0, 0.1, 2.55);
		g.add(splitter);

		const grille = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.05), trim);
		grille.position.set(0, 0.4, 2.6);
		g.add(grille);

		/* front brake-cooling ducts flanking the grille */
		[-0.75, 0.75].forEach((sx) => {
			const duct = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.05), trim);
			duct.position.set(sx, 0.3, 2.6);
			g.add(duct);
		});

		const headlightMat = new THREE.MeshToonMaterial({
			color: 0xfff6d8,
			emissive: 0xfff0b0,
			emissiveIntensity: 1,
			gradientMap: this.toonGradient,
		});
		[-0.66, 0.66].forEach((sx) => {
			const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.1), headlightMat);
			hl.position.set(sx, 0.48, 2.45);
			g.add(hl);
		});

		/* the R34's signature: two round tail lamps per side, set into
		   a dark garnish panel rather than floating on the body */
		const tailPanel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.34, 0.1), trim);
		tailPanel.position.set(0, 0.58, -2.0);
		g.add(tailPanel);

		const tailMat = new THREE.MeshToonMaterial({
			color: 0xff2c2c,
			emissive: 0xff1f1f,
			emissiveIntensity: 0.85,
			gradientMap: this.toonGradient,
		});
		[-0.62, -0.3, 0.3, 0.62].forEach((sx) => {
			const tl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 14), tailMat);
			tl.rotation.x = Math.PI / 2;
			tl.position.set(sx, 0.58, -2.04);
			g.add(tl);
		});

		const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.03), this._toon(0xf3f0e6));
		plate.position.set(0, 0.32, -2.1);
		g.add(plate);

		[-0.35, 0.35].forEach((sx) => {
			const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 14), chromeMat);
			exhaust.rotation.x = Math.PI / 2;
			exhaust.position.set(sx, 0.24, -2.15);
			g.add(exhaust);
		});

		const wing = this._toon(0x14161c);
		[-0.85, 0.85].forEach((sx) => {
			const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.15), wing);
			strut.position.set(sx, 1.1, -1.75);
			g.add(strut);
		});
		const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2, 0.07, 0.5), wing);
		wingBlade.position.set(0, 1.32, -1.75);
		g.add(wingBlade);
		const wingEndplates = [-1.0, 1.0];
		wingEndplates.forEach((sx) => {
			const plate2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.5), wing);
			plate2.position.set(sx, 1.32, -1.75);
			g.add(plate2);
		});

		this.wheels = [];
		[
			[-1.02, -1.35],
			[1.02, -1.35],
			[-1.02, 1.35],
			[1.02, 1.35],
		].forEach(([wx, wz]) => {
			const wheelGroup = new THREE.Group();
			const tireM = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 20), tire);
			tireM.rotation.z = Math.PI / 2;
			tireM.castShadow = true;
			wheelGroup.add(tireM);
			const rimM = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 18), gold);
			rimM.rotation.z = Math.PI / 2;
			wheelGroup.add(rimM);
			const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.32, 12), chromeMat);
			hub.rotation.z = Math.PI / 2;
			wheelGroup.add(hub);
			for (let i = 0; i < 5; i++) {
				const a = (i / 5) * Math.PI * 2;
				const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), gold);
				spoke.position.set(0.16, Math.cos(a) * 0.16, Math.sin(a) * 0.16);
				spoke.rotation.x = a;
				wheelGroup.add(spoke);
			}
			wheelGroup.position.set(wx, 0.42, wz);
			g.add(wheelGroup);
			this.wheels.push(wheelGroup);
		});

		this.car = g;
		this.scene.add(g);
	}

	/* each project stop is a tiny glowing izakaya shopfront: shutter band,
	   lit window band, striped awning, hanging paper lanterns, and a neon
	   project sign — the front face sits at local -z so it faces the road
	   once the group is lookAt()'d toward the curve */
	_buildStation(station) {
		const BUILDING_COLORS = [0xc9a24b, 0x7a8a4a, 0xb2584a, 0x4a7a82];
		const p = this.curve.getPointAt(station.t);
		const tangent = this.curve.getTangentAt(station.t);
		const up = new THREE.Vector3(0, 1, 0);
		const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
		const anchor = p.clone().addScaledVector(side, station.side * (ROAD_HALF_WIDTH + 1.9));

		const g = new THREE.Group();
		const color = new THREE.Color(station.color);
		const buildingColor = BUILDING_COLORS[station.index % BUILDING_COLORS.length];
		const buildingMat = this._toon(buildingColor);
		const trim = this._toon(0x241a16);

		const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 1.4), buildingMat);
		body.position.set(0, 2.1, 0);
		body.castShadow = true;
		body.receiveShadow = true;
		g.add(body);

		const cornice = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 1.6), trim);
		cornice.position.set(0, 4.3, 0);
		g.add(cornice);

		const shutterMat = new THREE.MeshToonMaterial({
			map: makeShutterTexture("#d8b96a", "#3a2c1c"),
			gradientMap: this.toonGradient,
		});
		const shutter = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), shutterMat);
		shutter.position.set(0, 3.5, -0.71);
		g.add(shutter);

		const windowMat = new THREE.MeshToonMaterial({
			map: makeWarmWindowTexture(6, 4),
			gradientMap: this.toonGradient,
		});
		const windowBand = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), windowMat);
		windowBand.position.set(0, 1.85, -0.71);
		g.add(windowBand);

		const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.06), trim);
		door.position.set(0, 0.65, -0.71);
		g.add(door);

		/* striped awning over the entrance, tilted outward toward the road */
		const awningMat = new THREE.MeshToonMaterial({
			map: makeAwningTexture(station.color),
			gradientMap: this.toonGradient,
		});
		const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.8), awningMat);
		awning.position.set(0, 1.35, -1.1);
		awning.rotation.x = -0.28;
		awning.castShadow = true;
		g.add(awning);

		/* project sign: a bracket-mounted board reusing the always-legible
		   billboard sprite, hung out over the road like a real shop sign */
		const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), trim);
		bracket.position.set(1.3, 3.6, -0.9);
		g.add(bracket);
		const label = makeLabelSprite(station.label, station.color);
		label.scale.set(2.4, 0.72, 1);
		label.position.set(1.55, 3.35, -1.1);
		g.add(label);

		const glowMat = new THREE.MeshToonMaterial({
			color,
			emissive: color,
			emissiveIntensity: 0.85,
			gradientMap: this.toonGradient,
		});
		const lanternPositions = [
			[-0.85, 1.15, -1.05],
			[0.5, 1.15, -1.05],
		];
		const lanterns = lanternPositions.map(([lx, ly, lz]) => {
			const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glowMat);
			lantern.position.set(lx, ly, lz);
			g.add(lantern);
			return lantern;
		});

		/* a couple of stacked crates at the base for street clutter */
		[
			[-1.35, 0.22, -0.4, 0x8a6a4a],
			[-1.1, 0.4, -0.55, 0x6a5040],
		].forEach(([cx, cy, cz, c]) => {
			const crate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), this._toon(c));
			crate.position.set(cx, cy, cz);
			crate.rotation.y = rand() * 0.6;
			g.add(crate);
		});

		g.position.copy(anchor);
		g.lookAt(p);
		g.userData.glows = lanterns;
		g.userData.pulseSeed = rand() * Math.PI * 2;
		this.scene.add(g);
		return g;
	}

	/* drifting neon-lit dust motes standing in for city night atmosphere —
	   same gentle fall-and-respawn mechanic as before, just recolored */
	_buildEmbers() {
		const count = 260;
		const positions = new Float32Array(count * 3);
		this.emberSeeds = [];
		for (let i = 0; i < count; i++) {
			const u = rand();
			const p = this.curve.getPointAt(u);
			positions[i * 3] = p.x + (rand() - 0.5) * 26;
			positions[i * 3 + 1] = p.y + rand() * 14;
			positions[i * 3 + 2] = p.z + (rand() - 0.5) * 26;
			this.emberSeeds.push(rand() * Math.PI * 2);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		const mat = new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.3, transparent: true, opacity: 0.85 });
		this.embers = new THREE.Points(geo, mat);
		this.scene.add(this.embers);
	}

	_bindPointer() {
		window.addEventListener("pointermove", (e) => {
			this.pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
			this.pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
		});
	}

	setProgress(t) {
		this.progress = Math.max(0, Math.min(1, t));
	}

	setChaseDistance(d) {
		this.chaseDistanceTarget = d;
	}

	resize() {
		const w = this.mount.clientWidth;
		const h = this.mount.clientHeight;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
	}

	_tick(timestamp) {
		this.timer.update(timestamp);
		const dt = Math.min(this.timer.getDelta(), 0.05);
		const t = this.timer.getElapsed();

		this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.05;
		this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.05;

		const eps = 0.0015;
		const u = Math.max(eps, Math.min(1 - eps, this.progress));
		const carPos = this.curve.getPointAt(u);
		const tangent = this.curve.getTangentAt(u).normalize();
		const tangentAhead = this.curve.getTangentAt(Math.min(1 - eps, u + eps)).normalize();

		const speed = Math.abs(this._lastU !== undefined ? u - this._lastU : 0) / dt;
		this._lastU = u;
		const arcSpeed = speed * this.curveLength;

		this.car.position.copy(carPos);
		const lookTarget = carPos.clone().add(tangent);
		this.car.up.set(0, 1, 0);
		this.car.lookAt(lookTarget);

		const turn = new THREE.Vector3().crossVectors(tangent, tangentAhead).y;
		const bank = THREE.MathUtils.clamp(-turn * 220, -0.45, 0.45);
		this.car.rotation.z = THREE.MathUtils.damp(this.car.rotation.z, bank, 4, dt);

		this.wheels.forEach((w) => {
			w.rotation.x -= arcSpeed * dt * 0.9 + dt * 0.3;
		});

		this.chaseDistance += (this.chaseDistanceTarget - this.chaseDistance) * 0.04;
		const up = new THREE.Vector3(0, 1, 0);
		const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
		const camPos = carPos
			.clone()
			.addScaledVector(tangent, -this.chaseDistance)
			.addScaledVector(up, 3.1)
			.addScaledVector(side, this.pointer.x * 1.2);
		this.camera.position.lerp(camPos, 1 - Math.pow(0.001, dt));
		const camLook = carPos.clone().addScaledVector(tangent, 6).addScaledVector(up, 1.4 - this.pointer.y * 0.6);
		this.camera.lookAt(camLook);
		this.camera.fov = this.baseFov + Math.min(8, arcSpeed * 4);
		this.camera.updateProjectionMatrix();

		this.stations.forEach((s) => {
			const pulse = 0.7 + Math.sin(t * 2 + s.userData.pulseSeed) * 0.3;
			s.userData.glows.forEach((glow) => {
				glow.material.emissiveIntensity = pulse;
			});
		});

		const positions = this.embers.geometry.attributes.position;
		for (let i = 0; i < this.emberSeeds.length; i++) {
			let y = positions.getY(i) - dt * 0.9;
			const seed = this.emberSeeds[i];
			let x = positions.getX(i) + Math.sin(t * 0.6 + seed) * dt * 0.4;
			if (y < carPos.y - 2) y = carPos.y + 14 + rand() * 4;
			positions.setXYZ(i, x, y, positions.getZ(i));
		}
		positions.needsUpdate = true;

		this.sky.position.copy(this.camera.position);

		this.renderer.render(this.scene, this.camera);
	}
}
