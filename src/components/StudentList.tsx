import React, { useState } from 'react';
import type { Student } from '../types';
import type { TFunction } from '../i18n';
import { StudentCard } from './StudentCard';
import './StudentList.css';

interface StudentListProps {
  students: Student[];
  onRemoveStudent: (studentId: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onDropFromGrid?: (studentId: string) => void;
  t: TFunction;
  locale: string;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onRemoveStudent,
  onUpdateStudent,
  onDropFromGrid,
  t,
  locale
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenderChange = (student: Student, newGender: 'male' | 'female') => {
    if (onUpdateStudent) {
      const nextGender = student.gender === newGender ? 'other' : newGender;
      onUpdateStudent({ ...student, gender: nextGender });
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
    const emptyTitle = (t('studentListTitle'))(0);
    return (
      <div className="student-list" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <h3>{emptyTitle}</h3>
        <p className="empty-message">{t('studentListEmptyMessage')}</p>
      </div>
    );
  }

  const sortedStudents = [...students].sort((a, b) => 
    a.name.localeCompare(b.name, locale, { sensitivity: 'base' })
  );
  const listTitle = (t('studentListTitle'))(students.length);

  return (
    <div
      className={`student-list ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="student-list-header">
        <h3>{listTitle}</h3>
        <button 
          className="btn-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? t('studentListShow') : t('studentListHide')}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="student-list-grid">
          {sortedStudents.map((student) => (
            <div key={student.id} className="student-list-item">
              <StudentCard student={student} draggable={true} t={t} />
              <div className={`gender-toggle ${student.gender === 'other' ? 'unset' : ''}`}>
                <button
                  className={`gender-icon male ${student.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(student, 'male')}
                  title={t('genderMaleTitle')}
                >
                  ♂
                </button>
                <button
                  className={`gender-icon female ${student.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderChange(student, 'female')}
                  title={t('genderFemaleTitle')}
                >
                  ♀
                </button>
              </div>
              <button
                className="btn-remove-student"
                onClick={() => onRemoveStudent(student.id)}
                title={t('removeStudentTitle')}
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
