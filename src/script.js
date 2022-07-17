import './style.css'
// import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import Scrollbar from 'smooth-scrollbar'
import gsap from 'gsap'

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// Scroll Triggers
gsap.registerPlugin(ScrollTrigger)

// 3rd party library setup:
const bodyScrollBar = Scrollbar.init(document.querySelector('#bodyScrollbar'), { damping: 0.1, delegateTo: document })

// Tell ScrollTrigger to use these proxy getter/setter methods for the "body" element: 
ScrollTrigger.scrollerProxy('#bodyScrollbar', {
  scrollTop(value) {
    if (arguments.length) {
      bodyScrollBar.scrollTop = value; // setter
    }
    return bodyScrollBar.scrollTop    // getter
  },
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight}
  }
})

// when the smooth scroller updates, tell ScrollTrigger to update() too: 
bodyScrollBar.addListener(ScrollTrigger.update);

// -----------------------------------------------------------------
/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Fix Position
bodyScrollBar.addListener(({ offset }) => {  
    canvas.style.top = offset.y + 'px'
})

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xF8F0E3)

/**
 * Loaders
 */
// Loading Manager
const loadingBar = document.getElementById('loadingBar')
const loadingPage = document.getElementById('loadingPage')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
       
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {

    }
)

const images = []

// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Font Loader
const fontLoader = new FontLoader()

// Lighting

const ambientLight = new THREE.AmbientLight(0xaa00ff, 0.1)
scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {    
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Objects

// --------------------

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false

controls.enableDamping = true
controls.maxPolarAngle = Math.PI/2
// controls.minAzimuthAngle = Math.PI*0/180
// controls.maxAzimuthAngle = Math.PI*90/180
controls.minDistance = 12  
controls.maxDistance = 80

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping

// Raycaster
const raycaster = new THREE.Raycaster()

// Parallax Camera Group
const cameraGroup = new THREE.Group
cameraGroup.add(camera)
cameraGroup.position.set(0,0,5)
scene.add(cameraGroup)

// Objects
const testMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1,1,32,32),
    new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide})
)
testMesh.position.set(2,0,0)
scene.add(testMesh)

// Events
const mouse = {
    x: 0,
    y: 0
}

