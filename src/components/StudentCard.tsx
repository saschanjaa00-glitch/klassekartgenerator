import React from 'react';
import type { Student } from '../types';
import './StudentCard.css';

interface StudentCardProps {
  student: Student | null;
  onClick?: () => void;
  draggable?: boolean;
  onToggleLock?: (studentId: string) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onClick,
  draggable = false,
  onToggleLock
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (student) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('studentId', student.id);
    }
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (student && onToggleLock) {
      onToggleLock(student.id);
    }
  };

  if (!student) {
    return (
      <div className="student-card empty" onClick={onClick}>
        <span className="empty-seat">Tom</span>
      </div>
    );
  }

  return (
    <div
      className={`student-card filled ${student.locked ? 'locked' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      {onToggleLock && (
        <button
          className={`lock-button ${student.locked ? 'locked' : ''}`}
          onClick={handleLockClick}
          title={student.locked ? 'Lås opp elev' : 'Lås elev på plass'}
        >
          {student.locked ? '🔒' : '🔓'}
        </button>
      )}
      <div className="student-name">{student.name}</div>
    </div>
  );
};
