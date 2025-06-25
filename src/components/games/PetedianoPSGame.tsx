"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Circle } from 'lucide-react';

const Square = ({ value, onSquareClick }: { value: 'X' | 'O' | null, onSquareClick: () => void }) => {
  return (
    <button
      className="h-24 w-24 border-2 border-primary bg-secondary/20 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors hover:bg-secondary/40 disabled:cursor-not-allowed"
      onClick={onSquareClick}
      disabled={!!value}
      aria-label={`Square with value ${value || 'empty'}`}
    >
      {value === 'X' && <X className="h-16 w-16 text-accent" />}
      {value === 'O' && <Circle className="h-14 w-14 text-primary" />}
    </button>
  );
};

const calculateWinner = (squares: ('X' | 'O' | null)[]) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default function TicTacToeGame() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(square => square !== null);
  
  let status;
  if (winner) {
    status = `Winner: ${winner}!`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const handleClick = (i: number) => {
    if (squares[i] || winner) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };
  
  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("text-2xl font-bold font-headline mb-4", winner && "text-green-500")}>
        {status}
      </div>
      <div className="grid grid-cols-3 gap-2 bg-background p-2 rounded-lg">
        {squares.map((square, i) => (
           <Square key={i} value={square} onSquareClick={() => handleClick(i)} />
        ))}
      </div>
      <Button onClick={handleReset} variant="outline" className="mt-4">
        Reset Game
      </Button>
    </div>
  );
}
