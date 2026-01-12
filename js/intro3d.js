// Intro 3D amb Three.js - VERSIÓ CINEMATOGRÀFICA AMB FLASHES NFS MW + POST-PROCESSING

let intro3DScene = null;
let intro3DCamera = null;
let intro3DRenderer = null;
let intro3DComposer = null;
let intro3DCars = [];
let intro3DAnimationId = null;
let intro3DStartTime = Date.now();
let titleShown = false;

function initIntro3D() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;

    // Configurar escena
    intro3DScene = new THREE.Scene();
    intro3DScene.fog = new THREE.Fog(0x0a0a1a, 30, 150);

    // Configurar càmera amb perspectiva cinematogràfica
    intro3DCamera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    intro3DCamera.position.set(0, 2.5, -12);
    intro3DCamera.lookAt(0, 0, 5);

    // Configurar renderer amb MÀXIMA QUALITAT
    intro3DRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        precision: "highp"
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    intro3DRenderer.setPixelRatio(pixelRatio);
    intro3DRenderer.setSize(window.innerWidth, window.innerHeight);

    intro3DRenderer.shadowMap.enabled = true;
    intro3DRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    intro3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    intro3DRenderer.toneMappingExposure = 1.3;
    intro3DRenderer.outputEncoding = THREE.sRGBEncoding;

    // POST-PROCESSING: Crear composer amb efectes cinematogràfics
    setupPostProcessing();

    // Crear pista
    createTrack();

    // Crear línia de meta
    createFinishLine();

    // Crear cotxes
    createF1Cars();

    // Il·luminació
    createLighting();

    // Iniciar animació
    intro3DStartTime = Date.now();
    animateIntro3D();

    // Responsive
    window.addEventListener('resize', onIntro3DResize);
}

function setupPostProcessing() {
    // EffectComposer (requereix EffectComposer.js, RenderPass.js i altres passes)
    if (typeof THREE.EffectComposer === 'undefined') {
        console.warn('⚠️ EffectComposer no disponible. Descarrega els fitxers de post-processing.');
        return;
    }

    intro3DComposer = new THREE.EffectComposer(intro3DRenderer);

    // Pass 1: Render bàsic de l'escena
    const renderPass = new THREE.RenderPass(intro3DScene, intro3DCamera);
    intro3DComposer.addPass(renderPass);

    // Pass 2: Unreal Bloom (glow als llums i alerons)
    if (typeof THREE.UnrealBloomPass !== 'undefined') {
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,    // strength (intensitat del bloom)
            0.6,    // radius
            0.15    // threshold (només elements brillants)
        );
        intro3DComposer.addPass(bloomPass);
    }

    // Pass 3: Film Grain (efecte de pel·lícula)
    if (typeof THREE.FilmPass !== 'undefined') {
        const filmPass = new THREE.FilmPass(
            0.15,   // noise intensity
            0.025,  // scanline intensity
            648,    // scanline count
            false   // grayscale
        );
        filmPass.renderToScreen = false;
        intro3DComposer.addPass(filmPass);
    }

    // Pass 4: Vignette (fosc als cantons)
    if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.VignetteShader !== 'undefined') {
        const vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
        vignettePass.uniforms['offset'].value = 0.95;
        vignettePass.uniforms['darkness'].value = 1.6;
        intro3DComposer.addPass(vignettePass);
    }

    // Darrer pass: Output al canvas
    const outputPass = intro3DComposer.passes[intro3DComposer.passes.length - 1];
    if (outputPass) {
        outputPass.renderToScreen = true;
    }

    console.log('✅ Post-processing activat amb', intro3DComposer.passes.length, 'efectes');
}

