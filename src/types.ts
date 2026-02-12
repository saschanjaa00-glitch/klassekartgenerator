export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  locked?: boolean;
}

export interface SeatingConstraints {
  placeTogether: string[][]; // Groups of student IDs to place adjacently
  keepApart: string[][]; // Pairs of student IDs to never place adjacent
  mixGenders: boolean; // Try to alternate genders when placing
}

export interface SeatingChart {
  id: string;
  name: string;
  students: Student[];
  grid: (Student | null)[][]; // 2D grid to represent seating
  rows: number;
  cols: number;
  pairedSeating?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPosition {
  row: number;
  col: number;
}
