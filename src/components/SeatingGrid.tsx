import React, { useState, forwardRef } from 'react';
import type { SeatingChart } from '../types';
import { StudentCard } from './StudentCard';
import './SeatingGrid.css';

interface SeatingGridProps {
  chart: SeatingChart;
  onPlaceStudent: (studentId: string, row: number, col: number) => void;
  onRemoveStudent: (row: number, col: number) => void;
  onSwapStudents?: (row1: number, col1: number, row2: number, col2: number) => void;
  onSwapPairs?: (row1: number, col1: number, row2: number, col2: number) => void;
  onToggleLock?: (studentId: string) => void;
}

export const SeatingGrid = forwardRef<HTMLDivElement, SeatingGridProps>((
  {
    chart,
    onPlaceStudent,
    onRemoveStudent,
    onSwapStudents,
    onSwapPairs,
    onToggleLock
  },
  ref
) => {
  const [dragOverPos, setDragOverPos] = useState<{ row: number; col: number } | null>(null);
  const [dragOverPair, setDragOverPair] = useState<{ row: number; pairIndex: number } | null>(null);

  const handleDragOver = (row: number, col: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Keep the drag-over state active while dragging over the cell
    if (chart.grid[row][col]) {
      setDragOverPos({ row, col });
    }
  };

  const handleDragEnter = (row: number, col: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (chart.grid[row][col]) {
      setDragOverPos({ row, col });
    }
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (row: number, col: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPos(null);
    
    const studentId = e.dataTransfer.getData('studentId');
    if (!studentId) return;

    // Check if target seat is occupied
    if (chart.grid[row][col] && onSwapStudents) {
      // Find current position of the dragged student
      for (let r = 0; r < chart.rows; r++) {
        for (let c = 0; c < chart.cols; c++) {
          if (chart.grid[r][c]?.id === studentId) {
            // Swap the two students
            onSwapStudents(r, c, row, col);
            return;
          }
        }
      }
    } else {
      // Move to empty seat
      onPlaceStudent(studentId, row, col);
    }
  };

  // Pair drag handlers
  const handlePairDragStart = (row: number, pairIndex: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('pairDrag', JSON.stringify({ row, pairIndex }));
  };

  const handlePairDragOver = (row: number, pairIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPair({ row, pairIndex });
  };

  const handlePairDragLeave = () => {
    setDragOverPair(null);
  };

  const handlePairDrop = (targetRow: number, targetPairIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPair(null);
    
    const pairData = e.dataTransfer.getData('pairDrag');
    if (!pairData || !onSwapPairs) return;
    
    const { row: sourceRow, pairIndex: sourcePairIndex } = JSON.parse(pairData);
    const sourceCol = sourcePairIndex * 2;
    const targetCol = targetPairIndex * 2;
    
    // Don't swap with self
    if (sourceRow === targetRow && sourcePairIndex === targetPairIndex) return;
    
    onSwapPairs(sourceRow, sourceCol, targetRow, targetCol);
  };

  const handleCellClick = (row: number, col: number) => {
    if (chart.grid[row][col]) {
      onRemoveStudent(row, col);
    }
  };

  // Helper to group columns into pairs
  const getPairs = (row: (typeof chart.grid)[0]) => {
    const pairs: { col1: number; col2: number | null }[] = [];
    for (let i = 0; i < row.length; i += 2) {
      pairs.push({ col1: i, col2: i + 1 < row.length ? i + 1 : null });
    }
    return pairs;
  };

  const renderCell = (student: typeof chart.grid[0][0], rowIndex: number, colIndex: number) => (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`seating-cell ${
        dragOverPos?.row === rowIndex && dragOverPos?.col === colIndex
          ? 'drag-over'
          : ''
      } ${chart.pairedSeating && colIndex % 2 === 1 ? 'pair-end' : ''}`}
      onDragOver={handleDragOver(rowIndex, colIndex)}
      onDragEnter={handleDragEnter(rowIndex, colIndex)}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop(rowIndex, colIndex)}
    >
      <StudentCard
        student={student}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        draggable={!!student}
        onToggleLock={onToggleLock}
      />
    </div>
  );

  return (
    <div className="seating-grid-container" ref={ref}>
      <h2>{chart.name}</h2>
      <div className="whiteboard">
        <span>TAVLE</span>
      </div>
      <div className={`seating-grid ${chart.pairedSeating ? 'paired' : ''}`}>
        {chart.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="seating-row">
            {chart.pairedSeating ? (
              // Render paired seats with drag handles
              getPairs(row).map((pair, pairIndex) => (
                <div
                  key={pairIndex}
                  className={`seat-pair ${
                    dragOverPair?.row === rowIndex && dragOverPair?.pairIndex === pairIndex
                      ? 'pair-drag-over'
                      : ''
                  }`}
                  onDragOver={handlePairDragOver(rowIndex, pairIndex)}
                  onDragLeave={handlePairDragLeave}
                  onDrop={handlePairDrop(rowIndex, pairIndex)}
                >
                  <div
                    className="pair-drag-handle"
                    draggable
                    onDragStart={handlePairDragStart(rowIndex, pairIndex)}
                    title="Dra for å bytte dette paret"
                  >
                    ⋮⋮
                  </div>
                  {renderCell(row[pair.col1], rowIndex, pair.col1)}
                  {pair.col2 !== null && renderCell(row[pair.col2], rowIndex, pair.col2)}
                </div>
              ))
            ) : (
              // Render individual seats
              row.map((student, colIndex) => renderCell(student, rowIndex, colIndex))
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

SeatingGrid.displayName = 'SeatingGrid';
