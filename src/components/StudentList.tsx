import React, { useState } from 'react';
import type { Student } from '../types';
import { StudentCard } from './StudentCard';
import './StudentList.css';

interface StudentListProps {
  students: Student[];
  onRemoveStudent: (studentId: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onDropFromGrid?: (studentId: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onRemoveStudent,
  onUpdateStudent,
  onDropFromGrid
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenderChange = (student: Student, newGender: 'male' | 'female') => {
    if (onUpdateStudent) {
      onUpdateStudent({ ...student, gender: newGender });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const studentId = e.dataTransfer.getData('studentId');
    if (studentId && onDropFromGrid) {
      onDropFromGrid(studentId);
    }
  };

  if (students.length === 0) {
    return (
      <div className="student-list" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <h3>Uplasserte elever (0)</h3>
        <p className="empty-message">Alle elever er plassert! ✓</p>
      </div>
    );
  }

  const sortedStudents = [...students].sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return (
    <div
      className={`student-list ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="student-list-header">
        <h3>Uplasserte elever ({students.length})</h3>
        <button 
          className="btn-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Vis elever' : 'Skjul elever'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="student-list-grid">
          {sortedStudents.map((student) => (
            <div key={student.id} className="student-list-item">
              <StudentCard student={student} draggable={true} />
              <div className="gender-toggle">
                <button
                  className={`gender-icon male ${student.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(student, 'male')}
                  title="Gutt"
                >
                  ♂
                </button>
                <button
                  className={`gender-icon female ${student.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(student, 'female')}
                  title="Jente"
                >
                  ♀
                </button>
              </div>
              <button
                className="btn-remove-student"
                onClick={() => onRemoveStudent(student.id)}
                title="Fjern elev"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
