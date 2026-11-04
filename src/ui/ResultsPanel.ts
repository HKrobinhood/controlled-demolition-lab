import type {ExperimentResult} from '../utils/types';
export class ResultsPanel {
  constructor(private host:HTMLElement){}
  show(r:ExperimentResult){this.host.innerHTML=`<section class="result-card" aria-label="Experiment results"><div class="eyebrow">EXPERIMENT COMPLETE · ${r.elapsed.toFixed(1)} SECONDS <button id="dismiss-results" aria-label="Close results">×</button></div><h2>${r.result}</h2><div class="score">${r.score}<span>/ 100 · FINAL SCORE</span></div><dl>${[
    ['Configured Nodes',r.configuredNodes],['Failed Connections',r.failedConnections],['Maximum Horizontal Displacement',`${r.maxDisplacement.toFixed(2)} m`],['Remaining Building Height',`${r.remainingHeight.toFixed(2)} m`],['Protected Zone Collisions',r.protectedCollisions],['Target Zone Reached',r.targetEntered?'Yes':'No'],['Simulation Result',r.result]
  ].map(([label,v])=>`<div><dt>${label}</dt><dd>${v}</dd></div>`).join('')}</dl><div class="section-label">WHAT THE STRUCTURE TELLS US</div>${r.feedback.map(s=>`<p>${s}</p>`).join('')}<button id="retry" class="primary">Reset & experiment again ↗</button></section>`;this.host.querySelector('#dismiss-results')!.addEventListener('click',()=>this.clear());}
  clear(){this.host.innerHTML='';}
}
