# Development Guide

## Architecture Overview

### Data Flow

```
User Actions (Click/Drag)
    ↓
React Event Handlers
    ↓
State Updates (setCharts, setCurrentChartId)
    ↓
Component Re-render
    ↓
Browser Display Update
    ↓
localStorage.setItem (via useEffect)
```

### Component Hierarchy

```
App (State Management)
├── Sidebar
│   ├── Create Chart Section
│   └── Charts List
└── Main Content
    ├── Controls (Clear Placements button)
    ├── StudentForm (Add new students)
    ├── StudentList (Unplaced students)
    │   └── StudentCard × N
    └── SeatingGrid (Classroom layout)
        ├── SeatingRow × rows
        │   └── SeatingCell × cols
        │       ├── StudentCard or Empty
        │       └── Seat Label (A1, B2, etc.)
```

## State Management

The App component manages all application state:

```typescript
- charts: SeatingChart[]              // All saved charts
- currentChartId: string | null       // Currently viewed chart
- gridSize: { rows, cols }            // Default grid dimensions
- chartName: string                   // New chart name input
```

## Key Utilities

### storage.ts
- `getCharts()` - Retrieve all charts from localStorage
- `saveChart(chart)` - Save or update a chart
- `deleteChart(chartId)` - Remove a chart
- `getChart(chartId)` - Find a specific chart

### seating.ts
- `generateId()` - Create unique IDs
- `createChart(name, rows, cols)` - Initialize new grid
- `addStudent(chart, student)` - Add student to chart
- `removeStudent(chart, studentId)` - Remove student
- `placeStudent(chart, studentId, row, col)` - Assign seat
- `getUnplacedStudents(chart)` - Get students without seats
- `clearPlacements(chart)` - Remove all seat assignments

## Adding New Features

### Adding a New Component

1. Create component file in `src/components/`
2. Create matching CSS file
3. Define TypeScript interfaces if needed
4. Import and use in App.tsx

Example:
```typescript
// src/components/ExportButton.tsx
import React from 'react';
import type { SeatingChart } from '../types';

interface ExportButtonProps {
  chart: SeatingChart;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ chart }) => {
  const handleExport = () => {
    // Export logic here
  };

  return (
    <button onClick={handleExport} className="btn btn-primary">
      Export Chart
    </button>
  );
};
```

### Adding a New Utility Function

1. Add function to relevant utility file in `src/utils/`
2. Export the function
3. Import and use where needed

Example for seating.ts:
```typescript
export const randomizeSeating = (chart: SeatingChart): SeatingChart => {
  const unplaced = seatingUtils.getUnplacedStudents(chart);
  let updated = seatingUtils.clearPlacements(chart);
  
  // Fisher-Yates shuffle of unplaced students
  for (let i = unplaced.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unplaced[i], unplaced[j]] = [unplaced[j], unplaced[i]];
  }
  
  // Place shuffled students
  let seatIndex = 0;
  for (let row = 0; row < chart.rows; row++) {
    for (let col = 0; col < chart.cols && seatIndex < unplaced.length; col++) {
      updated = seatingUtils.placeStudent(
        updated,
        unplaced[seatIndex].id,
        row,
        col
      );
      seatIndex++;
    }
  }
  
  return updated;
};
```

## Styling Guide

### CSS Architecture

- **Global styles** (index.css): Font families, reset styles, root variables
- **Component styles**: Individual CSS files for each component
- **Layout styles** (App.css): Main application layout and grid

### Color Scheme

- Primary Gradient: `#667eea` to `#764ba2` (purple)
- Background: `#f5f7fa` (light gray-blue)
- Text: `#333` (dark gray)
- Borders: `#ddd` (light gray)
- Error: `#e74c3c` (red)

### Responsive Breakpoints

```css
/* Tablet and below */
@media (max-width: 1024px) {
  /* Sidebar becomes grid */
  .sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* Mobile devices */
@media (max-width: 768px) {
  /* Further optimizations */
}
```

## Performance Optimization

Current optimizations in place:
- Lazy rendering with React.memo (can be added if needed)
- CSS animations for smooth transitions
- Vite's code splitting
- CSS minification in production

### Further Optimizations

1. **Code Splitting**: Dynamic imports for large features
   ```typescript
   const RandomizeButton = React.lazy(() => 
     import('./components/RandomizeButton')
   );
   ```

2. **Memoization**: Prevent unnecessary re-renders
   ```typescript
   export const SeatingGrid = React.memo(SeatingGridComponent);
   ```

3. **Virtual Lists**: For very large student lists
   ```typescript
   import { FixedSizeList } from 'react-window';
   ```

## Testing

### Manual Testing Checklist

- [ ] Create a new chart
- [ ] Add multiple students
- [ ] Drag students to seats
- [ ] Move students between seats
- [ ] Remove students from seats
- [ ] Delete students from chart
- [ ] Clear all placements
- [ ] Switch between charts
- [ ] Delete a chart
- [ ] Refresh page and verify data persists
- [ ] Test responsive layout on mobile

### Unit Testing (Future)

Set up Jest and React Testing Library:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Example test:
```typescript
import { seatingUtils } from '../utils/seating';
import type { SeatingChart } from '../types';

describe('seatingUtils', () => {
  it('should create a chart with correct dimensions', () => {
    const chart = seatingUtils.createChart('Test', 3, 4);
    expect(chart.rows).toBe(3);
    expect(chart.cols).toBe(4);
    expect(chart.grid).toHaveLength(3);
    expect(chart.grid[0]).toHaveLength(4);
  });
});
```

## Debugging Tips

### Common Issues

**Problem**: Data not persisting after refresh
- Check browser localStorage limits
- Verify `storageUtils.saveChart()` is being called
- Check browser console for storage errors

**Problem**: Drag-drop not working
- Verify `draggable={true}` on StudentCard
- Check Chrome DevTools Elements tab for event listeners
- Test in different browser if needed

**Problem**: Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS specificity conflicts
- Verify class names match between TSX and CSS files

### Debug Features to Add

```typescript
// Add logging to track state changes
useEffect(() => {
  console.log('Charts updated:', charts);
}, [charts]);

// Add temporary debug display
{process.env.NODE_ENV === 'development' && (
  <div style={{ padding: '10px', background: '#ffe' }}>
    Debug: {currentChartId ? 'Chart Selected' : 'No Chart'}
  </div>
)}
```

## Git Workflow

Suggested commit messages:
```
feat: add randomize seating feature
fix: prevent duplicate student IDs
refactor: simplify storage utilities
style: update color scheme
docs: update README with new features
chore: upgrade dependencies
```

## Environment Setup for IDE

### VS Code Extensions Recommended

- ESLint
- Prettier
- TypeScript Vue Plugin (if adding Vue later)
- React Developer Tools

### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

Happy coding! 🎓
