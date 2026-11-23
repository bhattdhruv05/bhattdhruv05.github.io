(() => {
  'use strict';

  const select = document.querySelector('#feature-project');
  const plate = document.querySelector('#featured-preview');
  if (!select || !plate) return;
  const link = select.parentElement.querySelector('.feature-arrow');
  const previews = new Map([['gripper', [...plate.children]]]);
  const { entries } = window.portfolioMapData;
  const images = {
    elmex: ['assets/high-res/inspection-bed.webp', 'Terminal link beneath the machine vision inspection cameras'],
    cam: ['assets/high-res/gearbox-cam.webp', 'Milling simulation for a gearbox housing']
  };
  const scenes = { assembly: 'assembly', irp: 'copper', iep: 'fatigue' };

  function update() {
    const id = select.value;
    const title = entries[id].title;
    link.href = 'projects/#' + id;
    link.setAttribute('aria-label', 'Open the ' + title + ' case study');
    if (previews.has(id)) {
      plate.replaceChildren(...previews.get(id));
      return;
    }
    const media = document.createElement('div');
    media.className = 'feature-media';
    previews.set(id, [media]);
    plate.replaceChildren(media);
    if (id === 'ifs') window.mountFemVisual(media);
    else if (scenes[id]) media.append(window.portfolioScenes.preview(scenes[id]));
    else {
      const img = new Image();
      [img.src, img.alt] = images[id];
      img.className = 'feature-image';
      media.append(img);
    }
  }

  select.addEventListener('change', update);
  if (select.value !== 'gripper') update();
})();
