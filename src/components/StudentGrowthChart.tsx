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

interface Props {
  // We'll add props here later when we make it dynamic
}

export const StudentGrowthChart: React.FC<Props> = () => {
  const data = {
    labels: ['Biology', 'Music', 'Programming', 'Art', 'Geography', 'English', 'Sport', 'Maths', 'Physics'],
    datasets: [
      {
        label: 'Current Progress',
        data: [15, 17, 12, 8, 10, 13, 9, 11, 14],
        backgroundColor: 'rgba(0, 119, 190, 0.2)',
        borderColor: 'rgba(0, 119, 190, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 119, 190, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 119, 190, 1)'
      }
    ]
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 20
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="student-growth-chart">
      <h2 className="chart-title">Student Growth Chart</h2>
      <div className="chart-container">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};
