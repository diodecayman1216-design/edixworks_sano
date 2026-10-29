// 変更：480px以下のWorksをスワイプとドットで操作できるようにする。
(() => {
  const track = document.querySelector('#works-carousel');
  const pagination = document.querySelector('.works__pagination');
  if (!track || !pagination) return;

  const cards = Array.from(track.querySelectorAll('.work-item'));
  if (!cards.length) return;

  const mobile = window.matchMedia('(max-width: 480px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;

  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'works__dot';
    dot.setAttribute('aria-label', `制作実績 ${index + 1} / ${cards.length}枚目を表示`);
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(index));
    pagination.appendChild(dot);
    return dot;
  });

  function updateDots(index) {
    activeIndex = index;
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === index) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function goTo(index, instant = false) {
    if (!mobile.matches) return;
    const nextIndex = Math.max(0, Math.min(index, cards.length - 1));
    // カードの実際の位置を使い、画面の回転・リサイズ後も位置を合わせる。
    const left = track.scrollLeft + cards[nextIndex].getBoundingClientRect().left
      - track.getBoundingClientRect().left;
    track.scrollTo({
      left,
      behavior: instant || reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  // スワイプ・タッチパッド・ドット操作のいずれも、現在位置からドットを更新。
  function syncPosition() {
    scrollFrame = 0;
    if (!mobile.matches) return;
    const trackLeft = track.getBoundingClientRect().left;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const gap = Math.abs(card.getBoundingClientRect().left - trackLeft);
      if (gap < distance) {
        nearest = index;
        distance = gap;
      }
    });
    updateDots(nearest);
  }

  track.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncPosition);
  }, { passive: true });

  // キーボードでも操作できるよう、スマホ表示では左右矢印・Home・Endに対応。
  track.addEventListener('keydown', (event) => {
    if (!mobile.matches || event.target !== track) return;
    const destinations = {
      ArrowLeft: activeIndex - 1,
      ArrowRight: activeIndex + 1,
      Home: 0,
      End: cards.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });

  function syncMode() {
    pagination.hidden = !mobile.matches;
    if (mobile.matches) {
      track.setAttribute('role', 'region');
      track.setAttribute('aria-roledescription', 'カルーセル');
      track.setAttribute('aria-label', '制作実績（左右にスワイプ、または矢印キーで切り替え）');
      track.tabIndex = 0;
      cards.forEach((card, index) => {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'スライド');
        card.setAttribute('aria-label', `${index + 1} / ${cards.length}`);
      });
      goTo(activeIndex, true);
    } else {
      // PCに戻ったら通常のグリッドと読み上げに戻す。
      ['role', 'aria-roledescription', 'aria-label', 'tabindex'].forEach((name) => {
        track.removeAttribute(name);
      });
      cards.forEach((card) => {
        ['role', 'aria-roledescription', 'aria-label'].forEach((name) => {
          card.removeAttribute(name);
        });
      });
      track.scrollLeft = 0;
      updateDots(0);
    }
  }

  mobile.addEventListener('change', syncMode);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => goTo(activeIndex, true));
  });

  updateDots(0);
  syncMode();
})();
