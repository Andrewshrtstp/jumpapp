(() => {
  // Chapter boundaries from Eddie Jumps' Learn How To Jump Rope in 2026.
  const lessons=[
    {title:'Choose and size your rope',start:19,end:84,note:'Watch the rope-choice and length demonstrations before your first session.'},
    {title:'Get ready to jump',start:84,end:121,note:'A quick look at preparation and gear.'},
    {title:'Find your timing',start:121,end:171,note:'Practise the warm-up and timing drills before adding more jumps.'},
    {title:'Learn the basic bounce',start:171,end:229,note:'Watch the basic-bounce form demonstration, then try a few easy repetitions.'},
    {title:'Fine-tune your arms and wrists',start:229,end:317,note:'Compare your rope-turning motion with the demonstration.'},
    {title:'Build a steady routine',start:317,note:'Finish with the chapter on endurance and regular practice.'}
  ];
  const list=document.querySelector('#tutorial-lessons'),host=document.querySelector('#tutorial-player');
  const time=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  function select(index){
    const lesson=lessons[index];
    const frame=document.createElement('iframe');
    const url=new URL('https://www.youtube-nocookie.com/embed/cArqTlZXQ2Y');
    url.searchParams.set('start',lesson.start);if(lesson.end)url.searchParams.set('end',lesson.end);
    url.searchParams.set('playsinline','1');url.searchParams.set('rel','0');
    frame.src=url.href;frame.title=`Eddie Jumps: ${lesson.title}`;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
    host.replaceChildren(frame);
    document.querySelector('#tutorial-now').textContent=lesson.title;
    const fallback=document.querySelector('#tutorial-external');fallback.href=`https://www.youtube.com/watch?v=cArqTlZXQ2Y&t=${lesson.start}s`;fallback.textContent='Watch this lesson on YouTube ↗';
    list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  }
  lessons.forEach((lesson,index)=>{
    const button=document.createElement('button');button.type='button';button.className='tutorial-lesson';button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="lesson-number">${String(index+1).padStart(2,'0')}</span><span><strong>${lesson.title}</strong><small>${lesson.note}</small><span class="lesson-time">${time(lesson.start)}${lesson.end?` – ${time(lesson.end)}`:' onward'}</span></span><span aria-hidden="true">▷</span>`;
    button.onclick=()=>select(index);list.append(button);
  });
  document.querySelector('#tutorial-load').onclick=()=>select(0);
  // Stop playback when leaving The plan, including audio in a hidden tab panel.
  document.querySelectorAll('.nav').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.view!=='journey'&&host.querySelector('iframe')){
      host.replaceChildren();const load=document.createElement('button');load.type='button';load.className='tutorial-cover';load.innerHTML='<span aria-hidden="true">▶</span><strong>Watch a quick lesson</strong><small>Learn with Eddie Jumps</small>';load.onclick=()=>select(0);host.append(load);
      document.querySelector('#tutorial-now').textContent='Pick a lesson to get started';list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    }
  }));
})();
