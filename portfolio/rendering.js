import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import { CustomEase } from "gsap/CustomEase";
import gsapCore from 'gsap/gsap-core';

gsap.registerPlugin(CustomEase);

// Variables Setup ---------------------------|


var scene;
var canvas;

var camera;
var renderer;

var gltfScene;
var models = {};
var loader;

var pointLightShelf;

var initDollyComplete = false;

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


// var controls;

// -------------------------------------------|



export function setupCanvas() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfbe0a0);

        canvas = document.querySelector('#model-viewer');

        camera = new THREE.PerspectiveCamera(30, 2, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({
                canvas: canvas,
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.physicallyCorrectLights = true;

        camera.position.set(-0.30, 1.9, 1.8);
        camera.rotation.set(-0.06, 0, 0);
        camera.updateProjectionMatrix();

        window.addEventListener('resize', onWindowResize, false);
        setupLighting();

        loader = new GLTFLoader();

        /* Debugging Controls commented out below - remember to uncomment update in animation function */

        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.addEventListener("change", event => {
        //         console.log(controls.object.position);
        //         console.log(controls.object.rotation);
        // });


        return loadModels();
}

function loadModels() {
        return new Promise((resolve, reject) => {
                loader.load('/room.glb', function (gltf) {
                        gltfScene = gltf.scene;
                        let children = gltfScene.children;
                        for (let i = 0; i < children.length; i++) {
                                // console.log(children[i].userData.name);
                                models[children[i].userData.name] = children[i];
                                switch (children[i].userData.name) {
                                        case 'Desk':
                                        case 'Room':
                                        case 'Monitor':
                                                break;
                                        default:
                                                setOpacityZero(children[i]);
                                }
                        }

                        console.log(models);
                        scene.add(gltfScene);
                }, undefined, function (error) {
                        console.error(error);
                        resolve(false);
                });

                resolve(true);
        });
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

        scene.add(spotLight);

        pointLightShelf = new THREE.PointLight(0xFF9C36, 0, 40, 0.05);
        pointLightShelf.position.set(-14, 10, 14);

        scene.add(pointLightShelf);
}

/**
 * Animates the mesh sliding into position on the given axis
 * @param {GSAPTimeline} objTl Timeline of mesh transformations
 * @param {String} name Name of the Mesh
 * @param {String} axis transformation axis
 * @param {int} time Time position of the animation 
 */
function multiAxisSlide(objTl, name, axis, time) {
        switch (axis) {
                case "x":
                        objTl.from(models[name].position, {
                                x: 30,
                                ease: 'power2.out',
                                duration: 1
                        }, time);
                        break;
                case "y":
                        objTl.from(models[name].position, {
                                y: 30,
                                ease: 'power2.out',
                                duration: 1
                        }, time);
                        break;
                case "z":
                        objTl.from(models[name].position, {
                                z: 50,
                                ease: 'power2.in',
                                duration: 1
                        }, time);
                        break;
        }
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
        var objTl = gsap.timeline();
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

function displayNavBar() {
        let l1 = document.getElementById('l1');
        let l2 = document.getElementById('l2');
        let l3 = document.getElementById('l3');
        let logo = document.getElementById('nav-logo');
        let dnSwitch = document.getElementById('nav-switch');
        let section = document.getElementById('section-header');
        l1.classList.add('header-fall');
        l2.classList.add('header-fall');
        l3.classList.add('header-fall');
        logo.classList.add('header-fall');
        dnSwitch.classList.add('header-fall');
        section.classList.add('header-fall');
}

/**
 * This function defines the initial camera movement upon leaving the loading screen
 */
function initDolly() {

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
}

/**
 * Animation Loop
 * 
 * Applies all constant transformations every tick.
 */
export function animate() {
        requestAnimationFrame(animate);

        if (!initDollyComplete) {
                initDolly();
                initDollyComplete = true;
        }

        // controls.update();
        renderer.render(scene, camera);
}

function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
}