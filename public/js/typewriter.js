var app = document.getElementById("app");

var typewriter = new Typewriter(app, {
  loop: true,
  delay: 100,
  deleteSpeed: 100,
});

typewriter.typeString("당신을 위한 최고의 여행").pauseFor(2000).start();

var app1 = document.getElementById("app1");

var typewriter = new Typewriter(app1, {
  loop: true,
  delay: 100,
  deleteSpeed: 100,
});

typewriter
  .typeString("언제든지 저렴한 가격으로 여행을 떠나보세요!")
  .pauseFor(2000)
  .start();
