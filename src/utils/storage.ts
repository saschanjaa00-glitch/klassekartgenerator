import type { SeatingChart } from '../types';

const STORAGE_KEY = 'seating_charts';

export const storageUtils = {
  // Get all seating charts
  getCharts: (): SeatingChart[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading seating charts:', error);
      return [];
    }
  },

  // Save a seating chart
  saveChart: (chart: SeatingChart): void => {
    try {
      const charts = storageUtils.getCharts();
      const existingIndex = charts.findIndex(c => c.id === chart.id);
      
      if (existingIndex >= 0) {
        charts[existingIndex] = chart;
      } else {
        charts.push(chart);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
    } catch (error) {
      console.error('Error saving seating chart:', error);
    }
  },

  // Delete a seating chart
  deleteChart: (chartId: string): void => {
    try {
      const charts = storageUtils.getCharts();
      const filtered = charts.filter(c => c.id !== chartId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting seating chart:', error);
    }
  },

  // Get a specific chart
  getChart: (chartId: string): SeatingChart | null => {
    const charts = storageUtils.getCharts();
    return charts.find(c => c.id === chartId) || null;
  }
};
