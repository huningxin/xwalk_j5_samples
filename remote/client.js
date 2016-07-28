window.onload = function(e) {
  InitTitle();
  InitClient();
}

function InitClient() {
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  var dispatcher = new MessageDispatcher();
  ws.addEventListener('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      dispatcher.dispatch(message.data);
    }
  });
  ws.onopen = function (event) {
    new InitWebRTCSignalClient(ws);
    new InitMtClient(ws);
  }
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
  ws.addEventListener('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      self.dispatcher.dispatch(message.data);
    }
  });
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

function InitWebRTCSignalClient(ws) {
  var self = this;
  this.dispatcher = new MessageDispatcher();
  var client = new MessageClient(ws);
  ws.addEventListener('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      self.dispatcher.dispatch(message.data);
    }
  });
  var servers = null;
  var peerConnection = new RTCPeerConnection(servers);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;

  client.send('signal', 'call');

  function gotIceCandidate(event) {
    if(event.candidate != null) {
      client.send('signal', 'ice', event.candidate);
    }
  }

  var streams = 0;

  function gotRemoteStream(event) {
    console.log("got remote stream " + streams);
    if (streams == 0) {
      var remoteVideo = document.querySelector("#color-preview");
      remoteVideo.src = window.URL.createObjectURL(event.stream);
    } else if (streams == 1) {
      var remoteVideo = document.querySelector("#depth-preview");
      remoteVideo.src = window.URL.createObjectURL(event.stream);
    } else if (streams == 2) {
      var remoteVideo = document.querySelector("#fisheye-preview");
      remoteVideo.src = window.URL.createObjectURL(event.stream);
    }

    streams++;
  }
  function errorCallback(error){
    console.log("WebRTC error: ", error);
  }
  this.dispatcher.on('signal', 'offer', function(description) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    peerConnection.createAnswer(gotAnswer, errorCallback);
  });
  function gotAnswer(description) {
    peerConnection.setLocalDescription(description, function() {
      client.send('signal', 'answer', description);
    }, errorCallback);
  }
  this.dispatcher.on('signal', 'ice', function(ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(ice));
  });
}

function InitMtClient(ws) {
  var self = this;
  this.dispatcher = new MessageDispatcher();

  ws.addEventListener('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'message') {
      self.dispatcher.dispatch(message.data);
    }
  });

  this.dispatcher.on('mt', 'data', function(data) {
    drawMtData(data);
  });

  this.client = new MessageClient(ws);

  var startMtButton = document.getElementById('mt-start');
  var stopMtButton = document.getElementById('mt-stop');

  startMtButton.onclick = function() {
    self.client.send('mt', 'start');
  }

  stopMtButton.onclick = function () {
    self.client.send('mt', 'stop');
  }
}
