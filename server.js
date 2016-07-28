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
    //InitControlServer(ws, control);
    InitWebRTCSignalServer(ws);
    InitPtServer(ws, pt);
  });
}

function InitWebRTCSignalServer(ws) {
  console.log('InitWebRTCSignalServer');
  var dispacher = new MessageDispatcher();
  var client = new MessageClient(ws);
  ws.on("message", function(data) {
    var message = JSON.parse(data);
    if (message.type === 'message') {
      dispacher.dispatch(message.data);
    }
  });
  function errorCallback(error){
    console.log("WebRTC error: ", error);
  }
  var peerConnnection;
  dispacher.on('signal', 'call', function() {
    var servers = null;
    peerConnection = new RTCPeerConnection(servers);
    console.log("Created local peer connection object localPeerConnection");
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.addStream(colorStream);
    peerConnection.addStream(depthStream);
    peerConnection.addStream(fisheyeStream);
    peerConnection.createOffer(gotOffer, errorCallback);
  });
  function gotIceCandidate(event) {
    if(event.candidate != null) {
      client.send('signal', 'ice', event.candidate);
    }
  }
  function gotOffer(description){
    peerConnection.setLocalDescription(description, function() {
      client.send('signal', 'offer', description);
    }, errorCallback);
  }
  dispacher.on('signal', 'answer', function(description) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(description));
  });
  dispacher.on('signal', 'ice', function(ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(ice));
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
