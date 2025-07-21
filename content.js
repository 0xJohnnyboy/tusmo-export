(() => {
    const [date, time] = new Date().toISOString().split("T");
    const playersMap = window.__tusmoPlayers || {};
    const rows = [];
  
    document.querySelectorAll("ul.players-list > li.item").forEach(li => {
      const player = li.querySelector('.name span')?.innerText.trim();
      const score = li.querySelector(".mr-1")?.innerText.trim();
      const playerId = playersMap[player] || "";
      if (player) {
        const hasFinished = !!player && !!score
        rows.push({ date, time, player, score, hasFinished, playerId });
      }
    });
  
    chrome.runtime.sendMessage({ type: "LEADERBOARD_DATA", rows });
  })();  