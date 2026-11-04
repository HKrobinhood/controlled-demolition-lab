import RAPIER from '@dimforge/rapier3d-compat';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,SphereGeometry,Vector3,Line,BufferGeometry,LineBasicMaterial} from 'three';
import {CORNERS,FLOORS,STOREY} from '../utils/constants';
import {PhysicsWorld} from '../core/PhysicsWorld';
import {BuildingComponent} from './BuildingComponent';
import {StructuralGraph} from './StructuralGraph';
export class BuildingGenerator {
  readonly root=new Group();readonly supportLines:Line[]=[];readonly graph=new StructuralGraph();readonly components:BuildingComponent[]=[];
  constructor(physics:PhysicsWorld){
    const slabMat=new MeshStandardMaterial({color:0x506d80,roughness:.8,metalness:.2});
    const beamMat=new MeshStandardMaterial({color:0x293840,roughness:.65});
    const columnMat=new MeshStandardMaterial({color:0xa8b7be,roughness:.7});
    const box=(g:Group,w:number,h:number,d:number,x:number,y:number,z:number,mat:MeshStandardMaterial)=>{const m=new Mesh(new BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
    for(let i=0;i<FLOORS;i++){
      const y=(i+1)*STOREY;
      const body=physics.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,y,0).setLinearDamping(.12).setAngularDamping(.15).setCanSleep(true).setCcdEnabled(true));
      const collider=physics.world.createCollider(RAPIER.ColliderDesc.cuboid(3,.16,2.5).setDensity(1).setFriction(.7).setRestitution(0).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),body);
      physics.floorHandles.add(collider.handle);
      const group=new Group();box(group,6,.32,5,0,0,0,slabMat);
      for(const z of [-2.2,2.2])box(group,5.7,.25,.24,0,-.3,z,beamMat);
      for(const x of [-2.7,2.7])box(group,.24,.25,4.6,x,-.3,0,beamMat);
      // Columns are visual support modules. Only slabs have collision/mass.
      const component=new BuildingComponent(`floor-${i+1}`,body,group);component.sync();this.components.push(component);this.root.add(group);
      CORNERS.forEach((c,index)=>{
        const nodeId=`F${i+1}-${'ABCD'[index]}`;
        const column=box(group,.19,2.6,.19,c.x,-1.65,c.z,columnMat);
        const marker=new Mesh(new SphereGeometry(.19,16,12),new MeshStandardMaterial({color:0x64e2de,emissive:0x1b8888,emissiveIntensity:.8,roughness:.25}));
        const line=new Line(new BufferGeometry().setFromPoints([new Vector3(c.x+.14,-3,c.z),new Vector3(c.x+.14,0,c.z)]),new LineBasicMaterial({color:0x64e2de,transparent:true,opacity:.35}));
        group.add(line);this.supportLines.push(line);
        marker.position.set(c.x,-2.55,c.z);marker.userData.nodeId=nodeId;marker.userData.column=column;group.add(marker);
        this.graph.nodes.push({nodeId,floorIndex:i+1,position:new Vector3(c.x,y-2.55,c.z),supportGroup:`Storey ${i+1} / corner ${'ABCD'[index]}`,selected:false,failed:false,marker});
        const lower=i===0?physics.ground:this.components[i-1].body;
        const joint=physics.world.createImpulseJoint(RAPIER.JointData.spherical({x:c.x,y:0,z:c.z},{x:c.x,y:-STOREY,z:c.z}),lower,body,true);
        joint.setContactsEnabled(false);
        this.graph.connections.push({id:`support-${nodeId}`,nodeId,lowerId:i===0?'foundation':`floor-${i}`,upperId:component.id,joint,state:'active'});
      });
    }
  }
  sync(){for(const c of this.components)c.sync();for(const n of this.graph.nodes){n.marker.getWorldPosition(n.position);n.marker.userData.column.visible=!n.failed;}}
  dispose(){this.root.traverse(o=>{if(o instanceof Mesh||o instanceof Line){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.root.removeFromParent();}
}
