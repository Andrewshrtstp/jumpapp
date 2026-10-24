const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
async function scenario({offline=false,workout=false,allow=true}={}){
 const button={classList:{add(){},remove(){}},setAttribute(){},addEventListener(_,fn){this.click=fn}};
 let target=null,message=null,requests=0;
 vm.runInNewContext(fs.readFileSync('dist/refresh.js','utf8'),{document:{querySelector:s=>s==='#refresh-app'?button:{open:workout}},confirm:()=>allow,persist:()=>true,URL,Date,location:{href:'https://andrewshrtstp.github.io/jumpapp/?old=1',replace:v=>target=v},fetch:async(u,o)=>{requests++;assert.equal(o.cache,'no-store');if(offline)throw Error();return {ok:true,json:async()=>({version:'0123456789abcdef'})}},toast:m=>message=m});
 await button.click();return {target,message,requests,button};
}
(async()=>{
 let r=await scenario();assert.match(r.target,/app-version=0123456789abcdef/);assert.match(r.target,/reload=/);
 r=await scenario({offline:true});assert.equal(r.target,null);assert.equal(r.button.disabled,false);assert.match(r.message,/progress is safe/);
 r=await scenario({workout:true,allow:false});assert.equal(r.requests,0);assert.equal(r.target,null);
 console.log('Fresh release reload, offline recovery and workout cancellation checks passed.');
})();
