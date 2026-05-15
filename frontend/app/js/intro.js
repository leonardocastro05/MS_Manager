/**
 * MS Manager - Optimized 3D Cinematic Intro
 * High-performance Three.js racing intro
 * Optimized for smooth 60fps on all devices
 */

class CinematicIntro3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cars = [];
        this.animationId = null;
        this.startTime = 0;
        this.isRunning = false;
        this.titleShown = false;

        // Performance settings
        this.targetFPS = 60;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / this.targetFPS;

        // Timing
        this.introDuration = 7000; // 7 seconds
        this.flashTimes = [1.5, 3.0, 4.5]; // Camera change moments

        // DOM elements
        this.canvas = null;
        this.introScreen = document.getElementById('intro-screen');
        this.authScreen = document.getElementById('auth-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');

        this.loadingMessages = [
            'Cargando circuito...',
            'Preparando monoplazas...',
            'Verificando telemetría...',
            'Posicionando en parrilla...',
            'Calentando neumáticos...',
            '¡LUCES APAGADAS!'
        ];

        this.progress = 0;
        this.isLoopMode = false;
    }

    async init() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, falling back to CSS intro');
            this.skipVideoAndStart();
            return;
        }

        try {
            // Build the 3D scene silently while the video plays
            this.setupRenderer();
            this.setupScene();
            this.setupCamera();
            this.setupLighting();
            this.createTrack();
            this.createFinishLine();
            this.createCars();
            this.bindEvents();
            // Start rendering silently (hidden behind the video)
            this.start();
        } catch (error) {
            console.error('3D Intro error:', error);
            this.skipVideoAndStart();
        }
    }

    // Called when video ends or is skipped
    onVideoEnd() {
        // Play bg music when video finishes or is skipped
        if (!this.bgMusicPlayed) {
            this.bgMusicPlayed = true;
            const bgMusic = new Audio('img/videos/Redline_Pursuit.mp3');
            bgMusic.loop = true;
            bgMusic.volume = 0.4;

            const playMusic = () => {
                bgMusic.play().then(() => {
                    document.body.removeEventListener('click', playMusic);
                    document.body.removeEventListener('keydown', playMusic);
                }).catch(e => console.warn('Audio playback prevented by browser:', e));
            };

            playMusic();
            document.body.addEventListener('click', playMusic);
            document.body.addEventListener('keydown', playMusic);
        }

        const videoIntro = document.getElementById('video-intro');
        if (!videoIntro) { this.startLoading(); return; }

        videoIntro.classList.add('fade-out');

        setTimeout(() => {
            videoIntro.style.display = 'none';
            // Reveal the 3D canvas and start the cinematic cameras
            this.introScreen.style.opacity = '1';
            this.introScreen.style.transition = 'opacity 0.6s ease';
            this.introScreen.style.pointerEvents = 'auto';
            // Restart the animation clock so cameras start from 0
            this.startTime = performance.now();
            this.titleShown = false;
            this.startLoading();
        }, 1000);
    }

    skipVideoAndStart() {
        const videoIntro = document.getElementById('video-intro');
        if (videoIntro) videoIntro.style.display = 'none';
        this.introScreen.style.opacity = '1';
        this.introScreen.style.pointerEvents = 'auto';
        this.fallbackToCSSIntro();
    }

    setupRenderer() {
        this.canvas = document.getElementById('intro-canvas');
        if (!this.canvas) {
            // Create canvas if not exists
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'intro-canvas';
            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
            this.introScreen.insertBefore(this.canvas, this.introScreen.firstChild);
        }

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });

        // Limit pixel ratio for performance
        const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Optimized shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Fastest shadow type

        // Tone mapping for cinematic look
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a15);
        this.scene.fog = new THREE.Fog(0x0a0a15, 40, 120);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.5,
            200
        );
        this.camera.position.set(0, 3, -10);
        this.camera.lookAt(0, 0, 10);
    }

    setupLighting() {
        // Ambient light - soft global illumination
        const ambient = new THREE.AmbientLight(0x404060, 0.8);
        this.scene.add(ambient);

        // Main directional light (sun) - with shadows
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(-5, 15, -5);
        sun.castShadow = true;

        // Optimized shadow camera
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 50;
        sun.shadow.mapSize.width = 1024; // Lower resolution for performance
        sun.shadow.mapSize.height = 1024;
        sun.shadow.bias = -0.001;
        this.scene.add(sun);

        // Back rim light for drama
        const backLight = new THREE.DirectionalLight(0x4488ff, 0.5);
        backLight.position.set(0, 5, 20);
        this.scene.add(backLight);

        // Red accent light from behind
        const redLight = new THREE.PointLight(0xff2200, 0.8, 30);
        redLight.position.set(0, 2, 25);
        this.scene.add(redLight);
    }

    createTrack() {
        // Single track plane (optimized - one draw call)
        const trackGeo = new THREE.PlaneGeometry(16, 1500, 1, 1);
        const trackMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0
        });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = -Math.PI / 2;
        track.position.z = -100;
        track.receiveShadow = true;
        this.scene.add(track);

        // Track lines using a single merged geometry
        this.createTrackLines();

        // Side barriers (simplified)
        this.createBarriers();
    }

    createTrackLines() {
        // White side lines
        const lineGeo = new THREE.BoxGeometry(0.3, 0.05, 1500);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const leftLine = new THREE.Mesh(lineGeo, lineMat);
        leftLine.position.set(-7, 0.03, -100);
        this.scene.add(leftLine);

        const rightLine = new THREE.Mesh(lineGeo, lineMat);
        rightLine.position.set(7, 0.03, -100);
        this.scene.add(rightLine);

        // Center dashed line (fewer segments)
        const dashGroup = new THREE.Group();
        const dashGeo = new THREE.BoxGeometry(0.2, 0.05, 2);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

        for (let z = -600; z < 400; z += 8) {
            const dash = new THREE.Mesh(dashGeo, dashMat);
            dash.position.set(0, 0.03, z);
            dashGroup.add(dash);
        }
        this.scene.add(dashGroup);
    }

    createBarriers() {
        // Red/white barriers using instanced rendering concept
        // But simpler - just two long boxes per side
        const barrierGeo = new THREE.BoxGeometry(0.8, 0.8, 1500);

        // Create striped material with canvas texture (lightweight)
        const stripedTexture = this.createStripedTexture();
        const barrierMat = new THREE.MeshStandardMaterial({
            map: stripedTexture,
            roughness: 0.8
        });

        const leftBarrier = new THREE.Mesh(barrierGeo, barrierMat);
        leftBarrier.position.set(-9, 0.4, -100);
        this.scene.add(leftBarrier);

        const rightBarrier = new THREE.Mesh(barrierGeo, barrierMat);
        rightBarrier.position.set(9, 0.4, -100);
        this.scene.add(rightBarrier);
    }

    createStripedTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Red and white stripes
        const stripeHeight = 8;
        for (let i = 0; i < canvas.height; i += stripeHeight * 2) {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, i, canvas.width, stripeHeight);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, i + stripeHeight, canvas.width, stripeHeight);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 20);
        return texture;
    }

    createFinishLine() {
        // Checkered finish line texture
        const checkerCanvas = document.createElement('canvas');
        checkerCanvas.width = 128;
        checkerCanvas.height = 32;
        const ctx = checkerCanvas.getContext('2d');

        const size = 16;
        for (let x = 0; x < checkerCanvas.width; x += size) {
            for (let y = 0; y < checkerCanvas.height; y += size) {
                ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, size, size);
            }
        }

        const checkerTexture = new THREE.CanvasTexture(checkerCanvas);

        const finishGeo = new THREE.PlaneGeometry(14, 3);
        const finishMat = new THREE.MeshBasicMaterial({
            map: checkerTexture,
            side: THREE.DoubleSide
        });

        const finishLine = new THREE.Mesh(finishGeo, finishMat);
        finishLine.rotation.x = -Math.PI / 2;
        finishLine.position.set(0, 0.02, -10);
        this.scene.add(finishLine);

        // Simple finish gantry (archway)
        const gantryMat = new THREE.MeshStandardMaterial({
            color: 0xe10600,
            emissive: 0xe10600,
            emissiveIntensity: 0.3,
            metalness: 0.7,
            roughness: 0.3
        });

        // Pillars
        const pillarGeo = new THREE.BoxGeometry(0.5, 5, 0.5);
        const leftPillar = new THREE.Mesh(pillarGeo, gantryMat);
        leftPillar.position.set(-8, 2.5, -8);
        this.scene.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeo, gantryMat);
        rightPillar.position.set(8, 2.5, -8);
        this.scene.add(rightPillar);

        // Top bar
        const topGeo = new THREE.BoxGeometry(17, 0.6, 0.6);
        const topBar = new THREE.Mesh(topGeo, gantryMat);
        topBar.position.set(0, 5, -8);
        this.scene.add(topBar);
    }

    createCars() {
        const carConfigs = [
            { color: 0xdc2626, x: -2, z: 60, speed: 1.0 },   // Red - Leader
            { color: 0x2563eb, x: 2, z: 63, speed: 0.97 },   // Blue
            { color: 0x16a34a, x: -1, z: 66, speed: 0.95 },  // Green
            { color: 0xf97316, x: 1, z: 69, speed: 0.93 },   // Orange
            { color: 0x06b6d4, x: 0, z: 72, speed: 0.91 }    // Cyan
        ];

        carConfigs.forEach((cfg, index) => {
            const car = this.createSimpleCar(cfg.color);
            car.position.set(cfg.x * 2.5, 0.2, cfg.z);
            car.userData = { speed: cfg.speed, baseZ: cfg.z, index };
            this.cars.push(car);
            this.scene.add(car);
        });
    }

    createSimpleCar(color) {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.2
        });

        const darkMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.3,
            roughness: 0.8
        });

        // Main body (simplified F1 shape)
        const bodyGeo = new THREE.BoxGeometry(1, 0.3, 4);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);

        // Nose cone
        const noseGeo = new THREE.BoxGeometry(0.4, 0.2, 1.2);
        const nose = new THREE.Mesh(noseGeo, bodyMat);
        nose.position.set(0, 0.15, -2.4);
        group.add(nose);

        // Cockpit
        const cockpitGeo = new THREE.BoxGeometry(0.6, 0.3, 1.2);
        const cockpit = new THREE.Mesh(cockpitGeo, darkMat);
        cockpit.position.set(0, 0.45, -0.3);
        group.add(cockpit);

        // Front wing
        const fwingGeo = new THREE.BoxGeometry(2, 0.08, 0.5);
        const fwing = new THREE.Mesh(fwingGeo, bodyMat);
        fwing.position.set(0, 0.08, -2.8);
        group.add(fwing);

        // Rear wing
        const rwingGeo = new THREE.BoxGeometry(1.4, 0.5, 0.1);
        const rwing = new THREE.Mesh(rwingGeo, bodyMat);
        rwing.position.set(0, 0.7, 1.8);
        group.add(rwing);

        // Wheels (4 simple cylinders)
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        });

        const wheelPositions = [
            [-0.65, 0, -1.5],
            [0.65, 0, -1.5],
            [-0.65, 0, 1.2],
            [0.65, 0, 1.2]
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.userData.isWheel = true;
            group.add(wheel);
        });

        // Rear light
        const lightGeo = new THREE.BoxGeometry(0.6, 0.1, 0.05);
        const lightMat = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        const rearLight = new THREE.Mesh(lightGeo, lightMat);
        rearLight.position.set(0, 0.35, 2);
        group.add(rearLight);

        return group;
    }

    startLoading() {
        const duration = this.introDuration - 500;
        const interval = 50;
        const steps = duration / interval;
        const increment = 100 / steps;

        const loadingInterval = setInterval(() => {
            this.progress = Math.min(100, this.progress + increment + (Math.random() - 0.5));

            if (this.loadingProgress) {
                this.loadingProgress.style.width = this.progress + '%';
            }

            if (this.loadingText) {
                const msgIndex = Math.floor((this.progress / 100) * (this.loadingMessages.length - 1));
                this.loadingText.textContent = this.loadingMessages[Math.min(msgIndex, this.loadingMessages.length - 1)];
            }

            if (this.progress >= 100) {
                clearInterval(loadingInterval);
                if (this.loadingText) this.loadingText.textContent = '¡SEMÁFORO EN VERDE!';
            }
        }, interval);
    }

    start() {
        this.isRunning = true;
        this.startTime = performance.now();
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const elapsed = (now - this.startTime) / 1000;

        // Frame rate limiting for consistent performance
        if (now - this.lastFrameTime < this.frameInterval * 0.8) return;
        this.lastFrameTime = now;

        // Update cars
        this.updateCars(elapsed);

        // Update camera (cinematic angles)
        this.updateCamera(elapsed);

        // Flash effects at camera changes
        this.updateFlash(elapsed);

        // Check for title show (only during initial intro, not in loop mode)
        if (!this.isLoopMode && this.cars[0] && this.cars[0].position.z < -5 && !this.titleShown) {
            this.titleShown = true;
            this.showTitle();
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateCars(elapsed) {
        const acceleration = this.isLoopMode ? 1 : Math.min(elapsed / 1.2, 1);

        this.cars.forEach((car, index) => {
            const speed = car.userData.speed * 0.7 * acceleration;
            car.position.z -= speed;

            // Subtle lateral movement
            car.position.x += Math.sin(elapsed * 2 + index) * 0.004;

            // Rotate wheels
            car.children.forEach(child => {
                if (child.userData.isWheel) {
                    child.rotation.x -= speed * 0.6;
                }
            });

            // Subtle vibration at speed
            if (acceleration > 0.5) {
                car.position.y = 0.2 + Math.sin(elapsed * 25 + index) * 0.008;
            }

            // Loop reset: teleport cars back to start when they go too far
            if (this.isLoopMode && car.position.z < -60) {
                const startPositions = [-2, 2, -1, 1, 0];
                car.position.z = car.userData.baseZ;
                car.position.x = startPositions[index] * 2.5;
            }
        });
    }

    updateCamera(elapsed) {
        const lead = this.cars[0];
        if (!lead) return;

        // In loop mode: smooth side-tracking camera that follows the lead car
        if (this.isLoopMode) {
            const loopTime = performance.now() / 1000;
            this.camera.position.set(
                Math.sin(loopTime * 0.25) * 12,
                2.5 + Math.sin(loopTime * 0.15) * 1.2,
                lead.position.z + 10
            );
            this.camera.lookAt(lead.position.x, 0.4, lead.position.z);
            return;
        }

        if (elapsed < 1.5) {
            // Angle 1: Side tracking shot
            const t = elapsed / 1.5;
            this.camera.position.set(
                -10 + t * 4,
                2.5 + Math.sin(t * Math.PI) * 0.5,
                lead.position.z + 8
            );
            this.camera.lookAt(lead.position);

        } else if (elapsed < 3.0) {
            // Angle 2: Rear view, camera pulling back
            const t = (elapsed - 1.5) / 1.5;
            this.camera.position.set(
                Math.sin(t * 2) * 0.5,
                2 + t * 0.5,
                lead.position.z + 6 + t * 4
            );
            this.camera.lookAt(lead.position.x, 0.3, lead.position.z);

        } else if (elapsed < 4.5) {
            // Angle 3: Low front view
            const t = (elapsed - 3.0) / 1.5;
            this.camera.position.set(
                Math.sin(elapsed * 2) * 2,
                0.8,
                lead.position.z - 8
            );
            this.camera.lookAt(lead.position.x, 0.5, lead.position.z);

        } else {
            // Angle 4: Finish line view
            const t = (elapsed - 4.5) / 2;
            this.camera.position.set(
                Math.sin(t * 0.5) * 4,
                2 + t,
                -14
            );
            this.camera.lookAt(0, 0.5, lead.position.z);
        }
    }

    updateFlash(elapsed) {
        if (this.isLoopMode) return;
        const flashEl = document.getElementById('flash-overlay');
        if (!flashEl) return;

        let intensity = 0;

        this.flashTimes.forEach(time => {
            if (elapsed >= time - 0.02 && elapsed < time + 0.15) {
                const t = (elapsed - (time - 0.02)) / 0.17;
                intensity = Math.max(intensity, t < 0.2 ? t * 5 : (1 - t) * 1.25);
            }
        });

        flashEl.style.opacity = intensity * 0.8;
    }

    showTitle() {
        const titleOverlay = document.querySelector('.title-overlay');
        if (titleOverlay) {
            titleOverlay.style.opacity = '1';
            titleOverlay.style.transform = 'scale(1)';
        }

        // Auto transition after title
        setTimeout(() => this.transitionToAuth(), 2500);
    }

    transitionToAuth() {
        if (!this.introScreen || !this.authScreen) return;
        if (this.introScreen.classList.contains('fade-out')) return;

        // Final flash
        const flashEl = document.getElementById('flash-overlay');
        if (flashEl) {
            flashEl.style.opacity = '0.9';
            setTimeout(() => flashEl.style.opacity = '0', 200);
        }

        this.introScreen.classList.add('fade-out');

        setTimeout(() => {
            // Switch intro to background loop mode (canvas keeps rendering)
            this.introScreen.classList.remove('fade-out');
            this.introScreen.classList.add('bg-mode');

            // Hide all intro UI, keep only the canvas
            const uiElements = this.introScreen.querySelectorAll(
                '.intro-overlay, .title-overlay, .loading-container, #skip-intro'
            );
            uiElements.forEach(el => { el.style.display = 'none'; });

            // Reset cars to starting positions for seamless loop
            const startPositions = [-2, 2, -1, 1, 0];
            this.cars.forEach((car, i) => {
                car.position.z = car.userData.baseZ;
                car.position.x = startPositions[i] * 2.5;
                car.position.y = 0.2;
            });

            // Activate loop mode
            this.isLoopMode = true;

            // Show auth screen on top
            this.authScreen.classList.remove('hidden');
            this.authScreen.classList.add('visible');
            this.authScreen.style.opacity = '0';

            requestAnimationFrame(() => {
                this.authScreen.style.transition = 'opacity 0.8s ease';
                this.authScreen.style.opacity = '1';
            });
        }, 1000);
    }

    cleanup() {
        this.isRunning = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.onResize);

        // Dispose Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.scene) {
            this.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cars = [];
    }

    onResize = () => {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    bindEvents() {
        window.addEventListener('resize', this.onResize);

        // Skip 3D intro button
        const skipBtn = document.getElementById('skip-intro');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.transitionToAuth();
            });
        }

        // Skip video button
        const skipVideoBtn = document.getElementById('skip-video');
        if (skipVideoBtn) {
            skipVideoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.onVideoEnd();
            });
        }

        // Video ended event
        const video = document.getElementById('intro-video');
        if (video) {
            video.addEventListener('ended', () => this.onVideoEnd());
            // Fallback: if video fails to load/play, skip it
            video.addEventListener('error', () => this.onVideoEnd());
        }

        // Keyboard skip
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                e.preventDefault();
                const videoIntro = document.getElementById('video-intro');
                if (videoIntro && videoIntro.style.display !== 'none') {
                    this.onVideoEnd();
                } else if (this.progress > 70) {
                    this.transitionToAuth();
                }
            }
        });
    }

    fallbackToCSSIntro() {
        // If Three.js fails, use a simple CSS animation
        console.log('Using CSS fallback intro');

        this.startLoading();

        setTimeout(() => {
            this.transitionToAuth();
        }, this.introDuration);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        const apiUrl = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : `${window.location.origin}/api`;
        fetch(`${apiUrl}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    localStorage.removeItem('authToken');
                    startIntro();
                }
            })
            .catch(() => {
                startIntro();
            });
    } else {
        startIntro();
    }
});

function startIntro() {
    const intro = new CinematicIntro3D();
    intro.init();

    // Autoplay might be blocked on some browsers — treat it as "video ended"
    const video = document.getElementById('intro-video');
    if (video) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay blocked: skip straight to 3D
                intro.onVideoEnd();
            });
        }
    }
}
