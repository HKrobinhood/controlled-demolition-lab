import './style.css';
import {PhysicsWorld} from './core/PhysicsWorld';
import {Game} from './core/Game';
import {StartPanel} from './ui/StartPanel';

const host = document.getElementById('app')!;
new StartPanel(host, async () => {
  await PhysicsWorld.initialize();
  new Game(host);
});
