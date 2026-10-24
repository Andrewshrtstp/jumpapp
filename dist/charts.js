function progressSeries(sessions) {
  const days=new Map();
  for(const s of sessions){
    if(!days.has(s.date)) days.set(s.date,{date:s.date,jumps:0,seconds:0,known:0,missing:0});
    const d=days.get(s.date);d.jumps=Math.max(d.jumps,s.jumps);
    if(Number.isFinite(s.jumpedSeconds)&&s.jumpedSeconds>=0){d.seconds+=s.jumpedSeconds;d.known++;}
    else if(s.seconds>0){d.seconds+=s.seconds;d.known++;d.missing++;}
    else d.missing++;
  }
  let total=0;
  return [...days.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({...d,total:total+=d.seconds}));
}
function renderProgressCharts(sessions) {
  const series=progressSeries(sessions),missing=series.reduce((n,d)=>n+d.missing,0);
  const duration=s=>`${Math.floor(s/60)}m ${Math.floor(s%60)}s`;
  function chart(id,field,label,unit){
    const root=document.querySelector(id);
    const points=field==='total'?series.filter(d=>d.known):series;
    if(!points.length){root.innerHTML='<div class="chart-empty">'+(field==='total'?'Jumping time will appear after your next workout.':'Your first workout starts the chart. Every jump counts.')+'</div>';return;}
    const w=540,h=230,left=48,right=20,top=20,bottom=42;
    const max=Math.max(1,...points.map(p=>p[field]));
    const first=calendarDay(points[0].date),last=calendarDay(points.at(-1).date);
    const x=p=>last===first?(w+left-right)/2:left+(calendarDay(p.date)-first)/(last-first)*(w-left-right);
    const y=p=>h-bottom-p[field]/max*(h-top-bottom);
    const fmt=v=>field==='total'?`${+(v/60).toFixed(1)}`:`${Math.round(v)}`;
    const date=d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
    root.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}. ${points.length} recorded days. Values listed below."><text x="${left}" y="11" class="chart-axis">${unit}</text>${[0,.5,1].map(f=>`<line x1="${left}" x2="${w-right}" y1="${h-bottom-f*(h-top-bottom)}" y2="${h-bottom-f*(h-top-bottom)}" stroke="#e5e5dc"/><text x="${left-9}" y="${h-bottom-f*(h-top-bottom)+4}" text-anchor="end" class="chart-axis">${fmt(max*f)}</text>`).join('')}<polyline points="${points.map(p=>`${x(p)},${y(p)}`).join(' ')}" fill="none" stroke="#537d42" stroke-width="3" stroke-linejoin="round"/>${points.map(p=>`<circle cx="${x(p)}" cy="${y(p)}" r="4" fill="#537d42"><title>${p.date}: ${field==='total'?duration(p[field]):p[field]+' jumps'}</title></circle>`).join('')}<text x="${left}" y="${h-12}" class="chart-axis">${date(points[0].date)}</text>${points.length>1?`<text x="${w-right}" y="${h-12}" text-anchor="end" class="chart-axis">${date(points.at(-1).date)}</text>`:''}</svg><details><summary>View daily values</summary><div class="chart-table"><table><thead><tr><th>Date</th><th>${label}</th></tr></thead><tbody>${points.map(p=>`<tr><td>${p.date}</td><td>${field==='total'?duration(p[field]):p[field]+' jumps'}</td></tr>`).join('')}</tbody></table></div></details>`;
  }
  chart('#jumps-chart','jumps','Daily max consecutive jumps','jumps');
  chart('#time-chart','total','Cumulative jumping time','minutes');
  document.querySelector('#time-total').textContent=duration(series.at(-1)?.total||0);
  document.querySelector('#time-note').textContent='Counts timed jumping intervals and stopwatch attempts; excludes warm-ups, rest and pauses. Untimed challenge attempts are not included.'+(missing?` ${missing} older workout${missing===1?' has':'s have'} missing interval durations; only recorded time is included.`:'');
}
