import type { Student, SeatingChart, SeatingConstraints } from '../types';

export const seatingUtils = {
  // Generate a unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Create a new seating chart
  createChart: (name: string, rows: number, cols: number, pairedSeating: boolean = false): SeatingChart => {
    const grid: (Student | null)[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));

    return {
      id: seatingUtils.generateId(),
      name,
      students: [],
      grid,
      rows,
      cols,
      pairedSeating,
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
             !updated.grid[row][col]?.locked;
    };

    // Helper to get horizontally adjacent positions (left and right only)
    const getHorizontalPositions = (row: number, col: number, count: number) => {
      const positions: { row: number; col: number }[] = [];
      // Try to extend to the right first
      for (let i = 1; i < count && col + i < chart.cols; i++) {
        if (isPosAvailable(row, col + i)) {
          positions.push({ row, col: col + i });
        } else {
          break;
        }
      }
      return positions;
    };

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

    // First, place groups that need to be together (horizontally, or in pairs if paired seating)
    for (const group of constraints.placeTogether) {
      // Find all students in group - check both unlocked students and locked students in grid
      const groupStudents: { student: Student; locked: boolean; position?: { row: number; col: number } }[] = [];
      
      for (const id of group) {
        // Check if it's an unlocked student to place
        const unlockedStudent = studentsToPlace.find(s => s.id === id);
        if (unlockedStudent) {
          groupStudents.push({ student: unlockedStudent, locked: false });
          continue;
        }
        
        // Check if it's a locked student in the grid
        for (let row = 0; row < chart.rows; row++) {
          for (let col = 0; col < chart.cols; col++) {
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
        continue;
      }
      
      // No locked students - place group together as before
      if (unlockedInGroup.length < 2) continue;

      if (chart.pairedSeating && unlockedInGroup.length === 2) {
        // For paired seating with 2 students, place them in a pair
        const availablePairs = findPairedPositions();
        if (availablePairs.length > 0) {
          const pair = availablePairs[0];
          usedPositions.add(`${pair.row},${pair.startCol}`);
          usedPositions.add(`${pair.row},${pair.startCol + 1}`);
          placement.set(unlockedInGroup[0].student.id, { row: pair.row, col: pair.startCol });
          placement.set(unlockedInGroup[1].student.id, { row: pair.row, col: pair.startCol + 1 });
        }
      } else {
        // For non-paired seating or groups > 2, place horizontally
        const availableForGroup = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
        
        // Shuffle to randomize starting position
        for (let i = availableForGroup.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableForGroup[i], availableForGroup[j]] = [availableForGroup[j], availableForGroup[i]];
        }

        for (const startPos of availableForGroup) {
          const horizontals = getHorizontalPositions(startPos.row, startPos.col, unlockedInGroup.length);
          if (horizontals.length >= unlockedInGroup.length - 1) {
            // Place the group starting here, horizontally
            usedPositions.add(`${startPos.row},${startPos.col}`);
            placement.set(unlockedInGroup[0].student.id, startPos);
            
            for (let i = 1; i < unlockedInGroup.length && i - 1 < horizontals.length; i++) {
              const pos = horizontals[i - 1];
              usedPositions.add(`${pos.row},${pos.col}`);
              placement.set(unlockedInGroup[i].student.id, pos);
            }
            break;
          }
        }
      }
    }

    // Remove already placed students from the list
    const remainingStudents = studentsToPlace.filter(s => !placement.has(s.id));
    
    // Shuffle remaining students
    for (let i = remainingStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingStudents[i], remainingStudents[j]] = [remainingStudents[j], remainingStudents[i]];
    }

    // Sort by gender if mixing is enabled (alternating pattern)
    if (constraints.mixGenders) {
      const males = remainingStudents.filter(s => s.gender === 'male');
      const females = remainingStudents.filter(s => s.gender === 'female');
      const others = remainingStudents.filter(s => s.gender === 'other');
      
      remainingStudents.length = 0;
      let m = 0, f = 0, o = 0;
      while (m < males.length || f < females.length || o < others.length) {
        if (m < males.length) remainingStudents.push(males[m++]);
        if (f < females.length) remainingStudents.push(females[f++]);
        if (o < others.length) remainingStudents.push(others[o++]);
      }
    }

    // Place remaining students
    const remainingPositions = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
    
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

    for (let row = 0; row < chart.rows; row++) {
      for (let col = 0; col < chart.cols; col++) {
        const student = chart.grid[row][col];
        if (student && !student.locked) {
          unlockedStudents.push(student);
          availablePositions.push({ row, col });
        }
      }
    }

    if (unlockedStudents.length === 0) return chart;

    // Start with current grid (keeps locked students, clears unlocked positions)
    const newGrid = chart.grid.map(r => [...r]);
    for (const pos of availablePositions) {
      newGrid[pos.row][pos.col] = null;
    }

    // If no constraints, just do a simple shuffle
    if (!constraints || (!constraints.mixGenders && constraints.placeTogether.length === 0 && constraints.keepApart.length === 0)) {
      const shuffled = [...unlockedStudents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      for (let i = 0; i < shuffled.length; i++) {
        const { row, col } = availablePositions[i];
        newGrid[row][col] = shuffled[i];
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

    const getHorizontalPositions = (row: number, col: number, count: number) => {
      const positions: { row: number; col: number }[] = [];
      for (let i = 1; i < count && col + i < chart.cols; i++) {
        if (isPosAvailable(row, col + i)) {
          positions.push({ row, col: col + i });
        } else {
          break;
        }
      }
      return positions;
    };

    // Place groups that need to be together
    for (const group of constraints.placeTogether) {
      // Find all students in group - check both unlocked students and locked students in grid
      const groupMembers: { student: Student; locked: boolean; position?: { row: number; col: number } }[] = [];
      
      for (const id of group) {
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
        continue;
      }
      
      // No locked students - place group together as before
      if (unlockedInGroup.length < 2) continue;

      if (chart.pairedSeating && unlockedInGroup.length === 2) {
        const availablePairs = findPairedPositions();
        if (availablePairs.length > 0) {
          const pair = availablePairs[0];
          usedPositions.add(`${pair.row},${pair.startCol}`);
          usedPositions.add(`${pair.row},${pair.startCol + 1}`);
          placement.set(unlockedInGroup[0].student.id, { row: pair.row, col: pair.startCol });
          placement.set(unlockedInGroup[1].student.id, { row: pair.row, col: pair.startCol + 1 });
        }
      } else {
        const availableForGroup = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));
        for (let i = availableForGroup.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableForGroup[i], availableForGroup[j]] = [availableForGroup[j], availableForGroup[i]];
        }

        for (const startPos of availableForGroup) {
          const horizontals = getHorizontalPositions(startPos.row, startPos.col, unlockedInGroup.length);
          if (horizontals.length >= unlockedInGroup.length - 1) {
            usedPositions.add(`${startPos.row},${startPos.col}`);
            placement.set(unlockedInGroup[0].student.id, startPos);
            
            for (let i = 1; i < unlockedInGroup.length && i - 1 < horizontals.length; i++) {
              const pos = horizontals[i - 1];
              usedPositions.add(`${pos.row},${pos.col}`);
              placement.set(unlockedInGroup[i].student.id, pos);
            }
            break;
          }
        }
      }
    }

    // Place remaining students
    const remainingStudents = unlockedStudents.filter(s => !placement.has(s.id));
    for (let i = remainingStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingStudents[i], remainingStudents[j]] = [remainingStudents[j], remainingStudents[i]];
    }

    if (constraints.mixGenders) {
      const males = remainingStudents.filter(s => s.gender === 'male');
      const females = remainingStudents.filter(s => s.gender === 'female');
      const others = remainingStudents.filter(s => s.gender === 'other');
      
      remainingStudents.length = 0;
      let m = 0, f = 0, o = 0;
      while (m < males.length || f < females.length || o < others.length) {
        if (m < males.length) remainingStudents.push(males[m++]);
        if (f < females.length) remainingStudents.push(females[f++]);
        if (o < others.length) remainingStudents.push(others[o++]);
      }
    }

    const remainingPositions = availablePositions.filter(p => !usedPositions.has(`${p.row},${p.col}`));

    for (const student of remainingStudents) {
      const keepApartIds = constraints.keepApart
        .filter(pair => pair.includes(student.id))
        .flat()
        .filter(id => id !== student.id);

      let placed = false;
      for (const pos of remainingPositions) {
        if (usedPositions.has(`${pos.row},${pos.col}`)) continue;

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
              if (chart.grid[r][c]?.id === apartId && chart.grid[r][c]?.locked &&
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