function createTrack() {
    // Terra de la pista
    const trackGeometry = new THREE.PlaneGeometry(15, 200, 64, 64);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.1
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.z = 50;
    track.receiveShadow = true;
    intro3DScene.add(track);

    // Línies laterals brillants
    const lineGeometry = new THREE.BoxGeometry(0.4, 0.15, 200);
    const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
    });

    const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
    leftLine.position.set(-7.2, 0.08, 50);
    intro3DScene.add(leftLine);

    const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
    rightLine.position.set(7.2, 0.08, 50);
    intro3DScene.add(rightLine);

    // Línies centrals amb animació
    for (let i = -50; i < 150; i += 6) {
        const centerLine = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.15, 2.5),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                emissive: 0xffcc00,
                emissiveIntensity: 0.8
            })
        );
        centerLine.position.set(0, 0.08, i);
        intro3DScene.add(centerLine);
    }

    // Herba als laterals
    const grassGeometry = new THREE.PlaneGeometry(80, 200, 32, 32);
    const grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a4d1a,
        roughness: 1
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.15, 50);
    intro3DScene.add(grass);

    // Barreres laterals (tire barriers)
    for (let z = -50; z < 150; z += 4) {
        createBarrier(-10, z);
        createBarrier(10, z);
    }
}

function createBarrier(x, z) {
    const barrier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16),
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        })
    );
    barrier.rotation.z = Math.PI / 2;
    barrier.position.set(x, 0.6, z);
    barrier.castShadow = true;
    intro3DScene.add(barrier);
}

function createFinishLine() {
    // Línia de meta amb efecte escaquer brillant
    const checkerSize = 1;
    const checkerGroup = new THREE.Group();

    for (let x = 0; x < 15; x++) {
        for (let z = 0; z < 4; z++) {
            const isWhite = (x + z) % 2 === 0;
            const checker = new THREE.Mesh(
                new THREE.BoxGeometry(checkerSize, 0.12, checkerSize),
                new THREE.MeshStandardMaterial({
                    color: isWhite ? 0xffffff : 0x000000,
                    emissive: isWhite ? 0x666666 : 0x000000,
                    emissiveIntensity: isWhite ? 0.6 : 0,
                    roughness: 0.3,
                    metalness: 0.3
                })
            );
            checker.position.set((x - 7) * checkerSize, 0.06, -10 + z * checkerSize);
            checker.castShadow = true;
            checkerGroup.add(checker);
        }
    }
    intro3DScene.add(checkerGroup);

    // Pòrtic espectacular amb llums
    const porticMaterial = new THREE.MeshStandardMaterial({
        color: 0xe10600,
        emissive: 0xe10600,
        emissiveIntensity: 1.2,
        metalness: 0.7,
        roughness: 0.2
    });

    // Columnes amb detall
    const columnGeometry = new THREE.BoxGeometry(0.6, 6, 0.6);
    const leftColumn = new THREE.Mesh(columnGeometry, porticMaterial);
    leftColumn.position.set(-8.5, 3, -8);
    leftColumn.castShadow = true;
    intro3DScene.add(leftColumn);

    const rightColumn = new THREE.Mesh(columnGeometry, porticMaterial);
    rightColumn.position.set(8.5, 3, -8);
    rightColumn.castShadow = true;
    intro3DScene.add(rightColumn);

    // Barra superior amb llums
    const topBar = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.8, 0.8),
        porticMaterial
    );
    topBar.position.set(0, 6, -8);
    topBar.castShadow = true;
    intro3DScene.add(topBar);

    // Pantalles LED al pòrtic
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 2
    });
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1.5, 0.2),
        screenMaterial
    );
    screen.position.set(0, 4.5, -8);
    intro3DScene.add(screen);
}

function createF1Cars() {
    const carConfigs = [
        { color: 0x0600EF, position: -2, speed: 1.0, name: "Red Bull" },
        { color: 0xDC0000, position: -1, speed: 0.98, name: "Ferrari" },
        { color: 0x00D2BE, position: 0, speed: 0.96, name: "Mercedes" },
        { color: 0xFF8700, position: 1, speed: 0.94, name: "McLaren" },
        { color: 0x006F62, position: 2, speed: 0.92, name: "Aston Martin" }
    ];

    carConfigs.forEach(config => {
        const car = createRealisticF1Car(config.color);
        car.position.set(config.position * 2.8, 0.2, 70 + Math.random() * 8);
        car.userData.speed = config.speed;
        car.userData.baseZ = car.position.z;
        car.userData.name = config.name;
        intro3DCars.push(car);
        intro3DScene.add(car);
    });
}

