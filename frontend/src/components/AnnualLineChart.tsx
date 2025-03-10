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
import { Line } from 'react-chartjs-2';

// Chart.js 플러그인 등록
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title, Filler);

interface ILineChartData {
  month: string;  // 예: 'Aug 2018'
  count: number;  // 완독한 권수
}

// Props로 외부에서 데이터 주입
interface Props {
  chartData: ILineChartData[];
  fromLabel?: string; // "from August 2018 - May 2019" 등 표시용
}

const AnnualLineChart: React.FC<Props> = ({ chartData, fromLabel }) => {
  // X축 라벨
  const labels = chartData.map(item => item.month);

  // 실제 데이터
  const data = {
    labels,
    datasets: [
      {
        label: '독서 권수',
        data: chartData.map(item => item.count),
        borderColor: '#FF7849',         // 주황색 계열
        backgroundColor: 'rgba(255,120,73,0.1)',
        pointBackgroundColor: '#FF7849',
        fill: true,                     // 선 아래 채우기
        tension: 0.3,                   // 선 곡률
      },
      // 필요하면 추가 라인(파란색 등)도 넣을 수 있음
      // {
      //   label: '다른 데이터',
      //   data: [...],
      //   borderColor: '#62AADF',
      //   ...
      // }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 차트 상단의 범례 숨기기 (원하면 true로)
      },
      title: {
        display: false, // Chart.js 기본 타이틀 숨김 (커스텀 문구 넣을 때 사용)
      },
    },
    scales: {
      x: {
        grid: {
          color: '#f5f5f5',
        },
        ticks: {
          color: '#666',
        },
      },
      y: {
        display: false, // y축 숨김
      },
    },
  };

  // 차트에 표시할 데이터가 없는 경우
  const hasData = chartData && chartData.length > 0;

  return (
    //<div style={{ borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 8px rgba(0,0,0,0.05)' }}>
    <div style={{ width: '100%', height: '100%' }}>
      {/* 상단 "from ~ to ~" 표시 */}
      {fromLabel && (
        <div style={{ textAlign: 'right', fontSize: '14px', color: '#999', marginBottom: '10px' }}>
          {fromLabel}
        </div>
      )}

      {/* 실제 차트 or "데이터 없음" */}
      {hasData ? (
        <Line data={data} options={options} />
      ) : (
        <div
          style={{
            height: '200px',
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
