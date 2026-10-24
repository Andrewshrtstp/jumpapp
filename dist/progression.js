// Pure calendar and progression rules, shared by the UI and checks.
function calendarDay(key) {
  const [y,m,d] = key.split('-').map(Number);
  return Date.UTC(y,m-1,d)/86400000;
}
function workoutStreak(sessions, today) {
  const dates = [...new Set(sessions.map(s=>s.date))].filter(d=>d<=today).sort();
  let count=0, anchor=null;
  for (const date of dates) {
    const gap=anchor===null?Infinity:calendarDay(date)-calendarDay(anchor);
    if(gap===1) continue; // Extra workouts on a rest day don't move the schedule.
    count=gap===2?count+1:1;
    anchor=date;
  }
  return {count:anchor&&calendarDay(today)-calendarDay(anchor)<=2?count:0,anchor};
}
function nextMilestone(sessions) {
  let unlocked=0;
  for(const s of sessions) {
    if(s.phase!==2) continue;
    const type=unlocked%2===0?'jumps':'seconds';
    const target=50+Math.floor(unlocked/2)*10;
    if((s[type]||0)>=target) unlocked++;
  }
  const type=unlocked%2===0?'jumps':'seconds';
  return {unlocked,type,target:50+Math.floor(unlocked/2)*10};
}
function milestoneText(goal) {
  return goal.type==='jumps'?`${goal.target} consecutive jumps`:`${goal.target} seconds of continuous jumping`;
}
function nextWorkout(sessions,today) {
  const {anchor}=workoutStreak(sessions,today);
  const done=sessions.some(s=>s.date===today);
  const planned=anchor?calendarDay(anchor)+2:calendarDay(today);
  const next=Math.max(planned,calendarDay(today)+(done?1:0));
  return {date:new Date(next*86400000).toISOString().slice(0,10),due:!done&&next===calendarDay(today),done};
}