function createRealisticF1Car(color) {
    const carGroup = new THREE.Group();

    // Monocoque (cos principal) - forma aerodinàmica
    const monocoqueGeometry = new THREE.BoxGeometry(1.1, 0.35, 4.2);
    const monocoqueMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.95,
        roughness: 0.1,
        envMapIntensity: 1.5
    });
    const monocoque = new THREE.Mesh(monocoqueGeometry, monocoqueMaterial);
    monocoque.position.y = 0.25;
    monocoque.castShadow = true;
    carGroup.add(monocoque);

    // Nas (front nose) - estret i baix
    const noseGeometry = new THREE.BoxGeometry(0.4, 0.2, 1.2);
    const nose = new THREE.Mesh(noseGeometry, monocoqueMaterial);
    nose.position.set(0, 0.15, -2.5);
    nose.castShadow = true;
    carGroup.add(nose);

    // Cockpit (amb forma de gota)
    const cockpitGeometry = new THREE.BoxGeometry(0.85, 0.4, 1.8);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.95,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.5, -0.2);
    cockpit.castShadow = true;
    carGroup.add(cockpit);

    // Halo (protecció del pilot)
    const haloMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1
    });

    const haloBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 1.2),
        haloMaterial
    );
    haloBar.position.set(0, 0.65, -0.2);
    carGroup.add(haloBar);

    // Aleron davanter - baix i ample
    const frontWingMain = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, 0.5),
        new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.85,
            roughness: 0.15
        })
    );
    frontWingMain.position.set(0, 0.08, -3);
    frontWingMain.castShadow = true;
    carGroup.add(frontWingMain);

    // Flaps del aleron davanter
    for (let i = 0; i < 3; i++) {
        const flap = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.05, 0.15),
            monocoqueMaterial
        );
        flap.position.set(0, 0.08 + i * 0.12, -3.1 - i * 0.15);
        carGroup.add(flap);
    }

    // Aleron posterior - alt i estret amb DRS
    const rearWingMain = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.1, 0.08),
        monocoqueMaterial
    );
    rearWingMain.position.set(0, 1.1, 2);
    rearWingMain.castShadow = true;
    carGroup.add(rearWingMain);

    const rearWingUpper = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.08, 0.08),
        monocoqueMaterial
    );
    rearWingUpper.position.set(0, 1.3, 2);
    carGroup.add(rearWingUpper);

    // Suports del aleron posterior
    const wingSupport1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.6, 0.08),
        haloMaterial
    );
    wingSupport1.position.set(-0.6, 0.8, 2);
    carGroup.add(wingSupport1);

    const wingSupport2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.6, 0.08),
        haloMaterial
    );
    wingSupport2.position.set(0.6, 0.8, 2);
    carGroup.add(wingSupport2);

    // Difusor (part posterior inferior)
    const diffuserGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.8);
    const diffuser = new THREE.Mesh(diffuserGeometry, monocoqueMaterial);
    diffuser.position.set(0, 0.1, 1.8);
    diffuser.rotation.x = -0.2;
    carGroup.add(diffuser);

    // Rodes amb pneumàtics realistes
    const wheelGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.3,
        roughness: 0.9
    });

    // Discs de fre
    const brakeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 32);
    const brakeMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc3300,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0x661100,
        emissiveIntensity: 0.3
    });

    const wheelPositions = [
        [-0.75, 0, -1.5],  // Davant esquerra
        [0.75, 0, -1.5],   // Davant dreta
        [-0.75, 0, 1.3],   // Darrere esquerra
        [0.75, 0, 1.3]     // Darrere dreta
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        carGroup.add(wheel);

        // Disc de fre
        const brake = new THREE.Mesh(brakeGeometry, brakeMaterial);
        brake.rotation.z = Math.PI / 2;
        brake.position.set(pos[0] > 0 ? pos[0] - 0.05 : pos[0] + 0.05, pos[1], pos[2]);
        carGroup.add(brake);
    });

    // Llums posteriors LED
    const rearLightGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.08);
    const rearLightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 4,
        transparent: true,
        opacity: 0.9
    });
    const rearLight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
    rearLight.position.set(0, 0.45, 2.15);
    carGroup.add(rearLight);

    // Escapes amb fum
    const exhaustGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
    const exhaustMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xff4400,
        emissiveIntensity: 0.5
    });

    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0, 0.35, 2.1);
    carGroup.add(exhaust);

    // Retrovisors
    const mirrorGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.25);
    const mirrorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.95,
        roughness: 0.05
    });

    const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    leftMirror.position.set(-0.65, 0.55, -0.5);
    carGroup.add(leftMirror);

    const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    rightMirror.position.set(0.65, 0.55, -0.5);
    carGroup.add(rightMirror);

    return carGroup;
}

