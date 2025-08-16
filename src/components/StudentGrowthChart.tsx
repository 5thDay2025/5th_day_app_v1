import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './StudentGrowthChart.css';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

import { User } from '../types/database.types';
import { useFocusAreas } from '../hooks/useSupabase';

interface Props {
  currentUser: User | null;
}

export const StudentGrowthChart: React.FC<Props> = ({ currentUser }) => {
  const { focusAreas, focusAreaScores, loading, error } = useFocusAreas(currentUser?.id);

  const data = {
    labels: focusAreas.map(area => area.name),
    datasets: [
      {
        data: focusAreas.map(area => focusAreaScores.get(area.id) || 6), // Use median score or default to 6
        backgroundColor: 'rgba(141, 198, 63, 0.2)',
        borderColor: 'rgba(141, 198, 63, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(141, 198, 63, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(141, 198, 63, 1)',
        pointHoverBorderColor: '#fff'
      }
    ]
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        min: 6,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'] as ('mousemove' | 'mouseout' | 'click' | 'touchstart' | 'touchmove')[],
        mode: 'point' as const,
        intersect: true,
        position: 'nearest' as const,
        xAlign: (context: any) => {
          const chart = context.chart;
          const tooltipWidth = window.innerWidth < 768 ? 240 : 400;
          const position = chart.canvas.getBoundingClientRect();
          const tooltipX = context.tooltip.x;
          
          // If tooltip would go off the right side
          return tooltipX + tooltipWidth > position.right ? 'left' : 'right';
        },
        callbacks: {
          title: (tooltipItems: any[]) => {
            const currentScore = tooltipItems[0].raw;
            // Find all areas with the same score and sort them alphabetically by name
            const areasWithSameScore = focusAreas
              .filter((_, idx) => focusAreaScores.get(focusAreas[idx].id) === currentScore)
              .sort((a, b) => a.name.localeCompare(b.name));
            
            // Return all matching focus areas and their descriptions
            const result: string[] = [];
            areasWithSameScore.forEach((area, i) => {
              if (i > 0) result.push(''); // Add spacing between areas
              result.push(area.name);
              result.push(`Score: ${currentScore}`);
              
              // Word wrap the description
              const description = area.description || 'No description available';
              const words = description.split(' ');
              let currentLine = '';
              
              words.forEach(word => {
                if (currentLine.length + word.length > (window.innerWidth < 768 ? 45 : 60)) { // Shorter lines on mobile
                  result.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = currentLine ? `${currentLine} ${word}` : word;
                }
              });
              if (currentLine) {
                result.push(currentLine);
              }
            });
            
            return result;
          },
          beforeLabel: () => '',
          label: () => ''
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: window.innerWidth < 768 ? 8 : 12,
        boxWidth: window.innerWidth < 768 ? 240 : 400, // Reduced width on mobile
        boxPadding: window.innerWidth < 768 ? 2 : 3,
        titleFont: {
          weight: 'bold' as const,
          size: window.innerWidth < 768 ? 12 : 14 // Smaller font on mobile
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 11 : 13 // Smaller font on mobile
        },
        bodySpacing: 6,
        displayColors: false,
        bodyAlign: 'left' as const,
        titleAlign: 'left' as const
      }
    },
    maintainAspectRatio: false,
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'] as ('mousemove' | 'mouseout' | 'click' | 'touchstart' | 'touchmove')[],
    onHover: (event: any, elements: any[]) => {
      const target = event.native?.target;
      if (target) {
        target.style.cursor = elements.length ? 'pointer' : 'default';
      }
    },
    interaction: {
      mode: 'point' as const,
      intersect: true
    }
  };

  if (loading) {
    return (
      <div className="student-growth-chart">
        <h2 className="chart-title">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-growth-chart">
        <h2 className="chart-title">Error</h2>
        <p className="error-message">{error.message}</p>
      </div>
    );
  }

  if (focusAreas.length === 0) {
    return (
      <div className="student-growth-chart">
        <h2 className="chart-title">No Focus Areas</h2>
        <p>No focus areas have been defined yet.</p>
      </div>
    );
  }

  return (
    <div className="student-growth-chart">
      <h2 className="chart-title">Student Growth Chart</h2>
      <div className="chart-container">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};
