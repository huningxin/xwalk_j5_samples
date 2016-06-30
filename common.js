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