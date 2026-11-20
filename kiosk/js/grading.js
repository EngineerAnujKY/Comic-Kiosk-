/* ==========================================================
   grading.js - grade table on grading.html (from data.js)
   ========================================================== */

document.getElementById("grade-rows").innerHTML = GRADES.map(function (g) {
  const change = g.mult === 1 ? "Base price" : (g.mult > 1 ? "+" : "-") + Math.round(Math.abs(g.mult - 1) * 100) + "%";
  return (
    '<tr><td><span class="grade-pill">' + g.grade + '</span></td>' +
    '<td><strong>' + g.name + '</strong></td>' +
    '<td>' + g.desc + '</td>' +
    '<td>' + change + '</td></tr>'
  );
}).join("");
