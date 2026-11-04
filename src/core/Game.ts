import {MeshStandardMaterial,Raycaster,Vector2} from 'three';
import {SceneManager} from './SceneManager';
import {PhysicsWorld} from './PhysicsWorld';
import {BuildingGenerator} from '../building/BuildingGenerator';
import {ChargeManager} from '../gameplay/ChargeManager';
import {CollapseController} from '../gameplay/CollapseController';
import {ControlPanel} from '../ui/ControlPanel';
import {ResultsPanel} from '../ui/ResultsPanel';
import {AboutPanel} from '../ui/AboutPanel';
import {SCENARIOS,STEP} from '../utils/constants';
import type {BuildingNode} from '../utils/types';
export class Game {
  private scene:SceneManager;private physics!:PhysicsWorld;private building!:BuildingGenerator;private charges!:ChargeManager;private collapse!:CollapseController;
  private results:ResultsPanel;private about:AboutPanel;private hovered:BuildingNode|undefined;private inspected:BuildingNode|undefined;
  private ray=new Raycaster();private pointer=new Vector2();private selecting=true;private showStructure=true;private accumulator=0;private last=0;private shownResult=false;
  private el(id:string){return document.getElementById(id)!;}
  constructor(host:HTMLElement){
    new ControlPanel(host);this.scene=new SceneManager(this.el('viewport'));this.results=new ResultsPanel(this.el('results-root'));this.about=new AboutPanel(this.el('about-root'));this.reset();this.bind();requestAnimationFrame(this.frame);
  }
  private reset(){if(this.building){this.building.dispose();this.physics.dispose();}this.physics=new PhysicsWorld();this.building=new BuildingGenerator(this.physics);this.scene.scene.add(this.building.root);this.charges=new ChargeManager(this.building.graph);this.collapse=new CollapseController(this.physics,this.building);this.results.clear();this.hovered=undefined;this.inspected=undefined;this.accumulator=0;this.shownResult=false;this.el('time').textContent='0.00 s';this.el('travel').textContent='0.00 m';this.toast('Click a support node to begin your experiment.');this.refresh();}
  private toast(s:string){this.el('toast').textContent=s;}
  private bind(){
    this.el('detonate').onclick=()=>{if(!this.charges.selected.length)return;this.collapse.detonate();this.toast('Support constraints released. Observe the gravity-driven response.');this.refresh();};
    this.el('pause').onclick=()=>{this.collapse.togglePause();this.accumulator=0;this.refresh();};this.el('reset').onclick=()=>{this.reset();this.toast('Structure rebuilt. Configure a new experiment.');};
    this.el('clear').onclick=()=>{if(this.collapse.state==='configuring'){this.charges.clear();this.refresh();}};
    this.el('select').onclick=()=>{this.selecting=!this.selecting;this.refresh();};this.el('structure').onclick=()=>{this.showStructure=!this.showStructure;this.refresh();};this.el('about').onclick=()=>this.about.show();
    document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.onclick=()=>{if(this.collapse.state!=='configuring')return;const preset=SCENARIOS[Number(b.dataset.preset)];this.charges.preset(preset.nodes);this.toast(preset.description);this.refresh();});
    const canvas=this.scene.renderer.domElement;let down={x:0,y:0};
    canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('pointermove',e=>{this.hovered=this.pick(e);canvas.style.cursor=this.hovered&&this.selecting?'pointer':'grab';if(this.hovered)this.inspected=this.hovered;this.updateNode();this.updateMarkers();});
    canvas.addEventListener('pointerleave',()=>{this.hovered=undefined;this.updateMarkers();});
    canvas.addEventListener('pointerup',e=>{if(e.button!==0||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const n=this.pick(e);if(!n)return;this.inspected=n;if(this.collapse.state==='configuring'&&this.selecting){const ok=this.charges.toggle(n.nodeId);this.toast(ok?`${n.nodeId}: ${n.selected?'module configured':'module removed'}.`:'Module limit reached. Remove a configured node first.');}this.refresh();});
  }
  private pick(e:PointerEvent){if(!this.showStructure)return;const r=this.scene.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.scene.camera);const hits=this.ray.intersectObjects(this.building.graph.nodes.map(n=>n.marker));return hits.length?this.building.graph.nodes.find(n=>n.nodeId===hits[0].object.userData.nodeId):undefined;}
  private updateMarkers(){for(const line of this.building.supportLines)line.visible=this.showStructure;for(const n of this.building.graph.nodes){const mat=n.marker.material as MeshStandardMaterial;const color=n.failed?0xff6860:n.selected?0xffb35e:0x64e2de;mat.color.setHex(color);mat.emissive.setHex(color);mat.emissiveIntensity=n===this.hovered?1.3:.45;n.marker.scale.setScalar(n===this.hovered?1.5:n.selected?1.22:1);n.marker.visible=this.showStructure;}}
  private updateNode(){const n=this.inspected;this.el('node-details').innerHTML=n?`<b>${n.nodeId}</b><span>${n.supportGroup}</span><span>Position: ${n.position.x.toFixed(1)}, ${n.position.y.toFixed(1)}, ${n.position.z.toFixed(1)} m</span><span class="node-status">${n.failed?'FAILED':n.selected?'PENDING FAILURE':'ACTIVE SUPPORT'}</span>`:'Hover or select a support node in the 3D view.';}
  private refresh(){
    const state=this.collapse.state;const configuring=state==='configuring';const count=this.charges.selected.length;
    this.el('module-count').textContent=`${count} / 4`;this.el('module-slots').innerHTML=Array.from({length:4},(_,i)=>`<span class="${i<count?'filled':''}">${i<count?'◆':'+'}</span>`).join('');
    this.el('configured').innerHTML=this.charges.selected.map(n=>`<span>${n.nodeId} <i>${n.failed?'FAILED':'READY'}</i></span>`).join('')||'No modules placed';
    for(const id of ['clear','select']) (this.el(id) as HTMLButtonElement).disabled=!configuring;
    document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.disabled=!configuring);
    (this.el('detonate') as HTMLButtonElement).disabled=!configuring||count===0;
    (this.el('pause') as HTMLButtonElement).disabled=!['running','paused'].includes(state);this.el('pause').textContent=state==='paused'?'▶ Resume':'Ⅱ Pause';
    this.el('select').classList.toggle('active',this.selecting);this.el('select').setAttribute('aria-pressed',String(this.selecting));this.el('structure').classList.toggle('active',this.showStructure);this.el('structure').setAttribute('aria-pressed',String(this.showStructure));
    this.el('state').textContent=`● ${state.toUpperCase()}`;this.el('supported').textContent=`${this.building.graph.supportedComponents().size-1} / 5`;this.updateNode();this.updateMarkers();
  }
  private frame=(now:number)=>{const delta=Math.min((now-this.last)/1000,.1);this.last=now;if(this.collapse.state==='running'){this.accumulator+=delta;while(this.accumulator>=STEP&&this.collapse.state==='running'){this.collapse.step();this.accumulator-=STEP;}this.el('time').textContent=`${this.collapse.elapsed.toFixed(2)} s`;this.el('travel').textContent=`${this.collapse.score.maxDisplacement.toFixed(2)} m`;if(this.collapse.result&&!this.shownResult){this.shownResult=true;this.results.show(this.collapse.result);this.el('retry').onclick=()=>this.reset();this.refresh();}}else this.accumulator=0;this.scene.render();requestAnimationFrame(this.frame);};
}
