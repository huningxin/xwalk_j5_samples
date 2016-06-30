console.log('Running in Crosswalk + Node.js mode');
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
  var depthVideo = document.querySelector("#depth-preview");

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

    if (depthCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: depthCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotDepthStream, errorCallback);
    }

    if (colorCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: colorCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotColorStream, errorCallback);
    }

  }

  navigator.mediaDevices.enumerateDevices().then(gotDevices, errorCallback);
}
