import type {StructuralGraph} from '../building/StructuralGraph';
import {MAX_MODULES} from '../utils/constants';
export class ChargeManager {
  constructor(private graph:StructuralGraph){}
  get selected(){return this.graph.nodes.filter(n=>n.selected);}
  toggle(id:string){const n=this.graph.nodes.find(n=>n.nodeId===id);if(!n)return false;if(!n.selected&&this.selected.length>=MAX_MODULES)return false;n.selected=!n.selected;this.graph.setPending();return true;}
  clear(){for(const n of this.graph.nodes)n.selected=false;this.graph.setPending();}
  preset(ids:string[]){this.clear();for(const id of ids)this.toggle(id);}
}
