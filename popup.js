const loadBtn = document.getElementById("load");
const resetBtn = document.getElementById("reset");
const exportBtn = document.getElementById("export");
const yearSel = document.getElementById("year");
const monthSel = document.getElementById("month");
const status = document.getElementById("status");

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "INJECT_HOOK") {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        world: "MAIN",
        files: ["inject-fetch-hook.js"]
      });
    }
  });  

function getKey(row) {
  return `${row.date}_${row.player}_${row.score}`;
}

function updateSelectors(data) {
  const dates = data.map(d => d.date.slice(0, 7));
  const uniqueMonths = [...new Set(dates)];
  const years = [...new Set(uniqueMonths.map(d => d.split('-')[0]))];
  const months = [...new Set(uniqueMonths.map(d => d.split('-')[1]))];

  yearSel.innerHTML = `<option value="">All</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join("");
  monthSel.innerHTML = `<option value="">All</option>` +
    months.map(m => `<option value="${m}">${m}</option>`).join("");
}

loadBtn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
};

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "LEADERBOARD_DATA") {
    const saved = await chrome.storage.local.get(["data"]);
    const existing = saved.data || [];
    const existingMap = new Map(existing.map(e => [getKey(e), e]));
    msg.rows.forEach(r => {
      existingMap.set(getKey(r), r); // overwrite or add
    });
    const merged = Array.from(existingMap.values());
    await chrome.storage.local.set({ data: merged });
    updateSelectors(merged);
    status.textContent = `${msg.rows.length} rows loaded (total: ${merged.length})`;
  }
});

resetBtn.onclick = async () => {
  if (confirm("Are you sure you want to delete all saved data?")) {
    await chrome.storage.local.remove("data");
    status.textContent = "Data cleared.";
    updateSelectors([]);
  }
};

exportBtn.onclick = async () => {
  const { data = [] } = await chrome.storage.local.get(["data"]);
  const y = yearSel.value;
  const m = monthSel.value;
  const filtered = data.filter(d => {
    if (!y && !m) return true;
    const [dy, dm] = d.date.split("-");
    return (!y || dy === y) && (!m || dm === m);
  });

  const csv = ["date;time;player_id;player;score;has_finished"]
    .concat(filtered.map(d => `${d.date};${d.time};${d.player_id ?? ''};${d.player};${d.score};${d.hasFinished}`))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);

  let suffix = Date.now();
  if (y && m) {
    suffix = `${y}-${m}`;
  }

  a.download = `tusmo_export_${suffix}.csv`;

  a.click();
};
