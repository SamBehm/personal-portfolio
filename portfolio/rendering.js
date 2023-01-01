import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

// ScrollTrigger.defaults({
//         immediateRender: false,
//         ease: "power1.inOut",
// });

// Variables Setup ---------------------------|


var scene;
var canvas;
var style;

var camera;
var renderer;

var pivotGroup;
var models = {};
var bboxes = {};

var pointLightShelf;

var initDollyComplete = false;

var mouse = { x: 0, y: 0 };
var INTERSECTED;

/* directions are added in case I wanna slide objects in 
   based on an axis - see multiAxisSlide function */
var slideDict = {
        "PC": "z",
        "Shelves": "y",
        "Bookshelf": "y",
        "Rug": "z",
        "Bed": "y",
        "Dog Bed": "y",
        "Chair": "z",
        "Lamp": "y",
        "Sticky Note": "y",
        "Whiteboard": "x",
        "Pillow1": "y",
        "Pillow 2": "y",
        "Armature": "y",
        "Whiteboard": "x",
        "Book": "x"
}

var moveableObjects = {
        "Whiteboard": "y",
        "Bed": "y",
        "Bookshelf": "y"
}

var modelOrigins = {};
var textMeshes = {};

var day_pallete = {};
var night_pallete = {};
var currentPallete;

// var controls;

// -------------------------------------------|



export async function setupCanvas() {

        style = getComputedStyle(document.body);
        day_pallete["highlight"] = parseInt(style.getPropertyValue('--day-highlight').substring(2), 16);
        day_pallete["midtone"] = parseInt(style.getPropertyValue('--day-midtone').substring(2), 16);
        day_pallete["shadow"] = parseInt(style.getPropertyValue('--day-shadow').substring(2), 16);

        currentPallete = day_pallete;

        scene = new THREE.Scene();
        // scene.background = new THREE.Color(day_pallete["midtone"]);
        canvas = document.querySelector('#model-viewer');

        camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true
        });
        renderer.setClearColor(0x000000, 0);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.physicallyCorrectLights = true;

        camera.position.set(-0.30, 1.9, 1.8);
        camera.rotation.set(-0.06, 0, 0);
        camera.updateProjectionMatrix();

        pivotGroup = new THREE.Object3D();

        window.addEventListener('resize', onWindowResize, false);



        /* Debugging Controls commented out below - remember to uncomment update in animation function */

        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.addEventListener("change", event => {
        //         console.log(controls.object.position);
        //         console.log(controls.object.rotation);
        // });

        document.addEventListener("mousemove", mouseMoveEvent, false);

        let objects = [];
        return loadModels(objects).then((result) => loadText(result));
}

function initScrollAnimations() {

        document.getElementsByClassName("no-scroll")[0].classList.remove("no-scroll");

        let tl = gsap.timeline({
                scrollTrigger: {
                        scroller: "#div-wrapper",
                        trigger: "#content-about-me",
                        start: "top bottom",
                        end: "top top",
                        scrub: 1
                },
        });

        tl.to(pivotGroup.rotation, {
                x: 0.08,
                y: (2 * Math.PI),
                duration: 1
        }, 0);

        tl.to(pivotGroup.position, {
                x: pivotGroup.position.x - 20,
                z: pivotGroup.position.z - 80,
                y: pivotGroup.position.y - 35,
                duration: 1
        }, 0);

        gsap.to(".sliding-text ul", {
                x: "-123%",
                ease: "power1.out",
                duration: 2,
                scrollTrigger: {
                        scroller: "#div-wrapper",
                        trigger: "#content-about-me",
                        start: "50% bottom",
                        toggleActions: "play none restart restart"
                }
        });
}

export function setupScene(objects) {

        scene.add(pivotGroup);

        // center pivot point
        const bbox = new THREE.Box3();
        bbox.setFromObject(models["Room"]);

        const position = new THREE.Vector3();
        bbox.getCenter(position);

        pivotGroup.position.copy(position);

        objects.forEach((object) => {
                pivotGroup.attach(object);
        });

        setupLighting();
}

function loadModels(objects) {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
                loader.load('/room.glb', function (gltf) {
                        let children = gltf.scene.children;
                        for (let i = 0; i < children.length; i++) {
                                models[children[i].userData.name] = children[i];
                                modelOrigins[children[i].userData.name] = (new THREE.Vector3).copy(children[i].position);
                                switch (children[i].userData.name) {
                                        case 'Desk':
                                        case 'Room':
                                        case 'Monitor':
                                                break;
                                        default:
                                                setOpacityZero(children[i]);
                                }

                                if (children[i].userData.name in moveableObjects) {
                                        objects.push(createBoundingBox(children[i]));
                                }

                        }
                        objects.push(gltf.scene);

                        resolve(objects)
                }, undefined, function (error) {
                        console.error(error);
                        reject();
                });
        });
}

