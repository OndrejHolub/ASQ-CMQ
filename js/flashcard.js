/* Flashcard component — expects window.FLASH_DATA = [{q, a}, ...] */
(function () {
  let idx = 0, flipped = false;

  function render() {
    const data = window.FLASH_DATA;
    document.getElementById('fc-q').textContent = data[idx].q;
    document.getElementById('fc-a').textContent = data[idx].a;
    document.getElementById('fc-counter').textContent = (idx + 1) + ' / ' + data.length;
    const inner = document.getElementById('fc-inner');
    inner.classList.remove('flipped');
    flipped = false;
  }

  window.fcFlip = function () {
    const inner = document.getElementById('fc-inner');
    inner.classList.toggle('flipped');
    flipped = !flipped;
  };

  window.fcNext = function () {
    idx = (idx + 1) % window.FLASH_DATA.length;
    render();
  };

  window.fcPrev = function () {
    idx = (idx - 1 + window.FLASH_DATA.length) % window.FLASH_DATA.length;
    render();
  };

  document.addEventListener('DOMContentLoaded', render);
})();
