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
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface Props {
  currentUser: User | null;
}

export const StudentGrowthChart: React.FC<Props> = ({ currentUser }) => {
  const { focusAreas, focusAreaScores, loading, error } = useFocusAreas(currentUser?.id);
  const [selfSelectionScores, setSelfSelectionScores] = useState<Map<string, number>>(new Map());
  const [loadingSelfSelection, setLoadingSelfSelection] = useState(true);

  // Fetch self-selection survey scores
  useEffect(() => {
    const fetchSelfSelectionScores = async () => {
      if (!currentUser?.id) {
        setLoadingSelfSelection(false);
        return;
      }

      try {
        // Fetch self-selection scores with focus area grade info
        const { data: selfSelectionData, error: selfSelectionError } = await supabase
          .from('student_focus_area_self_selection_score')
          .select(`
            focus_area_id,
            focus_area_grade_id,
            focus_area_grade!inner (
              name
            )
          `)
          .eq('student_id', currentUser.id);

        if (selfSelectionError) {
          console.error('Error fetching self-selection scores:', selfSelectionError);
          setLoadingSelfSelection(false);
          return;
        }

        // Map focus_area_id to score (grade name is the score number)
        const scoresMap = new Map<string, number>();
        selfSelectionData?.forEach(item => {
          const focusAreaGrade = item.focus_area_grade as unknown as { name: number | string } | null;
          const score = focusAreaGrade?.name 
            ? (typeof focusAreaGrade.name === 'number' ? focusAreaGrade.name : parseInt(String(focusAreaGrade.name)))
            : null;
          
          if (item.focus_area_id && score !== null && !isNaN(score)) {
            scoresMap.set(item.focus_area_id, score);
          }
        });

        setSelfSelectionScores(scoresMap);
      } catch (err) {
        console.error('Error fetching self-selection scores:', err);
      } finally {
        setLoadingSelfSelection(false);
      }
    };

    fetchSelfSelectionScores();
  }, [currentUser?.id]);

  const data = {
    labels: focusAreas.map(area => area.name),
    datasets: [
      {
        label: 'Self Selection',
        data: focusAreas.map(area => {
          const selfScore = selfSelectionScores.get(area.id);
          return selfScore !== undefined ? selfScore : null;
        }),
        backgroundColor: 'rgba(232, 119, 34, 0.15)',
        borderColor: 'rgba(232, 119, 34, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(232, 119, 34, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(232, 119, 34, 1)',
        pointHoverBorderColor: '#fff',
        order: 0 // Lower order = renders first (behind)
      },
      {
        label: 'Course Scores',
        data: focusAreas.map(area => focusAreaScores.get(area.id) || 6), // Use median score or default to 6
        backgroundColor: 'rgba(141, 198, 63, 0.2)',
        borderColor: 'rgba(141, 198, 63, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(141, 198, 63, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(141, 198, 63, 1)',
        pointHoverBorderColor: '#fff',
        order: 1 // Higher order = renders last (on top)
      }
    ]
  };

  const options = {
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        min: 5,
        max: 10,
        ticks: {
          stepSize: 1
        },
        pointLabels: {
          display: true,
          font: {
            size: 13
          },
          padding: 15
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
            if (tooltipItems.length === 0) return [];
            
            const tooltipItem = tooltipItems[0];
            const dataIndex = tooltipItem.dataIndex;
            const datasetIndex = tooltipItem.datasetIndex;
            const currentScore = tooltipItem.raw;
            
            // Get only the specific focus area being hovered
            const area = focusAreas[dataIndex];
            if (!area) return [];
            
            const result: string[] = [];
            result.push(area.name);
            
            // Show different label based on which dataset
            if (datasetIndex === 0) {
              result.push(`Self Selection: ${currentScore}`);
            } else {
              result.push(`Course Score: ${currentScore}`);
            }
            result.push(''); // Add spacing between score and description
            
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

  if (loading || loadingSelfSelection) {
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
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(232, 119, 34, 1)' }}></span>
          <span className="legend-label">Self Selection Survey Scores</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'rgba(141, 198, 63, 1)' }}></span>
          <span className="legend-label">Focus Area Scores</span>
        </div>
      </div>
    </div>
  );
};
