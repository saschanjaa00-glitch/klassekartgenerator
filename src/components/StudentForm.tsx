import React, { useState } from 'react';
import type { Student } from '../types';
import type { TFunction } from '../i18n';
import './StudentForm.css';

interface StudentFormProps {
  onAddStudent: (students: Student[]) => void;
  t: TFunction;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onAddStudent, t }) => {
  const [names, setNames] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNames(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lines = names
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setError(t('studentFormErrorEmpty'));
      return;
    }

    const students: Student[] = lines.map(name => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      gender: 'other' as const
    }));

    onAddStudent(students);
    setNames('');
    setError('');
  };

  const lineCount = names.split('\n').filter(line => line.trim().length > 0).length;
  const lineCountLabel = (t('studentFormLineCount'))(lineCount);
  const addButtonLabel = (t('studentFormAddButton'))(lineCount);

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h3>{t('studentFormTitle')}</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="names">
          {t('studentFormLabel')} <span className="hint">{t('studentFormHint')}</span>
        </label>
        <textarea
          id="names"
          value={names}
          onChange={handleChange}
          placeholder={t('studentFormPlaceholder')}
          rows={6}
        />
        {lineCount > 0 && <div className="line-count">{lineCountLabel}</div>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {addButtonLabel}
        </button>
      </div>
    </form>
  );
};
