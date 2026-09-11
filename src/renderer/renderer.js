function tempClass(value) {
  if (value >= 85) return "temp-hot";
  if (value >= 70) return "temp-warn";
  return "temp-ok";
}

function renderRows(containerId, items, unit, isTemp) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  if (!items || items.length === 0) {
    el.innerHTML = '<div class="empty">Aucun capteur détecté</div>';
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "row";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.Name;

    const value = document.createElement("span");
    value.className = "value " + (isTemp ? tempClass(item.Value) : "fan");
    value.textContent = `${item.Value} ${unit}`;

    row.appendChild(name);
    row.appendChild(value);
    el.appendChild(row);
  }
}

function showError(message) {
  const banner = document.getElementById("error-banner");
  if (message) {
    banner.textContent = message;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

window.hwAPI.onData((data) => {
  if (data.error || data.Error) {
    showError(data.error || data.Error);
  } else {
    showError(null);
  }

  renderRows("cpu-cores", data.CpuCores, "°C", true);
  renderRows("cpu-fans", data.CpuFans, "RPM", false);
  renderRows("gpu-temps", data.GpuTemps, "°C", true);
  renderRows("gpu-fans", data.GpuFans, "RPM", false);
  renderRows("case-fans", data.CaseFans, "RPM", false);

  document.getElementById("status").textContent =
    "Dernière mise à jour : " + new Date().toLocaleTimeString();
});
