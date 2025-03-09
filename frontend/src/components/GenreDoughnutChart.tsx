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
  label: string; // 예: '문학'
  value: number; // 예: 28.6 (퍼센트)
}

interface Props {
  genreData: IGenreData[];
}

const GenreDoughnutChart: React.FC<Props> = ({ genreData }) => {
  const labels = genreData.map(g => g.label);
  const values = genreData.map(g => g.value);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#62AADF', '#E6EEF5', '#b38feb'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#62AADF', '#E6EEF5', '#b38feb'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
  };

  const hasData = genreData && genreData.length > 0;

  return (
    //<div style={{ borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 8px rgba(0,0,0,0.05)' }}>
    <div style={{ width: '100%', minHeight: '300px', height: 'auto' }}>  
      {hasData ? (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '200px', height: '200px' }}>
            <Doughnut data={data} options={options} />
          </div>
          {/* 표 형태로 '장르'와 'Value' 표시 */}
          <div style={{ flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontSize: '14px' }}>장르</th>
                  <th style={{ padding: '8px 0', fontSize: '14px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {genreData.map((g, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '4px 0', fontSize: '13px' }}>{g.label}</td>
                    <td style={{ padding: '4px 0', fontSize: '13px' }}>
                      {g.value.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
          장르 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default GenreDoughnutChart;
