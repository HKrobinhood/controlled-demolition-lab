import {Group,Vector3,Quaternion} from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
export class BuildingComponent {
  readonly initial:Vector3;
  constructor(public id:string,public body:RAPIER.RigidBody,public mesh:Group){this.initial=new Vector3().copy(body.translation());}
  sync(){this.mesh.position.copy(this.body.translation());this.mesh.quaternion.copy(this.body.rotation() as Quaternion);}
}
