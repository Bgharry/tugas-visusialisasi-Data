
function totalsPerYearArray(){
  return DATA.years.map((y, idx) => {
    let sum=0;
    for(const p of Object.keys(DATA.platforms)) sum += DATA.platforms[p][idx];
    return sum;
  });
}

const yearSelect = document.getElementById('yearSelect');
DATA.years.forEach((y, idx)=>{
  const o=document.createElement('option'); o.value=idx; o.text=y; yearSelect.appendChild(o);
});
yearSelect.value = DATA.years.length-1;

// Line chart
const lineCtx = document.getElementById('lineChart').getContext('2d');
const totals = totalsPerYearArray();
const lineChart = new Chart(lineCtx, {
  type:'line',
  data:{labels:DATA.years,datasets:[{label:'Total Pengguna (juta)',data:totals,borderColor:'#0b3d91',backgroundColor:'rgba(11,61,145,0.08)',fill:true,tension:0.3}]},
  options:{responsive:true,plugins:{title:{display:true,text:'Pertumbuhan Total Pengguna Media Sosial (2015–2024)'}}}
});
document.getElementById('desc-line').innerText = 'Grafik menunjukkan total agregat pengguna media sosial (semua platform) dari 2015 sampai 2024.';

// Bar & Pie for selected year
const barCtx = document.getElementById('barChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');

function dataForYear(idx){
  const keys=Object.keys(DATA.platforms);
  const vals=keys.map(k=>DATA.platforms[k][idx]);
  return {labels:keys, values:vals};
}

let initial = dataForYear(DATA.years.length-1);
const barChart = new Chart(barCtx, {type:'bar',data:{labels:initial.labels,datasets:[{label:'Juta Pengguna',data:initial.values,backgroundColor:['#0b3d91','#2b9d44','#f1a51b','#e04b3c','#6a5acd']}]}, options:{responsive:true,plugins:{title:{display:true,text:'Jumlah Pengguna per Platform (tahun terpilih)'}}}});
const pieChart = new Chart(pieCtx, {type:'pie',data:{labels:initial.labels,datasets:[{data:initial.values,backgroundColor:['#0b3d91','#2b9d44','#f1a51b','#e04b3c','#6a5acd']}]}, options:{responsive:true,plugins:{title:{display:true,text:'Proporsi Pengguna Global (tahun terpilih)'}}}});
document.getElementById('desc-bar').innerText = 'Bar chart menampilkan perbandingan jumlah pengguna tiap platform pada tahun terpilih.';
document.getElementById('desc-pie').innerText = 'Pie chart menunjukkan proporsi masing-masing platform pada tahun terpilih.';

// Histogram
const histCtx = document.getElementById('histChart').getContext('2d');
function makeBins(data, binCount=5){
  const min=Math.min(...data), max=Math.max(...data);
  const step=(max-min)/binCount;
  const bins=Array(binCount).fill(0);
  const labels=[];
  for(let i=0;i<binCount;i++) labels.push(Math.round(min + i*step) + '-' + Math.round(min + (i+1)*step));
  data.forEach(v=>{ const idx = Math.min(binCount-1, Math.floor((v-min)/step)); bins[idx]++; });
  return {labels:labels, counts:bins};
}
const histInfo = makeBins(totals,6);
const histChart = new Chart(histCtx, {type:'bar', data:{labels:histInfo.labels,datasets:[{label:'Jumlah Tahun',data:histInfo.counts,backgroundColor:'#0b3d91'}]}, options:{responsive:true,plugins:{title:{display:true,text:'Histogram: Distribusi Total Pengguna per Tahun'}}}});
document.getElementById('desc-hist').innerText = 'Histogram menunjukkan frekuensi total pengguna dalam rentang nilai tertentu (2015–2024).';

// Scatter
const scatterCtx = document.getElementById('scatterChart').getContext('2d');
function computeGrowthPercent(arr){ const res=[0]; for(let i=1;i<arr.length;i++){ res.push(((arr[i]-arr[i-1])/arr[i-1])*100); } return res; }
const growth = computeGrowthPercent(totals);
const scatterData = totals.map((t,idx)=>({x:t,y:growth[idx],label:DATA.years[idx]}));
const scatterChart = new Chart(scatterCtx, {type:'scatter',data:{datasets:[{label:'Tahun (titik)',data:scatterData,backgroundColor:'#2b9d44'}]}, options:{responsive:true,plugins:{title:{display:true,text:'Scatter: Total Pengguna vs Pertumbuhan Tahunan (%)'}},scales:{x:{title:{display:true,text:'Total Pengguna (juta)'}},y:{title:{display:true,text:'Pertumbuhan (%)'}}}}});
document.getElementById('desc-scatter').innerText = 'Scatter plot menunjukkan hubungan antara total pengguna dan persentase pertumbuhan tahunan.';

// Google GeoChart for Asia
google.charts.load('current', {'packages':['geochart']});
google.charts.setOnLoadCallback(drawMapInitial);
function prepareAsiaData(yearIdx){
  const rows = [['Country','Users (juta)']];
  const asia = DATA.asia;
  for(const country of Object.keys(asia)){
    rows.push([country, asia[country][yearIdx]];
  }
  return rows;
}
function drawMapInitial(){
  const data = google.visualization.arrayToDataTable(prepareAsiaData(DATA.years.length-1));
  const options = {region:'002',displayMode:'regions',colorAxis:{colors:['#e6f7ff','#a9d9ff','#0b3d91']},resolution:'countries',backgroundColor:'#ffffff00',datalessRegionColor:'#f3f6fb'};
  const chart = new google.visualization.GeoChart(document.getElementById('asia_map'));
  chart.draw(data, options);
  document.getElementById('desc-map').innerText = 'Peta choropleth (Asia) menunjukkan jumlah pengguna media sosial per negara pada tahun terpilih.';
}

// Update function
function updateAll(idx){
  const labels = DATA.years.slice(0, idx+1);
  lineChart.data.labels = labels;
  lineChart.data.datasets[0].data = totals.slice(0, idx+1);
  lineChart.update();
  const d = (function(i){ const keys=Object.keys(DATA.platforms); return {labels:keys, values:keys.map(k=>DATA.platforms[k][i])}; })(idx);
  barChart.data.labels = d.labels; barChart.data.datasets[0].data = d.values; barChart.update();
  pieChart.data.labels = d.labels; pieChart.data.datasets[0].data = d.values; pieChart.update();
  const tsub = totals.slice(0, idx+1); const h = makeBins(tsub,6); histChart.data.labels = h.labels; histChart.data.datasets[0].data = h.counts; histChart.update();
  const g = computeGrowthPercent(totals.slice(0, idx+1)); const sdata = totals.slice(0, idx+1).map((t,i)=>({x:t,y:g[i],label:DATA.years[i]})); scatterChart.data.datasets[0].data = sdata; scatterChart.update();
  const mapData = google.visualization.arrayToDataTable(prepareAsiaData(idx)); const options = {region:'002',displayMode:'regions',colorAxis:{colors:['#e6f7ff','#a9d9ff','#0b3d91']},resolution:'countries',backgroundColor:'#ffffff00',datalessRegionColor:'#f3f6fb'}; const chart = new google.visualization.GeoChart(document.getElementById('asia_map')); chart.draw(mapData, options);
}
updateAll(parseInt(yearSelect.value));
yearSelect.addEventListener('change',(e)=>{ updateAll(parseInt(e.target.value)); });
