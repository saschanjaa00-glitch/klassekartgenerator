# Classroom Seating Chart Application

A modern, interactive web application for organizing and managing classroom seating arrangements. Built with React 18, TypeScript, and Vite.

## Features

- **Create Multiple Seating Charts**: Manage different classes or periods with separate seating configurations
- **Flexible Grid Layout**: Create custom grid sizes (number of rows and columns)
- **Drag-and-Drop Interface**: Easily drag students to seats with an intuitive interface
- **Local Storage Persistence**: All seating arrangements are automatically saved to your browser's local storage
- **Student Management**: Add, remove, and organize students by name and ID
- **Visual Organization**: Color-coded student cards and seat labels for easy reference
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with Flexbox and CSS Grid
- **Data Persistence**: Browser LocalStorage API

## Project Structure

```
src/
├── components/          # React components
│   ├── StudentCard.tsx     # Individual student card component
│   ├── StudentCard.css
│   ├── SeatingGrid.tsx     # Main seating grid component
│   ├── SeatingGrid.css
│   ├── StudentForm.tsx     # Form for adding students
│   ├── StudentForm.css
│   ├── StudentList.tsx     # List of unplaced students
│   └── StudentList.css
├── utils/              # Utility functions
│   ├── storage.ts      # LocalStorage management
│   └── seating.ts      # Seating logic and calculations
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css
├── main.tsx            # React entry point
└── index.css           # Global styles

public/                 # Static assets
dist/                   # Production build output
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173/`

### Building for Production

Build the optimized production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Check code quality:
```bash
npm run lint
```

## How to Use

### Creating a Seating Chart

1. Enter a name for your seating chart (e.g., "Period 1", "Class A")
2. Set the number of rows and columns for your classroom layout
3. Click "Create Chart"

### Managing Students

1. Use the "Add Student" form to add students
2. Enter the student's name and ID number
3. Click "Add Student" to add them to the unplaced students list

### Arranging Seats

1. **Drag students to seats**: Drag a student card from the unplaced list and drop them onto any empty seat in the grid
2. **Move students**: Drag a student from one seat to another to rearrange
3. **Remove from seat**: Click on a student in the seating grid to remove them from that seat
4. **Delete students**: Click the × button on a student card to remove them entirely

### Managing Charts

- **Switch charts**: Click on a chart name in the sidebar to switch between different seating arrangements
- **Delete charts**: Click the × button next to a chart name to delete it
- **Clear placements**: Use the "Clear Placements" button to unassign all students from seats while keeping them in the chart

## Data Persistence

All seating charts are automatically saved to your browser's local storage. Your data persists even after closing and reopening the application.

## Features in Detail

### Student Card
- Displays student name and ID
- Color-coded (purple gradient) when placed
- Drag-enabled for easy movement
- Click to remove from seat

### Seating Grid
- Visual representation of classroom layout
- Each seat labeled with row and column (e.g., A1, A2, B1)
- Drop zones for intuitive drag-and-drop interface
- Click any seated student to remove them

### Unplaced Students List
- Shows all students not yet seated
- Draggable for placement
- Includes remove button for each student

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Optimized build size: ~200KB (gzipped: ~63KB)
- Fast loading and smooth interactions
- Efficient state management

## Future Enhancements

Potential features for future versions:
- Export seating charts as PDF
- Import student lists from CSV
- Randomize seating arrangements
- Save multiple versions of charts per class
- Dark mode theme

## License

This project is provided as-is for educational use.

## Support

For issues or questions, please refer to the application's error messages and console logs for debugging information.
