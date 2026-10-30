document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("priceHistoryChart");
  if (!canvas) return;
  const labels = JSON.parse(decodeURIComponent(canvas.dataset.labels || "[]"));
  const prices = JSON.parse(decodeURIComponent(canvas.dataset.prices || "[]"));
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(245, 158, 11, 0.6)");
  gradient.addColorStop(0.7, "rgba(245, 158, 11, 0.1)");
  gradient.addColorStop(1, "rgba(245, 158, 11, 0)");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Giá (VND)",
          data: prices,
          fill: true,
          backgroundColor: gradient,
          borderColor: "#F59E0B",
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: "#FDE68A",
          pointBorderColor: "#F59E0B",
          pointBorderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E293B",
          borderColor: "#F59E0B",
          borderWidth: 1,
          titleColor: "#94A3B8",
          bodyColor: "#FBBF24",
          bodyFont: { weight: "bold" },
          displayColors: false,
          callbacks: {
            label: (context) => context.parsed.y.toLocaleString("vi-VN") + " ₫",
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94A3B8", font: { size: 11 }, maxRotation: 0 },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
          ticks: {
            color: "#94A3B8",
            font: { size: 11 },
            callback: (val) => val.toLocaleString("vi-VN") + "đ",
          },
        },
      },
    },
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("subscribed");
  const submitBtn = document.querySelector("#submitBtn");
  const formDiv = document.querySelector("#formDiv");
  const formTitle = document.querySelector("#formTitle");
  const inputForm = document.querySelector("#inputForm");
  const imageConfirm = document.querySelector("#imageConfirm");
  if (success) {
    submitBtn.classList.remove(
      "bg-[#D4AF37]",
      "hover:bg-amber-400",
      "active:scale-[0.98]",
    );
    submitBtn.classList.add("bg-[#10B981]", "pointer:none");
    submitBtn.innerHTML = "Đã xác nhận";
    submitBtn.type = "button";
    formDiv.classList.remove("border-[#D4AF37]");
    formDiv.classList.add("border-[#10B981]");
    formTitle.classList.remove("text-[#D4AF37]");
    formTitle.classList.add("text-[#10B981]");
    inputForm.classList.add("hidden");
    imageConfirm.classList.remove("hidden");
    window.history.replaceState({}, "", window.location.pathname);
  }
});
