import { useState, useEffect, useRef } from 'react';
import type { SeatingChart, Student, SeatingConstraints } from './types';
import { storageUtils } from './utils/storage';
import { seatingUtils } from './utils/seating';
import { generateRandomNamesWithGender } from './utils/names';
import { StudentForm } from './components/StudentForm';
import { SeatingGrid } from './components/SeatingGrid';
import { StudentList } from './components/StudentList';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [charts, setCharts] = useState<SeatingChart[]>([]);
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 6 });
  const [chartName, setChartName] = useState('');
  const [pairedSeating, setPairedSeating] = useState(true);
  const [useCustomLayout, setUseCustomLayout] = useState(false);
  const [customLayoutText, setCustomLayoutText] = useState('');
  const [savedPairedSeating, setSavedPairedSeating] = useState(true);
  const [showGenderColors, setShowGenderColors] = useState(false);

  // Extra control state
  const [showExtraControls, setShowExtraControls] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mixGenders, setMixGenders] = useState(false);
  const [placeTogether, setPlaceTogether] = useState<string[][]>([]);
  const [keepApart, setKeepApart] = useState<string[][]>([]);
  const [newTogetherGroup, setNewTogetherGroup] = useState<string[]>([]);
  const [newApartPair, setNewApartPair] = useState<string[]>([]);
  const seatingGridRef = useRef<HTMLDivElement>(null);

  // Load charts from storage on mount
  useEffect(() => {
    const loadedCharts = storageUtils.getCharts();
    setCharts(loadedCharts);
    if (loadedCharts.length > 0) {
      setCurrentChartId(loadedCharts[0].id);
    }
  }, []);

  // Save current chart whenever it changes
  useEffect(() => {
    const chart = charts.find(c => c.id === currentChartId);
    if (chart) {
      storageUtils.saveChart(chart);
    }
  }, [charts, currentChartId]);

  // Update grid size inputs when selecting a different chart
  useEffect(() => {
    const chart = charts.find(c => c.id === currentChartId);
    if (chart) {
      setGridSize({ rows: chart.rows, cols: chart.cols });
      setPairedSeating(chart.pairedSeating || false);
      if (chart.customLayout && chart.customLayout.length > 0) {
        setUseCustomLayout(true);
        setCustomLayoutText(chart.customLayout.map(row => row.join(' ')).join('\n'));
      } else {
        setUseCustomLayout(false);
        setCustomLayoutText('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChartId]);

  const currentChart = charts.find(c => c.id === currentChartId) || null;
  const unplacedStudents = currentChart ? seatingUtils.getUnplacedStudents(currentChart) : [];

  const handleCreateChart = () => {
    if (!chartName.trim()) {
      alert('Vennligst skriv inn et kartnavn');
      return;
    }

    let customLayout: number[][] | undefined;
    let effectivePairedSeating = pairedSeating;
    if (useCustomLayout) {
      if (!customLayoutText.trim()) {
        alert('Skriv inn et tilpasset oppsett før du lager et kart');
        return;
      }
      const parsed = seatingUtils.parseCustomLayout(customLayoutText);
      if (!parsed) {
        alert('Ugyldig oppsett. Bruk tall separert med mellomrom eller bindestrek.');
        return;
      }
      customLayout = parsed;
      effectivePairedSeating = false;
    }

    const newChart = seatingUtils.createChart(
      chartName,
      gridSize.rows,
      gridSize.cols,
      effectivePairedSeating,
      customLayout
    );
    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    setCurrentChartId(newChart.id);
    setChartName('');
    setPairedSeating(useCustomLayout ? false : true);
  };

  const handleDeleteChart = (chartId: string) => {
    if (window.confirm('Er du sikker på at du vil slette dette kartet?')) {
      const updated = charts.filter(c => c.id !== chartId);
      setCharts(updated);
      storageUtils.deleteChart(chartId);
      if (currentChartId === chartId) {
        setCurrentChartId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleRenameChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;
    
    const newName = window.prompt('Nytt navn for kartet:', chart.name);
    if (newName && newName.trim()) {
      const updated = charts.map(c =>
        c.id === chartId ? { ...c, name: newName.trim() } : c
      );
      setCharts(updated);
      storageUtils.deleteChart(chartId);
      storageUtils.saveChart({ ...chart, name: newName.trim() });
    }
  };

  const handleExportCharts = () => {
    if (charts.length === 0) {
      alert('Ingen kart å eksportere');
      return;
    }
    const dataStr = JSON.stringify(charts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klasseromskart.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCharts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedCharts = JSON.parse(event.target?.result as string);
        if (!Array.isArray(importedCharts)) {
          alert('Ugyldig filformat');
          return;
        }
        
        // Ask if they want to replace or merge
        const shouldReplace = window.confirm(
          'Vil du erstatte alle eksisterende kart? Klikk OK for å erstatte, eller Avbryt for å legge til.'
        );
        
        if (shouldReplace) {
          setCharts(importedCharts);
          if (importedCharts.length > 0) {
            setCurrentChartId(importedCharts[0].id);
          }
        } else {
          // Merge, avoiding duplicate IDs
          const existingIds = new Set(charts.map(c => c.id));
          const newCharts = importedCharts.filter((c: { id: string }) => !existingIds.has(c.id));
          const merged = [...charts, ...newCharts];
          setCharts(merged);
        }
        
        alert(`Importerte ${importedCharts.length} kart`);
      } catch {
        alert('Kunne ikke lese filen. Sørg for at det er en gyldig JSON-fil.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleUpdateChartSize = () => {
    if (!currentChart) {
      alert('Velg et kart å oppdatere');
      return;
    }

    let newRows = gridSize.rows;
    let newCols = gridSize.cols;
    let customLayout: number[][] | undefined;
    let effectivePairedSeating = pairedSeating;

    if (useCustomLayout) {
      if (!customLayoutText.trim()) {
        alert('Skriv inn et tilpasset oppsett før du oppdaterer kartet');
        return;
      }
      const parsed = seatingUtils.parseCustomLayout(customLayoutText);
      if (!parsed) {
        alert('Ugyldig oppsett. Bruk tall separert med mellomrom eller bindestrek.');
        return;
      }
      customLayout = parsed;
      newRows = parsed.length;
      newCols = Math.max(...parsed.map(row => row.reduce((sum, group) => sum + group, 0)));
      effectivePairedSeating = false;
    }
    
    // Create new grid with new dimensions
    const newGrid: (Student | null)[][] = Array.from({ length: newRows }, () =>
      Array.from({ length: newCols }, () => null)
    );

    const isSeatEnabled = (row: number, col: number) => {
      if (!customLayout) {
        return true;
      }
      const rowLayout = customLayout[row];
      if (!rowLayout) {
        return false;
      }
      const seatsInRow = rowLayout.reduce((sum, count) => sum + count, 0);
      return col >= 0 && col < seatsInRow;
    };
    
    // Copy over students that fit in the new grid
    for (let r = 0; r < Math.min(currentChart.rows, newRows); r++) {
      for (let c = 0; c < Math.min(currentChart.cols, newCols); c++) {
        if (isSeatEnabled(r, c)) {
          newGrid[r][c] = currentChart.grid[r][c];
        }
      }
    }
    
    const updatedChart = {
      ...currentChart,
      rows: newRows,
      cols: newCols,
      grid: newGrid,
      pairedSeating: effectivePairedSeating,
      customLayout: customLayout,
      updatedAt: new Date().toISOString()
    };
    
    setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
  };

  const handleAddStudents = (students: Student[]) => {
    if (!currentChart) return;
    let updated = currentChart;
    students.forEach(student => {
      updated = seatingUtils.addStudent(updated, student);
    });
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!currentChart) return;
    const updated = seatingUtils.removeStudent(currentChart, studentId);
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleUpdateStudent = (student: Student) => {
    if (!currentChart) return;
    const updatedStudents = currentChart.students.map(s =>
      s.id === student.id ? student : s
    );
    const updatedChart = { ...currentChart, students: updatedStudents };
    setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
  };

  const handleSwapStudents = (row1: number, col1: number, row2: number, col2: number) => {
    if (!currentChart) return;
    const updated = seatingUtils.swapStudents(currentChart, row1, col1, row2, col2);
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleSwapPairs = (row1: number, col1: number, row2: number, col2: number) => {
    if (!currentChart) return;
    // Swap both students in each pair
    const newGrid = currentChart.grid.map(r => [...r]);
    
    // Get the two students from source pair
    const source1 = newGrid[row1][col1];
    const source2 = col1 + 1 < currentChart.cols ? newGrid[row1][col1 + 1] : null;
    
    // Get the two students from target pair
    const target1 = newGrid[row2][col2];
    const target2 = col2 + 1 < currentChart.cols ? newGrid[row2][col2 + 1] : null;
    
    // Swap them
    newGrid[row1][col1] = target1;
    if (col1 + 1 < currentChart.cols) newGrid[row1][col1 + 1] = target2;
    newGrid[row2][col2] = source1;
    if (col2 + 1 < currentChart.cols) newGrid[row2][col2 + 1] = source2;
    
    const updatedChart = {
      ...currentChart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
    setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
  };

  const handleSwapGroups = (row1: number, groupIndex1: number, row2: number, groupIndex2: number) => {
    if (!currentChart || !currentChart.customLayout) return;

    const getGroupInfo = (rowLayout: number[] | undefined, index: number) => {
      if (!rowLayout || rowLayout.length === 0) return null;
      let startCol = 0;
      for (let i = 0; i < rowLayout.length; i++) {
        const size = rowLayout[i];
        if (i === index) {
          return { startCol, size };
        }
        startCol += size;
      }
      return null;
    };

    const rowLayout1 = currentChart.customLayout[row1];
    const rowLayout2 = currentChart.customLayout[row2];
    const group1 = getGroupInfo(rowLayout1, groupIndex1);
    const group2 = getGroupInfo(rowLayout2, groupIndex2);

    if (!group1 || !group2) return;
    if (group1.size !== group2.size) return;

    const newGrid = currentChart.grid.map(r => [...r]);
    for (let i = 0; i < group1.size; i++) {
      const col1 = group1.startCol + i;
      const col2 = group2.startCol + i;
      const temp = newGrid[row1][col1];
      newGrid[row1][col1] = newGrid[row2][col2];
      newGrid[row2][col2] = temp;
    }

    const updatedChart = {
      ...currentChart,
      grid: newGrid,
      updatedAt: new Date().toISOString()
    };
    setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
  };

  const handleDropFromGrid = (studentId: string) => {
    if (!currentChart) return;
    const updated = { ...currentChart };
    // Find the student in the grid and unplace them
    for (let r = 0; r < updated.rows; r++) {
      for (let c = 0; c < updated.cols; c++) {
        if (updated.grid[r][c]?.id === studentId) {
          updated.grid[r][c] = null;
          updated.updatedAt = new Date().toISOString();
          setCharts(charts.map(ch => ch.id === currentChart.id ? updated : ch));
          return;
        }
      }
    }
  };

  const handlePlaceStudent = (studentId: string, row: number, col: number) => {
    if (!currentChart) return;
    const updated = seatingUtils.placeStudent(currentChart, studentId, row, col);
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleRemoveFromSeat = (row: number, col: number) => {
    if (!currentChart) return;
    const updated = { ...currentChart };
    const student = updated.grid[row][col];
    if (student) {
      updated.grid[row][col] = null;
      updated.updatedAt = new Date().toISOString();
    }
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleClearPlacements = () => {
    if (!currentChart) return;
    if (window.confirm('Fjerne alle elevplasseringer?')) {
      const updated = seatingUtils.clearPlacements(currentChart);
      setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
    }
  };

  const handleRandomizeSeating = () => {
    if (!currentChart) return;
    
    // Count unlocked students (both placed and unplaced)
    const lockedIds = new Set<string>();
    for (let r = 0; r < currentChart.rows; r++) {
      for (let c = 0; c < currentChart.cols; c++) {
        const student = currentChart.grid[r][c];
        if (student?.locked) lockedIds.add(student.id);
      }
    }
    const unlockedCount = currentChart.students.filter(s => !lockedIds.has(s.id)).length;
    
    if (unlockedCount === 0) {
      alert('Ingen ulåste elever å plassere');
      return;
    }
    if (window.confirm(`Plassere ${unlockedCount} ulåste elev${unlockedCount !== 1 ? 'er' : ''} tilfeldig?`)) {
      const constraints: SeatingConstraints = {
        placeTogether,
        keepApart,
        mixGenders
      };
      const updated = seatingUtils.randomizeSeating(currentChart, constraints);
      setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
    }
  };

  const handleClearAllStudents = () => {
    if (!currentChart) return;
    if (window.confirm('Fjerne alle elever fra dette kartet?')) {
      const updatedChart = {
        ...currentChart,
        students: [],
        grid: Array.from({ length: currentChart.rows }, () =>
          Array.from({ length: currentChart.cols }, () => null)
        ),
        updatedAt: new Date().toISOString()
      };
      setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
    }
  };

  const handleShuffleSeated = () => {
    if (!currentChart) return;
    // Count unlocked seated students
    let unlockedCount = 0;
    for (let r = 0; r < currentChart.rows; r++) {
      for (let c = 0; c < currentChart.cols; c++) {
        if (currentChart.grid[r][c] && !currentChart.grid[r][c]?.locked) unlockedCount++;
      }
    }
    if (unlockedCount < 2) {
      alert('Trenger minst 2 ulåste plasserte elever for å blande');
      return;
    }
    const constraints: SeatingConstraints = {
      placeTogether,
      keepApart,
      mixGenders
    };
    const updated = seatingUtils.shuffleSeatedStudents(currentChart, constraints);
    setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
  };

  const handleToggleLock = (studentId: string) => {
    if (!currentChart) return;
    // Update the student's locked status in both students array and grid
    const updatedStudents = currentChart.students.map(s =>
      s.id === studentId ? { ...s, locked: !s.locked } : s
    );
    const updatedGrid = currentChart.grid.map(row =>
      row.map(cell =>
        cell?.id === studentId ? { ...cell, locked: !cell.locked } : cell
      )
    );
    const updatedChart = {
      ...currentChart,
      students: updatedStudents,
      grid: updatedGrid,
      updatedAt: new Date().toISOString()
    };
    setCharts(charts.map(c => c.id === currentChart.id ? updatedChart : c));
  };

  const handleGeneratePDF = async () => {
    if (!seatingGridRef.current || !currentChart) return;
    
    const container = seatingGridRef.current;
    
    // Temporarily hide elements we don't want in the PDF
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
    // Temporarily remove background colors
    const gridContainer = container;
    const seatingGrid = container.querySelector('.seating-grid') as HTMLElement;
    const originalContainerBg = gridContainer.style.backgroundColor;
    const originalGridBg = seatingGrid?.style.backgroundColor;
    const originalGridShadow = seatingGrid?.style.boxShadow;
    
    gridContainer.style.backgroundColor = 'white';
    if (seatingGrid) {
      seatingGrid.style.backgroundColor = 'white';
      seatingGrid.style.boxShadow = 'none';
    }

    container.classList.add('export-mode');
    
    lockButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    removeButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    pairHandles.forEach(el => (el as HTMLElement).style.display = 'none');
    seatLabels.forEach(el => (el as HTMLElement).style.display = 'none');
    
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 landscape dimensions in mm
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15; // 15mm margins
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      const contentRatio = canvas.width / canvas.height;
      
      // Scale image to fit within printable area while maintaining aspect ratio
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / contentRatio;
      
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * contentRatio;
      }
      
      // Center the image on the page
      const xOffset = margin + (availableWidth - imgWidth) / 2;
      const yOffset = margin + (availableHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`${currentChart.name.replace(/[^a-z0-9]/gi, '_')}_seating_chart.pdf`);
    } finally {
      // Restore hidden elements and backgrounds
      container.classList.remove('export-mode');
      lockButtons.forEach(el => (el as HTMLElement).style.display = '');
      removeButtons.forEach(el => (el as HTMLElement).style.display = '');
      pairHandles.forEach(el => (el as HTMLElement).style.display = '');
      seatLabels.forEach(el => (el as HTMLElement).style.display = '');
      gridContainer.style.backgroundColor = originalContainerBg;
      if (seatingGrid) {
        seatingGrid.style.backgroundColor = originalGridBg || '';
        seatingGrid.style.boxShadow = originalGridShadow || '';
      }
    }
  };

  const handleGeneratePNG = async () => {
    if (!seatingGridRef.current || !currentChart) return;
    
    const container = seatingGridRef.current;
    
    // Temporarily hide elements we don't want in the PNG
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
    // Temporarily remove background colors
    const gridContainer = container;
    const seatingGrid = container.querySelector('.seating-grid') as HTMLElement;
    const originalContainerBg = gridContainer.style.backgroundColor;
    const originalGridBg = seatingGrid?.style.backgroundColor;
    const originalGridShadow = seatingGrid?.style.boxShadow;
    
    gridContainer.style.backgroundColor = 'white';
    if (seatingGrid) {
      seatingGrid.style.backgroundColor = 'white';
      seatingGrid.style.boxShadow = 'none';
    }

    container.classList.add('export-mode');
    
    lockButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    removeButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    pairHandles.forEach(el => (el as HTMLElement).style.display = 'none');
    seatLabels.forEach(el => (el as HTMLElement).style.display = 'none');
    
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      // Download as PNG
      const link = document.createElement('a');
      link.download = `${currentChart.name.replace(/[^a-z0-9]/gi, '_')}_seating_chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      // Restore hidden elements and backgrounds
      container.classList.remove('export-mode');
      lockButtons.forEach(el => (el as HTMLElement).style.display = '');
      removeButtons.forEach(el => (el as HTMLElement).style.display = '');
      pairHandles.forEach(el => (el as HTMLElement).style.display = '');
      seatLabels.forEach(el => (el as HTMLElement).style.display = '');
      gridContainer.style.backgroundColor = originalContainerBg;
      if (seatingGrid) {
        seatingGrid.style.backgroundColor = originalGridBg || '';
        seatingGrid.style.boxShadow = originalGridShadow || '';
      }
    }
  };

  const handlePrintChart = async () => {
    if (!seatingGridRef.current || !currentChart) return;
    
    const container = seatingGridRef.current;
    
    // Temporarily hide elements we don't want in the print
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
    // Temporarily remove background colors
    const gridContainer = container;
    const seatingGrid = container.querySelector('.seating-grid') as HTMLElement;
    const originalContainerBg = gridContainer.style.backgroundColor;
    const originalGridBg = seatingGrid?.style.backgroundColor;
    const originalGridShadow = seatingGrid?.style.boxShadow;
    
    gridContainer.style.backgroundColor = 'white';
    if (seatingGrid) {
      seatingGrid.style.backgroundColor = 'white';
      seatingGrid.style.boxShadow = 'none';
    }

    container.classList.add('export-mode');
    
    lockButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    removeButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    pairHandles.forEach(el => (el as HTMLElement).style.display = 'none');
    seatLabels.forEach(el => (el as HTMLElement).style.display = 'none');
    
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 landscape dimensions in mm
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      const contentRatio = canvas.width / canvas.height;
      
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / contentRatio;
      
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * contentRatio;
      }
      
      const xOffset = margin + (availableWidth - imgWidth) / 2;
      const yOffset = margin + (availableHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      
      // Open PDF in new window and trigger print
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } finally {
      // Restore hidden elements and backgrounds
      container.classList.remove('export-mode');
      lockButtons.forEach(el => (el as HTMLElement).style.display = '');
      removeButtons.forEach(el => (el as HTMLElement).style.display = '');
      pairHandles.forEach(el => (el as HTMLElement).style.display = '');
      seatLabels.forEach(el => (el as HTMLElement).style.display = '');
      gridContainer.style.backgroundColor = originalContainerBg;
      if (seatingGrid) {
        seatingGrid.style.backgroundColor = originalGridBg || '';
        seatingGrid.style.boxShadow = originalGridShadow || '';
      }
    }
  };

  const handleCopyToClipboard = async () => {
    if (!seatingGridRef.current || !currentChart) return;
    
    const container = seatingGridRef.current;
    
    // Temporarily hide elements we don't want in the clipboard image
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
    // Temporarily remove background colors
    const gridContainer = container;
    const seatingGrid = container.querySelector('.seating-grid') as HTMLElement;
    const originalContainerBg = gridContainer.style.backgroundColor;
    const originalGridBg = seatingGrid?.style.backgroundColor;
    const originalGridShadow = seatingGrid?.style.boxShadow;
    
    gridContainer.style.backgroundColor = 'white';
    if (seatingGrid) {
      seatingGrid.style.backgroundColor = 'white';
      seatingGrid.style.boxShadow = 'none';
    }

    container.classList.add('export-mode');
    
    lockButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    removeButtons.forEach(el => (el as HTMLElement).style.display = 'none');
    pairHandles.forEach(el => (el as HTMLElement).style.display = 'none');
    seatLabels.forEach(el => (el as HTMLElement).style.display = 'none');
    
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Feil: Kunne ikke kopiere bilde til utklippstavlen');
          return;
        }
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          // Show success message
          const message = 'Klassekart kopiert til utklippstavlen!';
          alert(message);
        } catch (err) {
          alert('Feil: Kunne ikke kopiere bilde til utklippstavlen');
          console.error('Failed to copy to clipboard:', err);
        }
      }, 'image/png');
    } finally {
      // Restore hidden elements and backgrounds
      container.classList.remove('export-mode');
      lockButtons.forEach(el => (el as HTMLElement).style.display = '');
      removeButtons.forEach(el => (el as HTMLElement).style.display = '');
      pairHandles.forEach(el => (el as HTMLElement).style.display = '');
      seatLabels.forEach(el => (el as HTMLElement).style.display = '');
      gridContainer.style.backgroundColor = originalContainerBg;
      if (seatingGrid) {
        seatingGrid.style.backgroundColor = originalGridBg || '';
        seatingGrid.style.boxShadow = originalGridShadow || '';
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Klassekart</h1>
        <p>Organiser og administrer elevplasseringer</p>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <div className="chart-creation">
            <h3>Opprett nytt klassekart</h3>
            <input
              type="text"
              placeholder="Kartnavn (f.eks. Time 1)"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
            />
            
            <div className="grid-size-inputs">
              <div className="size-input">
                <label>Rader:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={gridSize.rows}
                  disabled={useCustomLayout}
                  onChange={(e) => setGridSize({...gridSize, rows: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="size-input">
                <label>Kolonner:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={gridSize.cols}
                  disabled={useCustomLayout}
                  onChange={(e) => setGridSize({...gridSize, cols: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={pairedSeating}
                onChange={(e) => {
                  setPairedSeating(e.target.checked);
                  if (e.target.checked && useCustomLayout) {
                    setUseCustomLayout(false);
                  }
                }}
              />
              Bruk Makkerpar
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useCustomLayout}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setUseCustomLayout(enabled);
                  if (enabled) {
                    setSavedPairedSeating(pairedSeating);
                    setPairedSeating(false);
                  } else {
                    setPairedSeating(savedPairedSeating);
                  }
                }}
              />
              Tilpasset oppsett
            </label>
            {useCustomLayout && (
              <div className="custom-layout">
                <textarea
                  className="layout-textarea"
                  placeholder={`eks.
2 3 3 2
2 3 3 2
2 3 3 2`}
                  value={customLayoutText}
                  onChange={(e) => setCustomLayoutText(e.target.value)}
                  rows={4}
                />
                <p className="layout-hint">
                  En linje per rad.<br />
                  Bruk mellomrom eller bindestrek mellom gruppene.
                </p>
              </div>
            )}
            <div className="chart-buttons">
              <button className="btn btn-primary" onClick={handleCreateChart}>
                Nytt klassekart
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleUpdateChartSize}
                disabled={!currentChart}
                title={currentChart ? `Oppdater ${currentChart.name}` : 'Velg et kart først'}
              >
                Oppdater klassekart
              </button>
            </div>
          </div>

          <div className="charts-list">
            <h3>Klassekartoversikt</h3>
            {charts.length === 0 ? (
              <p className="empty-message">Ingen kart ennå</p>
            ) : (
              <ul>
                {charts.map(chart => (
                  <li key={chart.id}>
                    <button
                      className={`chart-item ${currentChartId === chart.id ? 'active' : ''}`}
                      onClick={() => setCurrentChartId(chart.id)}
                    >
                      {chart.name}
                    </button>
                    <button
                      className="btn-rename"
                      onClick={() => handleRenameChart(chart.id)}
                      title="Endre navn"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteChart(chart.id)}
                      title="Slett"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="import-export">
            <button className="btn btn-secondary btn-full" onClick={handleExportCharts}>
              Eksporter til fil
            </button>
            <label className="btn btn-secondary btn-full import-label">
              Importer fra fil
              <input
                type="file"
                accept=".json"
                onChange={handleImportCharts}
                style={{ display: 'none' }}
              />
            </label>
            <p className="import-export-hint">
              <strong>Eksporter til fil:</strong> Lagre dataene dine til en fil på datamaskinen.
            </p>
            <p className="import-export-hint">
              <strong>Importer fra fil:</strong> Hent tilbake lagrede data eller overfør fra en annen nettleser.
            </p>
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? 'Skjul hjelp' : 'Vis hjelp'}
            </button>
            {showHelp && (
              <div className="help-section">
                <h4>Hvordan bruke appen</h4>
                <ul>
                  <li><strong>Opprett klassekart:</strong> Skriv inn navn og velg antall rader og kolonner, trykk "Nytt klassekart".</li>
                  <li><strong>Bruk makkerpar:</strong> Aktiver for å sette pulter i par.</li>
                  <li><strong>Oppdater klassekart:</strong> Oppdater antall rader osv. uten å fjerne alle navn fra listen.</li>
                  <li><strong>Legg til elever:</strong> Skriv inn navn og trykk Enter for å lage ny linje. Skriv inn ett navn per linje. Trykk "Legg til # elever".</li>
                  <li><strong>Velg kjønn:</strong> Trykk på symbol for mann / dame. Kan brukes for å blande kjønn (se "Alternativer").</li>
                  <li><strong>Plasser elever:</strong> Bruk "Automatisk plassering" eller gjør det manuelt med å dra de ned på plass.</li>
                  <li><strong>Bytt plasser:</strong> Dra en elev over en annen for å bytte plass, makkerpar kan også flyttes ved å dra i symbolet med de 6 prikkene.</li>
                  <li><strong>Bland plasserte:</strong> Blander alle ulåste elever - prøver å unngå å plassere dem ved siden av samme personer som før.</li>
                  <li><strong>Lås plassering:</strong> Klikk på hengelåsen for å låse en elev på plass.</li>
                  <li><strong>Fjern fra plass:</strong> I klassekartet, trykk på X-knappen for å flytte eleven tilbake til "Uplasserte elever"-listen.</li>
                  <li><strong>Fjern elev:</strong> I "Uplasserte elever"-listen, trykk på X-knappen for å slette eleven.</li>
                </ul>
                <h4>Alternativer</h4>
                <ul>
                  <li><strong>Bland kjønn:</strong> Huk av for å blande kjønn i klassekartet.</li>
                  <li><strong>Plasser sammen:</strong> Velg to elever som alltid skal sitte ved siden av hverandre.</li>
                  <li><strong>Hold fra hverandre:</strong> Velg to elever som IKKE skal sitte ved siden av hverandre.</li>
                  <li><strong>Tilpasset oppsett:</strong> Skriv en linje per rad. Tallene angir antall plasser per gruppe i rekkefolge fra venstre til høyre (f.eks. "2 3 3 2" gir fire grupper med totalt 10 seter). Bruk mellomrom eller bindestrek mellom grupper. Like store grupper kan byttes ved a dra i håndtaket over gruppen.</li>
                  <li><strong>Lagre PDF/PNG:</strong> Eksporter klassekartet som PDF eller bilde.</li>
                  <li><strong>Print klassekart:</strong> Lag en utskrift.</li>
                </ul>
                <h4>Personvern (GDPR)</h4>
                <ul>
                  <li>Alle data lagres lokalt i nettleseren din (localStorage).</li>
                  <li>Ingen data sendes til noen server eller tredjepart.</li>
                  <li>Du kan når som helst slette alle data ved å tømme nettleserdata eller bruke "Fjern alle elever".</li>
                  <li>Bruk "Eksporter til fil" for å ta sikkerhetskopi av dataene dine.</li>
                </ul>
                <p className="credits">Laget av Sascha Njaa Tjelta</p>
              </div>
            )}
          </div>
        </aside>

        <main className="main-content">
          {currentChart ? (
            <>
              <StudentForm onAddStudent={handleAddStudents} />

              <StudentList
                students={unplacedStudents}
                onRemoveStudent={handleRemoveStudent}
                onUpdateStudent={handleUpdateStudent}
                onDropFromGrid={handleDropFromGrid}
              />

              <div className="controls">
                <button className="btn btn-secondary" onClick={handleRandomizeSeating}>
                  Automatisk plassering
                </button>
                <button className="btn btn-secondary" onClick={handleShuffleSeated}>
                  Bland plasserte
                </button>
                <button className="btn btn-secondary" onClick={handleClearPlacements}>
                  Fjern plasseringer
                </button>
                <button className="btn btn-secondary" onClick={handleClearAllStudents}>
                  Fjern alle elever
                </button>
                <button 
                  className={`btn btn-toggle ${showExtraControls ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowExtraControls(!showExtraControls)}
                >
                  Alternativer
                </button>
                <button className="btn btn-secondary btn-export" onClick={handleCopyToClipboard}>
                  Kopier til utklippstavle
                </button>
                <button className="btn btn-secondary btn-export" onClick={handleGeneratePNG}>
                  Lagre bilde (PNG)
                </button>
                <button className="btn btn-secondary btn-export" onClick={handleGeneratePDF}>
                  Lagre PDF
                </button>
                <button className="btn btn-secondary btn-export" onClick={handlePrintChart}>
                  Print klassekart
                </button>
              </div>

              {showExtraControls && (
                <div className="extra-controls">
                  <h3>Alternativer</h3>
                  
                  <div className="control-section alternatives-toggles">
                    <div className="alternative-item">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={showGenderColors}
                          onChange={(e) => setShowGenderColors(e.target.checked)}
                        />
                        Vis farge for gutt/jente (kun i forhåndsvisning)
                      </label>
                    </div>
                    
                    <div className="alternative-item">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={mixGenders}
                          onChange={(e) => setMixGenders(e.target.checked)}
                        />
                        Bland gutter og jenter
                      </label>
                    </div>
                  </div>
                  
                  <div className="control-section constraint-columns-grid">
                    <div className="constraint-column">
                      <div className="constraint-content">
                        <h4>Plasser sammen</h4>
                        <p className="control-hint">Velg 2 elever som skal sitte sammen</p>
                        <div className="student-chips-container">
                          {[...currentChart.students].sort((a, b) => a.name.localeCompare(b.name, 'no')).map(s => {
                            const isInRule = placeTogether.some(group => group.includes(s.id));
                            const isSelected = newTogetherGroup.includes(s.id);
                            const isDisabled = isInRule || (!isSelected && newTogetherGroup.length >= 2);
                            return (
                              <button
                                key={s.id}
                                className={`student-chip ${isSelected ? 'selected' : ''} ${isInRule ? 'disabled-rule' : ''}`}
                                disabled={isDisabled}
                                onClick={() => {
                                  if (isDisabled) return;
                                  if (isSelected) {
                                    setNewTogetherGroup(newTogetherGroup.filter(id => id !== s.id));
                                  } else {
                                    setNewTogetherGroup([...newTogetherGroup, s.id]);
                                  }
                                }}
                              >
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                        <div className="student-select-actions">
                          <button 
                            className="btn btn-small"
                            onClick={() => {
                              if (newTogetherGroup.length >= 2) {
                                setPlaceTogether([...placeTogether, newTogetherGroup]);
                                setNewTogetherGroup([]);
                              } else {
                                alert('Velg minst 2 elever');
                              }
                            }}
                          >
                            Legg til gruppe
                          </button>
                          {newTogetherGroup.length > 0 && (
                            <button 
                              className="btn btn-small btn-clear"
                              onClick={() => setNewTogetherGroup([])}
                            >
                              Nullstill
                            </button>
                          )}
                        </div>
                        {placeTogether.length > 0 && (
                          <div className="constraint-list">
                            {placeTogether.map((group, idx) => (
                              <div key={idx} className="constraint-item">
                                <span>
                                  {group.map(id => 
                                    currentChart.students.find(s => s.id === id)?.name
                                  ).join(' + ')}
                                </span>
                                <button 
                                  className="btn-remove"
                                  onClick={() => setPlaceTogether(placeTogether.filter((_, i) => i !== idx))}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="constraint-column">
                      <div className="constraint-content">
                        <h4>Hold fra hverandre</h4>
                        <p className="control-hint">Velg 2 elever som IKKE skal sitte sammen</p>
                        <div className="student-chips-container">
                          {[...currentChart.students].sort((a, b) => a.name.localeCompare(b.name, 'no')).map(s => {
                            const isSelected = newApartPair.includes(s.id);
                            const isDisabled = !isSelected && newApartPair.length >= 2;
                            return (
                              <button
                                key={s.id}
                                className={`student-chip ${isSelected ? 'selected-apart' : ''}`}
                                disabled={isDisabled}
                                onClick={() => {
                                  if (isDisabled) return;
                                  if (isSelected) {
                                    setNewApartPair(newApartPair.filter(id => id !== s.id));
                                  } else {
                                    setNewApartPair([...newApartPair, s.id]);
                                  }
                                }}
                              >
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                        <div className="student-select-actions">
                          <button 
                            className="btn btn-small"
                            onClick={() => {
                              if (newApartPair.length >= 2) {
                                setKeepApart([...keepApart, newApartPair]);
                                setNewApartPair([]);
                              } else {
                                alert('Velg minst 2 elever');
                              }
                            }}
                          >
                            Legg til gruppe
                          </button>
                          {newApartPair.length > 0 && (
                            <button 
                              className="btn btn-small btn-clear"
                              onClick={() => setNewApartPair([])}
                            >
                              Nullstill
                            </button>
                          )}
                        </div>
                        {keepApart.length > 0 && (
                          <div className="constraint-list">
                            {keepApart.map((pair, idx) => (
                              <div key={idx} className="constraint-item apart">
                                <span>
                                  {pair.map(id => 
                                    currentChart.students.find(s => s.id === id)?.name
                                  ).join(' ≠ ')}
                                </span>
                                <button 
                                  className="btn-remove"
                                  onClick={() => setKeepApart(keepApart.filter((_, i) => i !== idx))}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="control-section">
                    <button 
                      className="btn btn-secondary btn-constraint"
                      onClick={() => {
                        const randomStudents = generateRandomNamesWithGender(30);
                        const students: Student[] = randomStudents.map(s => ({
                          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                          name: s.name,
                          gender: s.gender
                        }));
                        handleAddStudents(students);
                      }}
                    >
                      Generer 30 tilfeldige navn
                    </button>
                  </div>
                </div>
              )}

              <SeatingGrid
                ref={seatingGridRef}
                chart={currentChart}
                onPlaceStudent={handlePlaceStudent}
                onRemoveStudent={handleRemoveFromSeat}
                onSwapStudents={handleSwapStudents}
                onSwapPairs={handleSwapPairs}
                onSwapGroups={handleSwapGroups}
                onToggleLock={handleToggleLock}
                showGenderColors={showGenderColors}
              />
            </>
          ) : (
            <div className="empty-state">
              <h2>Ingen plasseringskart valgt</h2>
              <p>Opprett et nytt kart for å komme i gang</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
