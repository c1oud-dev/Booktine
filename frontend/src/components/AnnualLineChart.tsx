import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title, Filler, zoomPlugin);

interface ILineChartData {
  month: string;  // 예: '2021년'
  count: number;  // 완독한 권수
}

// Props에 registrationYear 추가
interface Props {
  chartData: ILineChartData[];
  fromLabel?: string; // 예시 문구
  registrationYear: number; // 사용자가 가입한 연도
}

const AnnualLineChart: React.FC<Props> = ({ chartData, fromLabel, registrationYear }) => {
  // 전체 범위 계산
  const currentYear = new Date().getFullYear();
  let startYear: number, endYear: number;
  if (registrationYear === currentYear) {
    startYear = currentYear;
    endYear = currentYear + 5;
  } else {
    startYear = registrationYear;
    endYear = currentYear;
  }
  const totalYears = endYear - startYear + 1;
  // labels 배열는 full range의 연도별 문자열로 생성(예: '2020년', '2021년', ...)
  const fullLabels = [];
  for (let y = startYear; y <= endYear; y++) {
    fullLabels.push(`${y}년`);
  }
  
  // 만약 chartData는 이미 fullLabels와 일치하는 순서로 만들어졌다고 가정
  // 초기 zoom window: 최신 6년을 보여주되, 전체 범위가 6년보다 작으면 전체 범위 사용
  let initialMinIndex = 0, initialMaxIndex = fullLabels.length - 1;
  if (fullLabels.length > 6) {
    initialMinIndex = fullLabels.length - 6;
    initialMaxIndex = fullLabels.length - 1;
  }
  
  // x축 라벨은 fullLabels를 사용 (혹은 chartData와 일치하는 순서로 구성되어 있어야 함)
  const labels = fullLabels;
  
  // 실제 데이터: chartData 배열의 count 값을 그대로 사용
  const data = {
    labels,
    datasets: [
      {
        label: '독서 권수',
        data: chartData.map(item => item.count),
        borderColor: '#FF7849',
        backgroundColor: 'rgba(255,120,73,0.1)',
        pointBackgroundColor: '#FF7849',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: false },
          drag: { enabled: false },
          mode: 'x' as const,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f5f5f5' },
        ticks: {
          // x축 눈금 색상: 현재 연도에 해당하는 경우 빨간색 처리
          color: (context: any) => {
            if (context.tick && context.tick.label) {
              const label = context.tick.label;
              if (label === `${currentYear}년`) {
                return 'red';
              }
            }
            return '#666';
          },
        },
        min: initialMinIndex,
        max: initialMaxIndex,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '70%', marginTop: '10px' }}>
      {fromLabel && (
        <div style={{ textAlign: 'right', fontSize: '14px', color: '#999', marginBottom: '10px' }}>
          {fromLabel}
        </div>
      )}
      {chartData.length > 0 ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            border: '1px dashed #ccc',
            borderRadius: '8px',
          }}
        >
          데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default AnnualLineChart;
