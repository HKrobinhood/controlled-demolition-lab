import type {GameState} from './GameState';
import type {PhysicsWorld} from '../core/PhysicsWorld';
import type {BuildingGenerator} from '../building/BuildingGenerator';
import {ScoreManager} from './ScoreManager';
import {DURATION,STEP} from '../utils/constants';
import type {ExperimentResult} from '../utils/types';
export class CollapseController {
  state:GameState='configuring';elapsed=0;result:ExperimentResult|null=null;readonly score:ScoreManager;
  constructor(private physics:PhysicsWorld,private building:BuildingGenerator){this.score=new ScoreManager(building,physics);}
  detonate(){if(this.state!=='configuring')return;this.building.graph.failConfigured(this.physics);this.state='running';}
  togglePause(){if(this.state==='running')this.state='paused';else if(this.state==='paused')this.state='running';}
  step(){if(this.state!=='running')return;this.physics.step();this.elapsed+=STEP;this.building.sync();this.score.sample();if(this.elapsed>=DURATION){this.state='finished';this.result=this.score.finish(this.elapsed);}}
}
