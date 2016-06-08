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
var lservoAngleSlider = document.getElementById('servo-angle');

var mdsForward = document.getElementById('mds-forward');
var mdsReverse = document.getElementById('mds-reverse');
var mdsSpeed = document.getElementById('mds-speed');

var mdForward = [];
var mdReverse = [];

for (var i = 0; i < 3; ++i) {
  mdForward[i] = document.getElementById('md' + i + '-forward');
  mdReverse[i] = document.getElementById('md' + i + '-reverse');
}

if (typeof require !== 'undefined') {
  var five = require('johnny-five');
  var board = new five.Board({repl: false});
  var led, button, rotary, lcd, thermometer, servo;
  var mds = [];

  board.on('ready', function() {
    console.log('Johnny-Five is ready');

    InitBoard();

    InitLocalUI();

    StartServer();
  });

  function InitBoard() {
    // Plug the LED module into the
    // Grove Shield's D6 jack.
    //
    // Select an LED from the kit
    // (red, green, blue) and insert
    // it into the LED module, with
    // the long pin in + and short
    // pin in -.
    led = new five.Led(6);

    // Plug the Button module into the
    // Grove Shield's D4 jack
    button = new five.Button(4);

    // Plug the Rotary Angle sensor module
    // into the Grove Shield's A0 jack
    rotary = new five.Sensor("A0");

    // Plug the LCD module into any of the
    // Grove Shield's I2C jacks.
    lcd = new five.LCD({
      controller: "JHD1313M1"
    });

    // Plug the Temperature sensor module
    // into the Grove Shield's A1 jack
    thermometer = new five.Thermometer({
      controller: "GROVE",
      pin: "A1"
    });

    // Plug the Servo module
    // into the Grove Shield's D5 jack
    servo = new five.Servo(5);

    // Plug the Motor Driver module
    // into the I2C jack.
    // Set the I2C address of driver
    // with 2 motors to 8.
    mds.push(new five.Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      address: 8,
      pin: "A",
    }));

    mds.push(new five.Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      address: 8,
      pin: "B",
    }));

    // Set the I2C address of driver
    // with 1 motor to 9.
    mds.push(new five.Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      address: 9,
      pin: "B",
    }));
  }

  function InitLocalUI() {
    boardId.innerHTML = board.id;
    boardPort.innerHTML = board.port;
    boardStatus.innerHTML = 'Ready';

    ledId.innerHTML = led.id;
    ledPin.innerHTML = led.pin;

    ledOnButton.onclick = function(e) {
      led.on();
    };
    ledOffButton.onclick = function(e) {
      led.off();
    };
    ledBlinkButton.onclick = function(e) {
      led.blink().on();
    };
    ledStopButton.onclick = function(e) {
      led.stop().off();
    };
    ledBrightnessSlider.oninput = function(e) {
      led.brightness(e.target.value);
    }

    buttonId.innerHTML = button.id;
    buttonPin.innerHTML = button.pin;
    buttonStatus.innerHTML = 'Released';

    button.on("press", function() {
      buttonStatus.innerHTML = 'Pressed';
    });

    button.on("release", function() {
      buttonStatus.innerHTML = 'Released';
    });

    rotaryId.innerHTML = rotary.id;
    rotaryPin.innerHTML = rotary.pin;

    rotary.scale(0, 255).on("change", function() {
      rotaryMeter.value = this.value.toFixed();
    });

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

    var r = 128, g = 128, b = 128;
    lcd.bgColor(r, g, b);
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);

    lcdRedSlider.oninput = function(e) {
      r = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      lcd.bgColor(r, g, b);
    }

    lcdGreenSlider.oninput = function(e) {
      g = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      lcd.bgColor(r, g, b);
    }

    lcdBlueSlider.oninput = function(e) {
      b = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      lcd.bgColor(r, g, b);
    }

    lcdText.onkeyup = function(e) {
      lcd.clear();
      var text = e.target.value;
      var line1 = text.slice(0, 16);
      var line2 = text.slice(16);
      lcd.cursor(0, 0).print(line1);
      lcd.cursor(1, 0).print(line2);
    }

    thermometerId.innerHTML = thermometer.id;
    thermometerPin.innerHTML = thermometer.pin;

    thermometer.on("data", function() {
      thermometerData.innerHTML = Math.round(this.C);
    });

    servoId.innerHTML = servo.id;
    servoPin.innerHTML = servo.pin;

    servo.to(90);

    lservoAngleSlider.oninput = function(e) {
      servo.to(e.target.value);
    }

    function releaseButton(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i in mds) {
          mds[i].stop();
        }
      }
    }

    mdsForward.onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i in mds) {
          mds[i].forward(mdsSpeed.value);
        }
      }
    };

    mdsForward.onmouseup = releaseButton;

    mdsReverse.onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i in mds) {
          mds[i].reverse(mdsSpeed.value);
        }
      }
    };

    mdsReverse.onmouseup = releaseButton;

    function setupMdControl(i) {
      function releaseButton(e) {
        e = e || window.event;
        var button = e.which || e.button;
        if (e.button == 0) { // left click
          mds[i].stop();
        }
      }

      mdForward[i].onmousedown = function(e) {
        e = e || window.event;
        var button = e.which || e.button;
        if (e.button == 0) { // left click
          mds[i].forward(mdsSpeed.value);
        }
      };

      mdForward[i].onmouseup = releaseButton;

      mdReverse[i].onmousedown = function(e) {
        e = e || window.event;
        var button = e.which || e.button;
        if (e.button == 0) { // left click
          mds[i].reverse(mdsSpeed.value);
        }
      };

      mdReverse[i].onmouseup = releaseButton;
    }

    for (var i in mds) {
      setupMdControl(i);
    }
  }

  function StartServer() {
    var WebSocketServer = require("ws").Server
    var http = require("http")
    var express = require("express")
    var app = express()
    var port = process.env.PORT || 5000

    // TODO(nhu): fix the __dirname to app manifest path
    app.use(express.static(process._app_manifest_path + "/"))

    var server = http.createServer(app)
    server.listen(port)

    console.log("http server listening on %d", port)

    var wss = new WebSocketServer({server: server})
    console.log("websocket server created")

    wss.on("connection", function(ws) {
      console.log("websocket connection open")

      var server = new MessageServer(ws);
      var client = new MessageClient(ws);

      ws.on("message", function(data) {
        var message = JSON.parse(data);
        if (message.type === 'message') {
          server.dispatch(message.data);
        }
      });

      var config = {
        board: {id: board.id, port: board.port},
        led: {id: led.id, pin: led.pin},
        button: {id: button.id, pin: button.pin},
        rotary: {id: rotary.id, pin: rotary.pin},
        lcd: {id: lcd.id, controller: lcd.controller},
        thermometer: {id: thermometer.id, pin: thermometer.pin},
        servo: {id: servo.id, pin: servo.pin}
      };      
      client.send('ui', 'config', config);

      InitEventDispatcher(client);

      InitMethodServer(server);

      ws.on("close", function() {
        console.log("websocket connection close")
      });
    });
  }

  function InitMethodServer(server) {
    server.on('led', 'on', function() {
      led.on();
    });
    server.on('led', 'off', function() {
      led.off();
    });
    server.on('led', 'blink', function() {
      led.blink().on();
    });
    server.on('led', 'stop', function() {
      led.stop().off();
    });
    server.on('led', 'brightness', function(value) {
      led.brightness(value);
    });
    server.on('lcd', 'bgColor', function(rgb) {
      lcd.bgColor(rgb.r, rgb.g, rgb.b);
    });
    server.on('lcd', 'cursor', function(pos) {
      lcd.cursor(pos.row, pos.line);
    });
    server.on('lcd', 'print', function(text) {
      lcd.print(text);
    });
    server.on('lcd', 'clear', function() {
      lcd.clear();
    });
    server.on('servo', 'to', function(angle) {
      servo.to(angle);
    });
    server.on('md', 'stop', function(args) {
      var i = args.i;
      mds[i].stop();
    });
    server.on('md', 'forward', function(args) {
      var i = args.i;
      var speed = args.speed;
      mds[i].forward(speed);
    });
    server.on('md', 'reverse', function(args) {
      var i = args.i;
      var speed = args.speed;
      mds[i].reverse(speed);
    });
  }

  function InitEventDispatcher(client) {
    button.on("press", function() {
      client.send('button', 'press');
    });

    button.on("release", function() {
      client.send('button', 'release');
    });

    rotary.on("change", function() {
      client.send('rotary', 'change', this.value);
    });

    thermometer.on("data", function() {
      client.send('thermometer', 'data', this.C);
    });
  }
} else {
  window.onload = function(e) {
    StartClient();
  }

  function StartClient() {
    var host = location.origin.replace(/^http/, 'ws')
    var ws = new WebSocket(host);
    ws.onmessage = function (event) {
      var message = JSON.parse(event.data);
      if (message.type === 'message') {
        server.dispatch(message.data);
      }
    };
    server = new MessageServer(ws);
    client = new MessageClient(ws);
    InitMessageServer(server);
    InitRemoteUI(client);
  }

  function InitMessageServer(server) {
    server.on('ui', 'config', Config);

    server.on('button', 'press', function() {
      buttonStatus.innerHTML = 'Pressed';
    });

    server.on('button', 'release', function() {
      buttonStatus.innerHTML = 'Released';
    });

    server.on('rotary', 'change', function(value) {
      rotaryMeter.value = value.toFixed();
    });

    server.on('thermometer', 'data', function(value) {
      thermometerData.innerHTML = Math.round(value);
    });
  }

  function Config(config) {
    boardId.innerHTML = config.board.id;
    boardPort.innerHTML = config.board.port;
    boardStatus.innerHTML = 'Ready';
    ledId.innerHTML = config.led.id;
    ledPin.innerHTML = config.led.pin;
    buttonId.innerHTML = config.button.id;
    buttonPin.innerHTML = config.button.pin;
    buttonStatus.innerHTML = 'Released';

    rotaryId.innerHTML = config.rotary.id;
    rotaryPin.innerHTML = config.rotary.pin;

    lcdId.innerHTML = config.lcd.id;
    lcdController.innerHTML = config.lcd.controller;

    thermometerId.innerHTML = config.thermometer.id;
    thermometerPin.innerHTML = config.thermometer.pin;

    servoId.innerHTML = config.servo.id;
    servoPin.innerHTML = config.servo.pin;

  }
 
  function InitRemoteUI(client) {
    ledOnButton.onclick = function(e) {
      client.send('led', 'on');
    };
    ledOffButton.onclick = function(e) {
      client.send('led', 'off');
    };
    ledBlinkButton.onclick = function(e) {
      client.send('led', 'blink');
    };
    ledStopButton.onclick = function(e) {
      client.send('led', 'stop');
    };

    ledBrightnessSlider.oninput = function(e) {
      client.send('led', 'brightness', e.target.value);
    }

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
    lcdRgb.style.backgroundColor = rgbToString(r, g, b);

    lcdRedSlider.oninput = function(e) {
      r = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      var rgb = {r: r, b: b, g: g};
      client.send('lcd', 'bgColor', rgb);
    }

    lcdGreenSlider.oninput = function(e) {
      g = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      var rgb = {r: r, b: b, g: g};
      client.send('lcd', 'bgColor', rgb);
    }

    lcdBlueSlider.oninput = function(e) {
      b = e.target.value
      lcdRgb.style.backgroundColor = rgbToString(r, g, b);
      var rgb = {r: r, b: b, g: g};
      client.send('lcd', 'bgColor', rgb);
    }

    lcdText.onkeyup = function(e) {
      client.send('lcd', 'clear');
      var text = e.target.value;
      var line1 = text.slice(0, 16);
      var line2 = text.slice(16);
      client.send('lcd', 'cursor', {row: 0, line: 0});
      client.send('lcd', 'print', line1);
      client.send('lcd', 'cursor', {row: 1, line: 0});
      client.send('lcd', 'print', line2);
    }

    lservoAngleSlider.oninput = function(e) {
      client.send('servo', 'to', e.target.value);
    }

    function releaseButton(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i = 0; i < 3; ++i) {
          var args = {i: i};
          client.send('md', 'stop', args);
        }
      }
    }

    mdsForward.onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i = 0; i < 3; ++i) {
          var args = {i: i, value: mdsSpeed.value};
          client.send('md', 'forward', args);
        }
      }
    };

    mdsForward.onmouseup = releaseButton;

    mdsReverse.onmousedown = function(e) {
      e = e || window.event;
      var button = e.which || e.button;
      if (e.button == 0) { // left click
        for (var i = 0; i < 3; ++i) {
          var args = {i: i, value: mdsSpeed.value};
          client.send('md', 'reverse', args);
        }
      }
    };

    mdsReverse.onmouseup = releaseButton;

    function setupMdControl(i) {
      function releaseButton(e) {
        e = e || window.event;
        var button = e.which || e.button;
        var index = i;
        var args = {i: index};
        client.send('md', 'stop', args);
      }

      mdForward[i].onmousedown = function(e) {
        e = e || window.event;
        var button = e.which || e.button;
        if (e.button == 0) { // left click
          var index = i;
          var args = {i: index, value: mdsSpeed.value};
          client.send('md', 'forward', args); 
        }
      };

      mdForward[i].onmouseup = releaseButton;

      mdReverse[i].onmousedown = function(e) {
        e = e || window.event;
        var button = e.which || e.button;
        if (e.button == 0) { // left click
          var index = i;
          var args = {i: index, value: mdsSpeed.value};
          client.send('md', 'reverse', args); 
        }
      };

      mdReverse[i].onmouseup = releaseButton;
    }

    for (var i = 0; i < 3; ++i) {
      setupMdControl(i);
    }
  }
}

function Message (object, method, args) {
  this.type = 'message';
  this.data = {
    object: object,
    method: method,
    args: args
  };
}

function MessageClient(ws) {
  this.ws = ws;

  this.send = function (object, method, args) {
    var message = new Message(object, method, args);
    this.ws.send(JSON.stringify(message));
  }
}

function MessageServer(ws) {
  this.ws = ws;
  this.objects = {};
  this.on = function(object, method, handler) {
    if (typeof this.objects[object] === 'undefined')
      this.objects[object] = {};
    if (typeof this.objects[object][method] === 'undefined')
      this.objects[object][method] = [];
    this.objects[object][method].push(handler);
  };
  this.dispatch = function(message) {
    var object = message.object;
    var method = message.method;
    var args = message.args;
    if (typeof this.objects[object] !== 'undefined' &&
        typeof this.objects[object][method] !== 'undefined') {
      var handlers = this.objects[object][method];
      for (var i in handlers) {
        handlers[i](args);
      }
    }
  };
}