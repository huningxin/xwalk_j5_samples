// hack to add local node_modules path
module.paths.push(process.cwd() + '/node_modules');

var five = require('johnny-five');
var board = new five.Board({repl: false});
var led;

board.on('ready', function() {
  console.log('Johnny-Five is ready');

  var boardId = document.getElementById('board-id');
  var boardPort = document.getElementById('board-port');
  var boardStatus = document.getElementById('board-status');

  boardId.innerHTML = board.id;
  boardPort.innerHTML = board.port;
  boardStatus.innerHTML = 'Ready';

  // Plug the LED module into the
  // Grove Shield's D6 jack.
  //
  // Select an LED from the kit
  // (red, green, blue) and insert
  // it into the LED module, with
  // the long pin in + and short
  // pin in -.
  led = new five.Led(6);

  var ledId = document.getElementById('led-id');
  var ledPin = document.getElementById('led-pin');

  ledId.innerHTML = led.id;
  ledPin.innerHTML = led.pin;

  var ledOnButton = document.getElementById('led-on');
  ledOnButton.onclick = function(e) {
    led.on();
  };
  var ledOffButton = document.getElementById('led-off');
  ledOffButton.onclick = function(e) {
    led.off();
  };
  var ledBlinkButton = document.getElementById('led-blink');
  ledBlinkButton.onclick = function(e) {
    led.blink().on();
  };
  var ledStopButton = document.getElementById('led-stop');
  ledStopButton.onclick = function(e) {
    led.stop().off();
  };
});
