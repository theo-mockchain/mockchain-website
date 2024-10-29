"use client";

// import { NextReactP5Wrapper } from "@p5-wrapper/react";
import type P5 from "p5";
import { ReactP5Wrapper, type Sketch } from "@p5-wrapper/react";
import { useRef } from "react";

// Constants
const GRID_SIZE = 25;
const DOT_SIZE = 2;
const MOUSE_INFLUENCE_RADIUS = 300;
const EASING = 0.1;
const METABALL_COUNT = 3;
const METABALL_MAX_RADIUS = 200;
const METABALL_MIN_SPEED = 2;
const METABALL_MAX_SPEED = 4;
const METABALL_BOUNCE_DECAY = 0.9;
const METABALL_MOUSE_ATTRACTION_RADIUS = 1000;
const METABALL_MOUSE_ATTRACTION_STRENGTH = 0.03;
const METABALL_REPULSION_RADIUS = 200;
const METABALL_REPULSION_STRENGTH = 0.02;
const MAX_MOUSE_EFFECT = 0.15;
const MAX_LINE_WIDTH = 2;
const DEBUG_MODE = false;
const BG_COLOR = [22, 23, 40];
const DOT_COLOR = [56, 60, 70, 255];
const VISIBLE_HEIGHT_PERCENTAGE = 80;
const MAX_NODES_PER_CONSTELLATION = 60;
const NODE_ADD_CHANCE = 0.1;
const MAX_HIGHLIGHT_RADIUS = 6;
const MAX_OPACITY = 40;
const METABALL_INFLUENCE_RADIUS = 300;
const MOUSE_ATTRACTION_TAPER_DURATION = 10000;

// Interfaces
interface Dot {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
}

interface Metaball {
  x: number;
  y: number;
  radius: number;
  strength: number;
  vx: number;
  vy: number;
}

interface HighlightNode {
  dot: Dot;
  radius: number;
  targetRadius: number;
  opacity: number;
}

interface HighlightLine {
  start: Dot;
  end: Dot;
  progress: number;
}

interface Constellation {
  nodes: HighlightNode[];
  lines: HighlightLine[];
  metaball: Metaball;
}

// Add type for p5Types
type p5Types = P5;

