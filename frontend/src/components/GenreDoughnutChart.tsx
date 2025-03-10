// GenreDoughnutChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface IGenreData {
  label: string; // 장르명
  value: number; // 퍼센트 (예: 33.3)
}

interface Props {
  genreData: IGenreData[];
}

const GenreDoughnutChart: React.FC<Props> = ({ genreData }) => {
  const hasData = genreData && genreData.length > 0;

  // 장르 중 가장 퍼센트가 높은 항목 찾기
  const maxGenre = hasData
    ? genreData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), genreData[0])
    : null;

  // (1) 실제 데이터 (장르가 있을 때)
  const labels = genreData.map((g) => g.label);
  const values = genreData.map((g) => g.value);

  // (2) "가짜" 데이터 (장르가 없을 때)
  //    → [1]짜리 데이터를 사용해 도넛 모양 유지
  const fallbackData = {
    labels: ['없음'],
    datasets: [
      {
        data: [1],
        backgroundColor: ['#ddd'], // 회색
        borderWidth: 0,
        cutout: '80%',
        color: '#737373'
      },
    ],
  };

  const data = hasData 
  ? {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56',
            '#62AADF', '#E6EEF5', '#b38feb',
          ],
          hoverBackgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56',
            '#62AADF', '#E6EEF5', '#b38feb',
          ],
          borderWidth: 1,
          cutout: '70%', // 도넛 굵기
        },
      ],
    }
  : fallbackData; // 데이터 없으면 fallbackData 사용

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // 범례 숨김 (테이블로 대체)
      title: { display: false },
    },
  };

  return (
    <div style={{ width: '250px', height: '250px', position: 'relative'}}>
      <Doughnut data={data} options={options as any} />

      {/* (5) 도넛 중앙 텍스트 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '16px',
        }}
      >
        {hasData && maxGenre && maxGenre.value > 0 ? (
          <>
            <div style={{ fontSize: '13px', color: '#666' }}>가장 많이 읽은 장르</div>
            <div style={{ marginTop: '4px', fontWeight: 'bold'}}>{maxGenre.label}</div>
          </>
        ) : (
          // 데이터 없거나 0% 이하인 경우
          <>가장 많이 읽은 장르는?</>
        )}
      </div>
      </div>
  );
};

export default GenreDoughnutChart;
