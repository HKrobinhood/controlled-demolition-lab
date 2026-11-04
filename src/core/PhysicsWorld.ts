import RAPIER from '@dimforge/rapier3d-compat';
import {STEP,PROTECTED} from '../utils/constants';
export class PhysicsWorld {
  readonly world: RAPIER.World;
  readonly events = new RAPIER.EventQueue(true);
  readonly floorHandles = new Set<number>();
  readonly protectedHits = new Set<number>();
  readonly groundHits = new Set<number>();
  readonly ground: RAPIER.RigidBody;
  readonly zoneHandle:number;
  readonly groundHandle:number;
  static async initialize(){await RAPIER.init();}
  constructor(){
    this.world = new RAPIER.World({x:0,y:-9.81,z:0});
    this.world.timestep=STEP;
    this.world.numSolverIterations=16;
    this.ground=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    this.groundHandle=this.world.createCollider(RAPIER.ColliderDesc.cuboid(50,.25,50).setTranslation(0,-.25,0).setFriction(.8).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),this.ground).handle;
    this.zoneHandle=this.world.createCollider(RAPIER.ColliderDesc.cuboid(PROTECTED.halfX,15,PROTECTED.halfZ).setTranslation(PROTECTED.x,15,PROTECTED.z).setSensor(true).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)).handle;
  }
  step(){this.world.step(this.events);this.events.drainCollisionEvents((a,b,started)=>{
    if(!started)return;
    for(const [special,set] of [[this.zoneHandle,this.protectedHits],[this.groundHandle,this.groundHits]] as const){
      if(a===special&&this.floorHandles.has(b))set.add(b);
      if(b===special&&this.floorHandles.has(a))set.add(a);
    }
  });}
  dispose(){this.events.free();this.world.free();}
}