function loadText(objects) {
        const loader = new FontLoader();
        return new Promise((resolve, reject) => {
                loader.load('Roboto_Black.json', function (font) {
                        let createTextGeometry = (name, text, size, axis) => {

                                const meshMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(currentPallete["highlight"]), transparent: true, opacity: 0 });

                                let words = text.split(" ");
                                let group = new THREE.Group();
                                let currentPosition = 0;

                                let direction = { "x": 1, "y": -1, "z": 1 };

                                words.forEach((word) => {
                                        const geometry = new TextGeometry(word, {
                                                font: font,
                                                size: size,
                                                height: 0.1
                                        });

                                        let mesh = new THREE.Mesh(geometry, meshMaterial);
                                        if (word[0] != '\n') {
                                                mesh.position[axis] = currentPosition;

                                                let dimensions = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
                                                currentPosition += direction[axis] * (dimensions[axis] + 1);
                                        }
                                        mesh.name = name;
                                        group.add(mesh);
                                });

                                return group;
                        };

                        let bedTextGroup = createTextGeometry("BedText", "About. \nMe", 2, "x");
                        bedTextGroup.rotation.set(-Math.PI / 2, 0, 0);
                        bedTextGroup.position.set(3, -4, 24);

                        let whiteboardTextGroup = createTextGeometry("WhiteboardText", "Contact \nMe", 1.3, "y");
                        whiteboardTextGroup.rotation.set(0, Math.PI / 2, 0);
                        whiteboardTextGroup.position.set(-15.4, 3, 26.5);

                        let bookShelfTextGroup = createTextGeometry("BookshelfText", "My \nWork", 1.3, "y");
                        bookShelfTextGroup.rotation.set(0, Math.PI / 2, 0);
                        bookShelfTextGroup.position.set(-15.4, 11, 26.5);

                        textMeshes["BedText"] = bedTextGroup;
                        textMeshes["WhiteboardText"] = whiteboardTextGroup;
                        textMeshes["BookshelfText"] = bookShelfTextGroup;

                        objects.push(bedTextGroup);
                        objects.push(whiteboardTextGroup);
                        objects.push(bookShelfTextGroup);

                        resolve(objects);

                }, undefined, function (error) {
                        console.error("LoadText Error: " + error);
                        reject();
                });
        });

}



function createBoundingBox(object) {
        const bbox = new THREE.Box3();
        bbox.setFromObject(object);

        const dimensions = new THREE.Vector3().subVectors(bbox.max, bbox.min);
        const geometry = new THREE.BoxGeometry(dimensions.x + 0.5, dimensions.y + 0.5, dimensions.z + 0.5);
        const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(bbox.min, bbox.max).multiplyScalar(0.5));

        geometry.applyMatrix4(matrix);

        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        mesh.name = object.name;
        mesh.material.visible = false;
        bboxes[object.userData.name] = mesh;

        return mesh;
}

/**
 * Sets the opacity of the given object to 0
 * @param {*} object object to affect
 */
