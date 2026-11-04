import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TARGET,PROTECTED} from '../utils/constants';
export class SceneManager {
  readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(43,1,.1,180);
  readonly renderer=new THREE.WebGLRenderer({antialias:true});readonly controls:OrbitControls;
  constructor(private host:HTMLElement){
    this.scene.background=new THREE.Color(0x142127);this.scene.fog=new THREE.Fog(0x142127,45,100);
    this.camera.position.set(25,21,29);this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    host.append(this.renderer.domElement);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,6.5,0);this.controls.enableDamping=true;this.controls.minDistance=10;this.controls.maxDistance=65;this.controls.maxPolarAngle=Math.PI/2-.03;
    this.scene.add(new THREE.HemisphereLight(0xc8f5ff,0x48514b,2));const sun=new THREE.DirectionalLight(0xffe5bd,3);sun.position.set(12,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:.1,far:90});sun.shadow.bias=-.0005;this.scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x233137,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;this.scene.add(ground);
    const grid=new THREE.GridHelper(100,100,0x52656c,0x33464d);grid.position.y=.015;this.scene.add(grid);
    for(const [zone,color] of [[TARGET,0x70d698],[PROTECTED,0xf17771]] as const){const mesh=new THREE.Mesh(new THREE.BoxGeometry(zone.halfX*2,.04,zone.halfZ*2),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.12,depthWrite:false}));mesh.position.set(zone.x,.035,zone.z);this.scene.add(mesh);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity:.7}));edges.position.copy(mesh.position);this.scene.add(edges);}
    const zoneWall=new THREE.Mesh(new THREE.BoxGeometry(PROTECTED.halfX*2,2,PROTECTED.halfZ*2),new THREE.MeshBasicMaterial({color:0xf17771,transparent:true,opacity:.06,depthWrite:false}));zoneWall.position.set(PROTECTED.x,1,0);this.scene.add(zoneWall);
    new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  }
  resize(){const {clientWidth:w,clientHeight:h}=this.host;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
  render(){this.controls.update();this.renderer.render(this.scene,this.camera);}
}
