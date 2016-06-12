function InitUI(control) {
  var boardId = document.getElementById('board-id');
  var boardPort = document.getElementById('board-port');
  var boardStatus = document.getElementById('board-status');

  var ledId = document.getElementById('led-id');
  var ledPin = document.getElementById('led-pin');

  var ledOnButton = document.getElementById('led-on');
  var ledOffButton = document.getElementById('led-off');
  var ledBlinkButton = document.getElementById('led-blink');
  var ledStopButton = document.getElementById('led-stop');
  var ledBrightnessSlider = document.getElementById('led-brightness');

  var buttonId = document.getElementById('button-id');
  var buttonPin = document.getElementById('button-pin');
  var buttonStatus = document.getElementById('button-status');

  var rotaryId = document.getElementById('rotary-id');
  var rotaryPin = document.getElementById('rotary-pin');
  var rotaryMeter = document.getElementById('rotary-meter');

  var lcdId = document.getElementById('lcd-id');
  var lcdController = document.getElementById('lcd-controller');

  var lcdRgb = document.getElementById('lcd-rgb');
  var lcdRedSlider = document.getElementById('lcd-red');
  var lcdGreenSlider = document.getElementById('lcd-green');
  var lcdBlueSlider = document.getElementById('lcd-blue');
  var lcdText = document.getElementById('lcd-text');

  var thermometerId = document.getElementById('thermometer-id');
  var thermometerPin = document.getElementById('thermometer-pin');
  var thermometerData = document.getElementById('thermometer-data');

  var servoId = document.getElementById('servo-id');
  var servoPin = document.getElementById('servo-pin');
  var servoAngleSlider = document.getElementById('servo-angle');

  var mdsForward = document.getElementById('mds-forward');
  var mdsReverse = document.getElementById('mds-reverse');
  var mdsSpeed = document.getElementById('mds-speed');

  var mdForward = [];
  var mdReverse = [];

  for (var i = 0; i < 3; ++i) {
    mdForward[i] = document.getElementById('md' + i + '-forward');
    mdReverse[i] = document.getElementById('md' + i + '-reverse');
  }

  boardId.innerHTML = control.board.id;
  boardPort.innerHTML = control.board.port;
  boardStatus.innerHTML = 'Ready';

  ledId.innerHTML = control.led.id;
  ledPin.innerHTML = control.led.pin;

  ledOnButton.onclick = function(e) {
    control.led.on();
  };
  ledOffButton.onclick = function(e) {
    control.led.off();
  };
  ledBlinkButton.onclick = function(e) {
    control.led.blink();
    control.led.on();
  };
  ledStopButton.onclick = function(e) {
    control.led.stop();
    control.led.off();
  };
  ledBrightnessSlider.oninput = function(e) {
    control.led.brightness(e.target.value);
  }

  buttonId.innerHTML = control.button.id;
  buttonPin.innerHTML = control.button.pin;
  buttonStatus.innerHTML = 'Released';

  control.button.on("press", function() {
    buttonStatus.innerHTML = 'Pressed';
  });

  control.button.on("release", function() {
    buttonStatus.innerHTML = 'Released';
  });

  rotaryId.innerHTML = control.rotary.id;
  rotaryPin.innerHTML = control.rotary.pin;

  control.rotary.scale(0, 255);

  control.rotary.on("change", function() {
    rotaryMeter.value = this.value.toFixed();
  });

  lcdId.innerHTML = control.lcd.id;
  lcdController.innerHTML = control.lcd.controller;

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

  var r = 128, g = 128, b = 128;
  control.lcd.bgColor(r, g, b);
  lcdRgb.style.backgroundColor = rgbToString(r, g, b);

  lcdRedSlider.oninput = function(e) {
    r = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    control.lcd.bgColor(r, g, b);
  }

  lcdGreenSlider.oninput = function(e) {
    g = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    control.lcd.bgColor(r, g, b);
  }

  lcdBlueSlider.oninput = function(e) {
    b = e.target.value
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);
    control.lcd.bgColor(r, g, b);
  }

  lcdText.onkeyup = function(e) {
    control.lcd.clear();
    var text = e.target.value;
    var line1 = text.slice(0, 16);
    var line2 = text.slice(16);
    control.lcd.cursor(0, 0);
    control.lcd.print(line1);
    control.lcd.cursor(1, 0);
    control.lcd.print(line2);
  }

  thermometerId.innerHTML = control.thermometer.id;
  thermometerPin.innerHTML = control.thermometer.pin;

  control.thermometer.on("data", function() {
    thermometerData.innerHTML = Math.round(this.C);
  });

  servoId.innerHTML = control.servo.id;
  servoPin.innerHTML = control.servo.pin;

  control.servo.to(90);

  servoAngleSlider.oninput = function(e) {
    control.servo.to(e.target.value);
  }

  function releaseButton(e) {
    e = e || window.event;
    var button = e.which || e.button;
    if (e.button == 0) { // left click
      for (var i in control.mds) {
        control.mds[i].stop();
      }
    }
  }

  mdsForward.onmousedown = function(e) {
    e = e || window.event;
    var button = e.which || e.button;
    if (e.button == 0) { // left click
      for (var i in control.mds) {
        control.mds[i].forward(mdsSpeed.value);
      }
    }
  };

  mdsForward.onmouseup = releaseButton;

  mdsReverse.onmousedown = function(e) {
    e = e || window.event;
    var button = e.which || e.button;
    if (e.button == 0) { // left click
      for (var i in control.mds) {
        control.mds[i].reverse(mdsSpeed.value);
      }
    }
  };

  mdsReverse.onmouseup = releaseButton;

  function setupMdControl(i) {
    function releaseButton(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        control.mds[i].stop();
      }
    }

    mdForward[i].onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        control.mds[i].forward(mdsSpeed.value);
      }
    };

    mdForward[i].onmouseup = releaseButton;

    mdReverse[i].onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        control.mds[i].reverse(mdsSpeed.value);
      }
    };

    mdReverse[i].onmouseup = releaseButton;
  }

  for (var i in control.mds) {
    setupMdControl(i);
  }
}