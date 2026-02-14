import { API_FILES_URL } from '../config/config.js';
import { formatFileSize } from '../utils/fileUtils.js';

let typeChart = null;
let trendChart = null;
let statsData = null;
let currentPeriod = 'daily';
let resizeHandler = null;

async function fetchStats() {
    try {
        const response = await fetch(`${API_FILES_URL}/stats`);
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('取得統計資料失敗:', error);
        return null;
    }
}

const chartColors = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
    '#86bcb6', '#8cd17d', '#b6992d', '#499894', '#e15759'
];

function renderTypeChart(typeStats) {
    const ctx = document.getElementById('type-chart');
    if (!ctx) return;

    if (typeChart) {
        typeChart.destroy();
    }

    const labels = typeStats.map(s => s.file_type ? s.file_type.toUpperCase() : '無副檔名');
    const data = typeStats.map(s => s.count);

    typeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: chartColors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 13 },
                        generateLabels: function(chart) {
                            const dataset = chart.data.datasets[0];
                            return chart.data.labels.map((label, i) => ({
                                text: `${label}  (${dataset.data[i]})`,
                                fillStyle: dataset.backgroundColor[i],
                                strokeStyle: '#fff',
                                lineWidth: 2,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} 個 (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderTrendChart(period) {
    if (!statsData) return;

    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;

    if (trendChart) {
        trendChart.destroy();
    }

    let labels, data, title;

    if (period === 'daily') {
        labels = statsData.dailyTrend.map(d => {
            // date 是 'YYYY-MM-DD' 格式
            const parts = String(d.date).slice(0, 10).split('-');
            return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
        });
        data = statsData.dailyTrend.map(d => d.count);
        title = '每日上傳數量 (近 30 天)';
    } else if (period === 'weekly') {
        labels = statsData.weeklyTrend.map(d => {
            const parts = String(d.week_start).slice(0, 10).split('-');
            return `${parseInt(parts[1])}/${parseInt(parts[2])} 週`;
        });
        data = statsData.weeklyTrend.map(d => d.count);
        title = '每週上傳數量 (近 12 週)';
    } else {
        labels = statsData.monthlyTrend.map(d => d.month);
        data = statsData.monthlyTrend.map(d => d.count);
        title = '每月上傳數量 (近 12 個月)';
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '上傳數量',
                data,
                borderColor: '#4e79a7',
                backgroundColor: 'rgba(78, 121, 167, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4e79a7',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: title,
                    font: { size: 14 },
                    padding: { bottom: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `上傳: ${context.parsed.y} 個檔案`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            }
        }
    });
}

export async function loadStats() {
    // 清除舊的 resize 監聽
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }

    statsData = await fetchStats();
    if (!statsData) return;

    const totalFilesEl = document.getElementById('stats-total-files');
    const totalSizeEl = document.getElementById('stats-total-size');

    if (totalFilesEl) totalFilesEl.textContent = statsData.totalFiles;
    if (totalSizeEl) totalSizeEl.textContent = formatFileSize(statsData.totalSize);

    renderTypeChart(statsData.typeStats);
    currentPeriod = 'daily';
    renderTrendChart(currentPeriod);

    const periodSelect = document.getElementById('trend-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            currentPeriod = e.target.value;
            renderTrendChart(currentPeriod);
        });
    }
}