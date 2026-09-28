async function loadMatches(){
  const res = await fetch("matches.json");
  if(!res.ok) throw new Error("Не удалось загрузить matches.json");
  const matches = await res.json();

  const stats = {total:matches.length,wins:0,losses:0,kills:0};
  matches.forEach(m=>{
    if(m.winner==="radiant") stats.wins++;
    else stats.losses++;
    stats.kills += [...m.teams.radiant,...m.teams.dire]
      .reduce((sum,p)=>sum+(Number(p.kills)||0),0);
  });

  document.getElementById("stats").innerHTML = `
    <div class="stat"><b>${stats.total}</b><span>КАТОК</span></div>
    <div class="stat"><b>${stats.wins}</b><span>ПОБЕД</span></div>
    <div class="stat"><b>${stats.losses}</b><span>ПОРАЖЕНИЙ</span></div>
    <div class="stat"><b>${stats.kills}</b><span>KILLS</span></div>`;

  document.getElementById("matches").innerHTML =
    matches.map(renderMatch).join("");
}

function renderMatch(m){
  const radiantKills = sumKills(m.teams.radiant);
  const direKills = sumKills(m.teams.dire);
  const winnerText = m.winner==="radiant" ? "ПОБЕДА СИЛ СВЕТА" :
                     m.winner==="dire" ? "ПОБЕДА СИЛ ТЬМЫ" : "НИЧЬЯ";
  const resultClass = m.winner==="radiant" ? "win" : "loss";

  return `
  <article class="match">
    <div class="match-head">
      <div class="result ${resultClass}">${winnerText}</div>
      <div class="meta">${escapeHtml(m.date)} • ${escapeHtml(m.duration)}</div>
    </div>
    <div class="teams">
      <section class="team light">
        <div class="team-title"><span>СИЛЫ СВЕТА</span><span>${radiantKills}</span></div>
        ${m.teams.radiant.map(renderPlayer).join("")}
      </section>
      <section class="team dark">
        <div class="team-title"><span>СИЛЫ ТЬМЫ</span><span>${direKills}</span></div>
        ${m.teams.dire.map(renderPlayer).join("")}
      </section>
    </div>
    <div class="bottom">
      <span>ОБЩИЕ УБИЙСТВА</span>
      <span class="score">${radiantKills}</span><span class="dash">—</span><span class="score">${direKills}</span>
    </div>
  </article>`;
}

function renderPlayer(p){
  const name = p.bot ? `${escapeHtml(p.name)} <span class="bot">🤖 БОТ</span>` :
    `<a href="${escapeAttr(p.profile || "#")}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a>`;
  return `<div class="player">
    <div class="name">${name}</div>
    <div class="hero">${escapeHtml(p.hero)}</div>
    <div class="kills">${Number(p.kills)||0}</div>
  </div>`;
}
function sumKills(team){return team.reduce((s,p)=>s+(Number(p.kills)||0),0)}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
loadMatches().catch(e=>document.getElementById("matches").innerHTML=
  `<div class="match" style="padding:20px;color:#e77">Ошибка: ${escapeHtml(e.message)}</div>`);
