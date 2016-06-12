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

function MessageDispatcher() {
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

function InitServer(control) {
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
    console.log("websocket connection open");
    InitControlServer(ws, control);
  });
}

function InitControlServer(ws, control) {
  var dispacher = new MessageDispatcher();
  dispacher.on('led', 'on', function() {
    control.led.on();
  });
  dispacher.on('led', 'off', function() {
    control.led.off();
  });
  dispacher.on('led', 'blink', function() {
    control.led.blink().on();
  });
  dispacher.on('led', 'stop', function() {
    control.led.stop().off();
  });
  dispacher.on('led', 'brightness', function(value) {
    control.led.brightness(value);
  });
  dispacher.on('lcd', 'clear', function() {
    control.lcd.clear();
  });
  dispacher.on('lcd', 'bgColor', function(rgb) {
    control.lcd.bgColor(rgb.r, rgb.g, rgb.b);
  });
  dispacher.on('lcd', 'cursor', function(pos) {
    control.lcd.cursor(pos.row, pos.line);
  });
  dispacher.on('lcd', 'print', function(text) {
    control.lcd.print(text);
  });
  dispacher.on('lcd', 'clear', function() {
    control.lcd.clear();
  });
  dispacher.on('servo', 'to', function(angle) {
    control.servo.to(angle);
  });
  dispacher.on('md', 'stop', function(args) {
    var i = args.i;
    control.mds[i].stop();
  });
  dispacher.on('md', 'forward', function(args) {
    var i = args.i;
    var speed = args.speed;
    control.mds[i].forward(speed);
  });
  dispacher.on('md', 'reverse', function(args) {
    var i = args.i;
    var speed = args.speed;
    control.mds[i].reverse(speed);
  });

  ws.on("message", function(data) {
    var message = JSON.parse(data);
    if (message.type === 'message') {
      dispacher.dispatch(message.data);
    }
  });

  var client = new MessageClient(ws);
  var config = {
    board: {id: control.board.id, port: control.board.port},
    led: {id: control.led.id, pin: control.led.pin},
    button: {id: control.button.id, pin: control.button.pin},
    rotary: {id: control.rotary.id, pin: control.rotary.pin},
    lcd: {id: control.lcd.id, controller: control.lcd.controller},
    thermometer: {id: control.thermometer.id, pin: control.thermometer.pin},
    servo: {id: control.servo.id, pin: control.servo.pin}
  };      
  client.send('control', 'init', config);

  var pressCallback = function() {
    client.send('button', 'press');
  };
  control.button.on("press", pressCallback);
  var releaseCallback = function() {
    client.send('button', 'release');
  };
  control.button.on("release", releaseCallback);
  var changeCallback = function() {
    client.send('rotary', 'change', this.value);
  };
  control.rotary.on("change", changeCallback);
  var dataCallback = function() {
    client.send('thermometer', 'data', this.C);
  };
  control.thermometer.on("data", dataCallback);

  ws.on("close", function() {
    console.log("websocket connection close");
    control.button.removeListener("press", pressCallback);
    control.button.removeListener("release", releaseCallback);
    control.rotary.removeListener("change", changeCallback);
    control.thermometer.removeListener("data", dataCallback);
  });
}

function InitClient() {
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  var dispatcher = new MessageDispatcher();
  ws.onmessage = function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      dispatcher.dispatch(message.data);
    }
  };
  dispatcher.on('control', 'init', function(config) {
    var control = new ControlClient(ws, config);
    InitUI(control);
  });
}

function ControlClient(ws, config) {
  var self = this;
  this.client = new MessageClient(ws);
  this.board = config.board;
  this.led = config.led;
  this.lcd = config.lcd;
  this.rotary = config.rotary;
  this.button = config.button;
  this.thermometer = config.thermometer;
  this.servo = config.servo;
  this.mds = [];
  this.led.on = function() {
    self.client.send('led', 'on');
  };
  this.led.off = function() {
    self.client.send('led', 'off');
  };
  this.led.blink = function() {
    self.client.send('led', 'blink');
  };
  this.led.stop = function(e) {
    self.client.send('led', 'stop');
  };
  this.led.brightness = function(value) {
    self.client.send('led', 'brightness', value);
  };
  this.lcd.bgColor = function(r, g, b) {
    var rgb = {r: r, b: b, g: g};
    self.client.send('lcd', 'bgColor', rgb);
  };
  this.lcd.clear = function() {
    self.client.send('lcd', 'clear');
  }
  this.lcd.cursor = function(row, line) {
    self.client.send('lcd', 'cursor', {row: row, line: line});
  };
  this.lcd.print = function(text) {
    self.client.send('lcd', 'print', text);
  };
  this.servo.to = function(value) {
    self.client.send('servo', 'to', value);
  };
  this.rotary.scale = function(min, max) {
    // not implemented
  }
  function setupMdControlClient(i) {
    var md = {};
    var index = i;
    md.stop = function() {
      var args = {i: index};
      self.client.send('md', 'stop', args);
    };
    md.forward = function(speed) {
      var args = {i: index, speed: speed};
      self.client.send('md', 'forward', args); 
    };
    md.reverse = function(speed) {
      var args = {i: index, speed: speed};
      self.client.send('md', 'reverse', args); 
    };
    self.mds.push(md);
  }
  for (var i = 0; i < 3; ++i) {
    setupMdControlClient(i);
  }

  this.dispatcher = new MessageDispatcher();
  ws.onmessage = function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      self.dispatcher.dispatch(message.data);
    }
  };
  function eventHandler(event, handler) {
    this['_on' + event] = handler;
  };
  this.button.on = eventHandler;
  this.dispatcher.on('button', 'press', function() {
    self.button._onpress();
  });

  this.dispatcher.on('button', 'release', function() {
    self.button._onrelease();
  });
  this.rotary.on = eventHandler;
  this.dispatcher.on('rotary', 'change', function(value) {
    self.rotary.value = value;
    self.rotary._onchange();
  });
  this.thermometer.on = eventHandler;
  this.dispatcher.on('thermometer', 'data', function(value) {
    self.thermometer.C = value;
    self.thermometer._ondata();
  });
}