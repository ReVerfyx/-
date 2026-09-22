// Headless logic checks. DOM/Canvas are stubs; this does not verify browser layout.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map(),storage=new Map(),children=[];
const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function element(id){if(!elements.has(id))elements.set(id,{style:{},dataset:{},classList:{toggle(){}},appendChild(e){children.push(e)},addEventListener(){},setPointerCapture(){},getContext(){return ctx}});return elements.get(id)}
const box={console,Math,JSON,document:{getElementById:element,querySelectorAll:()=>children,createElement:()=>({dataset:{},classList:{toggle(){}}}),addEventListener(){}},window:{addEventListener(){}},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)},innerWidth:900,innerHeight:420,devicePixelRatio:1,requestAnimationFrame(){},confirm:()=>true};
vm.createContext(box);vm.runInContext(code,box);
function run(s){return vm.runInContext(s,box)}
let checks=0;function check(name,body){body();checks++;console.log('PASS '+name)}
check('Projection round trip',()=>assert(run('(()=>{let p=project(10,23),q=unproject(p.x,p.y);return Math.abs(q.x-10)<1e-8&&Math.abs(q.y-23)<1e-8})()')));
check('Occupied cells rejected and resource placement exists',()=>assert(run("!valid('tower',16,16)&&(()=>{for(let x=2;x<30;x++)for(let y=2;y<30;y++)if(valid('wood',x,y))return true;return false})()")));
check('Economic production',()=>{run("fresh();S.buildings.push(make('wood',12,12),make('stone',13,12));update(1)");assert(run('S.wood>210&&S.stone>150&&S.food>160'))});
check('Recruitment and population cap',()=>{run("fresh();selected=make('barracks',12,12);S.buildings.push(selected);panel();document.getElementById('sword').onclick()");assert.equal(run('S.units.length'),7);run('S.food=9999;for(let i=0;i<30;i++)document.getElementById("sword").onclick()');assert.equal(run('S.units.length'),run('cap()'))});
check('Upgrade and repair charge resources',()=>{run("fresh();selected=S.buildings[0];panel();document.getElementById('upgrade').onclick()");assert.equal(run('selected.level'),2);run("selected.hp-=400;panel();document.getElementById('repair').onclick()");assert.equal(run('selected.max-selected.hp'),100)});
check('Wave cannot start twice',()=>{run('fresh();wave();wave()');assert.equal(run('S.wave'),1);assert.equal(run('S.enemies.length'),20)});
check('Tower attack damages enemy',()=>{run("fresh();S.units=[];S.enemies=[{x:19,y:16,hp:100,max:100,t:'raider',cd:1}];update(.1)");assert(run('S.enemies[0].hp<100'))});
check('Walls block and receive melee damage',()=>{run("fresh();S.buildings.push(make('wall',10,10));let e={x:9,y:10,hp:100,max:100,cd:0,t:'raider'};move(e,{x:11,y:10},1,.8,true)");assert(run("at(10,10).hp<at(10,10).max"))});
check('Save/load preserves state',()=>{run('fresh();S.wood=321;wave();save();fresh();load()');assert.equal(run('S.wood'),321);assert.equal(run('S.enemies.length'),20)});
check('Defeat when keep destroyed',()=>{run('fresh();S.buildings[0].hp=0;update(.1)');assert.equal(run('S.ended'),'lost')});
check('Ten waves reach victory',()=>{run('fresh();for(let i=0;i<10;i++){wave();S.enemies.forEach(e=>e.hp=0);update(.1)}');assert.equal(run('S.ended'),'won')});
check('Unassisted battle simulation has finite state and terminates',()=>{run('fresh();wave();for(let i=0;i<12000&&!S.ended;i++)update(.05)');assert(run('Number.isFinite(S.wood)&&Number.isFinite(S.food)&&S.enemies.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y))'));assert(run('S.wave>1||S.ended!==null'))});
console.log(checks+' logic checks passed. No Android or visual validation.');
