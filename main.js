import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("container");

// Create a canvas element and append it to the container div
const canvas = document.createElement("canvas");
let node;
container.appendChild(canvas);
// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  40
);
// Set camera position
camera.position.set(0, 0.5, 2); // Adjust the position as needed

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 0.1;
controls.maxDistance = 100;
controls.target.set(0, 0, 0);
controls.update();

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White directional light
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const spotlight = new THREE.SpotLight(0xffffff, 1); // White spotlight
spotlight.position.set(0, 10, 0);
spotlight.angle = Math.PI / 6; // 30 degrees
spotlight.penumbra = 0.05;
spotlight.decay = 2;
spotlight.distance = 200;
scene.add(spotlight);

// Load the glTF file
const loader = new GLTFLoader();
loader.load(
  "GLTF/scene.glb",
  function (gltf) {
    scene.add(gltf.scene);
    node = gltf.scene;
    // Function to recursively traverse the node hierarchy
    const traverseNode = (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.userData.originalMaterial = child.material.clone();
          child.userData.originalColor = child.material.color.clone(); // Store original color
          loadMesh(child);
          const fullcolorchange = document.getElementById("ColorpickerAll");
          fullcolorchange.addEventListener("input", function () {
            changeShirtColor(child, fullcolorchange.value);
          });
        }
      });
    };
    // Traverse the loaded scene to find meshes
    traverseNode(node);
  },
  undefined,
  function (error) {
    console.error("Error loading glTF model:", error);
  }
);
function loadMesh(node) {
  const meshList = document.getElementById("meshList");
  const row = document.createElement("tr");

  // Create table cells for mesh name and color picker
  const nameCell = document.createElement("td");
  nameCell.textContent = node.name;

  const colorPickerCell = document.createElement("td");
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.setAttribute("id", node.name);

  // Add event listener to color picker
  colorPicker.addEventListener("input", function () {
    changeMeshColor(node, colorPicker.value);
  });

  colorPickerCell.appendChild(colorPicker);

  // Append cells to the row
  row.appendChild(nameCell);
  row.appendChild(colorPickerCell);

  // Append row to the table
  meshList.appendChild(row);
}

function changeMeshColor(mesh, color) {
  // Create a new material with the selected color
  const newMaterial = new THREE.MeshBasicMaterial({
    color: parseInt(color.replace("#", ""), 16),
    side: THREE.DoubleSide,
  });

  // Assign the new material to the mesh
  mesh.material = newMaterial;

  // Reset material color after a delay (e.g., 1 second)
  // setTimeout(() => {
  //   mesh.material = mesh.userData.originalMaterial; // Restore original material
  // }, 1000);
}

function changeShirtColor(node, color) {
  // Change material color on click
  const originalColor = node.userData.originalColor; // Get the original color

  node.material.color.set(parseInt(color.replace("#", ""), 16));
  node.material.opacity = 0.5;
  setTimeout(() => {
    node.material.color.copy(originalColor); // Restore original color
    node.material.opacity = 1;
  }, 2000);
}
// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
