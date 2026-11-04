export const FLOORS = 5;
export const STOREY = 3;
export const STEP = 1 / 60;
export const DURATION = 18;
export const MAX_MODULES = 4;
export const CORNERS = [{x:-2.7,z:-2.2},{x:2.7,z:-2.2},{x:2.7,z:2.2},{x:-2.7,z:2.2}];
export const TARGET = {x:0,z:0,halfX:5.5,halfZ:5.5};
export const PROTECTED = {x:9,z:0,halfX:2,halfZ:5.5};
export const SCENARIOS = [
  {name:'01 · Retain support',nodes:['F1-A'],description:'Remove one corner; three supports remain.'},
  {name:'02 · Edge support',nodes:['F1-B','F1-C'],description:'Remove the east pair; observe rotation about the west edge.'},
  {name:'03 · Release foundation',nodes:['F1-A','F1-B','F1-C','F1-D'],description:'Remove all four base constraints; observe gravity-driven settling.'}
];
