import React, { useState } from 'react';
import type { Student } from '../types';
import './StudentForm.css';

interface StudentFormProps {
  onAddStudent: (students: Student[]) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onAddStudent }) => {
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
      setError('Vennligst skriv inn minst ett elevnavn');
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

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h3>Legg til elever</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="names">
          Elevnavn <span className="hint">(én per linje)</span>
        </label>
        <textarea
          id="names"
          value={names}
          onChange={handleChange}
          placeholder="Skriv inn elevnavn, én per linje:&#10;Ola Nordmann&#10;Kari Hansen&#10;Per Olsen"
          rows={6}
        />
        {lineCount > 0 && <div className="line-count">{lineCount} elev{lineCount !== 1 ? 'er' : ''}</div>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Legg til {lineCount} elev{lineCount !== 1 ? 'er' : ''}
        </button>
      </div>
    </form>
  );
};