function createLighting() {
    // Llum ambiental
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    intro3DScene.add(ambientLight);

    // Llum direccional principal
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(-8, 20, -10);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    intro3DScene.add(sunLight);

    // Spots de pista
    for (let i = 0; i < 6; i++) {
        const spotLight = new THREE.SpotLight(0xffffff, 1.5);
        spotLight.position.set((i % 2 === 0 ? -12 : 12), 15, -20 + i * 10);
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.4;
        spotLight.decay = 2;
        spotLight.distance = 80;
        spotLight.castShadow = true;
        intro3DScene.add(spotLight);
    }

    // Llum de fons
    const backLight = new THREE.DirectionalLight(0x4488ff, 0.6);
    backLight.position.set(0, 8, 15);
    intro3DScene.add(backLight);
}

function animateIntro3D() {
    intro3DAnimationId = requestAnimationFrame(animateIntro3D);

    const elapsed = (Date.now() - intro3DStartTime) / 1000;

    // FLASHES SIGNIFICATIUS AMB CANVIS DE CÀMERA
    const flashEl = document.getElementById('intro-flash');
    if (flashEl) {
        let flashIntensity = 0;

        // Flash 1: Canvi a vista d'aleron (segon 1.5)
        // Flash 2: Canvi a vista de cockpit (segon 3.0)
        // Flash 3: Canvi a vista de línia de meta (segon 4.5)
        const flashTimings = [
            { start: 1.48, duration: 0.15, intensity: 1.0 },  // Flash aleron
            { start: 2.98, duration: 0.15, intensity: 1.0 },  // Flash cockpit
            { start: 4.48, duration: 0.15, intensity: 1.0 }   // Flash meta
        ];

        for (const flash of flashTimings) {
            if (elapsed >= flash.start && elapsed < flash.start + flash.duration) {
                const flashProgress = (elapsed - flash.start) / flash.duration;
                if (flashProgress < 0.2) {
                    flashIntensity = (flashProgress / 0.2) * flash.intensity;
                } else {
                    flashIntensity = (1 - (flashProgress - 0.2) / 0.8) * flash.intensity;
                }
                break;
            }
        }

        flashEl.style.display = flashIntensity > 0 ? 'block' : 'none';
        flashEl.style.opacity = flashIntensity;
    }

    // Moure cotxes amb acceleració realista
    intro3DCars.forEach((car, index) => {
        const acceleration = Math.min(elapsed / 1.5, 1);
        const speed = car.userData.speed * 0.65 * acceleration;
        car.position.z -= speed;

        // Moviment lateral suau (efecte de slipstream)
        car.position.x += Math.sin(elapsed * 2.5 + index * 0.5) * 0.008;

        // Rotació de rodes
        car.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'CylinderGeometry') {
                child.rotation.x -= speed * 0.8;
            }
        });

        // Efecte de vibració a alta velocitat
        if (acceleration > 0.7) {
            car.position.y = 0.2 + Math.sin(elapsed * 30 + index) * 0.01;
        }
    });

    // CÀMERES CINEMATOGRÀFIQUES AMB CANVIS DRAMÀTICS
    if (intro3DCars.length > 0) {
        const leadCar = intro3DCars[0];

        if (elapsed < 1.5) {
            // ANGLE 1: Vista lateral seguint els cotxes
            const t = elapsed / 1.5;
            intro3DCamera.position.x = -12 + t * 5;
            intro3DCamera.position.y = 2.5 + Math.sin(t * Math.PI) * 0.8;
            intro3DCamera.position.z = leadCar.position.z + 10;
            intro3DCamera.lookAt(leadCar.position.x, leadCar.position.y + 0.3, leadCar.position.z);
            
        } else if (elapsed < 3.0) {
            // ANGLE 2: Càmera des de darrere retrocedint (vista posterior)
            const t = (elapsed - 1.5) / 1.5;
            intro3DCamera.position.x = leadCar.position.x + Math.sin(t * 2) * 0.5;
            intro3DCamera.position.y = leadCar.position.y + 1.8 + t * 0.5;
            intro3DCamera.position.z = leadCar.position.z + 5 + t * 3; // Càmera retrocedeix
            intro3DCamera.lookAt(
                leadCar.position.x,
                leadCar.position.y + 0.3,
                leadCar.position.z
            );
            
        } else if (elapsed < 4.5) {
            // ANGLE 3: Vista del cockpit (FLASH 2)
            const t = (elapsed - 3.0) / 1.5;
            intro3DCamera.position.x = leadCar.position.x + Math.sin(elapsed * 3) * 0.15;
            intro3DCamera.position.y = leadCar.position.y + 0.7;
            intro3DCamera.position.z = leadCar.position.z - 0.5;
            intro3DCamera.lookAt(
                leadCar.position.x,
                leadCar.position.y + 0.3,
                leadCar.position.z - 20
            );
            
        } else {
            // ANGLE 4: Vista de la línia de meta (FLASH 3)
            const t = (elapsed - 4.5) / 2;
            intro3DCamera.position.x = Math.sin(t * 0.8) * 3;
            intro3DCamera.position.y = 1.5 + t * 1.5;
            intro3DCamera.position.z = -12 + Math.cos(t * 0.5) * 2;
            intro3DCamera.lookAt(0, 0.5, leadCar.position.z);
        }

        // MOMENT CLAU: Quan creuen la línia de meta
        if (leadCar.position.z < -7 && !titleShown) {
            titleShown = true;
            showCinematicTitle();
        }
    }

    // Renderitzar amb post-processing si està disponible
    if (intro3DComposer) {
        intro3DComposer.render();
    } else {
        intro3DRenderer.render(intro3DScene, intro3DCamera);
    }
}

