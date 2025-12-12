// ===== 產生一筆模擬感測資料 =====
function generateMockData() {
  const temp = randomRange(20, 40);   // 溫度 20~40 °C
  const gas = randomRange(10, 100);   // 瓦斯指數 10~100
  const smoke = Math.random() < 0.2;  // 20% 機率有煙霧
  const pir = Math.random() < 0.5;    // 50% 機率有人活動
  return { temp, gas, smoke, pir };
}

function randomRange(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

// ===== 危險分數演算法 =====
function computeRiskScore(data) {
  let score = 0;

  if (data.temp > 25) {
    score += (data.temp - 25) * 2;
  }
  if (data.gas > 40) {
    score += (data.gas - 40) * 1.5;
  }
  if (data.smoke) {
    score += 30;
  }
  if (data.pir && (data.temp > 30 || data.gas > 60)) {
    score += 10;
  }

  score = Math.min(100, Math.max(0, Math.round(score)));
  return score;
}

// ===== DOM 元素 =====
const tempEl = document.getElementById("tempValue");
const gasEl = document.getElementById("gasValue");
const smokeEl = document.getElementById("smokeValue");
const pirEl = document.getElementById("pirValue");
const riskScoreEl = document.getElementById("riskScore");
const riskLevelEl = document.getElementById("riskLevel");
const simulateBtn = document.getElementById("simulateBtn");
const autoToggle = document.getElementById("autoToggle");
const eventListEl = document.getElementById("eventList");

let autoTimer = null;

// ===== Chart.js 設定 =====
const ctx = document.getElementById("riskChart").getContext("2d");
const riskData = {
  labels: [],
  datasets: [{
    label: "危險分數",
    data: [],
    tension: 0.25,
    fill: false
  }]
};

const riskChart = new Chart(ctx, {
  type: "line",
  data: riskData,
  options: {
    responsive: true,
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  }
});

// ===== 更新儀表板 =====
function updateDashboard() {
  const data = generateMockData();
  const score = computeRiskScore(data);

  tempEl.textContent = data.temp;
  gasEl.textContent = data.gas;
  smokeEl.textContent = data.smoke ? "有煙霧" : "正常";
  pirEl.textContent = data.pir ? "有人" : "無人";
  riskScoreEl.textContent = score;

  riskLevelEl.classList.remove("level-safe", "level-warning", "level-danger");
  let levelText = "";
  if (score < 40) {
    levelText = "安全";
    riskLevelEl.classList.add("level-safe");
  } else if (score < 70) {
    levelText = "注意";
    riskLevelEl.classList.add("level-warning");
  } else {
    levelText = "危險";
    riskLevelEl.classList.add("level-danger");
    addEventLog(score, data);
  }
  riskLevelEl.textContent = `目前狀態：${levelText}`;

  const nowLabel = new Date().toLocaleTimeString("zh-TW", { hour12: false });
  riskData.labels.push(nowLabel);
  riskData.datasets[0].data.push(score);
  if (riskData.labels.length > 20) {
    riskData.labels.shift();
    riskData.datasets[0].data.shift();
  }
  riskChart.update();
}

// ===== 事件紀錄 =====
function addEventLog(score, data) {
  if (eventListEl.children.length === 1 &&
      eventListEl.children[0].classList.contains("placeholder")) {
    eventListEl.innerHTML = "";
  }

  const li = document.createElement("li");

  const timeSpan = document.createElement("span");
  timeSpan.className = "event-time";
  timeSpan.textContent = new Date().toLocaleString("zh-TW", { hour12: false });

  const msgSpan = document.createElement("span");
  msgSpan.className = "event-msg";
  msgSpan.textContent =
    `危險分數 ${score} 分（溫度 ${data.temp}°C、瓦斯 ${data.gas}、煙霧 ${data.smoke ? "有" : "無"}、有人 ${data.pir ? "是" : "否"}），已觸發警報。`;

  li.appendChild(timeSpan);
  li.appendChild(msgSpan);
  eventListEl.insertBefore(li, eventListEl.firstChild);
}

// ===== 綁定事件 =====
simulateBtn.addEventListener("click", updateDashboard);

autoToggle.addEventListener("change", () => {
  if (autoToggle.checked) {
    autoTimer = setInterval(updateDashboard, 5000);
    updateDashboard();
  } else {
    clearInterval(autoTimer);
    autoTimer = null;
  }
});

// 一開始先跑一次
updateDashboard();
