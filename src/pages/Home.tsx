import { useState, useEffect, useMemo, useRef } from 'react';
import type { SeatingChart, Student, SeatingConstraints } from '../types';
import { storageUtils } from '../utils/storage';
import { seatingUtils } from '../utils/seating';
import { generateRandomNamesWithGender } from '../utils/names';
import { StudentForm } from '../components/StudentForm';
import { SeatingGrid } from '../components/SeatingGrid';
import { StudentList } from '../components/StudentList';
import { createTranslator } from '../i18n';
import type { Language } from '../i18n';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import '../App.css';

type HomeProps = {
  language: Language;
};

export function Home({ language }: HomeProps) {
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
  const t = useMemo(() => createTranslator(language), [language]);
  const locale = language === 'no' ? 'no' : 'en';

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
      alert(t('missingChartName'));
      return;
    }

    let customLayout: number[][] | undefined;
    let effectivePairedSeating = pairedSeating;
    if (useCustomLayout) {
      if (!customLayoutText.trim()) {
        alert(t('missingCustomLayoutCreate'));
        return;
      }
      const parsed = seatingUtils.parseCustomLayout(customLayoutText);
      if (!parsed) {
        alert(t('invalidCustomLayout'));
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
    if (window.confirm(t('deleteChartConfirm'))) {
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
    
    const newName = window.prompt(t('renameChartPrompt'), chart.name);
    if (newName && newName.trim()) {
      const updated = charts.map(c =>
        c.id === chartId ? { ...c, name: newName.trim() } : c
      );
      setCharts(updated);
      storageUtils.deleteChart(chartId);
      storageUtils.saveChart({ ...chart, name: newName.trim() });
    }
  };

  const handleCopyChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;
    
    const copiedChart: typeof chart = {
      ...chart,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${chart.name} (${t('copySuffix')})`,
      updatedAt: new Date().toISOString()
    };
    
    const updated = [...charts, copiedChart];
    setCharts(updated);
    storageUtils.saveChart(copiedChart);
  };

  const handleExportCharts = () => {
    if (charts.length === 0) {
      alert(t('noChartsToExport'));
      return;
    }
    const dataStr = JSON.stringify(charts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('exportFileName');
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
          alert(t('invalidFileFormat'));
          return;
        }
        
        // Ask if they want to replace or merge
        const shouldReplace = window.confirm(t('importReplaceConfirm'));
        
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
        
        const importedMessage = (t('importedCharts'))(importedCharts.length);
        alert(importedMessage);
      } catch {
        alert(t('importReadError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateChartSize = () => {
    if (!currentChart) {
      alert(t('selectChartToUpdate'));
      return;
    }

    let newRows = gridSize.rows;
    let newCols = gridSize.cols;
    let customLayout: number[][] | undefined;
    let effectivePairedSeating = pairedSeating;

    if (useCustomLayout) {
      if (!customLayoutText.trim()) {
        alert(t('missingCustomLayoutUpdate'));
        return;
      }
      const parsed = seatingUtils.parseCustomLayout(customLayoutText);
      if (!parsed) {
        alert(t('invalidCustomLayout'));
        return;
      }
      customLayout = parsed;
      newRows = parsed.length;
      newCols = Math.max(...parsed.map(row => row.reduce((sum, group) => sum + group, 0)));
      effectivePairedSeating = false;
    }
    
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
    const newGrid = currentChart.grid.map(r => [...r]);
    
    const source1 = newGrid[row1][col1];
    const source2 = col1 + 1 < currentChart.cols ? newGrid[row1][col1 + 1] : null;
    
    const target1 = newGrid[row2][col2];
    const target2 = col2 + 1 < currentChart.cols ? newGrid[row2][col2 + 1] : null;
    
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
    if (window.confirm(t('clearPlacementsConfirm'))) {
      const updated = seatingUtils.clearPlacements(currentChart);
      setCharts(charts.map(c => c.id === currentChart.id ? updated : c));
    }
  };

  const handleRandomizeSeating = () => {
    if (!currentChart) return;
    
    const lockedIds = new Set<string>();
    for (let r = 0; r < currentChart.rows; r++) {
      for (let c = 0; c < currentChart.cols; c++) {
        const student = currentChart.grid[r][c];
        if (student?.locked) lockedIds.add(student.id);
      }
    }
    const unlockedCount = currentChart.students.filter(s => !lockedIds.has(s.id)).length;
    
    if (unlockedCount === 0) {
      alert(t('noUnlockedToPlace'));
      return;
    }
    const randomizeMessage = (t('randomizeConfirm'))(unlockedCount);
    if (window.confirm(randomizeMessage)) {
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
    if (window.confirm(t('clearAllStudentsConfirm'))) {
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
    let unlockedCount = 0;
    for (let r = 0; r < currentChart.rows; r++) {
      for (let c = 0; c < currentChart.cols; c++) {
        if (currentChart.grid[r][c] && !currentChart.grid[r][c]?.locked) unlockedCount++;
      }
    }
    if (unlockedCount < 2) {
      alert(t('needAtLeastTwoToShuffle'));
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
    
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
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
      pdf.save(`${currentChart.name.replace(/[^a-z0-9]/gi, '_')}_${t('pdfFileSuffix')}.pdf`);
    } finally {
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
    
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
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
      
      const link = document.createElement('a');
      link.download = `${currentChart.name.replace(/[^a-z0-9]/gi, '_')}_${t('pngFileSuffix')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
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
    
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
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
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } finally {
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
    
    const lockButtons = container.querySelectorAll('.lock-button');
    const removeButtons = container.querySelectorAll('.remove-button');
    const pairHandles = container.querySelectorAll('.pair-drag-handle, .group-drag-handle');
    const seatLabels = container.querySelectorAll('.seat-label');
    
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
          alert(t('copyClipboardError'));
          return;
        }
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          const message = t('copyClipboardSuccess');
          alert(message);
        } catch (err) {
          alert(t('copyClipboardError'));
          console.error('Failed to copy to clipboard:', err);
        }
      }, 'image/png');
    } finally {
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
    <div className="app-container">
      <aside className="sidebar">
        <div className="chart-creation">
          <h3>{t('createChartTitle')}</h3>
          <input
            type="text"
            placeholder={t('chartNamePlaceholder')}
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
          />
          
          <div className="grid-size-inputs">
            <div className="size-input">
              <label>{t('rowsLabel')}</label>
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
              <label>{t('colsLabel')}</label>
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
            {t('usePairsLabel')}
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
            {t('customLayoutLabel')}
          </label>
          {useCustomLayout && (
            <div className="custom-layout">
              <textarea
                className="layout-textarea"
                placeholder={t('customLayoutPlaceholder')}
                value={customLayoutText}
                onChange={(e) => setCustomLayoutText(e.target.value)}
                rows={4}
              />
              <p className="layout-hint">
                {t('customLayoutHintLine1')}<br />
                {t('customLayoutHintLine2')}
              </p>
            </div>
          )}
          <div className="chart-buttons">
            <button className="btn btn-primary" onClick={handleCreateChart}>
              {t('newChartButton')}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleUpdateChartSize}
              disabled={!currentChart}
              title={currentChart ? (t('updateChartTitle'))(currentChart.name) : t('selectChartFirstTitle')}
            >
              {t('updateChartButton')}
            </button>
          </div>
        </div>

        <div className="charts-list">
          <h3>{t('chartsOverviewTitle')}</h3>
          {charts.length === 0 ? (
            <p className="empty-message">{t('noChartsYet')}</p>
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
                    title={t('renameTitle')}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-copy"
                    onClick={() => handleCopyChart(chart.id)}
                    title={t('duplicateTitle')}
                  >
                    📋
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteChart(chart.id)}
                    title={t('deleteTitle')}
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
            {t('exportToFile')}
          </button>
          <label className="btn btn-secondary btn-full import-label">
            {t('importFromFile')}
            <input
              type="file"
              accept=".json"
              onChange={handleImportCharts}
              style={{ display: 'none' }}
            />
          </label>
          <p className="import-export-hint">
            <strong>{t('exportHintTitle')}</strong> {t('exportHintBody')}
          </p>
          <p className="import-export-hint">
            <strong>{t('importHintTitle')}</strong> {t('importHintBody')}
          </p>
          <button 
            className="btn btn-secondary btn-full"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? t('hideHelp') : t('showHelp')}
          </button>
          {showHelp && (
            <div className="help-section">
              <h4>{t('helpTitle')}</h4>
              <ul>
                {(t('helpSteps')).map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong> {step.body}
                  </li>
                ))}
              </ul>
              <h4>{t('helpAlternativesTitle')}</h4>
              <ul>
                {(t('helpAlternatives')).map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong> {step.body}
                  </li>
                ))}
              </ul>
              <h4>{t('privacyTitle')}</h4>
              <ul>
                {(t('privacyItems')).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="credits">{t('credits')}</p>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        {currentChart ? (
          <>
            <StudentForm onAddStudent={handleAddStudents} t={t} />

            <StudentList
              students={unplacedStudents}
              onRemoveStudent={handleRemoveStudent}
              onUpdateStudent={handleUpdateStudent}
              onDropFromGrid={handleDropFromGrid}
              t={t}
              locale={locale}
            />

            <div className="controls">
              <button className="btn btn-secondary" onClick={handleRandomizeSeating}>
                {t('controlsAutoPlace')}
              </button>
              <button className="btn btn-secondary" onClick={handleShuffleSeated}>
                {t('controlsShuffleSeated')}
              </button>
              <button className="btn btn-secondary" onClick={handleClearPlacements}>
                {t('controlsClearPlacements')}
              </button>
              <button className="btn btn-secondary" onClick={handleClearAllStudents}>
                {t('controlsClearAllStudents')}
              </button>
              <button 
                className={`btn btn-toggle ${showExtraControls ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowExtraControls(!showExtraControls)}
              >
                {t('controlsOptions')}
              </button>
              <button className="btn btn-secondary btn-export" onClick={handleCopyToClipboard}>
                {t('controlsCopy')}
              </button>
              <button className="btn btn-secondary btn-export" onClick={handleGeneratePNG}>
                {t('controlsSavePng')}
              </button>
              <button className="btn btn-secondary btn-export" onClick={handleGeneratePDF}>
                {t('controlsSavePdf')}
              </button>
              <button className="btn btn-secondary btn-export" onClick={handlePrintChart}>
                {t('controlsPrint')}
              </button>
            </div>

            {showExtraControls && (
              <div className="extra-controls">
                <h3>{t('optionsTitle')}</h3>
                
                <div className="control-section alternatives-toggles">
                  <div className="alternative-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={showGenderColors}
                        onChange={(e) => setShowGenderColors(e.target.checked)}
                      />
                      {t('showGenderColors')}
                    </label>
                  </div>
                  
                  <div className="alternative-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={mixGenders}
                        onChange={(e) => setMixGenders(e.target.checked)}
                      />
                      {t('mixGenders')}
                    </label>
                  </div>
                </div>
                
                <div className="control-section constraint-columns-grid">
                  <div className="constraint-column">
                    <div className="constraint-content">
                      <h4>{t('placeTogetherTitle')}</h4>
                      <p className="control-hint">{t('placeTogetherHint')}</p>
                      <div className="student-chips-container">
                        {[...currentChart.students].sort((a, b) => a.name.localeCompare(b.name, locale)).map(s => {
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
                              alert(t('selectAtLeastTwoStudents'));
                            }
                          }}
                        >
                          {t('addGroup')}
                        </button>
                        {newTogetherGroup.length > 0 && (
                          <button 
                            className="btn btn-small btn-clear"
                            onClick={() => setNewTogetherGroup([])}
                          >
                            {t('reset')}
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
                      <h4>{t('keepApartTitle')}</h4>
                      <p className="control-hint">{t('keepApartHint')}</p>
                      <div className="student-chips-container">
                        {[...currentChart.students].sort((a, b) => a.name.localeCompare(b.name, locale)).map(s => {
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
                              alert(t('selectAtLeastTwoStudents'));
                            }
                          }}
                        >
                          {t('addGroup')}
                        </button>
                        {newApartPair.length > 0 && (
                          <button 
                            className="btn btn-small btn-clear"
                            onClick={() => setNewApartPair([])}
                          >
                            {t('reset')}
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
                      const randomStudents = generateRandomNamesWithGender(30, language);
                      const students: Student[] = randomStudents.map(s => ({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: s.name,
                        gender: s.gender
                      }));
                      handleAddStudents(students);
                    }}
                  >
                    {t('generateRandomNames')}
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
              t={t}
            />
          </>
        ) : (
          <div className="empty-state">
            <h2>{t('emptyStateTitle')}</h2>
            <p>{t('emptyStateBody')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