function showCinematicTitle() {
    const title = document.getElementById('intro-title');
    
    if (title) {
        title.innerHTML = '<div style="font-size: 4em; font-weight: 900; color: #e10600; text-shadow: 0 0 30px rgba(225,6,0,0.8), 0 0 60px rgba(225,6,0,0.5);">F1 MANAGER</div><div style="font-size: 1.5em; margin-top: 20px; font-weight: 300; letter-spacing: 3px;">BY LEONARDO DE CASTRO FERREIRA</div>';
        title.style.display = 'block';
        title.style.animation = 'titleExplosion 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        setTimeout(() => title.classList.add('visible'), 50);
        
        // Transició al menú després de mostrar el títol
        setTimeout(() => {
            showScreen('auth-screen');
            cleanupIntro3D();
        }, 3500);
    }
}

function onIntro3DResize() {
    if (!intro3DCamera || !intro3DRenderer) return;

    intro3DCamera.aspect = window.innerWidth / window.innerHeight;
    intro3DCamera.updateProjectionMatrix();

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    intro3DRenderer.setPixelRatio(pixelRatio);
    intro3DRenderer.setSize(window.innerWidth, window.innerHeight);

    // Actualitzar composer si està actiu
    if (intro3DComposer) {
        intro3DComposer.setSize(window.innerWidth, window.innerHeight);
    }
}

function cleanupIntro3D() {
    if (intro3DAnimationId) {
        cancelAnimationFrame(intro3DAnimationId);
    }

    window.removeEventListener('resize', onIntro3DResize);

    if (intro3DRenderer) {
        intro3DRenderer.dispose();
    }

    if (intro3DScene) {
        intro3DScene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    intro3DScene = null;
    intro3DCamera = null;
    intro3DRenderer = null;
    intro3DCars = [];
}