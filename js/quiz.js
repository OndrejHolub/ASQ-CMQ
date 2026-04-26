/* Quiz component — expects window.QUIZ_DATA = [{q, o:[], c, e}, ...] */
(function () {
  let score = 0, answered = 0;

  function build() {
    score = 0; answered = 0;
    const data = window.QUIZ_DATA;
    const box = document.getElementById('quiz-box');
    box.innerHTML = '';
    updateProgress();

    data.forEach(function (item, qi) {
      const div = document.createElement('div');
      div.className = 'q-item';
      div.id = 'q-' + qi;
      div.innerHTML =
        '<div class="q-num">Question ' + (qi + 1) + ' of ' + data.length + '</div>' +
        '<div class="q-text">' + item.q + '</div>' +
        '<div class="q-options">' +
        item.o.map(function (opt, oi) {
          return '<button class="q-opt" onclick="quizPick(' + qi + ',' + oi + ')">' +
            '<span class="q-label">' + String.fromCharCode(65 + oi) + '.</span>' +
            '<span>' + opt + '</span></button>';
        }).join('') +
        '</div>' +
        '<div class="q-explain" id="qe-' + qi + '"></div>';
      box.appendChild(div);
    });
  }

  function updateProgress() {
    const total = window.QUIZ_DATA.length;
    document.getElementById('quiz-stat').textContent = answered + ' / ' + total;
    document.getElementById('quiz-bar').style.width = (answered / total * 100) + '%';
    document.getElementById('quiz-score').textContent = score + ' correct';
    const reset = document.getElementById('quiz-reset');
    if (reset) reset.classList.toggle('show', answered === total);
  }

  window.quizPick = function (qi, oi) {
    const item = window.QUIZ_DATA[qi];
    const card = document.getElementById('q-' + qi);
    if (card.querySelector('.q-opt.correct')) return;

    const opts = card.querySelectorAll('.q-opt');
    const correct = oi === item.c;

    opts.forEach(function (btn, i) {
      btn.classList.add('locked');
      if (i === item.c) btn.classList.add('correct');
      if (i === oi && !correct) btn.classList.add('wrong');
    });

    const exp = document.getElementById('qe-' + qi);
    exp.className = 'q-explain show ' + (correct ? 'ok' : 'err');
    exp.textContent = (correct ? 'Correct. ' : 'Incorrect. ') + item.e;

    if (correct) score++;
    answered++;
    updateProgress();
  };

  window.quizReset = function () { build(); };

  document.addEventListener('DOMContentLoaded', build);
})();
