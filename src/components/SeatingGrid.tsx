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
  onSwapGroups?: (row1: number, groupIndex1: number, row2: number, groupIndex2: number) => void;
  onToggleLock?: (studentId: string) => void;
}

export const SeatingGrid = forwardRef<HTMLDivElement, SeatingGridProps>((
  {
    chart,
    onPlaceStudent,
    onRemoveStudent,
    onSwapStudents,
    onSwapPairs,
    onSwapGroups,
    onToggleLock
  },
  ref
) => {
  const [dragOverPos, setDragOverPos] = useState<{ row: number; col: number } | null>(null);
  const [dragOverPair, setDragOverPair] = useState<{ row: number; pairIndex: number } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<{ row: number; groupIndex: number } | null>(null);
  const [dragSource, setDragSource] = useState<{ row: number; col: number } | null>(null);
  const [dragSourcePair, setDragSourcePair] = useState<{ row: number; pairIndex: number } | null>(null);
  const hasCustomLayout = !!(chart.customLayout && chart.customLayout.length > 0);
  const usePairs = chart.pairedSeating && !hasCustomLayout;

  const handleCellDragStart = (row: number, col: number) => {
    setDragSource({ row, col });
  };
  const gridStyle = {
    '--seat-cols': String(chart.cols),
    '--pair-cols': String(Math.ceil(chart.cols / 2))
  } as React.CSSProperties;

  const handleCellDragEnd = () => {
    setDragSource(null);
    setDragOverPos(null);
  };

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
    setDragSource(null);
    
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
    setDragSourcePair({ row, pairIndex });
    
    // Use the entire seat-pair as drag image
    const handle = e.currentTarget as HTMLElement;
    const seatPair = handle.parentElement;
    if (seatPair) {
      // Calculate offset to center the drag image on cursor
      const rect = seatPair.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      e.dataTransfer.setDragImage(seatPair, offsetX, offsetY);
    }
  };

  const handlePairDragEnd = () => {
    setDragSourcePair(null);
    setDragOverPair(null);
  };

  const handlePairDragOver = (row: number, pairIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Only highlight pair if dragging a pair (check types includes pairDrag)
    if (e.dataTransfer.types.includes('pairdrag')) {
      setDragOverPair({ row, pairIndex });
    }
  };

  const handlePairDragLeave = (e: React.DragEvent) => {
    // Only clear pair highlight if it was a pair drag
    if (e.dataTransfer.types.includes('pairdrag')) {
      setDragOverPair(null);
    }
  };

  const handlePairDrop = (targetRow: number, targetPairIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPair(null);
    setDragSourcePair(null);
    
    const pairData = e.dataTransfer.getData('pairDrag');
    if (!pairData || !onSwapPairs) return;
    
    const { row: sourceRow, pairIndex: sourcePairIndex } = JSON.parse(pairData);
    const sourceCol = sourcePairIndex * 2;
    const targetCol = targetPairIndex * 2;
    
    // Don't swap with self
    if (sourceRow === targetRow && sourcePairIndex === targetPairIndex) return;
    
    onSwapPairs(sourceRow, sourceCol, targetRow, targetCol);
  };

  const handleGroupDragStart = (row: number, groupIndex: number, size: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('groupDrag', JSON.stringify({ row, groupIndex, size }));

    const handle = e.currentTarget as HTMLElement;
    const group = handle.parentElement;
    if (group) {
      const rect = group.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      e.dataTransfer.setDragImage(group, offsetX, offsetY);
    }
  };

  const handleGroupDragEnd = () => {
    setDragOverGroup(null);
  };

  const handleGroupDragOver = (row: number, groupIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.dataTransfer.types.includes('groupdrag')) {
      setDragOverGroup({ row, groupIndex });
    }
  };

  const handleGroupDragLeave = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('groupdrag')) {
      setDragOverGroup(null);
    }
  };

  const handleGroupDrop = (targetRow: number, targetGroupIndex: number, targetSize: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGroup(null);

    const groupData = e.dataTransfer.getData('groupDrag');
    if (!groupData || !onSwapGroups) return;

    const { row: sourceRow, groupIndex: sourceGroupIndex, size: sourceSize } = JSON.parse(groupData);
    if (sourceRow === targetRow && sourceGroupIndex === targetGroupIndex) return;
    if (sourceSize !== targetSize) return;

    onSwapGroups(sourceRow, sourceGroupIndex, targetRow, targetGroupIndex);
  };

  const getRowLayout = (rowIndex: number) => (hasCustomLayout ? chart.customLayout?.[rowIndex] ?? null : null);

  const getRowSeatCount = (rowIndex: number) => {
    const rowLayout = getRowLayout(rowIndex);
    if (!rowLayout || rowLayout.length === 0) {
      return chart.cols;
    }
    return rowLayout.reduce((sum, group) => sum + group, 0);
  };

  const getRowGroups = (rowLayout: number[] | null) => {
    if (!rowLayout || rowLayout.length === 0) {
      return [{ startCol: 0, size: chart.cols }];
    }
    const groups: { startCol: number; size: number }[] = [];
    let index = 0;
    for (const size of rowLayout) {
      groups.push({ startCol: index, size });
      index += size;
    }
    return groups;
  };

  // Helper to group columns into pairs
  const getPairs = (seatCount: number) => {
    const pairs: { col1: number; col2: number | null }[] = [];
    for (let i = 0; i < seatCount; i += 2) {
      pairs.push({ col1: i, col2: i + 1 < seatCount ? i + 1 : null });
    }
    return pairs;
  };

  const renderCell = (
    student: typeof chart.grid[0][0],
    rowIndex: number,
    colIndex: number
  ) => {
    const isDragOver = dragOverPos?.row === rowIndex && dragOverPos?.col === colIndex;
    const isDragSource = dragSource?.row === rowIndex && dragSource?.col === colIndex;
    
    // Check if this cell is part of a pair being dragged or hovered
    const pairIndex = Math.floor(colIndex / 2);
    const isInSourcePair = dragSourcePair?.row === rowIndex && dragSourcePair?.pairIndex === pairIndex;
    const isInTargetPair = dragOverPair?.row === rowIndex && dragOverPair?.pairIndex === pairIndex;
    
    // Determine what student to show (for swap preview)
    let displayStudent = student;
    let isPreview = false;
    
    // Individual student swap preview
    if (isDragOver && dragSource && chart.grid[dragSource.row][dragSource.col]) {
      displayStudent = chart.grid[dragSource.row][dragSource.col];
      isPreview = true;
    }
    else if (isDragSource && dragOverPos && chart.grid[dragOverPos.row][dragOverPos.col]) {
      displayStudent = chart.grid[dragOverPos.row][dragOverPos.col];
      isPreview = true;
    }
    // Pair swap preview - target pair shows source pair's students
    else if (isInTargetPair && dragSourcePair && (dragSourcePair.pairIndex !== pairIndex || dragSourcePair.row !== rowIndex)) {
      // Show the student from source pair at equivalent position
      const sourceCol = dragSourcePair.pairIndex * 2 + (colIndex % 2);
      displayStudent = chart.grid[dragSourcePair.row]?.[sourceCol] || null;
      isPreview = true;
    }
    // Pair swap preview - source pair shows target pair's students
    else if (isInSourcePair && dragOverPair && (dragOverPair.pairIndex !== pairIndex || dragOverPair.row !== rowIndex)) {
      // Show the student from target pair at equivalent position
      const targetCol = dragOverPair.pairIndex * 2 + (colIndex % 2);
      displayStudent = chart.grid[dragOverPair.row]?.[targetCol] || null;
      isPreview = true;
    }
    
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`seating-cell ${isDragOver ? 'drag-over' : ''} ${isPreview ? 'swap-preview' : ''} ${usePairs && colIndex % 2 === 1 ? 'pair-end' : ''}`}
        onDragOver={handleDragOver(rowIndex, colIndex)}
        onDragEnter={handleDragEnter(rowIndex, colIndex)}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop(rowIndex, colIndex)}
      >
        <StudentCard
          student={displayStudent}
          draggable={!!student}
          onToggleLock={onToggleLock}
          onRemove={student ? () => onRemoveStudent(rowIndex, colIndex) : undefined}
          onDragStart={() => handleCellDragStart(rowIndex, colIndex)}
          onDragEnd={handleCellDragEnd}
          isPreview={isPreview}
        />
      </div>
    );
  };

  return (
    <div className="seating-grid-container" ref={ref}>
      <h2>{chart.name}</h2>
      <div className="whiteboard">
        <span>TAVLE</span>
      </div>
      <div
        className={`seating-grid ${usePairs ? 'paired' : ''} ${hasCustomLayout ? 'custom-layout' : ''}`}
        style={gridStyle}
      >
        {chart.grid.map((row, rowIndex) => {
          const rowLayout = getRowLayout(rowIndex);
          const rowSeatCount = getRowSeatCount(rowIndex);
          if (rowSeatCount <= 0) {
            return null;
          }
          const rowGroups = getRowGroups(rowLayout);
          const rowStyle = {
            '--row-cols': String(rowSeatCount),
            '--row-pair-cols': String(Math.ceil(rowSeatCount / 2))
          } as React.CSSProperties;

          return (
            <div key={rowIndex} className="seating-row" style={rowStyle}>
              {usePairs ? (
                // Render paired seats with drag handles
                getPairs(rowSeatCount).map((pair, pairIndex) => (
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
                      onDragEnd={handlePairDragEnd}
                      title="Dra for å bytte dette paret"
                    >
                      ⋮⋮
                    </div>
                    {renderCell(row[pair.col1], rowIndex, pair.col1)}
                    {pair.col2 !== null && renderCell(row[pair.col2], rowIndex, pair.col2)}
                  </div>
                ))
              ) : (
                // Render custom layout groups
                rowGroups.map((group, groupIndex) => {
                  const groupStyle = {
                    '--group-cols': String(group.size),
                    '--group-flex': String(group.size)
                  } as React.CSSProperties;

                  const isGroupOver = dragOverGroup?.row === rowIndex && dragOverGroup?.groupIndex === groupIndex;
                  return (
                    <div
                      key={groupIndex}
                      className={`seat-group ${isGroupOver ? 'group-drag-over' : ''}`}
                      style={groupStyle}
                      onDragOver={handleGroupDragOver(rowIndex, groupIndex)}
                      onDragLeave={handleGroupDragLeave}
                      onDrop={handleGroupDrop(rowIndex, groupIndex, group.size)}
                    >
                      <div
                        className="group-drag-handle"
                        draggable
                        onDragStart={handleGroupDragStart(rowIndex, groupIndex, group.size)}
                        onDragEnd={handleGroupDragEnd}
                        title="Dra for å bytte denne gruppen"
                      >
                        ⋮⋮
                      </div>
                      {row
                        .slice(group.startCol, group.startCol + group.size)
                        .map((student, offset) =>
                          renderCell(student, rowIndex, group.startCol + offset)
                        )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

SeatingGrid.displayName = 'SeatingGrid';
