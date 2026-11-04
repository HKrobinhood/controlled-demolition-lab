import assert from 'node:assert/strict';
import {PhysicsWorld} from '../src/core/PhysicsWorld';
import {BuildingGenerator} from '../src/building/BuildingGenerator';
import {ChargeManager} from '../src/gameplay/ChargeManager';
import {CollapseController} from '../src/gameplay/CollapseController';
import {SCENARIOS,DURATION,STEP} from '../src/utils/constants';
await PhysicsWorld.initialize();
const results=[];
for(const scenario of SCENARIOS){
 const physics=new PhysicsWorld();const building=new BuildingGenerator(physics);const charges=new ChargeManager(building.graph);const collapse=new CollapseController(physics,building);
 charges.preset(scenario.nodes);
 assert.equal(charges.selected.length,scenario.nodes.length);
 assert.equal(building.graph.failedCount,0,'Configuration must not release joints');
 assert.equal(physics.world.impulseJoints.len(),20);
 collapse.detonate();assert.ok(building.graph.failedCount>=scenario.nodes.length);
 assert.equal(physics.world.impulseJoints.len(),20-building.graph.failedCount);
 for(let i=0;i<Math.ceil(DURATION/STEP)+2;i++)collapse.step();
 const result=collapse.result!;assert.ok(result);assert.ok(Number.isFinite(result.remainingHeight));
 results.push(result);console.log(scenario.name,JSON.stringify(result,null,2));
 building.dispose();physics.dispose();
}
assert.equal(results[0].result,'Partially stable');assert.ok(results[0].maxDisplacement<.25);
assert.ok(results[1].maxDisplacement>2,'Edge supports must produce lateral movement');
assert.ok(results[2].remainingHeight<4,'Full base release must settle near the ground');
assert.ok(results[1].maxDisplacement>results[2].maxDisplacement+1);
assert.ok(results[0].remainingHeight>results[2].remainingHeight+8);
// Rebuild must restore all independent bodies and constraints.
const physics=new PhysicsWorld();const building=new BuildingGenerator(physics);const charges=new ChargeManager(building.graph);
assert.equal(building.components.length,5);assert.equal(physics.world.impulseJoints.len(),20);assert.equal(charges.selected.length,0);
for(const n of ['F1-A','F1-B','F1-C','F1-D'])assert.ok(charges.toggle(n));assert.equal(charges.toggle('F2-A'),false);charges.clear();assert.equal(charges.selected.length,0);
const collapse=new CollapseController(physics,building);charges.preset(['F1-A']);collapse.detonate();collapse.togglePause();collapse.step();assert.equal(collapse.elapsed,0);collapse.togglePause();collapse.step();assert.ok(collapse.elapsed>0);
building.dispose();physics.dispose();
console.log('PASS: Three distinct physics responses, module limit, clear, reset and pause/resume.');
