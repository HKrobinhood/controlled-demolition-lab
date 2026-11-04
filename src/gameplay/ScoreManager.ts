import {Box3} from 'three';
import type {BuildingGenerator} from '../building/BuildingGenerator';
import type {PhysicsWorld} from '../core/PhysicsWorld';
import type {ExperimentResult} from '../utils/types';
import {MAX_MODULES,TARGET} from '../utils/constants';
export class ScoreManager {
  maxDisplacement=0;remainingHeight=15.16;targetEntered=false;
  constructor(private building:BuildingGenerator,private physics:PhysicsWorld){}
  sample(){let top=0;for(const c of this.building.components){const p=c.body.translation();this.maxDisplacement=Math.max(this.maxDisplacement,Math.hypot(p.x-c.initial.x,p.z-c.initial.z));const b=new Box3().setFromObject(c.mesh);top=Math.max(top,b.max.y);if(p.y<1&&Math.abs(p.x-TARGET.x)<TARGET.halfX&&Math.abs(p.z-TARGET.z)<TARGET.halfZ)this.targetEntered=true;}this.remainingHeight=top;}
  finish(elapsed:number):ExperimentResult {
    this.sample();const tilted=this.maxDisplacement>1;const collapsed=this.remainingHeight<7;
    const result=collapsed?'Extensive collapse':tilted?'Significant tilt':'Partially stable';
    const count=this.building.graph.nodes.filter(n=>n.selected).length;
    const protectedCollisions=this.physics.protectedHits.size;
    const feedback=[collapsed?'Gravity caused the unsupported sections to descend and settle.':tilted?'The remaining edge supports allowed gravity to rotate the structure.':'The structure retained sufficient support to remain partially stable.',
      `Removing ${this.building.graph.failedCount} structural constraints changed the load-bearing system.`,
      protectedCollisions?'The moving slabs entered the protected zone. Try another support configuration.':'The protected zone remained clear of slab collisions.',
      'Compare this measured outcome with your prediction, then reset and change one support condition.'];
    return {configuredNodes:count,failedConnections:this.building.graph.failedCount,maxDisplacement:this.maxDisplacement,remainingHeight:this.remainingHeight,protectedCollisions,groundContacts:this.physics.groundHits.size,targetEntered:this.targetEntered,result,score:(protectedCollisions===0?40:0)+(this.targetEntered?30:0)+20+(count<=MAX_MODULES?10:0),feedback,elapsed};
  }
}
