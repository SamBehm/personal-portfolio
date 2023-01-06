import { setupCanvas, animate, initDolly, getIntersected, setupScene } from './rendering.js'
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const speed = 50;
const console_text = ["> git clone https://github.com/SamBehm/personal-portfolio.git",
  "Cloning into 'personal-portfolio'...",
  "remote: Enumerating objects: 306, done.",
  "remote: Counting objects: 100% (306/306), done.",
  "remote: Compressing objects: 100% (184/184), done.",
  "remote: Total 306 (delta 143), reused 280 (delta 117), pack-reused 0;",
  "Receiving objects: 100% (306/306), 2.38 MiB | 3.06 MiB/s, done.",
  "Resolving deltas: 100% (143/143), done.",
  "Welcome!"];

async function main() {
  await initLoadingScreen();
  initDolly();

  document.addEventListener('click', onClickEvent);

  animate();
}

/**
 * Function used to display loading screen on `console`, while models are being loaded.
 */
async function initLoadingScreen() {
  try {
    let p = setupCanvas();
    // await printPreamble();
    let objects = await p;

    setupScene(objects);
    document.querySelector("#div-screen-console").style.display = 'none';
  } catch (error) {
    document.querySelector("#screen-console-text").innerHTML += '<span style="color:red">Error! ' + error + '<br />Let me know the error and I\'ll try and fix it :(</span>';
    return;
  }
}

async function printPreamble() {

  var screenConsole = document.querySelector("#screen-console-text");
  screenConsole.innerHTML = ">" + '<span id="blinker">\u25ae</span>';

  for (let pos = 1; pos < console_text[0].length; pos++) {
    screenConsole.innerHTML = console_text[0].substring(0, pos) + '<span id="blinker">\u25ae</span>';
    await new Promise(r => setTimeout(r, speed));
  }

  screenConsole.innerHTML = console_text[0] + '<br/>';

  for (let lineNum = 1; lineNum < console_text.length; lineNum++) {
    screenConsole.innerHTML += console_text[lineNum] + '<br/>';
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 501)));
  }
}

function onClickEvent(event) {

  let intersectedObject = getIntersected();
  let duration = 2;
  let scrollTarget = 0;
  let offsetY = 0;

  switch (intersectedObject.name) {
    case "Bed":
      duration = 1;
      scrollTarget = "#content-about-me";
      break;
    case "Bookshelf":
      duration = 1;
      scrollTarget = "#content-about-me";
      offsetY = 50;
      break;
    case "Whiteboard":
      scrollTarget = "#content-contact";
      break;
    case "PivotGroup":
      break;
    default:
      return;
  }

  gsap.to(window, { duration: 2, scrollTo: { y: scrollTarget, offsetY: -offsetY } });
}

main();