const ClientBackgroundCanvas: React.FC = () => {
  const dots = useRef<Dot[]>([]);
  const activeDots = useRef<Set<Dot>>(new Set());
  const sectors = useRef<Dot[][][]>([]);
  const metaballs = useRef<Metaball[]>([]);
  const constellations = useRef<Constellation[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(Date.now());
  const mouseVelocity = useRef({ x: 0, y: 0 });

  // Create the sketch function with proper typing
  const sketch: Sketch = (p5: P5) => {
    p5.setup = () => setup(p5);
    p5.draw = () => draw(p5);
    p5.windowResized = () => windowResized(p5);
  };

  // Update setup to remove canvasParentRef parameter since NextReactP5Wrapper handles this
  const setup = (p5: P5) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(BG_COLOR);
    createDots(p5);
    createMetaballs(p5);
    initializeConstellations();
  };

  const initializeConstellations = () => {
    constellations.current = metaballs.current.map((metaball) => ({
      nodes: [],
      lines: [],
      metaball,
    }));
  };

  const draw = (p5: p5Types) => {
    p5.background(BG_COLOR);
    updateDots(p5);
    updateMetaballs(p5);
    updateConstellations(p5);
    renderDots(p5);
    renderConstellations(p5);

    if (DEBUG_MODE) {
      renderDebugInfo(p5);
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    createDots(p5);
  };

  const createDots = (p5: p5Types) => {
    dots.current = [];
    activeDots.current.clear();
    for (let x = -GRID_SIZE; x < p5.width + GRID_SIZE; x += GRID_SIZE) {
      for (
        let y = -GRID_SIZE - GRID_SIZE / 2;
        y < p5.height + GRID_SIZE;
        y += GRID_SIZE
      ) {
        dots.current.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0 });
      }
    }
    updateSectors(p5);
  };

  const createMetaballs = (p5: p5Types) => {
    metaballs.current = [];
    for (let i = 0; i < METABALL_COUNT; i++) {
      const speed = p5.random(METABALL_MIN_SPEED, METABALL_MAX_SPEED);
      const angle = p5.random(p5.TWO_PI);
      metaballs.current.push({
        x: p5.random(METABALL_MAX_RADIUS, p5.width - METABALL_MAX_RADIUS),
        y: p5.random(METABALL_MAX_RADIUS, p5.height - METABALL_MAX_RADIUS),
        radius: p5.random(50, METABALL_MAX_RADIUS),
        strength: p5.random(0.1, 1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  };

  const updateMetaballs = (p5: p5Types) => {
    const currentTime = Date.now();
    const mouseMovement = {
      x: p5.mouseX - lastMousePos.current.x,
      y: p5.mouseY - lastMousePos.current.y,
    };
    const isMouseMoving = mouseMovement.x !== 0 || mouseMovement.y !== 0;

    if (isMouseMoving) {
      lastMouseMoveTime.current = currentTime;
    }

    const timeSinceLastMove = currentTime - lastMouseMoveTime.current;
    const attractionStrength = Math.max(
      0,
      1 - timeSinceLastMove / MOUSE_ATTRACTION_TAPER_DURATION
    );

    metaballs.current.forEach((metaball: Metaball, index: number) => {
      updateMetaballPosition(p5, metaball, attractionStrength);
      handleMetaballRepulsion(p5, metaball, index);
      handleMetaballScreenCollision(p5, metaball);
      ensureMetaballSpeed(metaball);
    });

    lastMousePos.current = { x: p5.mouseX, y: p5.mouseY };
  };

  const updateMetaballPosition = (
    p5: p5Types,
    metaball: Metaball,
    attractionStrength: number
  ) => {
    metaball.x += metaball.vx;
    metaball.y += metaball.vy;

    if (attractionStrength > 0) {
      const dx = p5.mouseX - metaball.x;
      const dy = p5.mouseY - metaball.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < METABALL_MOUSE_ATTRACTION_RADIUS) {
        const baseAttractionForce =
          (1 - distToMouse / METABALL_MOUSE_ATTRACTION_RADIUS) *
          METABALL_MOUSE_ATTRACTION_STRENGTH;
        const taperedAttractionForce = baseAttractionForce * attractionStrength;
        metaball.vx += dx * taperedAttractionForce;
        metaball.vy += dy * taperedAttractionForce;
      }
    }
  };

  const handleMetaballRepulsion = (
    p5: p5Types,
    metaball: Metaball,
    index: number
  ) => {
    for (let i = index + 1; i < metaballs.current.length; i++) {
      const otherMetaball = metaballs.current[i];
      const repelDx = metaball.x - otherMetaball.x;
      const repelDy = metaball.y - otherMetaball.y;
      const distance = Math.sqrt(repelDx * repelDx + repelDy * repelDy);

      if (distance < METABALL_REPULSION_RADIUS) {
        const repulsionForce =
          (1 - distance / METABALL_REPULSION_RADIUS) *
          METABALL_REPULSION_STRENGTH;
        const repelAngle = Math.atan2(repelDy, repelDx);
        metaball.vx += Math.cos(repelAngle) * repulsionForce;
        metaball.vy += Math.sin(repelAngle) * repulsionForce;
        otherMetaball.vx -= Math.cos(repelAngle) * repulsionForce;
        otherMetaball.vy -= Math.sin(repelAngle) * repulsionForce;
      }
    }
  };

  const handleMetaballScreenCollision = (p5: p5Types, metaball: Metaball) => {
    if (
      metaball.x - metaball.radius < 0 ||
      metaball.x + metaball.radius > p5.width
    ) {
      metaball.vx *= -METABALL_BOUNCE_DECAY;
      metaball.x = p5.constrain(
        metaball.x,
        metaball.radius,
        p5.width - metaball.radius
      );
    }
    if (
      metaball.y - metaball.radius < 0 ||
      metaball.y + metaball.radius > p5.height
    ) {
      metaball.vy *= -METABALL_BOUNCE_DECAY;
      metaball.y = p5.constrain(
        metaball.y,
        metaball.radius,
        p5.height - metaball.radius
      );
    }
  };

  const ensureMetaballSpeed = (metaball: Metaball) => {
    const currentSpeed = Math.sqrt(metaball.vx ** 2 + metaball.vy ** 2);
    if (currentSpeed < METABALL_MIN_SPEED) {
      const scale = METABALL_MIN_SPEED / currentSpeed;
      metaball.vx *= scale;
      metaball.vy *= scale;
    }

    const maxSpeed = METABALL_MAX_SPEED * 1.5;
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      metaball.vx *= scale;
      metaball.vy *= scale;
    }
  };

  const updateSectors = (p5: p5Types) => {
    const sectorSize = MOUSE_INFLUENCE_RADIUS * 2;
    const cols = Math.ceil(p5.width / sectorSize);
    const rows = Math.ceil(p5.height / sectorSize);
    sectors.current = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => [])
      );

    dots.current.forEach((dot: Dot) => {
      const col = Math.floor(dot.x / sectorSize);
      const row = Math.floor(dot.y / sectorSize);
      if (sectors.current[row] && sectors.current[row][col]) {
        sectors.current[row][col].push(dot);
      }
    });
  };

  const updateDots = (p5: p5Types) => {
    const rawMouseVelocity = {
      x: p5.mouseX - lastMousePos.current.x,
      y: p5.mouseY - lastMousePos.current.y,
    };
    const mouseSpeed = Math.sqrt(
      rawMouseVelocity.x ** 2 + rawMouseVelocity.y ** 2
    );
    const normalizedMouseSpeed = sigmoid(mouseSpeed / MAX_MOUSE_EFFECT);

    mouseVelocity.current = {
      x: rawMouseVelocity.x * normalizedMouseSpeed,
      y: rawMouseVelocity.y * normalizedMouseSpeed,
    };
    lastMousePos.current = { x: p5.mouseX, y: p5.mouseY };
    sectors.current.forEach((row: Dot[][]) => {
      row.forEach((sector: Dot[]) => {
        sector.forEach((dot: Dot) => {
          updateDotPosition(p5, dot, normalizedMouseSpeed);
        });
      });
    });
  };

  const updateDotPosition = (
    p5: p5Types,
    dot: Dot,
    normalizedMouseSpeed: number
  ) => {
    let fieldForceX = 0;
    let fieldForceY = 0;

    const dx = dot.x - p5.mouseX;
    const dy = dot.y - p5.mouseY;
    const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

    if (distanceToMouse < MOUSE_INFLUENCE_RADIUS) {
      const mouseEffect =
        (1 - distanceToMouse / MOUSE_INFLUENCE_RADIUS) *
        normalizedMouseSpeed *
        MAX_MOUSE_EFFECT;
      fieldForceX += mouseVelocity.current.x * mouseEffect;
      fieldForceY += mouseVelocity.current.y * mouseEffect;
    }

    dot.vx += fieldForceX + (dot.homeX - dot.x) * EASING;
    dot.vy += fieldForceY + (dot.homeY - dot.y) * EASING;

    dot.x += Math.pow(dot.vx * EASING, 3);
    dot.y += Math.pow(dot.vy * EASING, 3);

    dot.vx *= 0.95;
    dot.vy *= 0.95;
  };

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  const renderDots = (p5: p5Types) => {
    p5.noStroke();
    const maxVisibleY = p5.height * (VISIBLE_HEIGHT_PERCENTAGE / 100);

    dots.current.forEach((dot: Dot) => {
      const alpha = p5.map(dot.y, 0, maxVisibleY, 255, 0, true);
      p5.fill([...DOT_COLOR.slice(0, 3), alpha]);
      p5.ellipse(dot.x, dot.y, DOT_SIZE, DOT_SIZE);
    });
  };

  const updateConstellations = (p5: p5Types) => {
    constellations.current.forEach((constellation: Constellation) => {
      const { metaball } = constellation;

      if (
        p5.random() < NODE_ADD_CHANCE &&
        constellation.nodes.length < MAX_NODES_PER_CONSTELLATION
      ) {
        addNodeToConstellation(p5, constellation);
      }

      constellation.nodes.forEach((node: HighlightNode) => {
        updateNode(p5, node, metaball);
      });

      constellation.nodes = constellation.nodes.filter((node) => {
        const dx = node.dot.x - metaball.x;
        const dy = node.dot.y - metaball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= METABALL_INFLUENCE_RADIUS * 1.2;
      });

      ensureConnectivity(p5, constellation);
    });
  };

  const updateNode = (p5: p5Types, node: HighlightNode, metaball: Metaball) => {
    const dx = node.dot.x - metaball.x;
    const dy = node.dot.y - metaball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const influence = Math.max(0, 1 - distance / METABALL_INFLUENCE_RADIUS);
    node.opacity = p5.lerp(node.opacity, influence * MAX_OPACITY, 0.1);
    node.radius = p5.lerp(node.radius, node.targetRadius * influence, 0.1);
  };

  const addNodeToConstellation = (
    p5: p5Types,
    constellation: Constellation
  ) => {
    const { metaball } = constellation;
    const angle = p5.random(p5.TWO_PI);
    const radius = p5.random(METABALL_INFLUENCE_RADIUS);
    const x = metaball.x + Math.cos(angle) * radius;
    const y = metaball.y + Math.sin(angle) * radius;

    const closestDot = findClosestDot(p5, x, y);
    if (closestDot) {
      const newNode: HighlightNode = {
        dot: closestDot,
        radius: 0,
        targetRadius: p5.random(
          MAX_HIGHLIGHT_RADIUS * 0.5,
          MAX_HIGHLIGHT_RADIUS
        ),
        opacity: 0,
      };
      constellation.nodes.push(newNode);

      if (constellation.nodes.length > 1) {
        const nearestNode = findNearestNode(
          p5,
          newNode,
          constellation.nodes.slice(0, -1)
        );
        if (nearestNode) {
          addLine(constellation, newNode, nearestNode);
        }
      }
    }
  };

  const ensureConnectivity = (p5: p5Types, constellation: Constellation) => {
    if (constellation.nodes.length < 2) return;

    const connectedComponents = findConnectedComponents(constellation);

    if (connectedComponents.length > 1) {
      for (let i = 1; i < connectedComponents.length; i++) {
        const nearestPair = findNearestNodesBetweenComponents(
          p5,
          connectedComponents[0],
          connectedComponents[i]
        );
        if (nearestPair) {
          addLine(constellation, nearestPair[0], nearestPair[1]);
        }
      }
    }

    constellation.lines.forEach((line) => {
      line.progress += (1 - line.progress) * 0.1;
    });
  };

  const findConnectedComponents = (constellation: Constellation) => {
    const visited = new Set<HighlightNode>();
    const components: HighlightNode[][] = [];

    constellation.nodes.forEach((node) => {
      if (!visited.has(node)) {
        const component: HighlightNode[] = [];
        dfs(node, visited, component, constellation);
        components.push(component);
      }
    });

    return components;
  };

  const dfs = (
    node: HighlightNode,
    visited: Set<HighlightNode>,
    component: HighlightNode[],
    constellation: Constellation
  ) => {
    visited.add(node);
    component.push(node);

    constellation.lines.forEach((line) => {
      let neighbor: HighlightNode | null = null;
      if (line.start === node.dot) {
        neighbor = constellation.nodes.find((n) => n.dot === line.end) || null;
      } else if (line.end === node.dot) {
        neighbor =
          constellation.nodes.find((n) => n.dot === line.start) || null;
      }

      if (neighbor && !visited.has(neighbor)) {
        dfs(neighbor, visited, component, constellation);
      }
    });
  };

  const findNearestNodesBetweenComponents = (
    p5: p5Types,
    component1: HighlightNode[],
    component2: HighlightNode[]
  ): [HighlightNode, HighlightNode] | null => {
    let minDist = Infinity;
    let nearestPair: [HighlightNode, HighlightNode] | null = null;

    component1.forEach((node1) => {
      component2.forEach((node2) => {
        const dist = p5.dist(
          node1.dot.x,
          node1.dot.y,
          node2.dot.x,
          node2.dot.y
        );
        if (dist < minDist) {
          minDist = dist;
          nearestPair = [node1, node2];
        }
      });
    });

    return nearestPair;
  };

  const findNearestNode = (
    p5: p5Types,
    node: HighlightNode,
    nodes: HighlightNode[]
  ) => {
    let nearestNode = null;
    let minDist = Infinity;

    nodes.forEach((otherNode) => {
      const dist = p5.dist(
        node.dot.x,
        node.dot.y,
        otherNode.dot.x,
        otherNode.dot.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearestNode = otherNode;
      }
    });

    return nearestNode;
  };

  const addLine = (
    constellation: Constellation,
    start: HighlightNode,
    end: HighlightNode
  ) => {
    const existingLine = constellation.lines.find(
      (line) =>
        (line.start === start.dot && line.end === end.dot) ||
        (line.start === end.dot && line.end === start.dot)
    );

    if (!existingLine) {
      constellation.lines.push({
        start: start.dot,
        end: end.dot,
        progress: 0,
      });
    }
  };

  const findClosestDot = (p5: p5Types, x: number, y: number) => {
    let closestDot = null;
    let closestDistance = Infinity;
    dots.current.forEach((dot: Dot) => {
      const distance = p5.dist(x, y, dot.x, dot.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDot = dot;
      }
    });
    return closestDot;
  };

  const renderConstellations = (p5: p5Types) => {
    constellations.current.forEach((constellation: Constellation) => {
      p5.noStroke();
      constellation.nodes.forEach((node: HighlightNode) => {
        p5.fill(255, node.opacity);
        p5.circle(node.dot.x, node.dot.y, node.radius * 2);
      });

      p5.noFill();
      constellation.lines.forEach((line) => {
        const startNode = constellation.nodes.find((n) => n.dot === line.start);
        const endNode = constellation.nodes.find((n) => n.dot === line.end);
        if (startNode && endNode) {
          const lineOpacity =
            Math.min(startNode.opacity, endNode.opacity) * line.progress;
          p5.stroke(255, lineOpacity);
          p5.strokeWeight(MAX_LINE_WIDTH * line.progress);
          p5.line(line.start.x, line.start.y, line.end.x, line.end.y);
        }
      });

      if (DEBUG_MODE) {
        renderDebugMetaball(p5, constellation);
      }
    });
  };

  const renderDebugInfo = (p5: p5Types) => {
    p5.fill(255);
    p5.noStroke();
    p5.textSize(12);
    p5.text(`Metaballs: ${metaballs.current.length}`, 10, 20);
    p5.text(
      `Total Constellation Nodes: ${constellations.current.reduce(
        (sum: number, c: Constellation) => sum + c.nodes.length,
        0
      )}`,
      10,
      40
    );
    p5.text(
      `Total Constellation Lines: ${constellations.current.reduce(
        (sum: number, c: Constellation) => sum + c.lines.length,
        0
      )}`,
      10,
      60
    );
  };

  const renderDebugMetaball = (p5: p5Types, constellation: Constellation) => {
    p5.noFill();
    p5.stroke(255, 0, 0);
    p5.strokeWeight(1);
    p5.circle(
      constellation.metaball.x,
      constellation.metaball.y,
      constellation.metaball.radius * 2
    );
    p5.circle(
      constellation.metaball.x,
      constellation.metaball.y,
      METABALL_INFLUENCE_RADIUS * 2
    );
  };

  return (
    <div className="fixed inset-0 -z-10">
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
};

export default ClientBackgroundCanvas;
