// One atomic localStorage record, with independent data under stable jumper IDs.
// Stable IDs allow nicknames to change without moving or losing workout history.
function createJumperStore(storage, makeId=()=>crypto.randomUUID()) {
  const key='jump-club-jumpers-v1';
  const fresh=name=>({name,phase:0,sound:false,sessions:[]});
  const valid=d=>d&&typeof d.name==='string'&&Array.isArray(d.sessions)&&Number.isInteger(d.phase)&&d.phase>=0&&d.phase<3;
  let state;
  try{const saved=JSON.parse(storage.getItem(key));if(saved&&Array.isArray(saved.profiles)&&saved.profiles.length&&saved.profiles.every(p=>typeof p.id==='string'&&valid(p.data))&&new Set(saved.profiles.map(p=>p.id)).size===saved.profiles.length&&saved.profiles.some(p=>p.id===saved.active))state=saved;}catch{}
  if(!state){
    let old;
    try{old=JSON.parse(storage.getItem('jump-club-v1'));}catch{}
    const id=makeId();
    const d=valid({...old,name:typeof old?.name==='string'?old.name:''})?{...fresh('Jumper'),...old,name:old.name?.trim()||'Jumper'}:fresh('Jumper');
    state={active:id,profiles:[{id,data:d}]};
    // Retain the original storage record as a migration backup.
    try{storage.setItem(key,JSON.stringify(state));}catch{}
  }
  const copy=d=>JSON.parse(JSON.stringify(d));
  const write=next=>{storage.setItem(key,JSON.stringify(next));state=next;};
  const nameTaken=(name,except)=>state.profiles.some(p=>p.id!==except&&p.data.name.toLowerCase()===name.toLowerCase());
  const normalize=(name,except)=>{name=name.trim();if(!name||name.length>30)throw Error('Use a nickname between 1 and 30 characters.');if(nameTaken(name,except))throw Error('That nickname is already taken. Choose a different one.');return name;};
  return {
    active:()=>state.active,
    list:()=>state.profiles.map(p=>({id:p.id,name:p.data.name})),
    load:()=>copy(state.profiles.find(p=>p.id===state.active).data),
    save(data){const d=copy(data);d.name=normalize(d.name,state.active);write({...state,profiles:state.profiles.map(p=>p.id===state.active?{...p,data:d}:p)});},
    add(name){name=normalize(name);const id=makeId();write({active:id,profiles:[...state.profiles,{id,data:fresh(name)}]});return this.load();},
    switch(id){if(!state.profiles.some(p=>p.id===id))throw Error('Jumper not found.');write({...state,active:id});return this.load();}
  };
}
