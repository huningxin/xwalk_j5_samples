// hack to add local node_modules path
module.paths.push(process.cwd() + '/node_modules');

var five = require('johnny-five');
var board = new five.Board({repl: false});
var led, button, rotary;

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
  var ledBrightnessSlider = document.getElementById('led-brightness');
  ledBrightnessSlider.onchange = function(e) {
    led.brightness(e.target.value);
  }

  // Plug the Button module into the
  // Grove Shield's D4 jack
  button = new five.Button(4);

  var buttonId = document.getElementById('button-id');
  var buttonPin = document.getElementById('button-pin');
  var buttonStatus = document.getElementById('button-status');

  buttonId.innerHTML = button.id;
  buttonPin.innerHTML = button.pin;
  buttonStatus.innerHTML = 'Released';

  button.on("press", function() {
    buttonStatus.innerHTML = 'Pressed';
  });

  button.on("release", function() {
    buttonStatus.innerHTML = 'Released';
  });

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  rotary = new five.Sensor("A0");

  var rotaryId = document.getElementById('rotary-id');
  var rotaryPin = document.getElementById('rotary-pin');
  var rotaryMeter = document.getElementById('rotary-meter');
  rotaryId.innerHTML = rotary.id;
  rotaryPin.innerHTML = rotary.pin;

  rotary.scale(0, 255).on("change", function() {
    rotaryMeter.value = this.value.toFixed();
  });
});
