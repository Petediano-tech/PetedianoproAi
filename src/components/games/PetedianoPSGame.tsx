"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, Circle, Bot, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playWinSound } from '@/utils/audioPlayer';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

type Player = 'X' | 'O';
type SquareValue = Player | null;
type GameMode = 'player' | 'computer';
type Difficulty = 'simple' | 'moderate' | 'hard';
interface WinnerInfo {
  player: Player;
  line: number[];
}

const Square = ({ value, onSquareClick, isWinning }: { value: SquareValue, onSquareClick: () => void, isWinning: boolean }) => {
  return (
    <button
      className={cn(
        "h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary bg-secondary/20 flex items-center justify-center text-4xl font-bold rounded-lg transition-all duration-300 hover:bg-secondary/40 disabled:cursor-not-allowed",
        isWinning && "bg-primary/30 scale-110"
      )}
      onClick={onSquareClick}
      disabled={!!value}
      aria-label={`Square with value ${value || 'empty'}`}
    >
      {value === 'X' && <X className="h-12 w-12 sm:h-16 sm:w-16 text-accent" />}
      {value === 'O' && <Circle className="h-11 w-11 sm:h-14 sm:w-14 text-primary" />}
    </button>
  );
};

const calculateWinner = (squares: SquareValue[]): WinnerInfo | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a] as Player, line: lines[i] };
    }
  }
  return null;
};

export default function TicTacToeGame() {
  const [mode, setMode] = useState<GameMode>('computer');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [gameStarted, setGameStarted] = useState(false);
  const [xIsNext, setXIsNext] = useState(true);
  const [playerSymbol] = useState<Player>('X');
  const [computerSymbol] = useState<Player>('O');
  
  const winnerInfo = calculateWinner(squares);
  const isDraw = !winnerInfo && squares.every(square => square !== null);

  const { soundSettings } = useSoundSettings();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const computerMove = useCallback((currentSquares: SquareValue[]) => {
    const emptySquares = currentSquares.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];
    if (emptySquares.length === 0) return;

    const makeMove = (index: number) => {
        const newSquares = [...currentSquares];
        newSquares[index] = computerSymbol;
        setSquares(newSquares);
        setXIsNext(true);
    };

    const findWinningMove = (player: Player) => {
        for (const index of emptySquares) {
            const testSquares = [...currentSquares];
            testSquares[index] = player;
            if (calculateWinner(testSquares)) {
                return index;
            }
        }
        return null;
    };
    
    // AI LOGIC
    if (difficulty === 'simple') {
      const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      makeMove(randomIndex);
      return;
    }

    const aiWinMove = findWinningMove(computerSymbol);
    if (aiWinMove !== null) { makeMove(aiWinMove); return; }

    const playerWinMove = findWinningMove(playerSymbol);
    if (playerWinMove !== null) { makeMove(playerWinMove); return; }

    if (difficulty === 'hard') {
        const center = 4;
        if (currentSquares[center] === null) { makeMove(center); return; }
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => currentSquares[i] === null);
        if (availableCorners.length > 0) {
            makeMove(availableCorners[Math.floor(Math.random() * availableCorners.length)]);
            return;
        }
    }

    const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    makeMove(randomIndex);
  }, [computerSymbol, playerSymbol, difficulty]);

  useEffect(() => {
    if (!xIsNext && mode === 'computer' && !winnerInfo && gameStarted) {
      const timer = setTimeout(() => computerMove(squares), 500);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, squares, winnerInfo, computerMove, gameStarted]);

  useEffect(() => {
    if (winnerInfo && mode === 'computer' && winnerInfo.player === playerSymbol) {
        playWinSound(soundSettings);
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [winnerInfo, mode, playerSymbol, soundSettings]);

  const handleStartGame = () => {
    setSquares(Array(9).fill(null));
    setShowConfetti(false);
    
    let firstTurnIsX = true;
    if (mode === 'computer') {
        firstTurnIsX = Math.random() < 0.5;
    }
    setXIsNext(firstTurnIsX);
    setGameStarted(true);
  };

  const handleReset = () => {
    setGameStarted(false);
    setSquares(Array(9).fill(null));
    setShowConfetti(false);
  };

  const handleClick = (i: number) => {
    if (squares[i] || winnerInfo || !gameStarted) return;
    if (mode === 'player' || (mode === 'computer' && xIsNext)) {
      const newSquares = squares.slice();
      newSquares[i] = xIsNext ? 'X' : 'O';
      setSquares(newSquares);
      setXIsNext(!xIsNext);
    }
  };

  let status;
  if (winnerInfo) {
      if (mode === 'computer') {
          status = winnerInfo.player === playerSymbol ? "🎉 You Win! 🎉" : "You Lose!";
      } else {
          status = `Winner: Player ${winnerInfo.player}!`;
      }
  } else if (isDraw) {
      status = "It's a Draw!";
  } else {
      if(mode === 'computer') {
        status = xIsNext ? "Your Turn" : "Computer's Turn...";
      } else {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
      }
  }

  if (!gameStarted) {
    return (
        <div className="flex flex-col items-center gap-6 p-4">
            <h3 className="font-headline text-2xl">Game Options</h3>
            <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="computer" id="r-computer" />
                    <Label htmlFor="r-computer" className="flex items-center gap-2 text-lg"><Bot/> vs. Computer</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="player" id="r-player" />
                    <Label htmlFor="r-player" className="flex items-center gap-2 text-lg"><Users/> vs. Friend</Label>
                </div>
            </RadioGroup>

            {mode === 'computer' && (
                 <div className="flex flex-col items-center gap-2">
                    <Label>Difficulty</Label>
                    <RadioGroup value={difficulty} onValueChange={(v: any) => setDifficulty(v)} className="flex gap-4">
                       <div className="flex items-center space-x-2"><RadioGroupItem value="simple" id="d-simple" /><Label htmlFor="d-simple">Simple</Label></div>
                       <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="d-moderate" /><Label htmlFor="d-moderate">Moderate</Label></div>
                       <div className="flex items-center space-x-2"><RadioGroupItem value="hard" id="d-hard" /><Label htmlFor="d-hard">Hard</Label></div>
                    </RadioGroup>
                </div>
            )}
            <Button onClick={handleStartGame} size="lg">Start Game</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 relative">
       {showConfetti && width && height && <Confetti width={width} height={height} recycle={false} />}
      <div className={cn("text-2xl font-bold font-headline mb-4 transition-colors", winnerInfo && "text-green-500", (winnerInfo && winnerInfo.player === computerSymbol) && "text-destructive")}>
        {status}
      </div>
      <div className="grid grid-cols-3 gap-2 bg-background p-2 rounded-lg shadow-inner">
        {squares.map((square, i) => (
           <Square key={i} value={square} onSquareClick={() => handleClick(i)} isWinning={winnerInfo?.line.includes(i) ?? false} />
        ))}
      </div>
      <div className="flex gap-4">
        <Button onClick={handleReset} variant="outline" className="mt-4">
            Change Settings
        </Button>
        {(winnerInfo || isDraw) && <Button onClick={handleStartGame} className="mt-4">Play Again</Button>}
      </div>
    </div>
  );
}

// A simple hook to get window dimensions for confetti
function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
}
