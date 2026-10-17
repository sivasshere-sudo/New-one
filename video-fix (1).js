/*!
 * video-fix.js  -  one-file fix for background video flicker / quality drops
 *
 * HOW TO USE
 * 1. Put this file next to your index.html
 * 2. Add this line just before </body>:
 *      <script src="video-fix.js"></script>
 * 3. Optional: add data-bg-video to your video tag to pick it explicitly:
 *      <video data-bg-video autoplay muted loop playsinline src="..."></video>
 *    (If you skip this, the first <video> on the page is used.)
 *
 * Tweak the settings below if needed.
 */
(function () {
  'use strict';

  // ---------- SETTINGS (change these) ----------
  var CONFIG = {
    videoSelector: 'video[data-bg-video], #bgVideo, video', // first match is used
    glassSelector: '.glass, [class*="glass"]',              // your glass panels
    maxBlurPx: 14,           // blur above this is capped (big blur = flicker)
    pageBackground: '#000',  // stops white flash while video loads
    fullScreenBackground: true, // true = make video a fixed full-screen background
    loopFixSeconds: 0.15,    // jump back to start slightly early to hide loop gap
    reduceHeavyEffectsOnMobile: true
  };

  // ---------- 1. INJECT CSS ----------
  var css = '' +
    'html,body{background:' + CONFIG.pageBackground + ';}' +

    // video as GPU-accelerated layer
    CONFIG.videoSelector.split(',').map(function (s) { return s.trim(); }).join(',') + '{' +
      'transform:translateZ(0);' +
      'will-change:transform;' +
      'backface-visibility:hidden;' +
      '-webkit-backface-visibility:hidden;' +
      'image-rendering:auto;' +
      'pointer-events:none;' +
      'object-fit:cover;' +
    '}' +

    // glass panels on their own layer, blur limited
    CONFIG.glassSelector + '{' +
      'backdrop-filter:blur(' + CONFIG.maxBlurPx + 'px) saturate(140%);' +
      '-webkit-backdrop-filter:blur(' + CONFIG.maxBlurPx + 'px) saturate(140%);' +
      'transform:translateZ(0);' +
      'backface-visibility:hidden;' +
    '}' +

    // animated things should only move with transform
    '.vf-fixed-bg{position:fixed;inset:0;width:100%;height:100%;z-index:-1;}';

  var style = document.createElement('style');
  style.id = 'video-fix-css';
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- 2. FIND VIDEO ----------
  function init() {
    var v = document.querySelector(CONFIG.videoSelector);
    if (!v) { console.warn('[video-fix] No <video> found.'); return; }

    // required attributes for reliable autoplay
    v.muted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('preload', 'auto');
    v.loop = true;
    v.disablePictureInPicture = true;
    v.setAttribute('disablepictureinpicture', '');
    v.controls = false;

    if (CONFIG.fullScreenBackground) v.classList.add('vf-fixed-bg');

    // ---------- 3. SMOOTH START (no flash of empty frame) ----------
    v.style.opacity = '0';
    v.style.transition = 'opacity .6s ease';
    var shown = false;
    function reveal() {
      if (shown) return;
      shown = true;
      v.style.opacity = '1';
    }
    v.addEventListener('canplaythrough', reveal);
    v.addEventListener('playing', reveal);
    setTimeout(reveal, 2500); // safety

    // ---------- 4. AUTOPLAY + RETRY ----------
    function tryPlay() {
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        // browser blocked autoplay: start on first user interaction
        ['click', 'touchstart', 'scroll', 'keydown'].forEach(function (e) {
          window.addEventListener(e, function once() {
            v.play();
            window.removeEventListener(e, once);
          }, { passive: true });
        });
      });
    }
    tryPlay();

    // ---------- 5. FIX LOOP JUMP ----------
    v.addEventListener('timeupdate', function () {
      if (v.duration && v.duration - v.currentTime < CONFIG.loopFixSeconds) {
        v.currentTime = 0.01;
      }
    });

    // ---------- 6. RECOVER FROM STALLS / FREEZES ----------
    var lastTime = -1, stuckCount = 0;
    setInterval(function () {
      if (document.hidden || v.paused) return;
      if (v.currentTime === lastTime) {
        stuckCount++;
        if (stuckCount >= 3) { // frozen ~3 seconds
          v.currentTime = Math.max(0, v.currentTime - 0.1);
          v.play().catch(function () {});
          stuckCount = 0;
        }
      } else {
        stuckCount = 0;
      }
      lastTime = v.currentTime;
    }, 1000);

    v.addEventListener('stalled', function () { v.load(); tryPlay(); });
    v.addEventListener('error', function () {
      console.warn('[video-fix] video error', v.error);
    });

    // ---------- 7. SAVE GPU WHEN TAB HIDDEN ----------
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) v.pause(); else tryPlay();
    });

    // ---------- 8. LIGHTER EFFECTS ON WEAK / MOBILE DEVICES ----------
    if (CONFIG.reduceHeavyEffectsOnMobile) {
      var weak = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                 (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      if (weak) {
        var lite = document.createElement('style');
        lite.textContent = CONFIG.glassSelector +
          '{backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}';
        document.head.appendChild(lite);
      }
    }

    // ---------- 9. CAP CANVAS PIXEL RATIO (if you use Three.js / canvas) ----------
    // Use this in your own code:  renderer.setPixelRatio(window.vfPixelRatio)
    window.vfPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // ---------- 10. QUALITY CHECK HINT ----------
    v.addEventListener('loadedmetadata', function () {
      if (v.videoWidth < 1280) {
        console.warn('[video-fix] Video is only ' + v.videoWidth + 'px wide. ' +
          'Low resolution causes blur on big screens. Re-encode at 1920px wide.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
