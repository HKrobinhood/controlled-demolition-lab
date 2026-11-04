import type RAPIER from '@dimforge/rapier3d-compat';
import type { Mesh, Vector3 } from 'three';
export interface BuildingNode {nodeId:string;floorIndex:number;position:Vector3;supportGroup:string;selected:boolean;failed:boolean;marker:Mesh}
export type ConnectionState = 'active' | 'pending' | 'failed';
export interface SupportConnection {id:string;nodeId:string;lowerId:string;upperId:string;joint:RAPIER.ImpulseJoint;state:ConnectionState}
export interface ExperimentResult {configuredNodes:number;failedConnections:number;maxDisplacement:number;remainingHeight:number;protectedCollisions:number;groundContacts:number;targetEntered:boolean;result:string;score:number;feedback:string[];elapsed:number}
