import React from 'react';
import type { Student } from '../types';
import type { TFunction } from '../i18n';
import './StudentCard.css';

interface StudentCardProps {
  student: Student | null;
  t: TFunction;
  onClick?: () => void;
  draggable?: boolean;
  onToggleLock?: (studentId: string) => void;
  onRemove?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isPreview?: boolean;
  showGenderColors?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  t,
  onClick,
  draggable = false,
  onToggleLock,
  onRemove,
  onDragStart,
  onDragEnd,
  isPreview = false,
  showGenderColors = false
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (student) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('studentId', student.id);
      onDragStart?.();
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (student && onToggleLock) {
      onToggleLock(student.id);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  if (!student) {
    return (
      <div className="student-card empty" onClick={onClick}>
        <span className="empty-seat">{t('studentCardEmpty')}</span>
      </div>
    );
  }

  return (
    <div
      className={`student-card filled ${student.locked ? 'locked' : ''} ${isPreview ? 'preview' : ''} ${showGenderColors ? `gender-${student.gender}` : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {onRemove && (
        <button
          className="remove-button"
          onClick={handleRemoveClick}
          title={t('removeFromSeatTitle')}
        >
          ×
        </button>
      )}
      {onToggleLock && (
        <button
          className={`lock-button ${student.locked ? 'locked' : ''}`}
          onClick={handleLockClick}
          title={student.locked ? t('unlockStudentTitle') : t('lockStudentTitle')}
        >
          {student.locked ? '🔒' : '🔓'}
        </button>
      )}
      <div className="student-name">{student.name}</div>
    </div>
  );
};