function setOpacityZero(object) {
        switch (object.userData.name) {
                case 'Armature':
                        object.children[3].material.transparent = true;
                        object.children[3].material.opacity = 0;
                        break;
                case 'Lamp':
                        object.children[0].material.transparent = true;
                        object.children[1].material.transparent = true;
                        object.children[0].material.opacity = 0;
                        object.children[1].material.opacity = 0;
                        break;
                default:
                        object.material.transparent = true;
                        object.material.opacity = 0;

        }
}

/**
 * Initialises lighting in scene
 */
function setupLighting() {

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xFF9C36, 7, 40, Math.PI / 2, 1, 0.1);

        spotLight.castShadow = true;

        spotLight.position.set(-16, 4, 3);
        spotLight.target.position.set(0, 0, 15);
        spotLight.target.updateMatrixWorld();

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.Height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;

        pivotGroup.attach(spotLight);

        pointLightShelf = new THREE.PointLight(0xFF9C36, 0, 40, 0.05);
        pointLightShelf.position.set(-14, 10, 14);
        pointLightShelf.name = "shelfLight";
        pointLightShelf.userData.name = "shelfLight";

        models["shelfLight"] = pointLightShelf;

        pivotGroup.attach(pointLightShelf);

        modelOrigins["shelfLight"] = (new THREE.Vector3).copy(pointLightShelf.position);
}

/**
 * Animates the mesh sliding into position on the given axis
 * @param {GSAPTimeline} objTl Timeline of mesh transformations
 * @param {String} name Name of the Mesh
 * @param {String} axis transformation axis
 * @param {int} time Time position of the animation 
 */
function multiAxisSlide(objTl, name, axis, time) {

        objTl.from(models[name].position, {
                [axis]: 30,
                ease: 'power2.out',
                duration: 1
        }, time);
}

/**
 * Animates the mesh sliding down from the top of the screen
 * @param {GSAPTimeline} objTl Timeline of mesh transformations
 * @param {String} name Name of the Mesh
 * @param {int} time Time position of the animation
 */
function singleAxisSlide(objTl, name, time) {
        objTl.from(models[name].position, {
                y: 30,
                ease: 'power2.out',
                duration: 1
        }, time);
}

function dropObjects() {
        var objTl = gsap.timeline({
                onComplete: () => {
                        initDollyComplete = true;
                        initScrollAnimations();
                }
        });
        var i = 0;
        for (const [key, value] of Object.entries(slideDict)) {
                // multiAxisSlide(objTl, key, value, i);
                singleAxisSlide(objTl, key, i);

                if (key == "Armature") {
                        objTl.to(models['Armature'].children[3].material, {
                                opacity: 1,
                                ease: 'power1.out',
                                duration: 1
                        }, i);
                } else if (key == "Lamp") {
                        objTl.to(models['Lamp'].children[0].material, {
                                opacity: 1,
                                ease: 'power1.out',
                                duration: 1
                        }, i);
                        objTl.to(models['Lamp'].children[1].material, {
                                opacity: 1,
                                ease: 'power1.out',
                                duration: 1
                        }, i);
                        objTl.from(pointLightShelf.position, {
                                y: 30,
                                ease: 'power1.out',
                                duration: 1
                        }, i);
                        objTl.to(pointLightShelf, {
                                intensity: 4,
                                ease: 'power.out',
                                duration: 1
                        }, i);
                } else {
                        objTl.to(models[key].material, {
                                opacity: 1,
                                ease: 'power1.out',
                                duration: 1
                        }, i);
                }
                i += 0.2;
        }
}

function fadeIn() {
        let dnSwitch = document.getElementById("dn-switch");
        let contentDivs = document.getElementsByClassName("content-div");
        dnSwitch.classList.add("animFadeIn");
        Array.prototype.forEach.call(contentDivs, (element) => {
                element.classList.add("animFadeIn");
        })
}

function displayNavBar() {
        let navCenter = document.getElementsByClassName("nav-center-links")[0];
        let navRight = document.getElementsByClassName("nav-right-links")[0];
        let navCenterItems = navCenter.getElementsByTagName("li");
        let navRightItems = navRight.getElementsByTagName("li");

        let section = document.getElementById("section-header");
        let title = section.getElementsByTagName("header")[0].getElementsByTagName("h1")[0];

        let recursiveAddClass = (ul) => {
                for (let i = 0; i < ul.length; i++) {
                        ul[i].classList.add("header-fall");
                }
        }

        recursiveAddClass(navCenterItems);
        recursiveAddClass(navRightItems);
        title.classList.add("header-fall");
        section.classList.add("header-fall");
}

