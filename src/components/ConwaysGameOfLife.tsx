import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface ConwaysGameOfLifeProps {
  width?: number;
  height?: number;
  cellSize?: number;
  initialDensity?: number;
}

interface GameState {
  grid: boolean[][];
  isRunning: boolean;
  generation: number;
}

const ConwaysGameOfLife = ({
  width = 30,
  height = 20,
  cellSize = 0.8,
  initialDensity = 0.3,
}: ConwaysGameOfLifeProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const cellsRef = useRef<THREE.Mesh[][]>([]);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const materialsRef = useRef<{
    alive: THREE.MeshLambertMaterial;
    dead: THREE.MeshLambertMaterial;
  } | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    isRunning: false,
    generation: 0,
  });

  // Initialize random grid
  const initializeGrid = useCallback(() => {
    const newGrid: boolean[][] = [];
    for (let i = 0; i < height; i++) {
      newGrid[i] = [];
      for (let j = 0; j < width; j++) {
        newGrid[i][j] = Math.random() < initialDensity;
      }
    }
    return newGrid;
  }, [width, height, initialDensity]);

  // Conway's Game of Life rules
  const getNextGeneration = useCallback(
    (grid: boolean[][]): boolean[][] => {
      const newGrid: boolean[][] = [];

      for (let i = 0; i < height; i++) {
        newGrid[i] = [];
        for (let j = 0; j < width; j++) {
          let neighbors = 0;

          // Count neighbors
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue;

              const ni = i + di;
              const nj = j + dj;

              if (ni >= 0 && ni < height && nj >= 0 && nj < width) {
                if (grid[ni][nj]) neighbors++;
              }
            }
          }

          // Apply rules
          if (grid[i][j]) {
            // Live cell
            newGrid[i][j] = neighbors === 2 || neighbors === 3;
          } else {
            // Dead cell
            newGrid[i][j] = neighbors === 3;
          }
        }
      }

      return newGrid;
    },
    [width, height],
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      1000,
    );
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // Create cell geometry and materials
    const cellGeometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
    const aliveMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff88,
      emissive: 0x002211,
    });
    const deadMaterial = new THREE.MeshLambertMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
    });

    // Store materials for reuse
    materialsRef.current = {
      alive: aliveMaterial,
      dead: deadMaterial,
    };

    // Create cell meshes
    const cells: THREE.Mesh[][] = [];
    for (let i = 0; i < height; i++) {
      cells[i] = [];
      for (let j = 0; j < width; j++) {
        const cell = new THREE.Mesh(cellGeometry, deadMaterial);
        cell.position.set(j - width / 2 + 0.5, -(i - height / 2 + 0.5), 0);
        cell.castShadow = true;
        cell.receiveShadow = true;
        scene.add(cell);
        cells[i][j] = cell;
      }
    }
    cellsRef.current = cells;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Initialize game state
    const initialGrid = initializeGrid();
    setGameState((prev) => ({
      ...prev,
      grid: initialGrid,
      generation: 0,
    }));

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height, cellSize, initializeGrid]);

  // Update visual representation when grid changes
  useEffect(() => {
    if (!cellsRef.current.length || !gameState.grid.length || !materialsRef.current) {
      return;
    }

    const { alive, dead } = materialsRef.current;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (cellsRef.current[i] && cellsRef.current[i][j]) {
          const isAlive = gameState.grid[i][j];
          cellsRef.current[i][j].material = isAlive ? alive : dead;
        }
      }
    }
  }, [gameState.grid, height, width]);

  // Game loop
  useEffect(() => {
    if (gameState.isRunning) {
      intervalRef.current = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          grid: getNextGeneration(prev.grid),
          generation: prev.generation + 1,
        }));
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, getNextGeneration]);

  const toggleRunning = () => {
    setGameState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const reset = () => {
    setGameState((prev) => ({
      ...prev,
      grid: initializeGrid(),
      generation: 0,
      isRunning: false,
    }));
  };

  const step = () => {
    if (!gameState.isRunning) {
      setGameState((prev) => ({
        ...prev,
        grid: getNextGeneration(prev.grid),
        generation: prev.generation + 1,
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-base-200 rounded-lg">
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">Conway&apos;s Game of Life</h3>
        <p className="text-base-content/70 mb-4">
          A cellular automaton where cells evolve based on simple rules. Green cells are alive, gray
          cells are dead.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={toggleRunning}
            className={`btn ${gameState.isRunning ? "btn-error" : "btn-success"}`}
          >
            {gameState.isRunning ? "Pause" : "Play"}
          </button>
          <button onClick={step} className="btn btn-primary" disabled={gameState.isRunning}>
            Step
          </button>
          <button onClick={reset} className="btn btn-secondary">
            Reset
          </button>
        </div>

        <div className="text-sm text-base-content/60">Generation: {gameState.generation}</div>
      </div>

      <div
        ref={mountRef}
        className="w-full flex justify-center bg-black rounded-lg overflow-hidden"
        style={{ minHeight: "600px" }}
      />

      <div className="mt-4 text-sm text-base-content/60">
        <p className="mb-2">
          <strong>Rules:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Any live cell with 2 or 3 live neighbors survives</li>
          <li>Any dead cell with exactly 3 live neighbors becomes a live cell</li>
          <li>All other live cells die, and all other dead cells stay dead</li>
        </ul>
      </div>
    </div>
  );
};

export default ConwaysGameOfLife;
