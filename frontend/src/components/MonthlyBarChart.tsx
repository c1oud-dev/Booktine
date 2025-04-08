import React, { useState, useEffect } from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';
import { Bar } from 'react-chartjs-2';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, zoomPlugin);


interface IBarChartData { //월별 막대 차트에 필요한 데이터 구조
  month: string;   // 예: '4월'
  goal: number;    // 목표 권수
  achieved: number; // 실제 달성 권수
}

interface Props {
  chartData: IBarChartData[];
  monthlyGoal: number;
  defaultMin?: number;
  defaultMax?: number;
  selectedYear?: number;
}



const MonthlyBarChart: React.FC<Props> = ({ chartData, monthlyGoal, defaultMin, defaultMax, selectedYear }) => {
  const [showDragHint, setShowDragHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDragHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const defaultMinValue = defaultMin ?? 0;
  const defaultMaxValue = defaultMax ?? (chartData.length - 1);

  const maxY = Math.max(4, monthlyGoal);
  const stepSize = Math.ceil(maxY / 5) || 1;

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

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: 'category',
        grid: { display: false },
        ticks: { 
          color: (context) => {
            // 만약 선택한 연도가 현재 연도라면 현재 달의 라벨을 빨간색 처리
            if (selectedYear && selectedYear === new Date().getFullYear()) {
              const currentMonth = new Date().getMonth() + 1; // 1~12
              if (context.tick.label === `${currentMonth}월`) {
                return 'red';
              }
            }
            return '#666';
          },
         },
        title: {
          display: true,
          color: '#666',
        },
        min: defaultMinValue,
        max: defaultMaxValue,
      },
      y: {
        min: 0,
        max: maxY,
        ticks: { stepSize, color: '#666' },
        grid: { color: '#f5f5f5' },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: false },
          drag: { enabled: false },
          mode: 'x',
        },
      },
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) => {
            const goal = chartData[context.dataIndex].goal;
            const achieved = chartData[context.dataIndex].achieved;
            return context.dataset.label === '목표'
              ? `목표: ${goal}권`
              : `달성: ${achieved}권`;
          },
        },
      },
    },
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',  
      height: '300px', 
      backgroundColor: '#fff', 
      padding: '20px', 
      boxShadow: '0 0 8px rgba(0,0,0,0.1)' 
    }}>
      <Bar data={data} options={options} />

      {showDragHint && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          좌우로 드래그하세요
        </div>
      )}
    </div>
  );
};

export default MonthlyBarChart;
