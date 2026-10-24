const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup({ios=false,standalone=false,dismissed=false}={}){
 const nodes=new Map(),events={};let prompted=0;
 const get=s=>{if(!nodes.has(s))nodes.set(s,{hidden:false,textContent:'',open:false,close(){this.open=false},showModal(){this.open=true}});return nodes.get(s)};
 const ctx={document:{querySelector:get},navigator:{userAgent:ios?'iPhone':'Android',platform:ios?'iPhone':'Linux',maxTouchPoints:1},matchMedia:()=>({matches:standalone,addEventListener(){}}),localStorage:{getItem:()=>dismissed?String(Date.now()):null,setItem(){}},addEventListener:(k,f)=>events[k]=f,Date};
 vm.runInNewContext(fs.readFileSync('dist/install.js','utf8'),ctx);
 return {get,events,prompted:()=>prompted,prompt:()=>({preventDefault(){},prompt:async()=>{prompted++},userChoice:Promise.resolve({outcome:'accepted'})})};
}
(async()=>{
 let a=setup({ios:true});assert.equal(a.get('#install-hint').hidden,false);await a.get('#install-action').onclick();assert.equal(a.get('#install-help').open,true);assert.match(a.get('#install-instructions').textContent,/Safari/);
 a=setup();assert.equal(a.get('#install-hint').hidden,true);a.events.beforeinstallprompt(a.prompt());assert.equal(a.get('#install-hint').hidden,false);await a.get('#install-action').onclick();assert.equal(a.prompted(),1);a.events.appinstalled();assert.equal(a.get('#install-hint').hidden,true);assert.equal(a.get('#install-settings').hidden,true);
 a=setup({ios:true,standalone:true});assert.equal(a.get('#install-hint').hidden,true);
 a=setup({ios:true,dismissed:true});assert.equal(a.get('#install-hint').hidden,true);assert.equal(a.get('#install-settings').hidden,false);
 const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));for(const icon of manifest.icons)assert.ok(fs.existsSync('dist/'+icon.src));assert.equal(manifest.start_url,'./');assert.equal(manifest.display,'standalone');
 console.log('Install prompt, iOS instructions, dismissal, installed mode and manifest checks passed.');
})();
