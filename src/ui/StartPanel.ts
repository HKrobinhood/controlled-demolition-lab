export class StartPanel {
  constructor(host: HTMLElement, onStart: () => Promise<void>) {
    host.innerHTML = `
      <div class="start-screen">
        <header><div class="brand"><span class="brand-icon">▦</span> FIELDWORK <span class="brand-divider">/</span><span class="brand-sub">STEM LABS</span></div><span class="start-course">STRUCTURAL STABILITY & FORCES</span></header>
        <main class="start-layout" aria-labelledby="start-title">
          <section class="start-briefing">
            <div class="eyebrow">YOUR MISSION / CONTROLLED DEMOLITION</div>
            <h1 id="start-title">Controlled<br>Demolition <span>Lab</span></h1>
            <p class="start-intro">You are a demolition engineer. Your task is to bring down an abandoned building without affecting the surrounding buildings.</p>
            <p class="start-description">Place virtual explosive modules on different structural nodes, then observe how the building responds. Choose your locations carefully: keep the collapse inside the green target zone and keep the red protected zone clear.</p>
            <ol class="mission-steps">
              <li><span>01</span><div><b>Inspect the structure</b><p>Rotate the view and explore the building’s support nodes.</p></div></li>
              <li><span>02</span><div><b>Place your virtual charges</b><p>Click cyan nodes at different locations. Use up to four modules; click again to remove one.</p></div></li>
              <li><span>03</span><div><b>Detonate, observe, improve</b><p>Run the experiment, protect the neighboring buildings, and reset to try a new configuration.</p></div></li>
            </ol>
            <button id="start-game" class="primary start-button">Start Experiment <span>↗</span></button>
            <p id="start-status" class="start-status" role="status">A virtual STEM experiment · No real explosive parameters</p>
          </section>
          <section class="mission-preview" aria-label="Mission overview: five-storey target building and protected neighboring area">
            <div class="preview-heading"><span>STRUCTURAL SURVEY</span><span>5 STOREYS / 20 NODES</span></div>
            <svg viewBox="0 0 440 460" role="img" aria-label="Diagram of the target building and neighboring buildings to protect">
              <defs><pattern id="survey-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#334a52" stroke-width=".6"/></pattern></defs>
              <rect width="440" height="460" fill="url(#survey-grid)"/>
              <path d="M45 362 172 300 300 362 172 424Z" fill="#78b99218" stroke="#85bc97"/>
              <path d="m293 336 65-33 64 33-65 34Z" fill="#d4777318" stroke="#c67d78"/>
              <g fill="#22363e" stroke="#6b8590" stroke-width="1.5"><path d="M320 324V247l34-17 34 17v77l-34 17Z"/><path d="m320 247 34 17 34-17m-34 17v77"/></g>
              <g stroke="#95aeb7" stroke-width="3"><path d="M101 336V110M171 372V146M241 336V110M171 300V74"/></g>
              ${[0,1,2,3,4].map(i => `<g transform="translate(0 ${-i*46})"><path d="m96 329 75-37 75 37-75 38Z" fill="#486470" stroke="#90abb5"/><path d="m96 329v8l75 38 75-38v-8l-75 38Z" fill="#263c46" stroke="#5a7884"/><g fill="${i===0?'#ffb35e':'#64e2de'}"><circle cx="101" cy="331" r="4"/><circle cx="171" cy="367" r="4"/><circle cx="241" cy="331" r="4"/></g></g>`).join('')}
              <g font-family="monospace" font-size="10" letter-spacing="1"><text x="48" y="444" fill="#a4cfb1">TARGET ZONE</text><text x="289" y="401" fill="#df9991">PROTECT NEIGHBORS</text><text x="43" y="39" fill="#87aaa8">SELECT NODES. CHANGE THE SUPPORTS.</text></g>
            </svg>
            <div class="mission-rule"><span>MISSION PRIORITY</span><b>Keep neighboring buildings safe.</b><p>The red zone represents the surrounding buildings you must protect.</p></div>
          </section>
        </main>
      </div>`;
    const button = host.querySelector<HTMLButtonElement>('#start-game')!;
    const status = host.querySelector<HTMLElement>('#start-status')!;
    button.onclick = async () => {
      button.disabled = true;
      button.textContent = 'Preparing the lab…';
      status.textContent = 'Initializing the 3D scene and physics simulation…';
      try {
        await onStart();
      } catch (error) {
        console.error('Laboratory initialization failed', error);
        status.textContent = 'Unable to start. Check that WebGL and WebAssembly are enabled, then try again.';
        button.textContent = 'Try Again ↗';
        button.disabled = false;
      }
    };
  }
}
