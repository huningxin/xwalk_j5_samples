//var five = require('johnny-five');
//var board = new five.Board({repl: false});

// TODO: avoid to use global variable to share
var colorStream, depthStream;
/*
board.on('ready', function() {
  console.log('Johnny-Five is ready');

  var control = CreateControl(board);

  InitUI(control);

  InitServer(control);

  InitCamera();
});
*/

InitTitle();

InitServer();

InitCamera();

function CreateControl(board) {
  var control = {board: board};
  // Plug the LED module into the
  // Grove Shield's D6 jack.
  //
  // Select an LED from the kit
  // (red, green, blue) and insert
  // it into the LED module, with
  // the long pin in + and short
  // pin in -.
  control.led = new five.Led(6);

  // Plug the Button module into the
  // Grove Shield's D4 jack
  control.button = new five.Button(4);

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  control.rotary = new five.Sensor("A0");

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  control.lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  // Plug the Temperature sensor module
  // into the Grove Shield's A1 jack
  control.thermometer = new five.Thermometer({
    controller: "GROVE",
    pin: "A1"
  });

  // Plug the Servo module
  // into the Grove Shield's D5 jack
  control.servo = new five.Servo(5);

  control.mds = [];
  // Plug the Motor Driver module
  // into the I2C jack.
  // Set the I2C address of driver
  // with 2 motors to 8.
  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 8,
    pin: "A",
  }));

  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 8,
    pin: "B",
  }));

  // Set the I2C address of driver
  // with 1 motor to 9.
  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 9,
    pin: "B",
  }));
  return control;
}

function InitCamera() {
  var colorVideo = document.querySelector("#color-preview");
  //var depthVideo = document.querySelector("#depth-preview");

  function gotColorStream(stream) {
    colorStream = stream; // colorStream available to WebRTCSignalServer
    colorVideo.srcObject = stream;
    colorVideo.play();
  }

  function gotDepthStream(stream) {
    depthStream = stream; // colorStream available to WebRTCSignalServer
    depthVideo.srcObject = stream;
    depthVideo.play();
  }

  function errorCallback(error){
    console.log("navigator.getUserMedia error: ", error);
  }

  var depthCameraId = colorCameraId = '';

  function gotDevices(deviceInfos) {
    const depthCameraName = 'Intel RealSense R200-DEPTH';
    const colorCameraName = 'Intel RealSense R200-COLOR'
    for (var i = 0; i < deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'videoinput') {
        console.log(deviceInfo.label);
        if (deviceInfo.label === depthCameraName) {
          depthCameraId = deviceInfo.deviceId;
        } else if (deviceInfo.label === colorCameraName) {
          colorCameraId = deviceInfo.deviceId;
        }
      }
    }

    /*
    if (depthCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: depthCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotDepthStream, errorCallback);
    }
    */

    if (colorCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: colorCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotColorStream, errorCallback);
    }

  }

  navigator.mediaDevices.enumerateDevices().then(gotDevices, errorCallback);
}

var pt = null;
var overlayCanvas, overlayContext;
var ptRunning = false;

var startPtButton = document.getElementById('pt-start');
var stopPtButton = document.getElementById('pt-stop');

startPtButton.onclick = function() {
  StartPt();
}

stopPtButton.onclick = function () {
  StopPt();
}

function InitPt() {
  if (pt !== null)
    return;
  var addon = require('pt');
  pt = new addon.PersonTracking();
  overlayCanvas = document.getElementById('overlay');
  overlayContext = overlayCanvas.getContext('2d');
}

function StartPt() {
  if (ptRunning)
    return;
  InitPt();
  pt.start(process._app_manifest_path + '/node_modules/pt/PersonTracking/ubuntu/data',
           {gesturesEnabled: false,
            recognitionEnabled: false,
            sceletonEnabled: false,
            trackingEnabled: true});
  console.log('started');

  pt.on('error', function(msg) {console.log('PT error event: ' + msg)});

  pt.on('data', function() {
    var data = pt.getData();
  
    drawPtData(overlayCanvas, overlayContext, data);

    SendPtData(data);
  });

  ptRunning = true;
}

function StopPt() {
  if(!ptRunning)
    return;
  pt.stop();
  ptRunning = false;
}

var ptClient = null;

function SendPtData(data) {
  if (ptClient !== null) {
    ptClient.send('pt', 'data', data);
  }
}

function InitPtServer(ws) {
  var dispacher = new MessageDispatcher();
  ws.on("message", function(data) {
    var message = JSON.parse(data);
    if (message.type === 'message') {
      dispacher.dispatch(message.data);
    }
  });
  dispacher.on('pt', 'start', function() {
    StartPt();
  });
  dispacher.on('pt', 'stop', function() {
    StopPt();
  });
  ptClient = new MessageClient(ws);
  console.log('Create PT client');
  ws.on("close", function() {
    ptClient = null;  
  });
}
