import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface IBarChartData { //월별 막대 차트에 필요한 데이터 구조
  month: string;   // 예: '4월'
  goal: number;    // 목표 권수
  achieved: number; // 실제 달성 권수
}

interface Props {
  chartData: IBarChartData[];
  monthlyGoal: number; 
}

const MonthlyBarChart: React.FC<Props> = ({ chartData, monthlyGoal }) => {
  const maxY = Math.max(4, monthlyGoal);
  const stepSize = Math.ceil(maxY / 5) || 1;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        grid: { display: false },
        ticks: { color: '#666' },
      },
      y: {
        type: 'linear',
        min: 0,
        max: maxY,        // 동적 최대값
        ticks: {
          stepSize,       // 동적 간격
          callback: (value) => `${value}권`,
          color: '#666',
        },
        grid: {
          color: '#f5f5f5',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
      },
    },
  };

  // 실제 데이터
  const labels = chartData.map((item) => item.month);
  const data = {
    labels,
    datasets: [
      {
        label: '목표',
        data: chartData.map((item) => item.goal),
        backgroundColor: '#E6EEF5',
      },
      {
        label: '달성',
        data: chartData.map((item) => item.achieved),
        backgroundColor: '#62AADF',
      },
    ],
  };

  return (
    //<div style={{ width: '100%', height: '300px', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 8px rgba(0,0,0,0.05)' }}>
    <div style={{ width: '100%', minHeight: '300px', height: 'auto' }}>
        <Bar data={data} options={options} />
      
       
    </div>
  );
};

export default MonthlyBarChart;
