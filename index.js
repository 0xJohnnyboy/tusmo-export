const [date, time] = new Date().toISOString().split("T");
const rows = [];

document.querySelectorAll("ul.players-list > li.item").forEach(li => {
    const player = li.querySelector('.name span').innerText.trim();
    const score = li.querySelector(".mr-1").innerText.trim();

    if (player && score) {
        rows.push([date, time, player, score])
    }
})
 const csv = ["date; time; player; score"]
    .concat(rows.map(r => r.map(v => `${v}`).join(";")))
    .join("\n");

const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
const a = document.createElement("a");

a.href = URL.createObjectURL(blob);
a.download = `tusmo_${date}_${Date.now()}.csv`;

a.click();