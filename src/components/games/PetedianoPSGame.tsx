
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 20;
const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const OBSTACLE_SPEED = 2;
const OBSTACLE_SPAWN_INTERVAL = 1500; // ms

interface Obstacle {
  id: number;
  x: number;
  y: number;
}

export default function PetedianoPSGame() {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastObstacleSpawnRef = useRef<number>(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>();


  const resetGame = useCallback(() => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    lastObstacleSpawnRef.current = performance.now();
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver) return;

    // Move obstacles
    setObstacles(prevObstacles =>
      prevObstacles
        .map(obs => ({ ...obs, y: obs.y + OBSTACLE_SPEED }))
        .filter(obs => obs.y < GAME_HEIGHT)
    );

    // Spawn new obstacles
    if (timestamp - lastObstacleSpawnRef.current > OBSTACLE_SPAWN_INTERVAL) {
      const newObstacle: Obstacle = {
        id: Date.now(),
        x: Math.random() * (GAME_WIDTH - OBSTACLE_WIDTH),
        y: -OBSTACLE_HEIGHT,
      };
      setObstacles(prevObs => [...prevObs, newObstacle]);
      lastObstacleSpawnRef.current = timestamp;
    }

    // Collision detection
    const playerRect = {
      x: playerX,
      y: GAME_HEIGHT - PLAYER_HEIGHT - 10, // Player at bottom
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };

    for (const obs of obstacles) {
      const obsRect = { x: obs.x, y: obs.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT };
      if (
        playerRect.x < obsRect.x + obsRect.width &&
        playerRect.x + playerRect.width > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.height &&
        playerRect.y + playerRect.height > obsRect.y
      ) {
        setGameOver(true);
        break;
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, obstacles, playerX]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') {
        setPlayerX(prevX => Math.max(0, prevX - 20));
      } else if (e.key === 'ArrowRight') {
        setPlayerX(prevX => Math.min(GAME_WIDTH - PLAYER_WIDTH, prevX + 20));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
      scoreIntervalRef.current = setInterval(() => {
        setScore(s => s + 1);
      }, 100);
      lastObstacleSpawnRef.current = performance.now();
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    };
  }, [gameOver, gameLoop]);

  // Make the game focusable to capture key events on mount
  useEffect(() => {
    gameAreaRef.current?.focus();
  }, []);


  return (
    <div className="flex flex-col items-center">
      <div
        ref={gameAreaRef}
        className="relative bg-muted overflow-hidden border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        tabIndex={0} // Make it focusable for keyboard events
      >
        {/* Player */}
        <div
          className="absolute bg-accent rounded"
          style={{
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            left: playerX,
            bottom: 10, // Player fixed at bottom
          }}
          data-ai-hint="player square"
        />
        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute bg-destructive rounded"
            style={{
              width: OBSTACLE_WIDTH,
              height: OBSTACLE_HEIGHT,
              left: obs.x,
              top: obs.y,
            }}
            data-ai-hint="obstacle square"
          />
        ))}
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-primary-foreground">
            <p className="text-2xl font-bold">Game Over!</p>
            <p className="text-lg">Score: {score}</p>
            <Button onClick={resetGame} className="mt-4" variant="secondary">Play Again</Button>
          </div>
        )}
      </div>
      <div className="mt-4 text-lg font-semibold">Score: {score}</div>
      <p className="text-sm text-muted-foreground mt-2">Use Arrow Keys to Move</p>
    </div>
  );
}
