// hack to add local node_modules path
module.paths.push(process.cwd() + '/node_modules');

var five = require('johnny-five');
var board = new five.Board({repl: false});
var led, button, rotary, lcd;

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
  ledBrightnessSlider.oninput = function(e) {
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

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  var lcdId = document.getElementById('lcd-id');
  var lcdController = document.getElementById('lcd-controller');
  lcdId.innerHTML = lcd.id;
  lcdController.innerHTML = lcd.controller;

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToString(r, g, b) {
    return  'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  // https://crosswalk-project.org/jira/browse/XWALK-6958
  /*
  var lcdColorPicker = document.getElementById('lcd-color');
  lcdColorPicker.onchange = function(e) {
    var rgb = hexToRgb(e.target.value);
    lcd.bgColor(rgb.r, rgb.g, rgb.b);
  };
  */

  var lcdRgb = document.getElementById('lcd-rgb');
  var r = 128, g = 128, b = 128;
  lcd.bgColor(r, g, b);
  lcdRgb.style.backgroundColor = rgbToString(r, g, b);

  var lcdRedSlider = document.getElementById('lcd-red');
  lcdRedSlider.oninput = function(e) {
    r = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    lcd.bgColor(r, g, b);
  }

  var lcdGreenSlider = document.getElementById('lcd-green');
  lcdGreenSlider.oninput = function(e) {
    g = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    lcd.bgColor(r, g, b);
  }

  var lcdBlueSlider = document.getElementById('lcd-blue');
  lcdBlueSlider.oninput = function(e) {
    b = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    lcd.bgColor(r, g, b);
  }

  var lcdText = document.getElementById('lcd-text');
  lcdText.onkeyup = function(e) {
    lcd.clear();
    var text = e.target.value;
    var line1 = text.slice(0, 16);
    var line2 = text.slice(16);
    lcd.cursor(0, 0).print(line1);
    lcd.cursor(1, 0).print(line2);
  }

});
