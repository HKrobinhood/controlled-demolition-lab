import type {BuildingNode, SupportConnection} from '../utils/types';
import type {PhysicsWorld} from '../core/PhysicsWorld';
export class StructuralGraph {
  nodes: BuildingNode[]=[];
  connections: SupportConnection[]=[];
  setPending(){for(const c of this.connections)c.state=this.nodes.find(n=>n.nodeId===c.nodeId)?.selected?'pending':'active';}
  failConfigured(physics:PhysicsWorld){
    const fail=(c:SupportConnection)=>{physics.world.removeImpulseJoint(c.joint,true);c.state='failed';const n=this.nodes.find(n=>n.nodeId===c.nodeId)!;n.failed=true;};
    for(const c of this.connections)if(c.state==='pending')fail(c);
    // Abstract support dependency rule: an entirely ungrounded storey cannot
    // sustain the idealized support modules above it. This is not material fracture.
    const grounded=this.supportedComponents();
    for(const c of this.connections)if(c.state!=='failed'&&!grounded.has(c.lowerId))fail(c);
    physics.world.forEachRigidBody(b=>{if(b.isDynamic())b.wakeUp();});
  }
  supportedComponents(){
    const connected=new Set(['foundation']);let changed=true;
    while(changed){changed=false;for(const c of this.connections){if(c.state==='failed')continue;if(connected.has(c.lowerId)&&!connected.has(c.upperId)){connected.add(c.upperId);changed=true;}}}
    return connected;
  }
  get failedCount(){return this.connections.filter(c=>c.state==='failed').length;}
}