/**
 * This function defines the initial camera movement upon leaving the loading screen
 */
export function initDolly() {

        var tl = gsap.timeline();
        tl.to(camera.position, {
                duration: 3.6,
                ease: CustomEase.create("custom", "M0,0,C0.505,0.201,0.424,0.79,0.999,0.999,0.999,0.999,0.999,0.999,1,1"),
                z: 73
        });

        tl.to(camera.position, {
                duration: 3,
                ease: CustomEase.create("custom", "M0,0,C0.956,0,0.822,1,1,1"),
                x: 58.58021594401725,
                y: 37.2
        }, 1);

        tl.to(camera.rotation, {
                duration: 2.9,
                ease: CustomEase.create("custom", "M0,0,C0.78,0.016,0.768,0.996,0.998,0.996,0.999,0.998,1,1,1,1"),
                x: -0.5410995928728004,
                y: 0.698875756431121,
                z: 0.368910029539352
        }, 1);

        tl.call(displayNavBar, null, 3);
        tl.call(dropObjects, null, 2.9);
        tl.call(fadeIn, null, 2.9);
}

function getGroupedObjects(object) {
        switch (object.name) {
                case "Bed":
                        return [object, models["Pillow1"], models["Pillow 2"]];
                case "Bookshelf":
                        return [object, models["Lamp"], models["Book"], models["shelfLight"]];
                default:
                        return object;
        }
}

function tweenOnHover(toTween, direction) {

        let intersectedObjects = [];

        if (!Array.isArray(toTween)) {
                intersectedObjects.push(toTween);
        } else {
                intersectedObjects = toTween;
        }

        let axis = moveableObjects[intersectedObjects[0].userData.name];
        let tl = gsap.timeline();

        intersectedObjects.forEach((INTERSECTED) => {
                let time, endPosition = modelOrigins[INTERSECTED.userData.name][axis];
                if (direction > 0) {
                        endPosition += 3;
                }

                tl.to(INTERSECTED.position, {
                        [axis]: endPosition,
                        duration: 0.5,
                        ease: "power1.out",
                        overwrite: true
                }, 0);
        });

        let textMaterial = textMeshes[intersectedObjects[0].name + "Text"].children[0].material;
        let targetOpacity = direction > 0 ? 1 : 0;

        tl.to(textMaterial, {
                opacity: targetOpacity,
                duration: 0.5,
                ease: "power1.out",
                overwrite: true
        }, 0);

}

function checkHover() {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        var intersectedObjects = raycaster.intersectObjects(scene.children);

        if (intersectedObjects.length == 0) {
                if (INTERSECTED) {
                        let toTween = getGroupedObjects(INTERSECTED);
                        tweenOnHover(toTween, -1);
                }
                INTERSECTED = null;
                return;
        }

        let intersectedObject = intersectedObjects[0].object;

        if (INTERSECTED) {
                if (intersectedObject == bboxes[INTERSECTED.name]) {
                        return;
                }
                let toTween = getGroupedObjects(INTERSECTED);
                tweenOnHover(toTween, -1);
                INTERSECTED = null;
        }


        if (!(intersectedObject.name in bboxes)) {
                return;
        }


        INTERSECTED = models[intersectedObject.name];
        let toTween = getGroupedObjects(INTERSECTED);
        tweenOnHover(toTween, 1);
}

/**
 * Animation Loop
 * 
 * Applies all constant transformations every tick.
 */
export function animate() {
        requestAnimationFrame(animate);

        if (initDollyComplete) {
                checkHover();
        }
        // controls.update();

        renderer.render(scene, camera);
}

function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
}

function mouseMoveEvent(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

export function getIntersected() {
        return INTERSECTED;
}