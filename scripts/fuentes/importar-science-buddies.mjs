import { readFile, writeFile } from "node:fs/promises";

const PENDING_URL = new URL("../../data/pendientes.json", import.meta.url);
const RESOURCES_URL = new URL("../../data/resources.json", import.meta.url);
const SOURCE_PAGE = "https://www.sciencebuddies.org/blog/robotics-lessons";

// Science Buddies bloquea las peticiones de GitHub Actions con HTTP 403.
// Esta lista recoge los enlaces educativos verificados de su recopilación de robótica.
// Solo guarda candidatos: revisado permanece en false hasta comprobar edad y etapa.
const catalogue = [
  ["Build a Brushbot", "https://www.sciencebuddies.org/stem-activities/brushbot", "actividad", ["robot-construido"]],
  ["Build a Bristlebot, a Tiny Toothbrush Robot", "https://www.sciencebuddies.org/stem-activities/toothbrush-bristlebot", "actividad", ["robot-construido"]],
  ["Vibrobots— Tiny Robots from Scratch", "https://www.sciencebuddies.org/teacher-resources/lesson-plans/build-vibrobots", "plan-docente", ["robot-construido"], 8, 11, ["primaria"]],
  ["Art Bot: Build a Wobbly Robot That Creates Art", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p014/robotics/build-art-bot", "proyecto", ["robot-construido"]],
  ["Build Robots From Recycled Materials — Junkbots", "https://www.sciencebuddies.org/teacher-resources/lesson-plans/junkbots", "plan-docente", ["robot-construido"], 11, 14, ["primaria", "secundaria"]],
  ["Build a Simple Underwater Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p002/robotics/build-an-underwater-robot", "proyecto", ["robot-construido"]],
  ["Flippy, the Dancing Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p027/robotics/flippy-the-dancing-robot", "proyecto", ["robot-construido"]],
  ["Build a Jumping Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p047/robotics/rubber-band-jumping-robot", "proyecto", ["robot-construido"]],
  ["Build a Simple Steerable Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p045/robotics/simple-steerable-robot", "proyecto", ["robot-construido"]],
  ["Build a Simple Walking Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p057/robotics/simple-walking-robot", "proyecto", ["robot-construido"]],
  ["Line-Following Robot", "https://www.sciencebuddies.org/teacher-resources/lesson-plans/line-following-robot", "plan-docente", ["robot-construido"]],
  ["Build a Motion-Activated Guard Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p024/robotics/guard-robot", "proyecto", ["robot-construido"]],
  ["Build a Speedy Light-Tracking Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p022/robotics/light-following-robot", "proyecto", ["robot-construido"]],
  ["Build an Obstacle-Avoiding Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p028/robotics/obstacle-avoiding-robot", "proyecto", ["robot-construido"]],
  ["Build a Light-Tracking Bristlebot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p012/robotics/build-a-light-tracking-bristlebot", "proyecto", ["robot-construido"]],
  ["Build a Solar-Powered Bristlebot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p026/robotics/build-a-solar-powered-bristlebot", "proyecto", ["robot-construido"]],
  ["Build a Robotic Arm", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p050/robotics/arduino-robotic-arm", "proyecto", ["arduino", "robot-construido"]],
  ["DIY Mini Drone: Arduino Altitude Control", "https://www.sciencebuddies.org/stem-activities/diy-mini-drone-arduino-altitude-control", "actividad", ["arduino", "robot-construido"]],
  ["Drone Control with an Analog Joystick", "https://www.sciencebuddies.org/stem-activities/drone-arduino-steering-joystick", "actividad", ["arduino", "robot-construido"]],
  ["Build a Miniature Self-Driving Car", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p042/robotics/arduino-self-driving-car", "proyecto", ["arduino", "robot-construido"]],
  ["What Sensors Are Best for Self-Driving Cars?", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p043/robotics/autonomous-car-sensors", "proyecto", ["arduino", "robot-construido"]],
  ["How Fast is Automatic Braking?", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p044/robotics/autonomous-car-automatic-braking", "proyecto", ["arduino", "robot-construido"]],
  ["Squishy Robots: Build an Air-Powered Soft Robotic Gripper", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p020/robotics/squishy-robots-build-an-air-powered-soft-robotic-gripper", "proyecto", ["robot-construido"]],
  ["Keep Your Arduino Robot From Falling Off a Cliff", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p033/robotics/edge-detecting-arduino-robot", "proyecto", ["arduino", "robot-construido"]],
  ["Build a Solar-Tracking Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p032/robotics/solar-tracking-robot", "proyecto", ["arduino", "robot-construido"]],
  ["Build an Autonomous Arduino Robot with Bump Sensors", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p034/robotics/arduino-robot-bump-sensors", "proyecto", ["arduino", "robot-construido"]],
  ["Build a Sound-Tracking Search and Rescue Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p048/robotics/sound-tracking-robot", "proyecto", ["arduino", "robot-construido"]],
  ["Build an Arduino Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p031/robotics/build-arduino-robot", "proyecto", ["arduino", "robot-construido"]],
  ["Build an Arduino Walking Robot", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p058/robotics/arduino-walking-robot", "proyecto", ["arduino", "robot-construido"]],
  ["Build an Arduino ROV", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p052/robotics/arduino-underwater-ROV", "proyecto", ["arduino", "robot-construido"]],
  ["Build an RC Boat", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p055/robotics/build-an-arduino-rc-boat", "proyecto", ["arduino", "robot-construido"]],
  ["Build a Robot Hand", "https://www.sciencebuddies.org/stem-activities/build-a-robot-hand", "actividad", ["robot-construido"]],
  ["Make an Origami Robotic Gripper", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p053/robotics/origami-robotic-gripper", "proyecto", ["robot-construido"]],
  ["Foldable Paper Robotic Gripper", "https://www.sciencebuddies.org/teacher-resources/lesson-plans/foldable-paper-robotic-gripper", "plan-docente", ["robot-construido"]],
  ["Robot, Make Me a Sandwich!", "https://www.sciencebuddies.org/stem-activities/robot-make-sandwich", "actividad", ["sin-dispositivo"]],
  ["Mars Rover Obstacle Course", "https://www.sciencebuddies.org/stem-activities/mars-rover-obstacle-course", "actividad", ["sin-dispositivo"]],
  ["Squishy Robot Simulator", "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Robotics_p016/robotics/squishy-robot-simulator", "proyecto", ["sin-dispositivo"]]
];

function slugFrom(url) {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1).toLowerCase();
}

const imported = catalogue.map(([titulo, url, tipo, hardware, edadMin = null, edadMax = null, etapas = []]) => ({
  id: `science-buddies-${slugFrom(url)}`,
  titulo,
  descripcion: "Recurso de robótica en inglés recogido en la selección de Science Buddies. Clasificación educativa pendiente de revisión.",
  fuenteId: "science-buddies",
  fuente: "Science Buddies",
  entidad: "Science Buddies",
  url,
  paginaColeccion: SOURCE_PAGE,
  etapas,
  edadMin,
  edadMax,
  hardware,
  idiomas: ["en"],
  tags: ["robótica", "STEM", "ingeniería"],
  tipo,
  licencia: "Copyright Science Buddies; consultar condiciones de uso en la fuente",
  revisado: false
}));

let pending = [];
try {
  pending = JSON.parse(await readFile(PENDING_URL, "utf8"));
  if (!Array.isArray(pending)) throw new Error("data/pendientes.json no contiene una lista");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const otherSources = pending.filter(item => item.fuenteId !== "science-buddies");
let published = [];
try { published = JSON.parse(await readFile(RESOURCES_URL, "utf8")); } catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const publishedIds = new Set(published.map(item => item.id));
const publishedUrls = new Set(published.map(item => item.url));
const newCandidates = imported.filter(item => !publishedIds.has(item.id) && !publishedUrls.has(item.url));
await writeFile(PENDING_URL, `${JSON.stringify([...otherSources, ...newCandidates], null, 2)}\n`, "utf8");
console.log(`Preparados ${newCandidates.length} candidatos nuevos de Science Buddies (${imported.length} enlaces controlados).`);
