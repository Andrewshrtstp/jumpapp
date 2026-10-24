(() => {
  let deferred=null;
  const banner=document.querySelector('#install-hint'),button=document.querySelector('#install-action');
  const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let dismissed=false;
  try{dismissed=Date.now()-Number(localStorage.getItem('jump-club-install-dismissed')||0)<7*86400000;}catch{}
  function hide(){banner.hidden=true;}
  function refresh(){
    document.querySelector('#install-settings').hidden=installed();
    banner.hidden=installed()||dismissed||!(ios||deferred);
    button.textContent=deferred?'Install Jump Club':'Show me how';
  }
  function help(){
    const text=document.querySelector('#install-instructions');
    text.textContent=ios?'Open this page in Safari. Tap Share (the square with an upward arrow; it may be under More), then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.':'Open your browser’s menu and look for Install Jump Club, Install app, or Add to Home screen. If unavailable, open this link in Chrome on Android or Safari on iPhone.';
    document.querySelector('#profile').close();document.querySelector('#install-help').showModal();
  }
  async function install(){
    if(!deferred){help();return;}
    const prompt=deferred;deferred=null;
    try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')hide();else{dismissed=true;try{localStorage.setItem('jump-club-install-dismissed',String(Date.now()));}catch{}}}catch{help();}
    refresh();
  }
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;refresh();});
  addEventListener('appinstalled',()=>{deferred=null;dismissed=true;hide();document.querySelector('#install-settings').hidden=true;document.querySelector('#install-help').close();});
  document.querySelector('#dismiss-install').onclick=()=>{dismissed=true;try{localStorage.setItem('jump-club-install-dismissed',String(Date.now()));}catch{}hide();};
  button.onclick=install;document.querySelector('#install-settings').onclick=install;
  document.querySelector('#close-install-help').onclick=()=>document.querySelector('#install-help').close();
  matchMedia('(display-mode: standalone)').addEventListener('change',refresh);
  refresh();
})();
