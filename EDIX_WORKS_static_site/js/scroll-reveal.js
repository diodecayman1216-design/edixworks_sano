// 変更：各セクションが画面に入ったとき、一度だけフェードインさせる。
(() => {
  // 動きを減らす設定や非対応ブラウザでは、そのまま内容を表示する。
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const sections = document.querySelectorAll('main > section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    // 高さのあるセクションも、先端が画面内に入った時点で表示する。
    rootMargin: '0px 0px -40px 0px',
    threshold: 0,
  });

  sections.forEach((section) => {
    section.classList.add('scroll-reveal');
  });

  // 初期状態を描画してから監視を開始し、最初のヒーローにも適用する。
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sections.forEach((section) => observer.observe(section));
    });
  });
})();
