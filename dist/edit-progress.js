(() => {
  const modal=document.querySelector('#edit-day-dialog');
  let editing=null;
  document.querySelector('.progress-charts').addEventListener('click',event=>{
    const button=event.target.closest('.edit-day');if(!button)return;
    const {date,field}=button.dataset;
    const sessions=data.sessions.map((s,index)=>({s,index})).filter(({s})=>s.date===date);
    editing={profile:jumpers.active(),field,sessions};
    document.querySelector('#edit-day-title').textContent=field==='jumps'?'Edit consecutive jumps':'Edit jumping time';
    document.querySelector('#edit-day-description').textContent=`${data.name} · ${date}. `+(sessions.length>1?'Edit each workout below. The chart uses the daily maximum for jumps and adds up jumping time.':'Correct this workout’s recorded value.');
    const root=document.querySelector('#edit-day-fields');root.replaceChildren();
    sessions.forEach(({s,index},i)=>{
      const group=document.createElement('fieldset'),legend=document.createElement('legend');
      legend.textContent=`Workout ${i+1} · ${phases[s.phase].name}`;group.append(legend);
      const input=(id,label,value,max)=>{const el=document.createElement('label');el.htmlFor=id;el.textContent=label;const n=document.createElement('input');n.id=id;n.type='number';n.min='0';n.step='1';n.required=true;n.value=value;if(max!==undefined)n.max=max;group.append(el,n);};
      if(field==='jumps')input(`edit-jumps-${index}`,'Max consecutive jumps',s.jumps);
      else{
        const seconds=s.jumpedSeconds??s.seconds??0;
        input(`edit-minutes-${index}`,'Minutes',Math.floor(seconds/60));
        input(`edit-seconds-${index}`,'Seconds',seconds%60,59);
      }
      root.append(group);
    });
    document.querySelector('#edit-day-error').textContent='';modal.showModal();root.querySelector('input')?.focus();
  });
  const close=()=>{modal.close();editing=null;};
  document.querySelector('#close-edit-day').onclick=close;document.querySelector('#cancel-edit-day').onclick=close;
  document.querySelector('#edit-day-form').onsubmit=event=>{
    event.preventDefault();if(!editing||jumpers.active()!==editing.profile)return;
    const updated=JSON.parse(JSON.stringify(data));
    try{
      const read=id=>{const n=Number(document.getElementById(id).value);if(!Number.isSafeInteger(n)||n<0)throw Error('Enter a whole number of zero or more.');return n;};
      for(const {index} of editing.sessions){
        if(editing.field==='jumps')updated.sessions[index].jumps=read(`edit-jumps-${index}`);
        else{
          const minutes=read(`edit-minutes-${index}`),seconds=read(`edit-seconds-${index}`);
          const total=minutes*60+seconds;if(seconds>59||!Number.isSafeInteger(total))throw Error('Use whole minutes and seconds between 0 and 59.');
          updated.sessions[index].jumpedSeconds=total;
          // A shorter total cannot contain a longer continuous challenge attempt.
          if(updated.sessions[index].seconds>total)updated.sessions[index].seconds=total;
        }
      }
      jumpers.save(updated);data=updated;close();render();toast('Progress updated. Nice work keeping your records right.');
    }catch(e){document.querySelector('#edit-day-error').textContent=e.message.includes('whole')?e.message:'Could not save changes. Your previous progress is unchanged.';}
  };
})();
