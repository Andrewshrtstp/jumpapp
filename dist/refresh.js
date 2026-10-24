(() => {
  const button=document.querySelector('#refresh-app');
  button.addEventListener('click',async()=>{
    if(document.querySelector('#session').open&&!confirm('Refresh the app? Your current unfinished workout will not be saved.'))return;
    if(typeof persist==='function'&&!persist())return;
    button.disabled=true;button.classList.add('refreshing');
    button.setAttribute('aria-label','Checking for the latest version');
    try{
      const endpoint=new URL('version.json',location.href);endpoint.searchParams.set('_',Date.now());
      const response=await fetch(endpoint,{cache:'no-store'});
      if(!response.ok)throw Error('Unable to check for updates');
      const {version}=await response.json();
      if(typeof version!=='string'||!/^[a-f0-9]{16}$/.test(version))throw Error('Invalid version');
      // A new document URL bypasses a previously cached Home Screen launch page.
      // Release hashes in that document also refresh every app script and style.
      const target=new URL(location.href);target.searchParams.set('app-version',version);target.searchParams.set('reload',Date.now());
      target.hash='';location.replace(target.href);
    }catch{
      button.disabled=false;button.classList.remove('refreshing');button.setAttribute('aria-label','Refresh app');
      toast('Could not refresh. Check your connection and try again. Your progress is safe.');
    }
  });
})();
