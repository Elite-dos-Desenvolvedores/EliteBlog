$(document).ready(function () {

  $('#tags').tagsInput({
    'height': '60px',
    'width': '280px'
  });

});

(new IntersectionObserver(function (e, o) {
  if (e[0].intersectionRatio > 0) {
    document.documentElement.removeAttribute('class');
  } else {
    document.documentElement.setAttribute('class', 'fixed');
  };
})).observe(document.querySelector('.trigger'));