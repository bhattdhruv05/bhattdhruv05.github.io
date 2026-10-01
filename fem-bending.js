(() => {
  function mount(root) {
    root.classList.add('fem-visual');
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', 'Illustrative front view of a thin strip: tool bends it, it springs back, then a corrected bend reaches the target angle.');
    root.innerHTML = `
      <svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
        <path class="fem-grid" d="M20 35H185 M20 65H185 M20 95H185 M20 125H185 M45 20V130 M85 20V130 M125 20V130 M165 20V130"/>
        <path class="fem-reference" d="M78 95H181"/>
        <path class="fem-target" d="M78 95 156 35"/>
        <path class="fem-angle" d="M112 95 A34 34 0 0 0 105 74"/>
        <text class="fem-label" x="116" y="56">target 38°</text>
        <rect class="fem-clamp" x="21" y="78" width="19" height="35" rx="2"/>
        <path class="fem-base" d="M39 95H78"/>
        <path class="fem-strip" d="M78 95H177"/>
        <circle class="fem-hinge" cx="78" cy="95" r="3"/>
        <text class="fem-phase phase-load" x="100" y="146" text-anchor="middle">TOOL BEND 38°</text>
        <text class="fem-phase phase-free" x="100" y="146" text-anchor="middle">SPRINGBACK 31°</text>
        <text class="fem-phase phase-correct" x="100" y="146" text-anchor="middle">CORRECTED TOOL 45°</text>
        <text class="fem-phase phase-final" x="100" y="146" text-anchor="middle">FINAL ANGLE 38°</text>
      </svg>`;
  }
  window.mountFemVisual = mount;
  document.querySelectorAll('.fem-visual').forEach(mount);
})();
