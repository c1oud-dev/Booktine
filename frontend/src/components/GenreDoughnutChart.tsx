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

  // (1) 상위 7개 + '기타' 처리
  const sortedByValue = [...genreData].sort((a, b) => b.value - a.value); // 내림차순 정렬
  const top7 = sortedByValue.slice(0, 7);
  const rest = sortedByValue.slice(7);
  if (rest.length > 0) {
    const sumRest = rest.reduce((acc, curr) => acc + curr.value, 0);
    top7.push({ label: '기타', value: sumRest });
  }

  // (2) 차트용 라벨/값 생성
  const labels = top7.map((g) => g.label);
  const values = top7.map((g) => g.value);
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
  
  // 색상 팔레트 (최대 8개 정도)
  const colorPalette = [
    '#FF6384', // 진한 핑크
    '#FF9F40', // 진한 오렌지
    '#FFCD56', // 진한 옐로우
    '#4CAF50', // 진한 그린
    '#36A2EB', // 진한 블루
    '#9575CD', // 진한 라벤더
    '#EC407A', // 진한 로즈
    '#29B6F6', // 진한 스카이 블루
  ];

  const data = hasData 
  ? {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, idx) => colorPalette[idx % colorPalette.length]),
          hoverBackgroundColor: labels.map((_, idx) => colorPalette[idx % colorPalette.length]),
          borderWidth: 1,
          cutout: '75%',
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
    <div style={{ width: '210px', height: '210px', position: 'relative', margin: '20px'}}>
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
            <div style={{ fontSize: '12px', color: '#666' }}>가장 많이 읽은 장르</div>
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
