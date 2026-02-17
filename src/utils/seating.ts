import type { Student, SeatingChart, SeatingConstraints } from '../types';

export const seatingUtils = {
  // Generate a unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Parse custom layout text (e.g., "2 3 3 2\n2 3 3 2")
  parseCustomLayout: (text: string): number[][] | null => {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return null;
    }

    const layout = lines.map(line => {
      const parts = line.split(/[\s-]+/).filter(Boolean);
      const numbers = parts.map(part => Number.parseInt(part, 10));
      if (numbers.some(num => Number.isNaN(num) || num <= 0)) {
        return null;
      }
      return numbers;
    });

    if (layout.some(row => row === null)) {
      return null;
    }

    return layout as number[][];
  },

  // Check if a seat is enabled based on a custom layout (if any)
  isSeatEnabled: (chart: SeatingChart, row: number, col: number): boolean => {
    if (!chart.customLayout || chart.customLayout.length === 0) {
      return true;
    }
    const rowLayout = chart.customLayout[row];
    if (!rowLayout) {
      return false;
    }
    const seatsInRow = rowLayout.reduce((sum, count) => sum + count, 0);
    return col >= 0 && col < seatsInRow;
  },

  // Create a new seating chart
  createChart: (
    name: string,
    rows: number,
    cols: number,
    pairedSeating: boolean = false,
    customLayout?: number[][]
  ): SeatingChart => {
    let actualRows = rows;
    let actualCols = cols;

    if (customLayout && customLayout.length > 0) {
      actualRows = customLayout.length;
      actualCols = Math.max(...customLayout.map(row => row.reduce((sum, group) => sum + group, 0)));
    }

    const grid: (Student | null)[][] = Array(actualRows)
      .fill(null)
      .map(() => Array(actualCols).fill(null));

    return {
      id: seatingUtils.generateId(),
      name,
      students: [],
      grid,
      rows: actualRows,
      cols: actualCols,
      pairedSeating,
      customLayout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Add a student to the chart
  addStudent: (chart: SeatingChart, student: Student): SeatingChart => {
    if (!chart.students.find(s => s.id === student.id)) {
      return {
        ...chart,
        students: [...chart.students, student],
        updatedAt: new Date().toISOString()
      };
    }
    return chart;
  },

  // Remove a student from the chart
  removeStudent: (chart: SeatingChart, studentId: string): SeatingChart => {
    const newGrid = chart.grid.map(row =>
      row.map(cell => cell?.id === studentId ? null : cell)
    );

    return {
      ...chart,
      students: chart.students.filter(s => s.id !== studentId),
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
  },

  // Place a student at a specific position
  placeStudent: (
    chart: SeatingChart,
    studentId: string,
    row: number,
    col: number
  ): SeatingChart => {
    const student = chart.students.find(s => s.id === studentId);
    if (!student || row < 0 || row >= chart.rows || col < 0 || col >= chart.cols) {
      return chart;
    }

    if (!seatingUtils.isSeatEnabled(chart, row, col)) {
      return chart;
    }

    const newGrid = chart.grid.map(r => [...r]); // Deep copy
    
    // Remove student from current position if they're already placed
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        if (newGrid[i][j]?.id === studentId) {
          newGrid[i][j] = null;
        }
      }
    }

    // Place student at new position
    newGrid[row][col] = student;

    return {
      ...chart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
  },

  // Get unplaced students
  getUnplacedStudents: (chart: SeatingChart): Student[] => {
    const placedIds = new Set<string>();
    chart.grid.forEach(row => {
      row.forEach(cell => {
        if (cell) placedIds.add(cell.id);
      });
    });

    return chart.students.filter(s => !placedIds.has(s.id));
  },

  // Clear all placements
  clearPlacements: (chart: SeatingChart): SeatingChart => {
    const grid = Array(chart.rows)
      .fill(null)
      .map(() => Array(chart.cols).fill(null));

    return {
      ...chart,
      grid,
      updatedAt: new Date().toISOString()
    };
  },

  // Check if two positions are adjacent (horizontally, vertically, or diagonally)
  areAdjacent: (row1: number, col1: number, row2: number, col2: number): boolean => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    // Adjacent if within 1 cell in any direction (including diagonals)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  },

  // Randomize student placement (respects locked students and constraints)
  randomizeSeating: (chart: SeatingChart, constraints?: SeatingConstraints): SeatingChart => {
    // Get all unlocked students (both placed and unplaced)
    const lockedStudentIds = new Set<string>();
    for (let row = 0; row < chart.rows; row++) {
      for (let col = 0; col < chart.cols; col++) {
        if (!seatingUtils.isSeatEnabled(chart, row, col)) {
          continue;
        }
        const student = chart.grid[row][col];
        if (student?.locked) {
          lockedStudentIds.add(student.id);
        }
      }
    }
    const unlockedStudents = chart.students.filter(s => !lockedStudentIds.has(s.id));
    
    if (unlockedStudents.length === 0) {
      return chart; // No students to arrange
    }
    
    // Keep locked students in place, clear only unlocked
    const newGrid = chart.grid.map(row =>
      row.map(cell => (cell?.locked ? cell : null))
    );
    let updated = {
      ...chart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };

    // Get available positions (not occupied by locked students)
    const availablePositions: { row: number; col: number }[] = [];
    for (let row = 0; row < chart.rows; row++) {
      for (let col = 0; col < chart.cols; col++) {
        if (!seatingUtils.isSeatEnabled(chart, row, col)) {
          continue;
        }
        if (!updated.grid[row][col]?.locked) {
          availablePositions.push({ row, col });
        }
      }
    }

    if (!constraints || (!constraints.mixGenders && constraints.placeTogether.length === 0 && constraints.keepApart.length === 0)) {
      // No constraints - use simple shuffle
      const shuffled = [...unlockedStudents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      let seatIndex = 0;
      for (const pos of availablePositions) {
        if (seatIndex >= shuffled.length) break;
        updated = seatingUtils.placeStudent(updated, shuffled[seatIndex].id, pos.row, pos.col);
        seatIndex++;
      }
      return updated;
    }

    // Constraint-aware placement
    const studentsToPlace = [...unlockedStudents];
    const placement = new Map<string, { row: number; col: number }>();
    const usedPositions = new Set<string>();

    // Helper to check if a position is available
    const isPosAvailable = (row: number, col: number) => {
      return !usedPositions.has(`${row},${col}`) && 
             row >= 0 && row < chart.rows && 
             col >= 0 && col < chart.cols &&
             seatingUtils.isSeatEnabled(chart, row, col) &&
             !updated.grid[row][col]?.locked;
    };

    // Merge overlapping groups - if student A is in group [A,B] and [A,C], merge to [A,B,C]
    const mergeGroups = (groups: string[][]): string[][] => {
      const merged: string[][] = [];
      const processed = new Set<number>();
      
      for (let i = 0; i < groups.length; i++) {
        if (processed.has(i)) continue;
        
        let currentGroup = new Set(groups[i]);
        let changed = true;
        
        while (changed) {
          changed = false;
          for (let j = i + 1; j < groups.length; j++) {
            if (processed.has(j)) continue;
            
            // Check if groups share any members
            const hasOverlap = groups[j].some(id => currentGroup.has(id));
            if (hasOverlap) {
              groups[j].forEach(id => currentGroup.add(id));
              processed.add(j);
              changed = true;
            }
          }
        }
        
        processed.add(i);
        merged.push([...currentGroup]);
      }
      
      return merged;
    };

    // Merge placeTogether groups that share members
    const mergedPlaceTogether = mergeGroups([...constraints.placeTogether]);

    // Helper to find paired seat positions (col 0-1, 2-3, 4-5, etc.)
    const findPairedPositions = () => {
      const pairs: { row: number; startCol: number }[] = [];
      for (let row = 0; row < chart.rows; row++) {
        for (let col = 0; col < chart.cols - 1; col += 2) {
          // Check if this pair is available
          if (isPosAvailable(row, col) && isPosAvailable(row, col + 1)) {
            pairs.push({ row, startCol: col });
          }
        }
      }
      // Shuffle pairs
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      return pairs;
    };

    // Helper to find nearby available positions for a group - prioritizes contiguous horizontal placement
    const findNearbyPositions = (count: number): { row: number; col: number }[] => {
      const available = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
      
      if (available.length === 0) return [];
      
      // First priority: find contiguous horizontal positions (works for any seating mode)
      // This ensures groups like [Jenny, Elisabeth, Julie] sit next to each other
      const rowGroups = new Map<number, { row: number; col: number }[]>();
      for (const pos of available) {
        if (!rowGroups.has(pos.row)) {
          rowGroups.set(pos.row, []);
        }
        rowGroups.get(pos.row)!.push(pos);
      }
      
      // Sort positions in each row by column
      for (const positions of rowGroups.values()) {
        positions.sort((a, b) => a.col - b.col);
      }
      
      // Shuffle rows to randomize which row we pick
      const rows = [...rowGroups.keys()];
      for (let i = rows.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rows[i], rows[j]] = [rows[j], rows[i]];
      }
      
      // Try to find contiguous positions in each row
      for (const row of rows) {
        const rowPositions = rowGroups.get(row)!;
        
        // Find longest contiguous sequence starting at different positions
        for (let startIdx = 0; startIdx < rowPositions.length; startIdx++) {
          const contiguous: { row: number; col: number }[] = [rowPositions[startIdx]];
          
          for (let i = startIdx + 1; i < rowPositions.length && contiguous.length < count; i++) {
            // Check if this position is immediately adjacent to the last one
            if (rowPositions[i].col === contiguous[contiguous.length - 1].col + 1) {
              contiguous.push(rowPositions[i]);
            } else {
              break; // Gap found, stop this sequence
            }
          }
          
          if (contiguous.length >= count) {
            return contiguous.slice(0, count);
          }
        }
      }
      
      // Second priority for paired seating: find adjacent pairs on same row
      if (chart.pairedSeating && count >= 2) {
        const pairs = findPairedPositions();
        
        // Group pairs by row
        const pairsByRow = new Map<number, { row: number; startCol: number }[]>();
        for (const pair of pairs) {
          if (!pairsByRow.has(pair.row)) {
            pairsByRow.set(pair.row, []);
          }
          pairsByRow.get(pair.row)!.push(pair);
        }
        
        // Sort pairs in each row by column
        for (const rowPairs of pairsByRow.values()) {
          rowPairs.sort((a, b) => a.startCol - b.startCol);
        }
        
        // Try to find adjacent pairs
        for (const [row, rowPairs] of pairsByRow) {
          const positions: { row: number; col: number }[] = [];
          
          for (const pair of rowPairs) {
            // Add both seats from this pair
            positions.push({ row, col: pair.startCol });
            positions.push({ row, col: pair.startCol + 1 });
            
            if (positions.length >= count) {
              return positions.slice(0, count);
            }
          }
        }
        
        // Fall back to any available pairs
        const positions: { row: number; col: number }[] = [];
        for (const pair of pairs) {
          if (positions.length >= count) break;
          positions.push({ row: pair.row, col: pair.startCol });
          if (positions.length < count) {
            positions.push({ row: pair.row, col: pair.startCol + 1 });
          }
        }
        
        // Fill remaining with any available
        if (positions.length < count) {
          for (const pos of available) {
            if (positions.length >= count) break;
            const alreadyAdded = positions.some(p => p.row === pos.row && p.col === pos.col);
            if (!alreadyAdded) {
              positions.push(pos);
            }
          }
        }
        
        return positions.slice(0, count);
      }
      
      // Shuffle and return available positions as fallback
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      return available.slice(0, count);
    };

    // First, place groups that need to be together (horizontally, or in pairs if paired seating)
    for (const group of mergedPlaceTogether) {
      // Find all students in group - check both unlocked students and locked students in grid
      const groupStudents: { student: Student; locked: boolean; position?: { row: number; col: number } }[] = [];
      
      for (const id of group) {
        // Skip if already placed by a previous group processing
        if (placement.has(id)) continue;
        
        // Check if it's an unlocked student to place
        const unlockedStudent = studentsToPlace.find(s => s.id === id);
        if (unlockedStudent) {
          groupStudents.push({ student: unlockedStudent, locked: false });
          continue;
        }
        
        // Check if it's a locked student in the grid
        for (let row = 0; row < chart.rows; row++) {
          for (let col = 0; col < chart.cols; col++) {
            if (!seatingUtils.isSeatEnabled(chart, row, col)) {
              continue;
            }
            const gridStudent = updated.grid[row][col];
            if (gridStudent?.id === id && gridStudent.locked) {
              groupStudents.push({ student: gridStudent, locked: true, position: { row, col } });
              usedPositions.add(`${row},${col}`); // Mark locked position as used
            }
          }
        }
      }
      
      const unlockedInGroup = groupStudents.filter(g => !g.locked);
      const lockedInGroup = groupStudents.filter(g => g.locked);
      
      if (unlockedInGroup.length === 0) continue; // All locked, nothing to place
      
      // If there's a locked student, place unlocked ones next to them
      if (lockedInGroup.length > 0 && lockedInGroup[0].position) {
        const lockedPos = lockedInGroup[0].position;
        
        // Find horizontal positions next to the locked student
        const adjacentPositions: { row: number; col: number }[] = [];
        
        // For paired seating, try to place in the same pair
        if (chart.pairedSeating) {
          const pairStart = Math.floor(lockedPos.col / 2) * 2;
          const otherCol = lockedPos.col === pairStart ? pairStart + 1 : pairStart;
          if (isPosAvailable(lockedPos.row, otherCol)) {
            adjacentPositions.push({ row: lockedPos.row, col: otherCol });
          }
        }
        
        // Also check left and right
        if (isPosAvailable(lockedPos.row, lockedPos.col - 1)) {
          adjacentPositions.push({ row: lockedPos.row, col: lockedPos.col - 1 });
        }
        if (isPosAvailable(lockedPos.row, lockedPos.col + 1)) {
          adjacentPositions.push({ row: lockedPos.row, col: lockedPos.col + 1 });
        }
        
        // Place unlocked students in adjacent positions
        for (let i = 0; i < unlockedInGroup.length && i < adjacentPositions.length; i++) {
          const pos = adjacentPositions[i];
          usedPositions.add(`${pos.row},${pos.col}`);
          placement.set(unlockedInGroup[i].student.id, pos);
        }
        
        // If we couldn't place all adjacent, place remaining nearby
        const remainingInGroup = unlockedInGroup.filter(g => !placement.has(g.student.id));
        if (remainingInGroup.length > 0) {
          const nearbyPositions = findNearbyPositions(remainingInGroup.length);
          for (let i = 0; i < remainingInGroup.length && i < nearbyPositions.length; i++) {
            const pos = nearbyPositions[i];
            usedPositions.add(`${pos.row},${pos.col}`);
            placement.set(remainingInGroup[i].student.id, pos);
          }
        }
        continue;
      }
      
      // No locked students - place group together
      if (unlockedInGroup.length < 2) {
        // Single student - just place them anywhere
        if (unlockedInGroup.length === 1) {
          const nearbyPositions = findNearbyPositions(1);
          if (nearbyPositions.length > 0) {
            usedPositions.add(`${nearbyPositions[0].row},${nearbyPositions[0].col}`);
            placement.set(unlockedInGroup[0].student.id, nearbyPositions[0]);
          }
        }
        continue;
      }

      // Use findNearbyPositions to get the best available positions for the group
      const positions = findNearbyPositions(unlockedInGroup.length);
      for (let i = 0; i < unlockedInGroup.length && i < positions.length; i++) {
        const pos = positions[i];
        usedPositions.add(`${pos.row},${pos.col}`);
        placement.set(unlockedInGroup[i].student.id, pos);
      }
    }

    // Remove already placed students from the list
    const remainingStudents = studentsToPlace.filter(s => !placement.has(s.id));
    
    // Get remaining positions
    const remainingPositions = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
    
    // If mixing genders, organize students and positions to maximize gender diversity
    if (constraints.mixGenders && remainingStudents.length > 0 && remainingPositions.length > 0) {
      const males = remainingStudents.filter(s => s.gender === 'male');
      const females = remainingStudents.filter(s => s.gender === 'female');
      const others = remainingStudents.filter(s => s.gender === 'other');
      
      // Group positions based on seating structure
      const hasCustomLayout = !!(chart.customLayout && chart.customLayout.length > 0);
      const positionGroups: { row: number; col: number }[][] = [];
      
      if (chart.pairedSeating && !hasCustomLayout) {
        // Group positions into pairs (columns 0-1, 2-3, 4-5, etc.)
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const [row, positions] of positionsByRow) {
          positions.sort((a, b) => a.col - b.col);
          for (let i = 0; i < positions.length; i += 2) {
            const pair = [positions[i]];
            if (i + 1 < positions.length) {
              pair.push(positions[i + 1]);
            }
            positionGroups.push(pair);
          }
        }
      } else if (hasCustomLayout) {
        // Group positions according to custom layout groups
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const [row, positions] of positionsByRow) {
          positions.sort((a, b) => a.col - b.col);
          const rowLayout = chart.customLayout![row];
          if (rowLayout) {
            let colIndex = 0;
            for (const groupSize of rowLayout) {
              const group: { row: number; col: number }[] = [];
              for (let i = 0; i < groupSize && colIndex < positions.length; i++, colIndex++) {
                group.push(positions[colIndex]);
              }
              if (group.length > 0) {
                positionGroups.push(group);
              }
            }
          } else {
            // Fallback: treat each position as its own group
            for (const pos of positions) {
              positionGroups.push([pos]);
            }
          }
        }
      } else {
        // Regular grid: group by row and adjacent positions
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const positions of positionsByRow.values()) {
          positions.sort((a, b) => a.col - b.col);
          positionGroups.push(positions);
        }
      }
      
      // Shuffle position groups to distribute same-sex pairs randomly
      for (let i = positionGroups.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positionGroups[i], positionGroups[j]] = [positionGroups[j], positionGroups[i]];
      }
      
      // Now fill each group/pair with alternating genders
      let maleIndex = 0, femaleIndex = 0, otherIndex = 0;
      
      for (const group of positionGroups) {
        // Randomize starting gender for each group
        const startWithMale = Math.random() < 0.5;
        
        for (let i = 0; i < group.length; i++) {
          let student: Student | null = null;
          
          // Alternate gender preference within each group
          const preferMale = (i % 2 === 0) === startWithMale;
          
          if (preferMale) {
            // Prefer male or first available
            if (maleIndex < males.length) {
              student = males[maleIndex++];
            } else if (femaleIndex < females.length) {
              student = females[femaleIndex++];
            } else if (otherIndex < others.length) {
              student = others[otherIndex++];
            }
          } else {
            // Prefer female or first available
            if (femaleIndex < females.length) {
              student = females[femaleIndex++];
            } else if (maleIndex < males.length) {
              student = males[maleIndex++];
            } else if (otherIndex < others.length) {
              student = others[otherIndex++];
            }
          }
          
          if (student) {
            usedPositions.add(`${group[i].row},${group[i].col}`);
            placement.set(student.id, group[i]);
          }
        }
      }
    } else {
      // No gender mixing - shuffle and place
      for (let i = remainingStudents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingStudents[i], remainingStudents[j]] = [remainingStudents[j], remainingStudents[i]];
      }
    
      for (const student of remainingStudents) {
        // Find a valid position (respecting keepApart constraints)
        const keepApartIds = constraints.keepApart
          .filter(pair => pair.includes(student.id))
          .flat()
          .filter(id => id !== student.id);

        let placed = false;
        for (let i = 0; i < remainingPositions.length; i++) {
          const pos = remainingPositions[i];
          if (usedPositions.has(`${pos.row},${pos.col}`)) continue;

          // Check if any keepApart student is adjacent
          let isValid = true;
          for (const apartId of keepApartIds) {
            const apartPos = placement.get(apartId);
            if (apartPos && seatingUtils.areAdjacent(pos.row, pos.col, apartPos.row, apartPos.col)) {
              isValid = false;
              break;
            }
            // Also check locked students in grid
            for (let r = 0; r < chart.rows && isValid; r++) {
              for (let c = 0; c < chart.cols && isValid; c++) {
                if (!seatingUtils.isSeatEnabled(chart, r, c)) {
                  continue;
                }
                if (updated.grid[r][c]?.id === apartId && 
                    seatingUtils.areAdjacent(pos.row, pos.col, r, c)) {
                  isValid = false;
                }
              }
            }
          }

          if (isValid) {
            usedPositions.add(`${pos.row},${pos.col}`);
            placement.set(student.id, pos);
            placed = true;
            break;
          }
        }

        // If no valid position found, place anywhere available
        if (!placed) {
          for (const pos of remainingPositions) {
            if (!usedPositions.has(`${pos.row},${pos.col}`)) {
              usedPositions.add(`${pos.row},${pos.col}`);
              placement.set(student.id, pos);
              break;
            }
          }
        }
      }
    }

    // Apply placements to grid
    for (const [studentId, pos] of placement) {
      updated = seatingUtils.placeStudent(updated, studentId, pos.row, pos.col);
    }

    return updated;
  },

  // Swap two students' positions
  swapStudents: (
    chart: SeatingChart,
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ): SeatingChart => {
    if (!seatingUtils.isSeatEnabled(chart, row1, col1) || !seatingUtils.isSeatEnabled(chart, row2, col2)) {
      return chart;
    }
    const newGrid = chart.grid.map(r => [...r]);
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = newGrid[row2][col2];
    newGrid[row2][col2] = temp;

    return {
      ...chart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
  },

  // Shuffle seated students (re-randomize their positions, respects locked students and constraints)
  shuffleSeatedStudents: (chart: SeatingChart, constraints?: SeatingConstraints): SeatingChart => {
    // Collect unlocked seated students and available positions
    const unlockedStudents: Student[] = [];
    const availablePositions: { row: number; col: number }[] = [];

    // Record current neighbors for each student (before shuffling)
    const previousNeighbors = new Map<string, Set<string>>();
    
        for (let row = 0; row < chart.rows; row++) {
          for (let col = 0; col < chart.cols; col++) {
            if (!seatingUtils.isSeatEnabled(chart, row, col)) {
              continue;
            }
        const student = chart.grid[row][col];
        if (student) {
          // Find all adjacent students
          const neighbors = new Set<string>();
          const adjacentOffsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
          for (const [dr, dc] of adjacentOffsets) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < chart.rows && nc >= 0 && nc < chart.cols && seatingUtils.isSeatEnabled(chart, nr, nc)) {
              const neighbor = chart.grid[nr][nc];
              if (neighbor) {
                neighbors.add(neighbor.id);
              }
            }
          }
          previousNeighbors.set(student.id, neighbors);
          
          if (!student.locked) {
            unlockedStudents.push(student);
            availablePositions.push({ row, col });
          }
        }
      }
    }

    if (unlockedStudents.length === 0) return chart;

    // Start with current grid (keeps locked students, clears unlocked positions)
    const newGrid = chart.grid.map(r => [...r]);
    for (const pos of availablePositions) {
      newGrid[pos.row][pos.col] = null;
    }

    // If no constraints, do a shuffle that avoids previous neighbors
    if (!constraints || (!constraints.mixGenders && constraints.placeTogether.length === 0 && constraints.keepApart.length === 0)) {
      const shuffled = [...unlockedStudents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Try to place avoiding previous neighbors
      const usedPos = new Set<string>();
      const studentPlacements = new Map<string, { row: number; col: number }>();
      
      for (const student of shuffled) {
        const prevNeighbors = previousNeighbors.get(student.id) || new Set();
        let bestPos: { row: number; col: number } | null = null;
        
        // First try to find a position without previous neighbors
        for (const pos of availablePositions) {
          if (usedPos.has(`${pos.row},${pos.col}`)) continue;
          
          let hasPreviousNeighbor = false;
          const adjacentOffsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
          for (const [dr, dc] of adjacentOffsets) {
            const nr = pos.row + dr;
            const nc = pos.col + dc;
            // Check already placed students
            for (const [placedId, placedPos] of studentPlacements) {
              if (placedPos.row === nr && placedPos.col === nc && prevNeighbors.has(placedId)) {
                hasPreviousNeighbor = true;
                break;
              }
            }
            // Check locked students in grid
            if (!hasPreviousNeighbor && nr >= 0 && nr < chart.rows && nc >= 0 && nc < chart.cols && seatingUtils.isSeatEnabled(chart, nr, nc)) {
              const locked = chart.grid[nr][nc];
              if (locked?.locked && prevNeighbors.has(locked.id)) {
                hasPreviousNeighbor = true;
              }
            }
            if (hasPreviousNeighbor) break;
          }
          
          if (!hasPreviousNeighbor) {
            bestPos = pos;
            break;
          }
        }
        
        // Fallback to any available position
        if (!bestPos) {
          for (const pos of availablePositions) {
            if (!usedPos.has(`${pos.row},${pos.col}`)) {
              bestPos = pos;
              break;
            }
          }
        }
        
        if (bestPos) {
          usedPos.add(`${bestPos.row},${bestPos.col}`);
          studentPlacements.set(student.id, bestPos);
          newGrid[bestPos.row][bestPos.col] = student;
        }
      }
      
      return {
        ...chart,
        grid: newGrid,
        updatedAt: new Date().toISOString()
      };
    }

    // Constraint-aware shuffle
    const placement = new Map<string, { row: number; col: number }>();
    const usedPositions = new Set<string>();

    const isPosAvailable = (row: number, col: number) => {
      return !usedPositions.has(`${row},${col}`) && 
             availablePositions.some(p => p.row === row && p.col === col);
    };

    // Merge overlapping groups
    const mergeGroups = (groups: string[][]): string[][] => {
      const merged: string[][] = [];
      const processed = new Set<number>();
      
      for (let i = 0; i < groups.length; i++) {
        if (processed.has(i)) continue;
        
        let currentGroup = new Set(groups[i]);
        let changed = true;
        
        while (changed) {
          changed = false;
          for (let j = i + 1; j < groups.length; j++) {
            if (processed.has(j)) continue;
            const hasOverlap = groups[j].some(id => currentGroup.has(id));
            if (hasOverlap) {
              groups[j].forEach(id => currentGroup.add(id));
              processed.add(j);
              changed = true;
            }
          }
        }
        
        processed.add(i);
        merged.push([...currentGroup]);
      }
      
      return merged;
    };

    const mergedPlaceTogether = mergeGroups([...constraints.placeTogether]);

    const findPairedPositions = () => {
      const pairs: { row: number; startCol: number }[] = [];
      for (let row = 0; row < chart.rows; row++) {
        for (let col = 0; col < chart.cols - 1; col += 2) {
          if (isPosAvailable(row, col) && isPosAvailable(row, col + 1)) {
            pairs.push({ row, startCol: col });
          }
        }
      }
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      return pairs;
    };

    // Helper to find nearby available positions for a group
    const findNearbyPositions = (count: number): { row: number; col: number }[] => {
      const positions: { row: number; col: number }[] = [];
      const available = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
      
      // Shuffle available positions
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      
      if (available.length === 0) return positions;
      
      // For paired seating, try to find adjacent pairs first
      if (chart.pairedSeating && count >= 2) {
        const pairs = findPairedPositions();
        let pairsNeeded = Math.ceil(count / 2);
        
        for (const pair of pairs) {
          if (positions.length >= count) break;
          positions.push({ row: pair.row, col: pair.startCol });
          if (positions.length < count) {
            positions.push({ row: pair.row, col: pair.startCol + 1 });
          }
          pairsNeeded--;
          if (pairsNeeded <= 0) break;
        }
        
        // If we couldn't find enough pairs, fill with any available
        if (positions.length < count) {
          for (const pos of available) {
            if (positions.length >= count) break;
            const alreadyAdded = positions.some(p => p.row === pos.row && p.col === pos.col);
            if (!alreadyAdded) {
              positions.push(pos);
            }
          }
        }
      } else {
        // Try to find contiguous row positions, or just use any available
        for (const startPos of available) {
          const rowPositions = [startPos];
          for (let c = startPos.col + 1; c < chart.cols && rowPositions.length < count; c++) {
            if (!usedPositions.has(`${startPos.row},${c}`) && isPosAvailable(startPos.row, c)) {
              rowPositions.push({ row: startPos.row, col: c });
            } else {
              break;
            }
          }
          if (rowPositions.length >= count) {
            return rowPositions.slice(0, count);
          }
        }
        
        // Couldn't find contiguous, just return available positions
        return available.slice(0, count);
      }
      
      return positions.slice(0, count);
    };

    // Place groups that need to be together
    for (const group of mergedPlaceTogether) {
      // Find all students in group - check both unlocked students and locked students in grid
      const groupMembers: { student: Student; locked: boolean; position?: { row: number; col: number } }[] = [];
      
      for (const id of group) {
        // Skip if already placed
        if (placement.has(id)) continue;
        
        // Check if it's an unlocked student to place
        const unlockedStudent = unlockedStudents.find(s => s.id === id);
        if (unlockedStudent) {
          groupMembers.push({ student: unlockedStudent, locked: false });
          continue;
        }
        
        // Check if it's a locked student in the grid
        for (let row = 0; row < chart.rows; row++) {
          for (let col = 0; col < chart.cols; col++) {
            const gridStudent = chart.grid[row][col];
            if (gridStudent?.id === id && gridStudent.locked) {
              groupMembers.push({ student: gridStudent, locked: true, position: { row, col } });
            }
          }
        }
      }
      
      const unlockedInGroup = groupMembers.filter(g => !g.locked);
      const lockedInGroup = groupMembers.filter(g => g.locked);
      
      if (unlockedInGroup.length === 0) continue; // All locked, nothing to place
      
      // If there's a locked student, place unlocked ones next to them
      if (lockedInGroup.length > 0 && lockedInGroup[0].position) {
        const lockedPos = lockedInGroup[0].position;
        
        // Find horizontal positions next to the locked student
        const adjacentPositions: { row: number; col: number }[] = [];
        
        // For paired seating, try to place in the same pair
        if (chart.pairedSeating) {
          const pairStart = Math.floor(lockedPos.col / 2) * 2;
          const otherCol = lockedPos.col === pairStart ? pairStart + 1 : pairStart;
          if (isPosAvailable(lockedPos.row, otherCol)) {
            adjacentPositions.push({ row: lockedPos.row, col: otherCol });
          }
        }
        
        // Also check left and right
        if (isPosAvailable(lockedPos.row, lockedPos.col - 1)) {
          adjacentPositions.push({ row: lockedPos.row, col: lockedPos.col - 1 });
        }
        if (isPosAvailable(lockedPos.row, lockedPos.col + 1)) {
          adjacentPositions.push({ row: lockedPos.row, col: lockedPos.col + 1 });
        }
        
        // Place unlocked students in adjacent positions
        for (let i = 0; i < unlockedInGroup.length && i < adjacentPositions.length; i++) {
          const pos = adjacentPositions[i];
          usedPositions.add(`${pos.row},${pos.col}`);
          placement.set(unlockedInGroup[i].student.id, pos);
        }
        
        // If we couldn't place all adjacent, place remaining nearby
        const remainingInGroup = unlockedInGroup.filter(g => !placement.has(g.student.id));
        if (remainingInGroup.length > 0) {
          const nearbyPositions = findNearbyPositions(remainingInGroup.length);
          for (let i = 0; i < remainingInGroup.length && i < nearbyPositions.length; i++) {
            const pos = nearbyPositions[i];
            usedPositions.add(`${pos.row},${pos.col}`);
            placement.set(remainingInGroup[i].student.id, pos);
          }
        }
        continue;
      }
      
      // No locked students - place group together
      if (unlockedInGroup.length < 2) {
        // Single student - just place them anywhere
        if (unlockedInGroup.length === 1) {
          const nearbyPositions = findNearbyPositions(1);
          if (nearbyPositions.length > 0) {
            usedPositions.add(`${nearbyPositions[0].row},${nearbyPositions[0].col}`);
            placement.set(unlockedInGroup[0].student.id, nearbyPositions[0]);
          }
        }
        continue;
      }

      // Use findNearbyPositions to get the best available positions for the group
      const positions = findNearbyPositions(unlockedInGroup.length);
      for (let i = 0; i < unlockedInGroup.length && i < positions.length; i++) {
        const pos = positions[i];
        usedPositions.add(`${pos.row},${pos.col}`);
        placement.set(unlockedInGroup[i].student.id, pos);
      }
    }

    // Place remaining students
    const remainingStudents = unlockedStudents.filter(s => !placement.has(s.id));
    
    // Get remaining positions
    const remainingPositions = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
    
    // If mixing genders, organize students and positions to maximize gender diversity
    if (constraints.mixGenders && remainingStudents.length > 0 && remainingPositions.length > 0) {
      const males = remainingStudents.filter(s => s.gender === 'male');
      const females = remainingStudents.filter(s => s.gender === 'female');
      const others = remainingStudents.filter(s => s.gender === 'other');
      
      // Group positions based on seating structure
      const hasCustomLayout = !!(chart.customLayout && chart.customLayout.length > 0);
      const positionGroups: { row: number; col: number }[][] = [];
      
      if (chart.pairedSeating && !hasCustomLayout) {
        // Group positions into pairs (columns 0-1, 2-3, 4-5, etc.)
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const [row, positions] of positionsByRow) {
          positions.sort((a, b) => a.col - b.col);
          for (let i = 0; i < positions.length; i += 2) {
            const pair = [positions[i]];
            if (i + 1 < positions.length) {
              pair.push(positions[i + 1]);
            }
            positionGroups.push(pair);
          }
        }
      } else if (hasCustomLayout) {
        // Group positions according to custom layout groups
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const [row, positions] of positionsByRow) {
          positions.sort((a, b) => a.col - b.col);
          const rowLayout = chart.customLayout![row];
          if (rowLayout) {
            let colIndex = 0;
            for (const groupSize of rowLayout) {
              const group: { row: number; col: number }[] = [];
              for (let i = 0; i < groupSize && colIndex < positions.length; i++, colIndex++) {
                group.push(positions[colIndex]);
              }
              if (group.length > 0) {
                positionGroups.push(group);
              }
            }
          } else {
            // Fallback: treat each position as its own group
            for (const pos of positions) {
              positionGroups.push([pos]);
            }
          }
        }
      } else {
        // Regular grid: group by row and adjacent positions
        const positionsByRow = new Map<number, { row: number; col: number }[]>();
        for (const pos of remainingPositions) {
          if (!positionsByRow.has(pos.row)) {
            positionsByRow.set(pos.row, []);
          }
          positionsByRow.get(pos.row)!.push(pos);
        }
        
        for (const positions of positionsByRow.values()) {
          positions.sort((a, b) => a.col - b.col);
          positionGroups.push(positions);
        }
      }
      
      // Shuffle position groups to distribute same-sex pairs randomly
      for (let i = positionGroups.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positionGroups[i], positionGroups[j]] = [positionGroups[j], positionGroups[i]];
      }
      
      // Now fill each group/pair with alternating genders
      let maleIndex = 0, femaleIndex = 0, otherIndex = 0;
      
      for (const group of positionGroups) {
        // Randomize starting gender for each group
        const startWithMale = Math.random() < 0.5;
        
        for (let i = 0; i < group.length; i++) {
          let student: Student | null = null;
          
          // Alternate gender preference within each group
          const preferMale = (i % 2 === 0) === startWithMale;
          
          if (preferMale) {
            // Prefer male or first available
            if (maleIndex < males.length) {
              student = males[maleIndex++];
            } else if (femaleIndex < females.length) {
              student = females[femaleIndex++];
            } else if (otherIndex < others.length) {
              student = others[otherIndex++];
            }
          } else {
            // Prefer female or first available
            if (femaleIndex < females.length) {
              student = females[femaleIndex++];
            } else if (maleIndex < males.length) {
              student = males[maleIndex++];
            } else if (otherIndex < others.length) {
              student = others[otherIndex++];
            }
          }
          
          if (student) {
            usedPositions.add(`${group[i].row},${group[i].col}`);
            placement.set(student.id, group[i]);
          }
        }
      }
    } else {
      // No gender mixing - shuffle and place
      for (let i = remainingStudents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingStudents[i], remainingStudents[j]] = [remainingStudents[j], remainingStudents[i]];
      }

      for (const student of remainingStudents) {
        const keepApartIds = constraints.keepApart
          .filter(pair => pair.includes(student.id))
          .flat()
          .filter(id => id !== student.id);
        
        // Get previous neighbors (unless they're in placeTogether with this student)
        const prevNeighbors = previousNeighbors.get(student.id) || new Set();
        const placeTogetherIds = new Set(
          constraints.placeTogether
            .filter(group => group.includes(student.id))
            .flat()
        );
        
        // Previous neighbors we should avoid (not in placeTogether)
        const avoidPreviousNeighbors = [...prevNeighbors].filter(id => !placeTogetherIds.has(id));

        let placed = false;
        for (const pos of remainingPositions) {
          if (usedPositions.has(`${pos.row},${pos.col}`)) continue;

          let isValid = true;
          
          // Check keepApart constraints
          for (const apartId of keepApartIds) {
            const apartPos = placement.get(apartId);
            if (apartPos && seatingUtils.areAdjacent(pos.row, pos.col, apartPos.row, apartPos.col)) {
              isValid = false;
              break;
            }
            // Also check locked students in grid
            for (let r = 0; r < chart.rows && isValid; r++) {
              for (let c = 0; c < chart.cols && isValid; c++) {
                if (!seatingUtils.isSeatEnabled(chart, r, c)) {
                  continue;
                }
                if (chart.grid[r][c]?.id === apartId && chart.grid[r][c]?.locked &&
                    seatingUtils.areAdjacent(pos.row, pos.col, r, c)) {
                  isValid = false;
                }
              }
            }
          }
          
          // Check previous neighbors (avoid sitting next to same people)
          if (isValid) {
            for (const prevNeighborId of avoidPreviousNeighbors) {
              const neighborPos = placement.get(prevNeighborId);
              if (neighborPos && seatingUtils.areAdjacent(pos.row, pos.col, neighborPos.row, neighborPos.col)) {
                isValid = false;
                break;
              }
              // Also check locked students in grid
              for (let r = 0; r < chart.rows && isValid; r++) {
                for (let c = 0; c < chart.cols && isValid; c++) {
                  if (!seatingUtils.isSeatEnabled(chart, r, c)) {
                    continue;
                  }
                  if (chart.grid[r][c]?.id === prevNeighborId && chart.grid[r][c]?.locked &&
                      seatingUtils.areAdjacent(pos.row, pos.col, r, c)) {
                    isValid = false;
                  }
                }
              }
            }
          }

          if (isValid) {
            usedPositions.add(`${pos.row},${pos.col}`);
            placement.set(student.id, pos);
            placed = true;
            break;
          }
        }

        if (!placed) {
          for (const pos of remainingPositions) {
            if (!usedPositions.has(`${pos.row},${pos.col}`)) {
              usedPositions.add(`${pos.row},${pos.col}`);
              placement.set(student.id, pos);
              break;
            }
          }
        }
      }
    }

    // Apply placements to grid
    for (const [studentId, pos] of placement) {
      const student = unlockedStudents.find(s => s.id === studentId);
      if (student) {
        newGrid[pos.row][pos.col] = student;
      }
    }

    return {
      ...chart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
  }
};
