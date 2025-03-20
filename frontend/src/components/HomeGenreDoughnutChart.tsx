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
  value: number; // 퍼센트(예: 33.3)
}

interface Props {
  genreData: IGenreData[];
}

// HomePage 전용 장르 도넛차트
const HomeGenreDoughnutChart: React.FC<Props> = ({ genreData }) => {
  const hasData = genreData && genreData.length > 0;

  // (1) 상위 7개 + '기타' 처리
  const sortedByValue = [...genreData].sort((a, b) => b.value - a.value);
  const top7 = sortedByValue.slice(0, 7);
  const rest = sortedByValue.slice(7);
  if (rest.length > 0) {
    const sumRest = rest.reduce((acc, curr) => acc + curr.value, 0);
    top7.push({ label: '기타', value: sumRest });
  }

  // (2) 차트용 라벨/값
  const labels = top7.map((g) => g.label);
  const values = top7.map((g) => g.value);

  // (3) 가장 많이 읽은 장르
  const maxGenre = hasData
    ? top7.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), top7[0])
    : null;

  // (4) 색상 팔레트 (최대 8개)
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

  // 데이터셋
  const data = hasData
    ? {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
            hoverBackgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
            borderWidth: 1,
            cutout: '75%', // 도넛 두께
          },
        ],
      }
    : {
        labels: ['없음'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#ddd'],
            borderWidth: 0,
            cutout: '80%',
          },
        ],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // chart.js 기본 범례 숨김
      title: { display: false },
    },
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* (A) 도넛 차트 */}
      <div style={{ width: '210px', height: '210px', position: 'relative', margin: '20px' }}>
        <Doughnut data={data as any} options={options as any} />

        {/* (도넛 중앙 텍스트) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          {hasData && maxGenre && maxGenre.value > 0 ? (
            <>
              <div style={{ fontSize: '11px', color: '#666' }}>가장 많이 읽은 장르</div>
              <div style={{ marginTop: '4px', fontWeight: 'bold' }}>{maxGenre.label}</div>
            </>
          ) : (
            <>가장 많이 읽은 장르는?</>
          )}
        </div>
      </div>

      {/* (B) 오른쪽 범례(legend) */}
      {hasData && (
        <div style={{ marginLeft: '40px' }}>
          {labels.map((label, idx) => {
            const color = colorPalette[idx % colorPalette.length];
            return (
              <div
                key={label}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
              >
                {/* 색상 네모칸 */}
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: color,
                    marginRight: '8px',
                    borderRadius: '2px',
                  }}
                />
                {/* 장르명 + 퍼센트 */}
                <span style={{ fontSize: '14px', color: '#333' }}>
                  {label} ({values[idx].toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeGenreDoughnutChart;