document.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX/window.innerWidth - 0.5
    mouse.y = -(e.clientY/window.innerHeight - 0.5)
    
    if (mouse.x > 0.25) {
        gsap.to('.gameDiv', {duration: 0, x: (mouse.x - 0.25) * - 1000})
    }

    else {
        gsap.to('.gameDiv', {duration: 0, rotation: 0})
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    scrollY = bodyScrollBar.scrollTop
    const elapsedTime = clock.getElapsedTime()

    testMesh.rotation.x = elapsedTime * 0.5
    testMesh.rotation.y = elapsedTime * 0.2
    testMesh.rotation.z = elapsedTime * 0.3

    // Update controls
    if (controls.enabled == true) {
        controls.update()
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// Scroll Triggers
// gsap.fromTo(camera.position, {x: 0, y: 0}, {x: 0, y: 0})

// gsap.fromTo(camera.position, {x: parameters.sectionDistance * 0 * Math.sin(parameters.rotationAngle), y: -parameters.sectionDistance * 0 * Math.cos(parameters.rotationAngle)}, {
//     scrollTrigger: {
//         trigger: '#section1',
//         start: () =>  window.innerHeight*1 + ' bottom',
//         end: () =>  window.innerHeight*1 + ' top',
//         snap: 1, 
//         scrub: true,
//     },
//     x: parameters.sectionDistance * 1 * Math.sin(parameters.rotationAngle),
//     y: -parameters.sectionDistance * 1 * Math.cos(parameters.rotationAngle),
//     ease: 'none'
// })



// Round Timer (Will stop in 10 minutes)
gsap.fromTo('.timerProgress', {duration: 0, scaleX: 0, transformOrigin: 'left', ease: 'none'}, {duration: 5*60, scaleX: 1, transformOrigin: 'left', ease: 'none'})

const actualTimer = document.querySelector('.actualTimer')
let days = 30

const updateTimer = () => {
    actualTimer.innerText = days + ' days'
    days = days - 1
    setTimeout(() => {
        updateTimer()
    }, 5*60000 / 30)
}

updateTimer()

// Player Object
const playerData = {
    name: 'Patrick',
    currentMoney: 1000,
    availableMoney: 1000,
    investedMoney: 0,
    score: 0,
}

const playerCV = document.querySelector('.playerCV')
const playerAM = document.querySelector('.playerAM')
const playerScore = document.querySelector('.playerScore')


// Update Player Portfolio
const updatePlayerPortfolio = () => {
    playerCV.innerText = playerData.currentMoney.toLocaleString("en-US")
    playerAM.innerText = playerData.availableMoney.toLocaleString("en-US")
    playerScore.innerText = playerData.score.toLocaleString("en-US")
}

updatePlayerPortfolio()

// Stocks Data
const stocksData = [
    {name: "McRonald's", price: 15, projection: 0, owned: 0, value: 0},
    {name: "Burger Queen", price: 15, projection: 0, owned: 0, value: 0},
    {name: "Chirper", price: 15, projection: 0, owned: 0, value: 0},
    {name: "Goggle", price: 15, projection: 0, owned: 0, value: 0},
    {name: "Fjord", price: 15, projection: 0, owned: 0, value: 0},
    {name: "Tezla", price: 15, projection: 0, owned: 0, value: 0},
    {name: "?", price: 15, projection: 0, owned: 0, value: 0}
]

const stockNames = document.querySelectorAll('.stockNameDiv')
const stockPrices = document.querySelectorAll('.stockPrice')
const stockProjections = document.querySelectorAll('.stockProjection')
const stockChangeDivs = document.querySelectorAll('.stockChangeDiv')
const stockArrows = document.querySelectorAll('.stockArrow')
const stockOwneds = document.querySelectorAll('.stockOwned')
const stockValues = document.querySelectorAll('.stockValue')

const updateStocks = () => {
    for (let i = 0; i < stockNames.length; i++) {
        stockNames[i].innerText = stocksData[i].name
        stockPrices[i].innerText = stocksData[i].price
        stockProjections[i].innerText = stocksData[i].projection
        if (stocksData[i].projection >= 0) {
            stockChangeDivs[i].classList.remove('down')
            stockChangeDivs[i].classList.add('up')
            stockArrows[i].innerText = 'arrow_drop_up'
        }
        else {
            stockChangeDivs[i].classList.remove('up')
            stockChangeDivs[i].classList.add('down')
            stockArrows[i].innerText = 'arrow_drop_down'
        }
        stockOwneds[i].innerText = stocksData[i].owned
        stocksData[i].value = stocksData[i].owned * stocksData[i].price
        stockValues[i].innerText = stocksData[i].value
    }
}

updateStocks()

// Buy Events
const buyButtons = document.querySelectorAll('.buyButton')

for (let i = 0; i < buyButtons.length; i++) {
    buyButtons[i].addEventListener('click', () => {
        if (playerData.availableMoney > stocksData[i].price) {
            stocksData[i].owned += 1
            playerData.availableMoney -= stocksData[i].price
        }
        globalUpdates()
    })
}

// Sell Events
const sellButtons = document.querySelectorAll('.sellButton')

for (let i = 0; i < sellButtons.length; i++) {
    sellButtons[i].addEventListener('click', () => {
        if (stocksData[i].owned > 0) {
            stocksData[i].owned -= 1
            playerData.availableMoney += stocksData[i].price
        }
        globalUpdates()
    })
}

// News Updates
const news = [
    {
        news: "Elon Mask FINALLY buys Chirper!",
        effects:
        [
            {results: "Chirper stocks skyrockets!", affectedPositively: [2], affectedNegatively: []},
            {results: "He completely forgets about Tezla.", affectedPositively: [0], affectedNegatively: [5]}
        ]
    },
    {
        news: "CRISIS: Global Potato Shortage",
        effects:
        [
            {results: "No, you can't have fries with that.", affectedPositively: [0,1], affectedNegatively: []},
            {results: "The lack of Vodka has surprisingly lowered the number of car accidents. Car prices go up!", affectedPositively: [], affectedNegatively: [4,5]}
        ]
    }
]

// Add News
const actualNewsFeedDiv = document.querySelector('.actualNewsFeedDiv')

const addNews = () => {
    const newDiv = document.createElement("div")
    newDiv.setAttribute('class', 'newsDiv')
    newDiv.classList.add('newsDiv')

    const newsIndex = Math.floor(Math.random() * news.length)

    const newsText = document.createElement("div")
    newsText.setAttribute('class', 'newsText')
    newsText.innerText = news[newsIndex].news

    const countDown = document.createElement("div")
    countDown.setAttribute('class', 'countDown')
    setTimeout(() => {
        document.querySelector('.countDown').classList.remove('countDown')
        updateNews()
    }, 10000)

    newDiv.appendChild(newsText)
    newDiv.appendChild(countDown)

    actualNewsFeedDiv.appendChild(newDiv)
}

const updateNews = () => {
    addNews()
    gsap.to('.countDown', {duration: 10, scaleX: 0, transformOrigin: 'left', ease: 'none'})
}

updateNews()

// Global Updates
const globalUpdates = () => {
    updateStocks()
    updatePlayerPortfolio()
}

tick()