// List of sessions
let adapter = require("./adapter-latest.js");
const tvvsdk_constants = require("./tvvsdk_constants.js");
const tvlogTag = tvvsdk_constants.logTag;

var TvRTC = {};
TvRTC.sessions = {};

TvRTC.isExtensionEnabled = function() {
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    // No need for the extension, getDisplayMedia is supported
    return true;
  }
  if (window.navigator.userAgent.match('Chrome')||window.navigator.userAgent.match('electron')) {
    var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
    var maxver = 33;
    if (window.navigator.userAgent.match('Linux'))
      maxver = 35; // "known" crash in chrome 34 and 35 on linux
    if (chromever >= 26 && chromever <= maxver) {
      // Older versions of Chrome don't support this extension-based approach, so lie
      return true;
    }
    return TvRTC.extension.isInstalled();
  } else {
    // Firefox of others, no need for the extension (but this doesn't mean it will work)
    return true;
  }
};

var defaultExtension = {
  // Screensharing Chrome Extension ID
  extensionId: 'hapfgfdkleiggjjpfpenajgdnfckjpaj',
  isInstalled: function() {
    return document.querySelector('#janus-extension-installed') !== null;
  },
  getScreen: function(callback) {
    var pending = window.setTimeout(function() {
      var error = new Error('NavigatorUserMediaError');
      error.name =
          'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
      return callback(error);
    }, 1000);
    this.cache[pending] = callback;
    window.postMessage({
      type: 'janusGetScreen',
      id: pending
    }, '*');
  },
  init: function() {
    //alert("init");
    var cache = {};
    this.cache = cache;
    // Wait for events from the Chrome Extension
    window.addEventListener('message', function(event) {
      //alert(JSON.stringify(event));
      if (event.origin != window.location.origin)
        return;
      if (event.data.type == 'janusGotScreen' && cache[event.data.id]) {
        var callback = cache[event.data.id];
        delete cache[event.data.id];

        if (event.data.sourceId === '') {
          // user canceled
          var error = new Error('NavigatorUserMediaError');
          error.name = 'You cancelled the request for permission, giving up...';
          callback(error);
        } else {
          callback(null, event.data.sourceId);
        }
      } else if (event.data.type == 'janusGetScreenPending') {
        console.log('clearing ', event.data.id);
        window.clearTimeout(event.data.id);
      }
    });
  }
};

TvRTC.useDefaultDependencies = function(deps) {
  var f = (deps && deps.fetch) || fetch;
  var p = (deps && deps.Promise) || Promise;
  var socketCls = (deps && deps.WebSocket) || WebSocket;

  return {
    newWebSocket: function(server, proto) {
      return new socketCls(server, proto);
    },
    extension: (deps && deps.extension) || defaultExtension,
    isArray: function(arr) {
      return Array.isArray(arr);
    },
    webRTCAdapter: (deps && deps.adapter) || adapter,
    httpAPICall: function(url, options) {
      var fetchOptions = {
        method: options.verb,
        headers: {
          'Accept': 'application/json, text/plain, */*'
        },
        cache: 'no-cache'
      };
      if (options.verb === "POST") {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
      if (options.withCredentials !== undefined) {
        fetchOptions.credentials = options.withCredentials === true ? 'include' : (options.withCredentials ? options.withCredentials :
            'omit');
      }
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      var fetching = f(url, fetchOptions).catch(function(error) {
        return p.reject({
          message: 'Probably a network error, is the server down?',
          error: error
        });
      });

      if (options.timeout) {
        var timeout = new p(function(resolve, reject) {
          var timerId = setTimeout(function() {
            clearTimeout(timerId);
            return reject({
              message: 'Request timed out',
              timeout: options.timeout
            });
          }, options.timeout);
        });
        fetching = p.race([fetching, timeout]);
      }

      fetching.then(function(response) {
        TvRTC.log("httpAPICall response",response);
        if (response.ok) {
          if (typeof(options.success) === typeof(TvRTC.noop)) {
            return response.json().then(function(parsed) {
              options.success(parsed);
            }).catch(function(error) {
              return p.reject({
                message: 'Failed to parse response body',
                error: error,
                response: response
              });
            });
          }
        } else {
          return p.reject({
            message: 'API call failed',
            response: response
          });
        }
      }).catch(function(error) {
        TvRTC.log("httpAPICall error",error);
        if (typeof(options.error) === typeof(TvRTC.noop)) {
          options.error(error.message || '<< internal error >>', error);
        }
      });

      return fetching;
    }
  }
};

TvRTC.useOldDependencies = function(deps) {
  var jq = (deps && deps.jQuery) || jQuery;
  var socketCls = (deps && deps.WebSocket) || WebSocket;
  return {
    newWebSocket: function(server, proto) {
      return new socketCls(server, proto);
    },
    isArray: function(arr) {
      return jq.isArray(arr);
    },
    extension: (deps && deps.extension) || defaultExtension,
    webRTCAdapter: (deps && deps.adapter) || adapter,
    httpAPICall: function(url, options) {
      var payload = options.body !== undefined ? {
        contentType: 'application/json',
        data: JSON.stringify(options.body)
      } : {};
      var credentials = options.withCredentials !== undefined ? {
        xhrFields: {
          withCredentials: options.withCredentials
        }
      } : {};

      return jq.ajax(jq.extend(payload, credentials, {
        url: url,
        type: options.verb,
        cache: false,
        dataType: 'json',
        async: options.async,
        timeout: options.timeout,
        success: function(result) {
          if (typeof(options.success) === typeof(TvRTC.noop)) {
            options.success(result);
          }
        },
        error: function(xhr, status, err) {
          if (typeof(options.error) === typeof(TvRTC.noop)) {
            options.error(status, err);
          }
        }
      }));
    }
  };
};

TvRTC.noop = function() {};

TvRTC.dataChanDefaultLabel = "TvRTCDataChannel";

// Note: in the future we may want to change this, e.g., as was
// attempted in https://github.com/meetecho/janus-gateway/issues/1670
TvRTC.endOfCandidates = null;

// Initialization
TvRTC.init = function(options) {
  options = options || {};
  options.callback = (typeof options.callback == "function") ? options.callback : TvRTC.noop;
  if (TvRTC.initDone) {
    // Already initialized
    options.callback();
  } else {
    if (typeof console == "undefined" || typeof console.log == "undefined") {
      console = {
        log: function() {}
      };
    }
    // Console logging (all debugging disabled by default)
    TvRTC.trace = TvRTC.noop;
    TvRTC.debug = TvRTC.noop;
    TvRTC.vdebug = TvRTC.noop;
    TvRTC.log = TvRTC.noop;
    TvRTC.warn = TvRTC.noop;
    TvRTC.error = TvRTC.noop;
    if (options.debug === true || options.debug === "all") {
      TvRTC.trace = console.log.bind(console);
      TvRTC.debug = console.log.bind(console);
      TvRTC.vdebug = console.log.bind(console);
      TvRTC.log = console.log.bind(console);
      TvRTC.warn = console.warn.bind(console);
      TvRTC.error = console.error.bind(console);
    } else if (Array.isArray(options.debug)) {
      for (var d of options.debug) {
        switch (d) {
          case "trace":
            TvRTC.trace = console.trace.bind(console);
            break;
          case "debug":
            TvRTC.debug = console.debug.bind(console);
            break;
          case "vdebug":
            TvRTC.vdebug = console.debug.bind(console);
            break;
          case "log":
            TvRTC.log = console.log.bind(console);
            break;
          case "warn":
            TvRTC.warn = console.warn.bind(console);
            break;
          case "error":
            TvRTC.error = console.error.bind(console);
            break;
          default:
            console.error("Unknown debugging option '" + d +
                "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
            break;
        }
      }
    }
    TvRTC.log("Initializing library");

    const usedDependencies = options.dependencies || TvRTC.useDefaultDependencies();
    TvRTC.isArray = usedDependencies.isArray;
    TvRTC.webRTCAdapter = usedDependencies.webRTCAdapter;
    TvRTC.httpAPICall = usedDependencies.httpAPICall;
    TvRTC.newWebSocket = usedDependencies.newWebSocket;
    TvRTC.extension = usedDependencies.extension;
    TvRTC.extension.init();


    // Helper methods to attach/reattach a stream to a video element (previously part of adapter.js)
    TvRTC.attachMediaStream = function(element, stream) {
      try {
        element.srcObject = stream;
      } catch (e) {
        try {
          element.src = URL.createObjectURL(stream);
        } catch (e) {
          TvRTC.error("Error attaching stream to element");
        }
      }
    };
    TvRTC.reattachMediaStream = function(to, from) {
      try {
        to.srcObject = from.srcObject;
      } catch (e) {
        try {
          to.src = from.src;
        } catch (e) {
          TvRTC.error("Error reattaching stream to element");
        }
      }
    };
    // Detect tab close: make sure we don't loose existing onbeforeunload handlers
    // (note: for iOS we need to subscribe to a different event, 'pagehide', see
    // https://gist.github.com/thehunmonkgroup/6bee8941a49b86be31a787fe8f4b8cfe)
    var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
    var eventName = iOS ? 'pagehide' : 'beforeunload';
    var oldOBF = window["on" + eventName];
    window.addEventListener(eventName, function(event) {
      TvRTC.log("Closing window");
      for (var s in TvRTC.sessions) {
        if (TvRTC.sessions[s] && TvRTC.sessions[s].destroyOnUnload) {
          TvRTC.log("Destroying session " + s);
          TvRTC.sessions[s].destroy({
            unload: true,
            notifyDestroyed: false
          });
        }
      }
      if (oldOBF && typeof oldOBF == "function") {
        oldOBF();
      }
    });
    // If this is a Safari Technology Preview, check if VP8 is supported
    TvRTC.safariVp8 = false;
    if (TvRTC.webRTCAdapter.browserDetails.browser === 'safari' &&
        TvRTC.webRTCAdapter.browserDetails.version >= 605) {
      // Let's see if RTCRtpSender.getCapabilities() is there
      if (RTCRtpSender && RTCRtpSender.getCapabilities && RTCRtpSender.getCapabilities("video") &&
          RTCRtpSender.getCapabilities("video").codecs && RTCRtpSender.getCapabilities("video").codecs.length) {
        for (var codec of RTCRtpSender.getCapabilities("video").codecs) {
          if (codec && codec.mimeType && codec.mimeType.toLowerCase() === "video/vp8") {
            TvRTC.safariVp8 = true;
            break;
          }
        }
        if (TvRTC.safariVp8) {
          TvRTC.log("This version of Safari supports VP8");
        } else {
          TvRTC.warn("This version of Safari does NOT support VP8: if you're using a Technology Preview, " +
              "try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
        }
      } else {
        // We do it in a very ugly way, as there's no alternative...
        // We create a PeerConnection to see if VP8 is in an offer
        var testpc = new RTCPeerConnection({});
        testpc.createOffer({
          offerToReceiveVideo: true
        }).then(function(offer) {
          TvRTC.safariVp8 = offer.sdp.indexOf("VP8") !== -1;
          if (TvRTC.safariVp8) {
            TvRTC.log("This version of Safari supports VP8");
          } else {
            TvRTC.warn("This version of Safari does NOT support VP8: if you're using a Technology Preview, " +
                "try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
          }
          testpc.close();
          testpc = null;
        });
      }
    }
    // Check if this browser supports Unified Plan and transceivers
    // Based on https://codepen.io/anon/pen/ZqLwWV?editors=0010
    TvRTC.unifiedPlan = false;
    if (TvRTC.webRTCAdapter.browserDetails.browser === 'firefox' &&
        TvRTC.webRTCAdapter.browserDetails.version >= 59) {
      // Firefox definitely does, starting from version 59
      TvRTC.unifiedPlan = true;
    } else if (TvRTC.webRTCAdapter.browserDetails.browser === 'chrome' &&
        TvRTC.webRTCAdapter.browserDetails.version < 72) {
      // Chrome does, but it's only usable from version 72 on
      TvRTC.unifiedPlan = false;
    } else if (!window.RTCRtpTransceiver || !('currentDirection' in RTCRtpTransceiver.prototype)) {
      // Safari supports addTransceiver() but not Unified Plan when
      // currentDirection is not defined (see codepen above).
      TvRTC.unifiedPlan = false;
    } else {
      // Check if addTransceiver() throws an exception
      var tempPc = new RTCPeerConnection();
      try {
        tempPc.addTransceiver('audio');
        TvRTC.unifiedPlan = true;
      } catch (e) {}
      tempPc.close();
    }
    TvRTC.initDone = true;
    options.callback();
  }
};

// Helper method to check whether WebRTC is supported by this browser
TvRTC.isWebrtcSupported = function() {
  return !!window.RTCPeerConnection;
};
// Helper method to check whether devices can be accessed by this browser (e.g., not possible via plain HTTP)
TvRTC.isGetUserMediaAvailable = function() {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
};

// Helper method to enumerate devices
TvRTC.listDevices = function(callback, config) {
  callback = (typeof callback == "function") ? callback : TvRTC.noop;
  if (config == null) config = {
    audio: true,
    video: true
  };
  if (TvRTC.isGetUserMediaAvailable()) {
    navigator.mediaDevices.getUserMedia(config)
        .then(function(stream) {
          navigator.mediaDevices.enumerateDevices().then(function(devices) {
            // TvRTC.log(devices);
            callback(devices);
            // Get rid of the now useless stream
            try {
              var tracks = stream.getTracks();
              for (var mst of tracks) {
                if (mst)
                  mst.stop();
              }
            } catch (e) {}
          });
        })
        .catch(function(err) {
          TvRTC.error(err);
          callback([]);
        });
  } else {
    TvRTC.warn("navigator.mediaDevices unavailable");
    callback([]);
  }
};

// Helper method to create random identifiers (e.g., transaction)
TvRTC.randomString = function(len) {
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
};

TvRTC.createConnection = function(gatewayCallbacks) {
  gatewayCallbacks = gatewayCallbacks || {};
  gatewayCallbacks.success = (typeof gatewayCallbacks.success == "function") ? gatewayCallbacks.success : TvRTC.noop;
  gatewayCallbacks.error = (typeof gatewayCallbacks.error == "function") ? gatewayCallbacks.error : TvRTC.noop;
  gatewayCallbacks.destroyed = (typeof gatewayCallbacks.destroyed == "function") ? gatewayCallbacks.destroyed : TvRTC.noop;
  if (!TvRTC.initDone) {
    gatewayCallbacks.error("Library not initialized");
    return {};
  }
  if (!TvRTC.isWebrtcSupported()) {
    gatewayCallbacks.error("WebRTC not supported by this browser");
    return {};
  }
  TvRTC.log("Library initialized: " + TvRTC.initDone);
  if (!gatewayCallbacks.server) {
    gatewayCallbacks.error("Invalid server url");
    return {};
  }
  let websockets = false;
  let ws = null;
  let wsHandlers = {};
  let wsKeepaliveTimeoutId = null;
  let wsKeepaSendTimeoutId = null;
  let isClose = false;
  let servers = null;
  let serversIndex = 0;
  let closeIndex = 0;
  let server = gatewayCallbacks.server;
  if (TvRTC.isArray(server)) {
    TvRTC.log("Multiple servers provided (" + server.length + "), will use the first that works");
    server = null;
    servers = gatewayCallbacks.server;
  } else {
    if (server.indexOf("ws") === 0) {
      websockets = true;
      TvRTC.log("Using WebSockets to contact TvRTC: " + server);
    } else {
      websockets = false;
      TvRTC.log("Using REST API to contact TvRTC: " + server);
    }
  }
  let iceServers = gatewayCallbacks.iceServers || [{
    urls: "stun:stun.zwan.com.cn:2231"
  }];
  let iceTransportPolicy = gatewayCallbacks.iceTransportPolicy;
  let bundlePolicy = gatewayCallbacks.bundlePolicy;
  // Whether IPv6 candidates should be gathered
  let ipv6Support = (gatewayCallbacks.ipv6 === true);
  // Whether we should enable the withCredentials flag for XHR requests
  let withCredentials = false;
  if (gatewayCallbacks.withCredentials !== undefined && gatewayCallbacks.withCredentials !== null)
    withCredentials = gatewayCallbacks.withCredentials === true;
  // Optional max events
  let maxev = 10;
  if (gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null)
    maxev = gatewayCallbacks.max_poll_events;
  if (maxev < 1)
    maxev = 1;
  // Token to use (only if the token based authentication mechanism is enabled)
  let token = null;
  if (gatewayCallbacks.token !== undefined && gatewayCallbacks.token !== null)
    token = gatewayCallbacks.token;
  // API secret to use (only if the shared API secret is enabled)
  let apisecret = null;
  if (gatewayCallbacks.apisecret !== undefined && gatewayCallbacks.apisecret !== null)
    apisecret = gatewayCallbacks.apisecret;
  // Whether we should destroy this session when onbeforeunload is called
  this.destroyOnUnload = true;
  if (gatewayCallbacks.destroyOnUnload !== undefined && gatewayCallbacks.destroyOnUnload !== null)
    this.destroyOnUnload = (gatewayCallbacks.destroyOnUnload === true);
  // Some timeout-related values
  let keepAlivePeriod = 15000;
  if (gatewayCallbacks.keepAlivePeriod !== undefined && gatewayCallbacks.keepAlivePeriod !== null)
    keepAlivePeriod = gatewayCallbacks.keepAlivePeriod;
  if (isNaN(keepAlivePeriod))
    keepAlivePeriod = 25000;
  let longPollTimeout = 60000;
  if (gatewayCallbacks.longPollTimeout !== undefined && gatewayCallbacks.longPollTimeout !== null)
    longPollTimeout = gatewayCallbacks.longPollTimeout;
  if (isNaN(longPollTimeout))
    longPollTimeout = 60000;

  // overrides for default maxBitrate values for simulcasting
  function getMaxBitrates(simulcastMaxBitrates) {
    const maxBitrates = {
      high: 900000,
      medium: 300000,
      low: 100000,
    };

    if (simulcastMaxBitrates !== undefined && simulcastMaxBitrates !== null) {
      if (simulcastMaxBitrates.high)
        maxBitrates.high = simulcastMaxBitrates.high;
      if (simulcastMaxBitrates.medium)
        maxBitrates.medium = simulcastMaxBitrates.medium;
      if (simulcastMaxBitrates.low)
        maxBitrates.low = simulcastMaxBitrates.low;
    }

    return maxBitrates;
  }

  let connected = false;
  let sessionId = null;
  let pluginHandles = {};
  let that = this;
  let retries = 0;
  let transactions = {};
  let userOption = {};
  createSession(gatewayCallbacks);

  // Public methods
  this.getServer = function() {
    return server;
  };
  this.isConnected = function() {
    return connected;
  };
  this.reconnect = function(callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    callbacks["reconnect"] = true;
    createSession(callbacks);
  };
  this.getSessionId = function() {
    return sessionId;
  };
  this.destroy = function(callbacks) {
    destroySession(callbacks);
  };
  this.attach = function(callbacks) {
    createHandle(callbacks);
  };

  this.pluginHandler = function() {
    return pluginHandles[sessionId];
  }

  this.setOption = function(option) {
    userOption = option;
  }

  // 处理服务器下发信令
  function handleEvent(json, skipTimeout) {
    retries = 0;

    if (json["janus"] === "ack") {
      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', json["janus"], 'json', json);
      let transaction = json["transaction"];
      if (transaction) {
        let reportSuccess = transactions[transaction];
        if (reportSuccess)
          reportSuccess(json);
        delete transactions[transaction];
      }
      return;
    } else if (json["janus"] === "success") {
      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', json["janus"], 'json', json);
      var transaction = json["transaction"];
      if (transaction) {
        var reportSuccess = transactions[transaction];
        if (reportSuccess)
          reportSuccess(json);
        delete transactions[transaction];
      }
      return;
    }  else if (json["janus"] === "error") {
      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', json["janus"], 'json', json);
      var transaction = json["transaction"];
      if (transaction) {
        var reportSuccess = transactions[transaction];
        if (reportSuccess) {
          reportSuccess(json);
        }
        delete transactions[transaction];
      }
      var pluginHandle = pluginHandles[sessionId];
      var callback = pluginHandle.onmessage;
      if (callback) {
        TvRTC.debug("Notifying application...");
        // Send to callback specified when attaching plugin handle
        callback(sessionId, json["error"]);
      } else {
        // Send to generic callback (?)
        TvRTC.debug("No provided notification callback");
      }
      if (json["error"].code === 458){
        destroyHandle(sessionId,{
          noRequest: true
        });
      }
      return;
    } else if (json["janus"] === "event") {
      let sender = json["sender"];
      if (!sender) {
        TvRTC.warn("Missing sender...");
        return;
      }
      let plugindata = json["plugindata"];
      if (!plugindata) {
        TvRTC.warn("Missing plugindata...");
        return;
      }

      let data = plugindata["data"];

      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', data['event'], 'json', json);
      let pluginHandle = pluginHandles[sessionId];
      if(!pluginHandle) {
        TvRTC.log("This handle is not attached to this session");
        return;
      }
      let callback = pluginHandle.onmessage;
      if (callback) {
        callback(sessionId, data);
      }
    } else if (json["janus"] === "timeout") {
      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', json["janus"], 'json', json);
      if (websockets) {
        ws.close(3504, "Gateway timeout");
      }
      gatewayCallbacks.error("service Timeout on session" + sessionId);
      return;
    } else {
      TvRTC.debug(tvlogTag.MS2SDK, 'sessionId', sessionId, 'result', json["janus"]);
    }
  }

  // Private helper to send keep-alive messages on WebSockets
  function keepAlive() {
    if (!server || !websockets || !connected)
      return;
    wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
    var request = {
      "janus": "keepalive",
      "session_id": sessionId,
      "transaction": TvRTC.randomString(12)
    };
    if (token)
      request["token"] = token;
    if (apisecret)
      request["apisecret"] = apisecret;
    if (ws){
      TvRTC.log(tvlogTag.SDK2MS, 'sessionId', sessionId,'request', request['janus'], 'body', request);
      ws.send(JSON.stringify(request));
    }
  }

  // Private method to create a session
  function createSession(callbacks) {
    const transaction = TvRTC.randomString(12);
    const request = {
      "janus": "create",
      "transaction": transaction
    };

    if (token)
      request["token"] = token;
    if (apisecret)
      request["apisecret"] = apisecret;
    if (!server && TvRTC.isArray(servers)) {
      // We still need to find a working server from the list we were given
      server = servers[serversIndex];
      if (server.indexOf("ws") === 0) {
        websockets = true;
        TvRTC.log("Server #" + (serversIndex + 1) + ": trying WebSockets to contact TvRTC (" + server + ")");
      } else {
        websockets = false;
        TvRTC.log("Server #" + (serversIndex + 1) + ": trying REST API to contact TvRTC (" + server + ")");
      }
    }
    if (websockets) {
      ws = TvRTC.newWebSocket(server, 'zwan-protocol');
      wsHandlers = {
        'error': function() {
          TvRTC.error("Error connecting to the TvRTC WebSockets server... " + server);
          if (TvRTC.isArray(servers) && !callbacks["reconnect"]) {
            serversIndex++;
            if (serversIndex === servers.length) {
              // We tried all the servers the user gave us and they all failed
              callbacks.error("Error connecting to any of the provided TvRTC servers: Is the server down?");
              return;
            }
            // Let's try the next server
            server = null;
            setTimeout(function() {
              createSession(callbacks);
            }, 200);
            return;
          } else {
            isClose = true;
            serversIndex++;
            if (serversIndex === 3) {
              callbacks.error("Error connecting to the TvRTC WebSockets server: Is the server down?");
              return;
            } else {
              setTimeout(function () {
                createSession(callbacks);
              }, 200);
              return;
            }
          }
        },

        'open': function() {
          TvRTC.log("WebSockets server " + server + " opened");
          // We need to be notified about the success
          transactions[transaction] = function(json) {
            if (json["janus"] !== "success") {
              callbacks.error(json["error"].reason);
              return;
            }
            if (wsKeepaSendTimeoutId) {
              clearTimeout(wsKeepaSendTimeoutId);
              wsKeepaSendTimeoutId = null;
            }
            wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
            connected = true;
            sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
            if (callbacks["reconnect"]) {
              TvRTC.log("Claimed session: " + sessionId);
            } else {
              TvRTC.log("Created session: " + sessionId);
            }
            TvRTC.sessions[sessionId] = that;
            callbacks.success(sessionId);  //回调到core，继续attach
          };

          TvRTC.log(tvlogTag.SDK2MS, 'request', request['janus'], 'body', request);
          ws.send(JSON.stringify(request))
          wsKeepaSendTimeoutId = setTimeout( function () {
            ws.close();
            isClose = true;
            createSession(callbacks);
          }, 500);
        },

        'message': function(event) {
          TvRTC.log("got message", event);
          handleEvent(JSON.parse(event.data));
        },

        'close': function() {
          TvRTC.log("close WebSockets server... " + server , transaction);
          if (!isClose){
            closeIndex ++;
            TvRTC.log("WebSockets reconnect... " + server , transaction, closeIndex);
            if (closeIndex < 5){
              createSession(callbacks);
            }else {
              if (!server || !connected) {
                return;
              }
              connected = false;
              callbacks.error("Error connecting to the TvRTC WebSockets server: Is the server down?");
            }
          }
        }
      };

      for (var eventName in wsHandlers) {
        ws.addEventListener(eventName, wsHandlers[eventName]);
      }
      return;
    }
    else {
      TvRTC.error("we only support websocket");
    }
  }

  // Private method to destroy a session
  function destroySession(callbacks) {
    callbacks = callbacks || {};
    // FIXME This method triggers a success even when we fail
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    var unload = (callbacks.unload === true);
    var notifyDestroyed = true;
    if (callbacks.notifyDestroyed !== undefined && callbacks.notifyDestroyed !== null)
      notifyDestroyed = (callbacks.notifyDestroyed === true);
    TvRTC.log("Destroying session " + sessionId + " (unload=" + unload + ")");
    if (!sessionId) {
      TvRTC.warn("No session to destroy");
      callbacks.success();
      if (notifyDestroyed)
        gatewayCallbacks.destroyed();
      return;
    }

    destroyHandle(pluginHandles[sessionId], {
      noRequest: true
    });
    if (!connected) {
      TvRTC.warn("Is the server down? (connected=false)");
      sessionId = null;
      callbacks.success();
      return;
    }
  }

  // Private method to create a plugin handle
  function createHandle(callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    callbacks.consentDialog = (typeof callbacks.consentDialog == "function") ? callbacks.consentDialog : TvRTC.noop;
    callbacks.iceState = (typeof callbacks.iceState == "function") ? callbacks.iceState : TvRTC.noop;
    callbacks.mediaState = (typeof callbacks.mediaState == "function") ? callbacks.mediaState : TvRTC.noop;
    callbacks.webrtcState = (typeof callbacks.webrtcState == "function") ? callbacks.webrtcState : TvRTC.noop;
    callbacks.slowLink = (typeof callbacks.slowLink == "function") ? callbacks.slowLink : TvRTC.noop;
    callbacks.onmessage = (typeof callbacks.onmessage == "function") ? callbacks.onmessage : TvRTC.noop;
    callbacks.onlocalstream = (typeof callbacks.onlocalstream == "function") ? callbacks.onlocalstream : TvRTC.noop;
    callbacks.onremotestream = (typeof callbacks.onremotestream == "function") ? callbacks.onremotestream : TvRTC.noop;
    callbacks.ondata = (typeof callbacks.ondata == "function") ? callbacks.ondata : TvRTC.noop;
    callbacks.ondataopen = (typeof callbacks.ondataopen == "function") ? callbacks.ondataopen : TvRTC.noop;
    callbacks.oncleanup = (typeof callbacks.oncleanup == "function") ? callbacks.oncleanup : TvRTC.noop;
    callbacks.ondetached = (typeof callbacks.ondetached == "function") ? callbacks.ondetached : TvRTC.noop;
    if (!connected) {
      TvRTC.warn("Is the server down? (connected=false)");
      callbacks.error("Is the server down? (connected=false)");
      return;
    }
    var plugin = callbacks.plugin;
    if (!plugin) {
      TvRTC.warn("Invalid plugin");
      callbacks.error("Invalid plugin");
      return;
    }
    var opaqueId = callbacks.opaqueId;
    var handleToken = callbacks.token ? callbacks.token : token;
    var transaction = TvRTC.randomString(12);
    var request = {
      "janus": "attach",
      "plugin": plugin,
      "opaque_id": opaqueId,
      "transaction": transaction
    };
    if (handleToken)
      request["token"] = handleToken;
    if (apisecret)
      request["apisecret"] = apisecret;
    if (websockets) {
      transactions[transaction] = function(json) {
        if (json["janus"] !== "success") {
          TvRTC.warn("Ooops: " + json["error"].code + " " + json["error"].reason);
          callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
          return;
        }
        var handleId = json.data["id"];
        TvRTC.log("Created handle: " + handleId);
        var pluginHandle = {
          session: that,
          plugin: plugin,
          sessionid: sessionId,
          id: handleId,
          token: handleToken,
          detached: false,
          webrtcStuff: {
            started: false,
            myStream: null,
            streamExternal: false,
            remoteStream: null,
            mySdp: null,
            mediaConstraints: null,
            pc: null,
            dataChannel: {},
            dtmfSender: null,
            trickle: true,
            iceDone: false,
            volume: {
              value: null,
              timer: null
            },
            bitrate: {
              value: null,
              bsnow: null,
              bsbefore: null,
              tsnow: null,
              tsbefore: null,
              timer: null
            }
          },
          getId: function() {
            return handleId;
          },
          getPlugin: function() {
            return plugin;
          },
          getVolume: function() {
            return getVolume(handleId, true);
          },
          getRemoteVolume: function() {
            return getVolume(handleId, true);
          },
          getLocalVolume: function() {
            return getVolume(handleId, false);
          },
          isAudioMuted: function() {
            return isMuted(handleId, false);
          },
          muteAudio: function() {
            return mute(handleId, false, true);
          },
          unmuteAudio: function() {
            return mute(handleId, false, false);
          },
          isVideoMuted: function() {
            return isMuted(handleId, true);
          },
          muteVideo: function() {
            return mute(handleId, true, true);
          },
          unmuteVideo: function() {
            return mute(handleId, true, false);
          },
          getBitrate: function() {
            return getBitrate(handleId);
          },
          setBitrate: function(callbacks) {
            return setBitrate(handleId, callbacks);
          },
          getQos: function(callbacks){
            return getQos(handleId, callbacks);
          },
          send: function(callbacks) {
            sendMessage(handleId, callbacks);
          },
          data: function(callbacks) {
            sendData(handleId, callbacks);
          },
          dtmf: function(callbacks) {
            sendDtmf(handleId, callbacks);
          },
          consentDialog: callbacks.consentDialog,
          iceState: callbacks.iceState,
          mediaState: callbacks.mediaState,
          webrtcState: callbacks.webrtcState,
          slowLink: callbacks.slowLink,
          onmessage: callbacks.onmessage,
          createOffer: function(callbacks) {
            prepareWebrtc(handleId, true, callbacks);
          },
          createAnswer: function(callbacks) {
            prepareWebrtc(handleId, false, callbacks);
          },
          onlocalstream: callbacks.onlocalstream,
          onremotestream: callbacks.onremotestream,
          ondata: callbacks.ondata,
          ondataopen: callbacks.ondataopen,
          oncleanup: callbacks.oncleanup,
          ondetached: callbacks.ondetached,
          streamstop: function(sendRequest) {
            cleanupWebrtc(handleId, sendRequest === true);
          },
          detach: function(callbacks) {
            destroyHandle(handleId, callbacks);
          }
        };
        pluginHandles[sessionId] = pluginHandle;
        callbacks.success(handleId);
      };
      request["session_id"] = sessionId;
      TvRTC.log(tvlogTag.SDK2MS, 'request', request['janus'], 'body', request);
      ws.send(JSON.stringify(request));
      return;
    }
  }

  // 向服务器发送消息
  function sendMessage(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    if (!connected) {
      TvRTC.warn("Is the server down? (connected=false)");
      callbacks.error("Is the server down? (connected=false)");
      return;
    }
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var message = callbacks.message;
    var transaction = TvRTC.randomString(12);
    var request = {
      "janus": "message",
      "body": message,
      "transaction": transaction
    };
    TvRTC.debug("Sending message to plugin (handle=" + handleId + "):");
    TvRTC.debug(request);
    if (websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      transactions[transaction] = function(json) {
        if (json["janus"] === "success") {
          let plugindata = json["plugindata"];
          if (!plugindata) {
            TvRTC.warn("Request succeeded, but missing plugindata...");
            callbacks.success();
            return;
          }
          let data = plugindata["data"];
          callbacks.success(data);
          return;
        } else if (json["janus"] !== "ack") {
          // Not a success and not an ack, must be an error
          if (json["error"]) {
            TvRTC.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
            callbacks.error(json["error"].code + " " + json["error"].reason);
          } else {
            TvRTC.warn("Unknown error"); // FIXME
            callbacks.error("Unknown error");
          }
          return;
        }
        // If we got here, the plugin decided to handle the request asynchronously
        callbacks.success();
      };
      TvRTC.log(tvlogTag.SDK2MS, 'request', request['janus'], 'sessionId', sessionId, 'body', request);
      ws.send(JSON.stringify(request));
      return;
    }
  }

  // Private method to send a trickle candidate
  function sendTrickleCandidate(handleId, candidate) {
    if (!connected) {
      TvRTC.warn("Is the server down? (connected=false)");
      return;
    }
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return;
    }
    candidate["request"] = "trickle";
    var request = {
      "janus": "message",
      "body": candidate,
      "transaction": TvRTC.randomString(12)
    };
    if (websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      TvRTC.log(tvlogTag.SDK2MS, 'sessionId', sessionId, 'request', 'trickle', 'body', request);
      ws.send(JSON.stringify(request));
      return;
    }
  }

  // Private method to create a data channel
  function createDataChannel(handleId, dclabel, incoming, pendingData) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    if(!config.pc) {
      TvRTC.warn("Invalid PeerConnection");
      return;
    }
    var onDataChannelMessage = function(event) {
      TvRTC.log('Received message on data channel:', event);
      var label = event.target.label;
      pluginHandler.ondata(event.data, label);
    };
    var onDataChannelStateChange = function(event) {
      TvRTC.log('Received state change on data channel:', event);
      var label = event.target.label;
      var dcState = config.dataChannel[label] ? config.dataChannel[label].readyState : "null";
      TvRTC.log('State change on <' + label + '> data channel: ' + dcState);
      if (dcState === 'open') {
        // Any pending messages to send?
        if (config.dataChannel[label].pending && config.dataChannel[label].pending.length > 0) {
          TvRTC.log("Sending pending messages on <" + label + ">:", config.dataChannel[label].pending.length);
          for (var data of config.dataChannel[label].pending) {
            TvRTC.log("Sending data on data channel <" + label + ">");
            TvRTC.debug(data);
            config.dataChannel[label].send(data);
          }
          config.dataChannel[label].pending = [];
        }
        // Notify the open data channel
        pluginHandler.ondataopen(label);
      }
    };
    var onDataChannelError = function(error) {
      TvRTC.error('Got error on data channel:', error);
      // TODO
    };
    if (!incoming) {
      // FIXME Add options (ordered, maxRetransmits, etc.)
      config.dataChannel[dclabel] = config.pc.createDataChannel(dclabel, {
        ordered: true
      });
    } else {
      // The channel was created by TvRTC
      config.dataChannel[dclabel] = incoming;
    }
    config.dataChannel[dclabel].onmessage = onDataChannelMessage;
    config.dataChannel[dclabel].onopen = onDataChannelStateChange;
    config.dataChannel[dclabel].onclose = onDataChannelStateChange;
    config.dataChannel[dclabel].onerror = onDataChannelError;
    config.dataChannel[dclabel].pending = [];
    if (pendingData)
      config.dataChannel[dclabel].pending.push(pendingData);
  }

  // Private method to send a data channel message
  function sendData(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    var data = callbacks.text || callbacks.data;
    if (!data) {
      TvRTC.warn("Invalid data");
      callbacks.error("Invalid data");
      return;
    }
    var label = callbacks.label ? callbacks.label : TvRTC.dataChanDefaultLabel;
    if (!config.dataChannel[label]) {
      // Create new data channel and wait for it to open
      createDataChannel(handleId, label, false, data);
      callbacks.success();
      return;
    }
    if (config.dataChannel[label].readyState !== "open") {
      config.dataChannel[label].pending.push(data);
      callbacks.success();
      return;
    }
    TvRTC.log("Sending data on data channel <" + label + ">");
    TvRTC.debug(data);
    config.dataChannel[label].send(data);
    callbacks.success();
  }

  // Private method to send a DTMF tone
  function sendDtmf(handleId, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    if (!config.dtmfSender) {
      // Create the DTMF sender the proper way, if possible
      if (config.pc) {
        var senders = config.pc.getSenders();
        var audioSender = senders.find(function(sender) {
          return sender.track && sender.track.kind === 'audio';
        });
        if (!audioSender) {
          TvRTC.warn("Invalid DTMF configuration (no audio track)");
          callbacks.error("Invalid DTMF configuration (no audio track)");
          return;
        }
        config.dtmfSender = audioSender.dtmf;
        if (config.dtmfSender) {
          TvRTC.log("Created DTMF Sender");
          config.dtmfSender.ontonechange = function(tone) {
            TvRTC.debug("Sent DTMF tone: " + tone.tone);
          };
        }
      }
      if (!config.dtmfSender) {
        TvRTC.warn("Invalid DTMF configuration");
        callbacks.error("Invalid DTMF configuration");
        return;
      }
    }
    var dtmf = callbacks.dtmf;
    if (!dtmf) {
      TvRTC.warn("Invalid DTMF parameters");
      callbacks.error("Invalid DTMF parameters");
      return;
    }
    var tones = dtmf.tones;
    if (!tones) {
      TvRTC.warn("Invalid DTMF string");
      callbacks.error("Invalid DTMF string");
      return;
    }
    var duration = (typeof dtmf.duration === 'number') ? dtmf.duration : 500; // We choose 500ms as the default duration for a tone
    var gap = (typeof dtmf.gap === 'number') ? dtmf.gap : 50; // We choose 50ms as the default gap between tones
    TvRTC.debug("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
    config.dtmfSender.insertDTMF(tones, duration, gap);
    callbacks.success();
  }

  // Private method to destroy a plugin handle
  function destroyHandle(handleId, callbacks) {
    callbacks = callbacks || {};
    var notifyDestroyed = true;
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    var noRequest = (callbacks.noRequest === true);
    var pluginHandler = pluginHandles[sessionId]

    pluginHandler.detached = true;
    if(!connected) {
      TvRTC.warn("Is the server down? (connected=false)");
      callbacks.error("Is the server down? (connected=false)");
      return;
    }
    var request = {
      "janus": "message",
      "transaction": TvRTC.randomString(12)
    };
    let message = {
      "request": "hangup"
    };
    request["body"] = message;

    if (websockets) {
      request["session_id"] = sessionId;
      request["handle_id"] = handleId;
      TvRTC.log('destroyHandle websockets wsKeepaliveTimeoutId',transactions);
      var unbindWebSocket = function() {
        for (var eventName in wsHandlers) {
          ws.removeEventListener(eventName, wsHandlers[eventName]);
        }
        ws.removeEventListener('message', onUnbindMessage);
        ws.removeEventListener('error', onUnbindError);
        if (wsKeepaliveTimeoutId) {
          clearTimeout(wsKeepaliveTimeoutId);
        }
        TvRTC.log('destroyHandle wsKeepaliveTimeoutId',transactions)
        isClose = true;
        ws.close();
      };

      var onUnbindMessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.session_id == request.session_id && data.transaction == request.transaction) {
          unbindWebSocket();
          callbacks.success();
          if (notifyDestroyed)
            gatewayCallbacks.destroyed();
        }
      };
      var onUnbindError = function(event) {
        unbindWebSocket();
        callbacks.error("Failed to destroy the server: Is the server down?");
        if (notifyDestroyed)
          gatewayCallbacks.destroyed();
      };

      ws.addEventListener('message', onUnbindMessage);
      ws.addEventListener('error', onUnbindError);
      ws.send(JSON.stringify(request));
      TvRTC.log("Destroyed session:");
      sessionId = null;
      ws.onclose = null;
      isClose = true;
      ws.close();
      ws = null;
      if (noRequest) {
        TvRTC.log('destroyHandle noRequest wsKeepaliveTimeoutId',transactions)
        // We're only removing the handle locally
        if (wsKeepaliveTimeoutId) {
          clearTimeout(wsKeepaliveTimeoutId);
          wsKeepaliveTimeoutId = null;
        }
        // We're only removing the handle locally
        delete pluginHandles[sessionId];
        callbacks.success();
        return;
      }
      return;
    }
    TvRTC.httpAPICall(server + "/" + sessionId, {
      verb: 'POST',
      withCredentials: withCredentials,
      body: request,
      success: function(json) {
        TvRTC.log("Destroyed session:");
        TvRTC.debug(json);
        sessionId = null;
        connected = false;
        if(json["janus"] !== "success") {
          TvRTC.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
        }
        callbacks.success();
        if(notifyDestroyed)
          gatewayCallbacks.destroyed();
      },
      error: function(textStatus, errorThrown) {
        TvRTC.error(textStatus + ":", errorThrown);	// FIXME
        // Reset everything anyway
        sessionId = null;
        connected = false;
        callbacks.success();
        if(notifyDestroyed)
          gatewayCallbacks.destroyed();
      }
    });
  }

  // WebRTC stuff
  function streamsDone(handleId, jsep, media, callbacks, stream) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    TvRTC.debug("streamsDone:", stream);
    if (stream) {
      TvRTC.debug("  -- Audio tracks:", stream.getAudioTracks());
      TvRTC.debug("  -- Video tracks:", stream.getVideoTracks());
    }
    // We're now capturing the new stream: check if we're updating or if it's a new thing
    var addTracks = false;
    if (!config.myStream || !media.update || config.streamExternal) {
      config.myStream = stream;
      addTracks = true;
    } else {
      // We only need to update the existing stream
      if (((!media.update && isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
          stream.getAudioTracks() && stream.getAudioTracks().length) {
        config.myStream.addTrack(stream.getAudioTracks()[0]);
        if (TvRTC.unifiedPlan) {
          // Use Transceivers
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, (media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
          var audioTransceiver = null;
          var transceivers = config.pc.getTransceivers();
          if (transceivers && transceivers.length > 0) {
            for (var t of transceivers) {
              if ((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
                  (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
                audioTransceiver = t;
                break;
              }
            }
          }
          if (audioTransceiver && audioTransceiver.sender) {
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'replaceTrack', stream.getAudioTracks()[0]);
            audioTransceiver.sender.replaceTrack(stream.getAudioTracks()[0]);
          } else {
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'addTrack', stream.getAudioTracks()[0], stream);
            config.pc.addTrack(stream.getAudioTracks()[0], stream);
          }
        } else {
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, (media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
          config.pc.addTrack(stream.getAudioTracks()[0], stream);
        }
      }
      if (((!media.update && isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
          stream.getVideoTracks() && stream.getVideoTracks().length) {
        config.myStream.addTrack(stream.getVideoTracks()[0]);
        if (TvRTC.unifiedPlan) {
          // Use Transceivers
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, (media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
          var videoTransceiver = null;
          var transceivers = config.pc.getTransceivers();
          if (transceivers && transceivers.length > 0) {
            for (var t of transceivers) {
              if ((t.sender && t.sender.track && t.sender.track.kind === "video") ||
                  (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
                videoTransceiver = t;
                break;
              }
            }
          }
          if (videoTransceiver && videoTransceiver.sender) {
            videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
          } else {
            config.pc.addTrack(stream.getVideoTracks()[0], stream);
          }
        } else {
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, (media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
          config.pc.addTrack(stream.getVideoTracks()[0], stream);
        }
      }
    }
    // If we still need to create a PeerConnection, let's do that
    if (!config.pc) {
      var pc_config = {
        "iceServers": iceServers,
        "iceTransportPolicy": iceTransportPolicy,
        "bundlePolicy": bundlePolicy
      };
      if (TvRTC.webRTCAdapter.browserDetails.browser === "chrome") {
        // For Chrome versions before 72, we force a plan-b semantic, and unified-plan otherwise
        pc_config["sdpSemantics"] = (TvRTC.webRTCAdapter.browserDetails.version < 72) ? "plan-b" : "unified-plan";
      }
      if (TvRTC.webRTCAdapter.browserDetails.browser === "electron") {
        pc_config["sdpSemantics"] =  "unified-plan";
      }
      var pc_constraints = {
        "optional": [{
          "DtlsSrtpKeyAgreement": true
        }]
      };
      if (ipv6Support) {
        pc_constraints.optional.push({
          "googIPv6": true
        });
      }
      // Any custom constraint to add?
      if (callbacks.rtcConstraints && typeof callbacks.rtcConstraints === 'object') {
        TvRTC.debug("Adding custom PeerConnection constraints:", callbacks.rtcConstraints);
        for (var i in callbacks.rtcConstraints) {
          pc_constraints.optional.push(callbacks.rtcConstraints[i]);
        }
      }
      if (TvRTC.webRTCAdapter.browserDetails.browser === "edge") {
        // This is Edge, enable BUNDLE explicitly
        pc_config.bundlePolicy = "max-bundle";
      }
      TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Create RTCPeerConnection', 'param', pc_config, pc_constraints);
      config.pc = new RTCPeerConnection(pc_config, pc_constraints);
      TvRTC.debug(config.pc);
      if (config.pc.getStats) { // FIXME
        config.volume = {};
        config.bitrate.value = "0 kbits/sec";
      }
      TvRTC.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")");
      config.pc.oniceconnectionstatechange = function(e) {
        TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'oniceconnectionstatechange', 'param', e);
        if (config.pc && pluginHandler){
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'oniceconnectionstatechange', 'iceConnectionState', config.pc.iceConnectionState, 'connectionState', config.pc.connectionState);
          pluginHandler.iceState({iceConnectionState:config.pc.iceConnectionState, connectionState:config.pc.connectionState});
        }
      };
      config.pc.onicecandidate = function(event) {
        TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'onicecandidate', 'param', event);
        if (!event.candidate ||
            (TvRTC.webRTCAdapter.browserDetails.browser === 'edge' && event.candidate.candidate.indexOf('endOfCandidates') >
                0)) {
          // TvRTC.log("End of candidates.");
          // config.iceDone = true;
          // if (config.trickle === true) {
          // 	// Notify end of candidates
          // 	sendTrickleCandidate(handleId, {
          // 		"completed": true
          // 	});
          // } else {
          // 	// No trickle, time to send the complete SDP (including all candidates)
          // 	sendSDP(handleId, callbacks);
          // }
        } else {
          // JSON.stringify doesn't work on some WebRTC objects anymore
          // See https://code.google.com/p/chromium/issues/detail?id=467366
          var candidate = {
            "candidate": event.candidate.candidate,
            "sdpMid": event.candidate.sdpMid,
            "sdpMLineIndex": event.candidate.sdpMLineIndex
          };
          if (config.trickle === true && candidate["candidate"].length > 0) {
            // Send candidate
            sendTrickleCandidate(handleId, candidate);
          }
        }
      };
      config.pc.ontrack = function(event) {
        TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'ontrack', 'param', event);
        if (!event.streams)
          return;
        config.remoteStream = event.streams[0];
        pluginHandler.onremotestream(sessionId, config.remoteStream);
        if (event.track.onended)
          return;
        TvRTC.log("Adding onended callback to track:", event.track);
        var trackMutedTimeoutId = null;
        event.track.onended = function(ev) {
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'onended', 'param', ev);
          if (config.remoteStream) {
            clearTimeout(trackMutedTimeoutId);
            config.remoteStream.removeTrack(ev.target);
            pluginHandler.onremotestream(sessionId, config.remoteStream);
          }
        };
        event.track.onmute = function(ev) {
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'onmute', 'param', ev);
          if(config.remoteStream && trackMutedTimeoutId == null) {
            trackMutedTimeoutId = setTimeout(function() {
              TvRTC.log("Removing remote track");
              if (config.remoteStream) {
                config.remoteStream.removeTrack(ev.target);
                pluginHandler.onremotestream(sessionId, config.remoteStream);
              }
              trackMutedTimeoutId = null;
              // Chrome seems to raise mute events only at multiples of 834ms;
              // we set the timeout to three times this value (rounded to 840ms)
            }, 3 * 840);
          }
        };
        event.track.onunmute = function(ev) {
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'onunmute', 'param', ev);
          if(trackMutedTimeoutId != null) {
            clearTimeout(trackMutedTimeoutId);
            trackMutedTimeoutId = null;
          } else {
            try {
              config.remoteStream.addTrack(ev.target);
              pluginHandler.onremotestream(sessionId, config.remoteStream);
            } catch(e) {
              TvRTC.error(e);
            };
          }
        };
      };
    }
    if (addTracks && stream) {
      TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getTracks');
      stream.getTracks().forEach(function (track) {
        TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getTracks result', track);
        if (track.kind === "audio") {
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'addTrack audio', stream, track);
          config.pc.addTrack(track, stream);
        } else if(track.kind === "video"){
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'addTrack video', stream, track);
          config.pc.addTrack(track, stream);
        }
      });
    }
    // console.log(config.pc.getSenders());
    // console.log(config.pc.getTransceivers());
    // Any data channel to create?
    if (isDataEnabled(media) && !config.dataChannel[TvRTC.dataChanDefaultLabel]) {
      TvRTC.log("Creating data channel");
      createDataChannel(handleId, TvRTC.dataChanDefaultLabel, false);
      config.pc.ondatachannel = function(event) {
        TvRTC.log("Data channel created by TvRTC:", event);
        createDataChannel(handleId, event.channel.label, event.channel);
      };
    }
    // If there's a new local stream, let's notify the application
    if (config.myStream) {
      pluginHandler.onlocalstream(sessionId, config.myStream);
    }
    console.log(config.pc.getTransceivers());
    // Create offer/answer now
    if (!jsep) {
      createOffer(handleId, media, callbacks);
    } else {
      TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'setRemoteDescription', jsep);
      config.pc.setRemoteDescription(jsep)
          .then(function() {
            TvRTC.log("Remote description accepted!");
            console.log(config.pc.getTransceivers());
            config.remoteSdp = jsep.sdp;
            // Any trickle candidate we cached?
            if (config.candidates && config.candidates.length > 0) {
              for (var i = 0; i < config.candidates.length; i++) {
                var candidate = config.candidates[i];
                TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'addIceCandidate', candidate);
                if (!candidate || candidate.completed === true) {
                  // end-of-candidates
                  config.pc.addIceCandidate(TvRTC.endOfCandidates);
                } else {
                  // New candidate
                  config.pc.addIceCandidate(candidate);
                }
              }
              config.candidates = [];
            }
            // Create the answer now
            createAnswer(handleId, media, callbacks);
          }, callbacks.error);
    }
  }

  function prepareWebrtc(handleId, offer, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
    var jsep = callbacks.jsep;
    if (offer && jsep) {
      TvRTC.error("Provided a JSEP to a createOffer");
      callbacks.error("Provided a JSEP to a createOffer");
      return;
    } else if (!offer && (!jsep || !jsep.type || !jsep.sdp)) {
      TvRTC.error("A valid JSEP is required for createAnswer");
      callbacks.error("A valid JSEP is required for createAnswer");
      return;
    }
    /* Check that callbacks.media is a (not null) Object */
    if(callbacks.media === null || callbacks.media === undefined) {
      callbacks.media = userOption;
    }
    callbacks.media = (typeof callbacks.media === 'object' && callbacks.media) ? callbacks.media : {
      audio: true,
      video: true
    };
    var media = callbacks.media;
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    config.trickle = isTrickleEnabled(callbacks.trickle);
    // Are we updating a session?
    if (!config.pc) {
      // Nope, new PeerConnection
      media.update = false;
      media.keepAudio = false;
      media.keepVideo = false;
    }
    else {
      TvRTC.log("Updating existing media session");
      media.update = true;
      // Check if there's anything to add/remove/replace, or if we
      // can go directly to preparing the new SDP offer or answer
      if (callbacks.stream) {
        // External stream: is this the same as the one we were using before?
        if (callbacks.stream !== config.myStream) {
          TvRTC.log("Renegotiation involves a new external stream");
        }
      } else {
        // Check if there are changes on audio
        if (media.addAudio) {
          media.keepAudio = false;
          media.replaceAudio = false;
          media.removeAudio = false;
          media.audio.audiosend = true;
          if (config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
            TvRTC.error("Can't add audio stream, there already is one");
            callbacks.error("Can't add audio stream, there already is one");
            return;
          }
        } else if (media.removeAudio) {
          media.keepAudio = false;
          media.replaceAudio = false;
          media.addAudio = false;
          media.audio.audiosend = false;
        } else if (media.replaceAudio) {
          media.keepAudio = false;
          media.addAudio = false;
          media.removeAudio = false;
          media.audio.audiosend = true;
        }
        if (!config.myStream) {
          // No media stream: if we were asked to replace, it's actually an "add"
          if (media.replaceAudio) {
            media.keepAudio = false;
            media.replaceAudio = false;
            media.addAudio = true;
            media.audio.audiosend = true;
          }
          if (isAudioSendEnabled(media) && !media.removeAudio) {
            media.keepAudio = false;
            media.addAudio = true;
          }
        } else {
          if (!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
            // No audio track: if we were asked to replace, it's actually an "add"
            if (media.replaceAudio) {
              media.keepAudio = false;
              media.replaceAudio = false;
              media.addAudio = true;
              media.audio.audiosend = true;
            }
            if (isAudioSendEnabled(media) && !media.removeAudio) {
              media.keepAudio = false;
              media.addAudio = true;
            }
          } else {
            // We have an audio track: should we keep it as it is?
            if (isAudioSendEnabled(media) &&
                !media.removeAudio && !media.replaceAudio) {
              media.keepAudio = true;
            }
          }
        }
        // Check if there are changes on video
        if (media.addVideo) {
          media.keepVideo = false;
          media.replaceVideo = false;
          media.removeVideo = false;
          media.videoSend = true;
          if (config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
            TvRTC.error("Can't add video stream, there already is one");
            callbacks.error("Can't add video stream, there already is one");
            return;
          }
        } else if (media.removeVideo) {
          media.keepVideo = false;
          media.replaceVideo = false;
          media.addVideo = false;
          media.videoSend = false;
        } else if (media.replaceVideo) {
          media.keepVideo = false;
          media.addVideo = false;
          media.removeVideo = false;
          media.video.videosend = true;
        }
        if (!config.myStream) {
          // No media stream: if we were asked to replace, it's actually an "add"
          if (media.replaceVideo) {
            media.keepVideo = false;
            media.replaceVideo = false;
            media.addVideo = true;
            media.video.videosend = true;
          }
          if (isVideoSendEnabled(media)) {
            media.keepVideo = false;
            media.addVideo = true;
          }
        } else {
          if (!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
            // No video track: if we were asked to replace, it's actually an "add"
            if (media.replaceVideo) {
              media.keepVideo = false;
              media.replaceVideo = false;
              media.addVideo = true;
              media.video.videosend = true;
            }
            if (isVideoSendEnabled(media)) {
              media.keepVideo = false;
              media.addVideo = true;
            }
          } else {
            // We have a video track: should we keep it as it is?
            if (isVideoSendEnabled(media) && !media.removeVideo && !media.replaceVideo) {
              media.keepVideo = true;
            }
          }
        }
        // Data channels can only be added
        if (media.addData) {
          media.data = true;
        }
      }
      // If we're updating and keeping all tracks, let's skip the getUserMedia part
      if ((isAudioSendEnabled(media) && media.keepAudio) &&
          (isVideoSendEnabled(media) && media.keepVideo)) {
        streamsDone(handleId, jsep, media, callbacks, config.myStream);
        return;
      }
    }
    // If we're updating, check if we need to remove/replace one of the tracks
    if (media.update && !config.streamExternal) {
      if (media.removeAudio || media.replaceAudio) {
        if (config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
          let at = config.myStream.getAudioTracks()[0];
          TvRTC.log("Removing audio track:", at);
          config.myStream.removeTrack(at);
          try {
            at.stop();
          } catch (e) {}
        }

        if (config.pc.getSenders() && config.pc.getSenders().length) {
          let ra = false;
          if (media.replaceAudio && TvRTC.unifiedPlan) {
            // We can use replaceTrack
            ra = true;
          }
          for (let s of config.pc.getSenders()) {
            if (s && s.track && s.track.kind === "audio") {
              if (ra) {
                if (callbacks.stream) {
                  TvRTC.log("Replace audio sender:", s);
                  s.replaceTrack(callbacks.stream.getAudioTracks()[0])
                }
              } else {
                TvRTC.log("Removing audio sender:", s);
                config.pc.removeTrack(s);
              }
            }
          }
        }
      }
      if (media.removeVideo || media.replaceVideo) {
        if (config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
          let vt = config.myStream.getVideoTracks()[0];
          TvRTC.log("Removing video track:", vt);
          config.myStream.removeTrack(vt);
          try {
            vt.stop();
          } catch (e) {}
        }

        if (config.pc.getSenders() && config.pc.getSenders().length) {
          let rv = false;
          if (media.replaceVideo && TvRTC.unifiedPlan) {
            // We can use replaceTrack
            rv = true;
          }
          for (let s of config.pc.getSenders()) {
            if (s && s.track && s.track.kind === "video") {
              if (rv) {
                if (callbacks.stream) {
                  TvRTC.log("Replace video sender:", s);
                  s.replaceTrack(callbacks.stream.getVideoTracks()[0])
                } else {

                }
              } else {
                TvRTC.log("Removing video sender:", s);
                config.pc.removeTrack(s);
              }
            }
          }
        }
      }
    }
    // Was a MediaStream object passed, or do we need to take care of that?
    if (callbacks.stream) {
      var stream = callbacks.stream;
      TvRTC.log("MediaStream provided by the application");
      TvRTC.debug(stream);
      // If this is an update, let's check if we need to release the previous stream
      if (media.update) {
        if (config.myStream && config.myStream !== callbacks.stream && !config.streamExternal) {
          // We're replacing a stream we captured ourselves with an external one
          try {
            // Try a MediaStreamTrack.stop() for each track
            var tracks = config.myStream.getTracks();
            for (var mst of tracks) {
              TvRTC.log(mst);
              if (mst)
                mst.stop();
            }
          } catch (e) {
            // Do nothing if this fails
          }
          config.myStream = null;
        }
      }
      // Skip the getUserMedia part
      config.streamExternal = true;
      streamsDone(handleId, jsep, media, callbacks, stream);
      return;
    }
    if (isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
      if (!TvRTC.isGetUserMediaAvailable()) {
        callbacks.error("getUserMedia not available");
        return;
      }
      var constraints = {
        mandatory: {},
        optional: []
      };

      //装配getUserMedia的约束条件
      var audioSupport = isAudioSendEnabled(media);    //audioSupport是true或者false
      if(audioSupport && media){
        audioSupport = {
          'deviceId': media.audio.audioindeviceid,
        };
      }
      var videoSupport = isVideoSendEnabled(media);    //videoSupport是boolean或者分辨率
      if (videoSupport && media) {
        if (media.video && media.video.type != 'screen' && media.video.type != 'window') {
          var size={};
          getSizefromConfig(media, size);
          videoSupport = {
            'deviceId': media.video.deviceid,
            'height': {
              'ideal': size.height
            },
            'width': {
              'ideal': size.width
            },
            'frameRate': media.conf.fps,
          };
          TvRTC.log("Adding video constraint:", videoSupport);

        }
        else if (media.video.type === 'screen' || media.video.type === 'window') {
          //屏幕共享，开始装配约束条件
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            // The new experimental getDisplayMedia API is available, let's use that
            // https://groups.google.com/forum/#!topic/discuss-webrtc/Uf0SrR4uxzk
            // https://webrtchacks.com/chrome-screensharing-getdisplaymedia/
            constraints.video = {};
            if (media.conf.fps) {
              constraints.video.frameRate = media.conf.fps;
            }
            var size={};
            getSizefromConfig(media, size);
            constraints.video.height = size.height;
            constraints.video.width = size.width;
            constraints.audio = media.audio.sendaudio;

            if (TvRTC.webRTCAdapter.browserDetails.browser === "electron") {
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'desktopCapturer.getSources');
              //electron版本请取消下一行注释
              let { desktopCapturer } = require('electron')
              desktopCapturer.getSources({ types: ['window', 'screen'] }).then(
                  sources=>{
                    TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'sources', sources);
                    callbacks.sources(sources, function (enable, sourceId) {
                      if (enable){
                        constraints.video = {
                          mandatory: {
                            chromeMediaSource: 'desktop',
                            minWidth: size.width,
                            minHeight: size.height,
                            chromeMediaSourceId: sourceId
                          }
                        }
                        // 避免electron出现 Error starting screen capture
                        if (media.audioSend){
                          constraints.audio = {
                            mandatory: {
                              chromeMediaSource: 'desktop'
                            }
                          }
                        } else {
                          constraints.audio = false
                        }
                        TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getUserMedia @1', 'param', constraints);
                        navigator.mediaDevices.getUserMedia(constraints)
                            .then(function(stream) {
                              TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getUserMedia result', stream);
                              if (isAudioSendEnabled(media) && !media.keepAudio) {
                                let constr = {
                                  audio: true,
                                  video: false
                                }
                                TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getUserMedia @2', 'param', constr);
                                navigator.mediaDevices.getUserMedia(constr).then(function(audioStream) {
                                  TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getUserMedia result', audioStream);
                                  TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'addTrack', 'param', audioStream.getAudioTracks()[0]);
                                  stream.addTrack(audioStream.getAudioTracks()[0]);
                                  streamsDone(handleId, jsep, media, callbacks, stream);
                                  jsep = false
                                });
                              } else {
                                streamsDone(handleId, jsep, media, callbacks, stream);
                                jsep = false
                              }
                              media.update = true
                              media.replaceVideo = true
                              // 停止屏幕共享
                              stream.getVideoTracks()[0].onended = ()=>{
                                TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getVideoTracks result', 'screen stop');
                                callbacks.error("screen stop");
                              }
                            }, function(error) {
                              callbacks.error(error);
                            });
                      }
                    })
                  })
            }
            else {
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getDisplayMedia @1', 'param', constraints);
              navigator.mediaDevices.getDisplayMedia(constraints)
                  .then(function(stream) {
                    TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getDisplayMedia result', stream);
                    if (isAudioSendEnabled(media) && !media.keepAudio) {
                      let constr = {
                        audio: true,
                        video: false
                      }
                      TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getUserMedia @3', 'param', constr);
                      navigator.mediaDevices.getUserMedia(constr)
                          .then(function(audioStream) {
                            TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getUserMedia result', audioStream);
                            stream.addTrack(audioStream.getAudioTracks()[0]);
                            streamsDone(handleId, jsep, media, callbacks, stream);
                          });
                    } else {
                      streamsDone(handleId, jsep, media, callbacks, stream);
                    }
                    // 停止屏幕共享
                    stream.getVideoTracks()[0].onended = ()=>{
                      console.log("screen stop");
                      callbacks.error("screen stop");
                    }
                  }, function(error) {
                    callbacks.error(error);
                  });

            }
            return;
          }
          // We're going to try and use the extension for Chrome 34+, the old approach
          // for older versions of Chrome, or the experimental support in Firefox 33+
          function callbackUserMedia(error, stream) {
            if (error) {
              callbacks.error(error);
            } else {
              streamsDone(handleId, jsep, media, callbacks, stream);
            }
          }

          function getScreenMedia(constraints, gsmCallback, useAudio) {
            TvRTC.log("Adding media constraint (screen capture)");
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getUserMedia @4', 'param', constraints);
            navigator.mediaDevices.getUserMedia(constraints)
                .then(function(stream) {
                  if (useAudio) {
                    navigator.mediaDevices.getUserMedia({
                      audio: true,
                      video: false
                    })
                        .then(function(audioStream) {
                          stream.addTrack(audioStream.getAudioTracks()[0]);
                          gsmCallback(null, stream);
                        });
                  } else {
                    gsmCallback(null, stream);
                  }
                })
                .catch(function(error) {
                  gsmCallback(error);
                });
          }
          if (TvRTC.webRTCAdapter.browserDetails.browser === 'chrome') {
            var chromever = TvRTC.webRTCAdapter.browserDetails.version;
            var maxver = 33;
            if (window.navigator.userAgent.match('Linux'))
              maxver = 35; // "known" crash in chrome 34 and 35 on linux
            if (chromever >= 26 && chromever <= maxver) {
              // Chrome 26->33 requires some awkward chrome://flags manipulation
              constraints = {
                video: {
                  mandatory: {
                    googLeakyBucket: true,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height,
                    minFrameRate: media.conf.fps,
                    maxFrameRate: media.conf.fps,
                    chromeMediaSource: 'screen'
                  }
                },
                audio: isAudioSendEnabled(media) && !media.keepAudio
              };
              getScreenMedia(constraints, callbackUserMedia);
            } else {
              // Chrome 34+ requires an extension
              TvRTC.extension.getScreen(function(error, sourceId) {
                if (error) {
                  return callbacks.error(error);
                }
                constraints = {
                  audio: false,
                  video: {
                    mandatory: {
                      chromeMediaSource: 'desktop',
                      maxWidth: window.screen.width,
                      maxHeight: window.screen.height,
                      minFrameRate: media.conf.fps,
                      maxFrameRate: media.conf.fps,
                    },
                    optional: [{
                      googLeakyBucket: true
                    }, {
                      googTemporalLayeredScreencast: true
                    }]
                  }
                };
                constraints.video.mandatory.chromeMediaSourceId = sourceId;
                getScreenMedia(constraints, callbackUserMedia,
                    isAudioSendEnabled(media) && !media.keepAudio);
              });
            }
          } else if (TvRTC.webRTCAdapter.browserDetails.browser === 'firefox') {
            if (TvRTC.webRTCAdapter.browserDetails.version >= 33) {
              // Firefox 33+ has experimental support for screen sharing
              constraints = {
                video: {
                  mozMediaSource: media.video,
                  mediaSource: media.video
                },
                audio: isAudioSendEnabled(media) && !media.keepAudio
              };
              getScreenMedia(constraints, function(err, stream) {
                callbackUserMedia(err, stream);
                // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
                if (!err) {
                  var lastTime = stream.currentTime;
                  var polly = window.setInterval(function() {
                    if (!stream)
                      window.clearInterval(polly);
                    if (stream.currentTime == lastTime) {
                      window.clearInterval(polly);
                      if (stream.onended) {
                        stream.onended();
                      }
                    }
                    lastTime = stream.currentTime;
                  }, 500);
                }
              });
            } else {
              var error = new Error('NavigatorUserMediaError');
              error.name =
                  'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
              callbacks.error(error);
              return;
            }
          }
          return;
        }
      }
      // If we got here, we're not screensharing
      if (!media || (media.video.type !== 'screen' && media.video.type !== 'window')) {
        // Check whether all media sources are actually available or not
        TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'enumerateDevices @5');
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'enumerateDevices result', devices);
          let audioExist = devices.some(function(device) {
                return device.kind === 'audioinput';
              }),
              videoExist = isScreenSendEnabled(media) || devices.some(function(device) {
                return device.kind === 'videoinput';
              });

          // Check whether a missing device is really a problem
          let audioSend = isAudioSendEnabled(media);
          let videoSend = isVideoSendEnabled(media);
          let needAudioDevice = audioSend;
          let needVideoDevice = videoSend;
          if (audioSend || videoSend || needAudioDevice || needVideoDevice) {
            // We need to send either audio or video
            var haveAudioDevice = audioSend ? audioExist : false;
            var haveVideoDevice = videoSend ? videoExist : false;
            if (!haveAudioDevice && !haveVideoDevice) {
              // FIXME Should we really give up, or just assume recvonly for both?
              callbacks.error('No capture device found');
              return false;
            } else if (!haveAudioDevice && needAudioDevice) {
              callbacks.error('Audio capture is required, but no capture device found');
              return false;
            } else if (!haveVideoDevice && needVideoDevice) {
              callbacks.error('Video capture is required, but no capture device found');
              return false;
            }
          }

          var gumConstraints = {
            audio: (audioExist && !media.keepAudio) ? audioSupport : false,
            video: (videoExist && !media.keepVideo) ? videoSupport : false
          };
          TvRTC.debug("getUserMedia constraints", gumConstraints);
          if (!gumConstraints.audio && !gumConstraints.video) {
            streamsDone(handleId, jsep, media, callbacks, stream);
          } else {
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getUserMedia @6', gumConstraints);
            navigator.mediaDevices.getUserMedia(gumConstraints)
                .then(function(stream) {
                  TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'getUserMedia result', stream);
                  streamsDone(handleId, jsep, media, callbacks, stream);
                }).catch(function(error) {
              callbacks.error({
                code: error.code,
                name: error.name,
                message: error.message
              });
            });
          }
        })
            .catch(function(error) {
              callbacks.error('enumerateDevices error', error);
            });
      }
    } else {
      // No need to do a getUserMedia, create offer/answer right away
      streamsDone(handleId, jsep, media, callbacks);
    }
  }

  function getSizefromConfig(media, size) {
    if (media.conf.size === 'lowres') {
      // Small resolution, 4:3
      size.height = 240;
      size.width = 320;
    } else if (media.conf.size === 'hires' || media.conf.size === 'hires-16:9' || media.conf.size === 'hdres') {
      // High(HD) resolution is only 16:9
      size.height = 720;
      size.width = 1280;
    } else if (media.conf.size === 'fhdres') {
      // Full HD resolution is only 16:9
      size.height = 1080;
      size.width = 1920;
    } else if (media.conf.size === '4kres') {
      // 4K resolution is only 16:9
      size.height = 2160;
      size.width = 3840;
    } else if (media.conf.size === 'stdres') {
      // Normal resolution, 4:3
      size.height = 480;
      size.width = 640;
    } else if (media.conf.size === 'lowres-16:9') {
      // low resolution, 16:9
      size.height = 360;
      size.width = 640;
    }else if (media.conf.size === 'stdres-16:9') {
      // Normal resolution, 16:9
      size.height = 540;
      size.width = 960;
    } else {
      TvRTC.log("Default video setting is stdres 4:3");
      size.height = 480;
      size.width = 640;
    }
  }

  function createOffer(handleId, media, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : TvRTC.noop;
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    var config = pluginHandler.webrtcStuff;
    var simulcast = (callbacks.simulcast === true);
    if (!simulcast) {
      TvRTC.log("Creating offer (iceDone=" + config.iceDone + ")");
    } else {
      TvRTC.log("Creating offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
    }
    // https://code.google.com/p/webrtc/issues/detail?id=3508
    var mediaConstraints = {};
    if (TvRTC.unifiedPlan) {
      // We can use Transceivers
      var audioTransceiver = null,
          videoTransceiver = null;
      var transceivers = config.pc.getTransceivers();
      if (transceivers && transceivers.length > 0) {
        for (var t of transceivers) {
          if ((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
              (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
            if (!audioTransceiver) {
              audioTransceiver = t;
            }
            continue;
          }
          if ((t.sender && t.sender.track && t.sender.track.kind === "video") ||
              (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
            if (!videoTransceiver) {
              videoTransceiver = t;
            }
            continue;
          }
        }
      }
      // Handle audio (and related changes, if any)
      var audioSend = isAudioSendEnabled(media);
      var audioRecv = isAudioRecvEnabled(media);
      if (!audioSend && !audioRecv) {
        // Audio disabled: have we removed it?
        if (media.removeAudio && audioTransceiver) {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
          TvRTC.log("Setting audio transceiver to inactive:", audioTransceiver);
        }
      } else {
        // Take care of audio m-line
        if (audioSend && audioRecv) {
          if (audioTransceiver) {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("sendrecv");
            } else {
              audioTransceiver.direction = "sendrecv";
            }
            TvRTC.log("Setting audio transceiver to sendrecv:", audioTransceiver);
          }
        } else if (audioSend && !audioRecv) {
          if (audioTransceiver) {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("sendonly");
            } else {
              audioTransceiver.direction = "sendonly";
            }
            TvRTC.log("Setting audio transceiver to sendonly:", audioTransceiver);
          }
        } else if (!audioSend && audioRecv) {
          if (audioTransceiver) {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("recvonly");
            } else {
              audioTransceiver.direction = "recvonly";
            }
            TvRTC.log("Setting audio transceiver to recvonly:", audioTransceiver);
          } else {
            // In theory, this is the only case where we might not have a transceiver yet
            audioTransceiver = config.pc.addTransceiver("audio", {
              direction: "recvonly"
            });
            TvRTC.log("Adding recvonly audio transceiver:", audioTransceiver);
          }
        }
      }
      // Handle video (and related changes, if any)
      var videoSend = isVideoSendEnabled(media);
      var videoRecv = isVideoRecvEnabled(media);
      if (!videoSend && !videoRecv) {
        // Video disabled: have we removed it?
        if (media.removeVideo && videoTransceiver) {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
          TvRTC.log("Setting video transceiver to inactive:", videoTransceiver);
        }
      } else {
        // Take care of video m-line
        if (videoSend && videoRecv) {
          if (videoTransceiver) {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("sendrecv");
            } else {
              videoTransceiver.direction = "sendrecv";
            }
            TvRTC.log("Setting video transceiver to sendrecv:", videoTransceiver);
          }
        } else if (videoSend && !videoRecv) {
          if (videoTransceiver) {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("sendonly");
            } else {
              videoTransceiver.direction = "sendonly";
            }
            TvRTC.log("Setting video transceiver to sendonly:", videoTransceiver);
          }
        } else if (!videoSend && videoRecv) {
          if (videoTransceiver) {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("recvonly");
            } else {
              videoTransceiver.direction = "recvonly";
            }
            TvRTC.log("Setting video transceiver to recvonly:", videoTransceiver);
          } else {
            // In theory, this is the only case where we might not have a transceiver yet
            videoTransceiver = config.pc.addTransceiver("video", {
              direction: "recvonly"
            });
            TvRTC.log("Adding recvonly video transceiver:", videoTransceiver);
          }
        }
      }
    } else {
      mediaConstraints["offerToReceiveAudio"] = isAudioRecvEnabled(media);
      mediaConstraints["offerToReceiveVideo"] = isVideoRecvEnabled(media);
    }
    var iceRestart = (callbacks.iceRestart === true);
    if (iceRestart) {
      mediaConstraints["iceRestart"] = true;
    }
    TvRTC.debug(mediaConstraints);
    // Check if this is Firefox and we've been asked to do simulcasting
    var sendVideo = isVideoSendEnabled(media);
    if (sendVideo && simulcast && TvRTC.webRTCAdapter.browserDetails.browser === "firefox") {
      // FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
      TvRTC.log("Enabling Simulcasting for Firefox (RID)");
      var sender = config.pc.getSenders().find(function(s) {
        return s.track.kind === "video"
      });
      if (sender) {
        var parameters = sender.getParameters();
        if (!parameters) {
          parameters = {};
        }
        var maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
        parameters.encodings = [{
          rid: "h",
          active: true,
          maxBitrate: maxBitrates.high
        }, {
          rid: "m",
          active: true,
          maxBitrate: maxBitrates.medium,
          scaleResolutionDownBy: 2
        }, {
          rid: "l",
          active: true,
          maxBitrate: maxBitrates.low,
          scaleResolutionDownBy: 4
        }];
        sender.setParameters(parameters);
      }
    }
    // console.log(mediaConstraints);
    // var videoSend = isVideoSendEnabled(media);
    // var videoRecv = isVideoRecvEnabled(media);
    // mediaConstraints.videoSend = videoSend;
    // mediaConstraints.audioSend =
    //console.log(media);
    config.pc.createOffer(mediaConstraints)
        .then(function(offer) {
          TvRTC.debug(offer);
          // JSON.stringify doesn't work on some WebRTC objects anymore
          // See https://code.google.com/p/chromium/issues/detail?id=467366
          var jsep = {
            "type": offer.type,
            "sdp": offer.sdp
          };
          callbacks.customizeSdp(jsep);
          offer.sdp = jsep.sdp;
          TvRTC.log("Setting local description");
          //console.log(offer.sdp);
          if (sendVideo && simulcast) {
            // This SDP munging only works with Chrome (Safari STP may support it too)
            if (TvRTC.webRTCAdapter.browserDetails.browser === "chrome" ||
                TvRTC.webRTCAdapter.browserDetails.browser === "electron" ||
                TvRTC.webRTCAdapter.browserDetails.browser === "safari") {
              TvRTC.log("Enabling Simulcasting for Chrome (SDP munging)");
              offer.sdp = mungeSdpForSimulcasting(offer.sdp);
            } else if (TvRTC.webRTCAdapter.browserDetails.browser !== "firefox") {
              TvRTC.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
            }
          }
          config.mySdp = offer.sdp;
          config.pc.setLocalDescription(offer)
              .catch(callbacks.error);
          config.mediaConstraints = mediaConstraints;
          if (!config.iceDone && !config.trickle) {
            // Don't do anything until we have all candidates
            TvRTC.log("Waiting for all candidates...");
            return;
          }
          TvRTC.log("Offer ready");
          TvRTC.debug(callbacks);
          callbacks.success(offer);
        }, callbacks.error);
  }

  function createAnswer(handleId, media, callbacks) {
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : TvRTC.noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : TvRTC.noop;
    callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : TvRTC.noop;
    let pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      callbacks.error("Invalid handle");
      return;
    }
    let config = pluginHandler.webrtcStuff;
    let simulcast = (callbacks.simulcast === true);
    if (!simulcast) {
      TvRTC.log("Creating answer (iceDone=" + config.iceDone + ")");
    } else {
      TvRTC.log("Creating answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
    }
    let mediaConstraints = null;
    if (TvRTC.unifiedPlan) {
      // We can use Transceivers
      mediaConstraints = {};
      let audioTransceiver = null,
          videoTransceiver = null;
      TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'getTransceivers')
      let transceivers = config.pc.getTransceivers();
      if (transceivers && transceivers.length > 0) {
        for (var t of transceivers) {
          if ((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
              (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
            if (!audioTransceiver)
              audioTransceiver = t;
            continue;
          }
          if ((t.sender && t.sender.track && t.sender.track.kind === "video") ||
              (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
            if (!videoTransceiver)
              videoTransceiver = t;
            continue;
          }
        }
      }
      // Handle audio (and related changes, if any)
      var audioSend = isAudioSendEnabled(media);
      var audioRecv = isAudioRecvEnabled(media);
      if (!audioSend && !audioRecv) {
        // Audio disabled: have we removed it?
        if (media.removeAudio && audioTransceiver) {
          try {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("inactive");
            } else {
              audioTransceiver.direction = "inactive";
            }
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Audio Transceiver setDirection inactive')
          } catch (e) {
            TvRTC.error(e);
          }
        }
      } else {
        // Take care of audio m-line
        if (audioSend && audioRecv) {
          if (audioTransceiver) {
            try {
              if (audioTransceiver.setDirection) {
                audioTransceiver.setDirection("sendrecv")
              } else {
                audioTransceiver.direction = "sendrecv"
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Audio Transceiver setDirection sendrecv')
            } catch (e) {
              TvRTC.error(e);
            }
          }
        } else if (audioSend && !audioRecv) {
          try {
            if (audioTransceiver) {
              if (audioTransceiver.setDirection) {
                audioTransceiver.setDirection("sendonly");
              } else {
                audioTransceiver.direction = "sendonly";
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Audio Transceiver setDirection sendonly')
            }
          } catch (e) {
            TvRTC.error(e);
          }
        } else if (!audioSend && audioRecv) {
          if (audioTransceiver) {
            try {
              if (audioTransceiver.setDirection) {
                audioTransceiver.setDirection("recvonly");
              } else {
                audioTransceiver.direction = "recvonly";
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Audio Transceiver setDirection recvonly')
            } catch (e) {
              TvRTC.error(e);
            }
          } else {
            // In theory, this is the only case where we might not have a transceiver yet
            audioTransceiver = config.pc.addTransceiver("audio", {
              direction: "recvonly"
            });
            TvRTC.log("Adding recvonly audio transceiver:", audioTransceiver);
          }
        }
      }
      // Handle video (and related changes, if any)
      var videoSend = isVideoSendEnabled(media);
      var videoRecv = isVideoRecvEnabled(media);
      if (!videoSend && !videoRecv) {
        // Video disabled: have we removed it?
        if (media.removeVideo && videoTransceiver) {
          try {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("inactive");
            } else {
              videoTransceiver.direction = "inactive";
            }
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Video Transceiver setDirection inactive')
          } catch (e) {
            TvRTC.error(e);
          }
        }
      } else {
        // Take care of video m-line
        if (videoSend && videoRecv) {
          if (videoTransceiver) {
            try {
              if (videoTransceiver.setDirection) {
                videoTransceiver.setDirection("sendrecv");
              } else {
                videoTransceiver.direction = "sendrecv";
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Video Transceiver setDirection sendrecv')
            } catch (e) {
              TvRTC.error(e);
            }
          }
        } else if (videoSend && !videoRecv) {
          if (videoTransceiver) {
            try {
              if (videoTransceiver.setDirection) {
                videoTransceiver.setDirection("sendonly");
              } else {
                videoTransceiver.direction = "sendonly";
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Video Transceiver setDirection sendonly')
            } catch (e) {
              TvRTC.error(e);
            }
          }
        } else if (!videoSend && videoRecv) {
          if (videoTransceiver) {
            try {
              if (videoTransceiver.setDirection) {
                videoTransceiver.setDirection("recvonly");
              } else {
                videoTransceiver.direction = "recvonly";
              }
              TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Video Transceiver setDirection recvonly')
            } catch (e) {
              TvRTC.error(e);
            }
          } else {
            // In theory, this is the only case where we might not have a transceiver yet
            TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'Adding recvonly video transceiver')
            videoTransceiver = config.pc.addTransceiver("video", {
              direction: "recvonly"
            });
          }
        }
      }
    } else {
      if (TvRTC.webRTCAdapter.browserDetails.browser === "firefox" || TvRTC.webRTCAdapter.browserDetails.browser ===
          "edge") {
        mediaConstraints = {
          offerToReceiveAudio: isAudioRecvEnabled(media),
          offerToReceiveVideo: isVideoRecvEnabled(media)
        };
      } else {
        mediaConstraints = {
          mandatory: {
            OfferToReceiveAudio: isAudioRecvEnabled(media),
            OfferToReceiveVideo: isVideoRecvEnabled(media)
          }
        };
      }
    }
    TvRTC.debug(mediaConstraints);
    // Check if this is Firefox and we've been asked to do simulcasting
    var sendVideo = isVideoSendEnabled(media);
    if (sendVideo && simulcast && TvRTC.webRTCAdapter.browserDetails.browser === "firefox") {
      // FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
      TvRTC.log("Enabling Simulcasting for Firefox (RID)");
      var sender = config.pc.getSenders()[1];
      TvRTC.log(sender);
      var parameters = sender.getParameters();
      TvRTC.log(parameters);

      var maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
      sender.setParameters({
        encodings: [{
          rid: "high",
          active: true,
          priority: "high",
          maxBitrate: maxBitrates.high
        }, {
          rid: "medium",
          active: true,
          priority: "medium",
          maxBitrate: maxBitrates.medium
        }, {
          rid: "low",
          active: true,
          priority: "low",
          maxBitrate: maxBitrates.low
        }]
      });
    }
    TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'createAnswer', media);
    config.pc.createAnswer(media)
        .then(function(answer) {
          TvRTC.log(tvlogTag.RTC2SDK, 'sessionId', sessionId, 'createAnswer ack', answer);
          // JSON.stringify doesn't work on some WebRTC objects anymore
          // See https://code.google.com/p/chromium/issues/detail?id=467366
          var jsep = {
            "type": answer.type,
            "sdp": answer.sdp
          };
          callbacks.customizeSdp(jsep);
          answer.sdp = jsep.sdp;
          TvRTC.log("Setting local description");
          //console.log(answer.sdp)
          if (sendVideo && simulcast) {
            // This SDP munging only works with Chrome
            if (TvRTC.webRTCAdapter.browserDetails.browser === "chrome") {
              // FIXME Apparently trying to simulcast when answering breaks video in Chrome...
              //~ TvRTC.log("Enabling Simulcasting for Chrome (SDP munging)");
              //~ answer.sdp = mungeSdpForSimulcasting(answer.sdp);
              TvRTC.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
            } else if (TvRTC.webRTCAdapter.browserDetails.browser === "electron") {
              TvRTC.warn("simulcast=true, but this is an answer, and video breaks in electron if we enable it");
            } else if (TvRTC.webRTCAdapter.browserDetails.browser !== "firefox") {
              TvRTC.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
            }
          }
          config.mySdp = answer.sdp;
          TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'setLocalDescription', answer);
          config.pc.setLocalDescription(answer)
              .catch(callbacks.error);
          config.mediaConstraints = mediaConstraints;
          if (!config.iceDone && !config.trickle) {
            // Don't do anything until we have all candidates
            TvRTC.log("Waiting for all candidates...");
            return;
          }
          callbacks.success(answer);
        }, callbacks.error);
  }

  function getVolume(handleId, remote) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return 0;
    }
    var stream = remote ? "remote" : "local";
    var config = pluginHandler.webrtcStuff;
    if (!config.volume[stream])
      config.volume[stream] = {
        value: 0
      };
    // Start getting the volume, if audioLevel in getStats is supported (apparently
    // they're only available in Chrome/Safari right now: https://webrtc-stats.callstats.io/)
    if (config.pc.getStats && (TvRTC.webRTCAdapter.browserDetails.browser === "chrome" ||TvRTC.webRTCAdapter.browserDetails.browser === "electron" ||
        TvRTC.webRTCAdapter.browserDetails.browser === "safari")) {
      if (remote && !config.remoteStream) {
        TvRTC.warn("Remote stream unavailable");
        return 0;
      } else if (!remote && !config.myStream) {
        TvRTC.warn("Local stream unavailable");
        return 0;
      }
      if (!config.volume[stream].timer) {
        TvRTC.log("Starting " + stream + " volume monitor");
        config.volume[stream].timer = setInterval(function() {
          config.pc.getStats()
              .then(function(stats) {
                stats.forEach(function(res) {
                  if (!res || res.kind !== "audio")
                    return;
                  if ((remote && !res.remoteSource) || (!remote && res.type !== "media-source"))
                    return;
                  config.volume[stream].value = (res.audioLevel ? res.audioLevel : 0);
                });
              });
        }, 200);
        return 0; // We don't have a volume to return yet
      }
      return config.volume[stream].value;
    } else {
      // audioInputLevel and audioOutputLevel seem only available in Chrome? audioLevel
      // seems to be available on Chrome and Firefox, but they don't seem to work
      TvRTC.warn("Getting the " + stream + " volume unsupported by browser");
      return 0;
    }
  }

  function isMuted(handleId, video) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return true;
    }
    var config = pluginHandler.webrtcStuff;
    if (!config.pc) {
      TvRTC.warn("Invalid PeerConnection");
      return true;
    }
    if (!config.myStream) {
      TvRTC.warn("Invalid local MediaStream");
      return true;
    }
    if (video) {
      // Check video track
      if (!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
        TvRTC.warn("No video track");
        return true;
      }
      return !config.myStream.getVideoTracks()[0].enabled;
    } else {
      // Check audio track
      if (!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
        TvRTC.warn("No audio track");
        return true;
      }
      return !config.myStream.getAudioTracks()[0].enabled;
    }
  }

  function mute(handleId, video, mute) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return false;
    }
    var config = pluginHandler.webrtcStuff;
    if (!config.pc) {
      TvRTC.warn("Invalid PeerConnection");
      return false;
    }
    if (!config.myStream) {
      TvRTC.warn("Invalid local MediaStream");
      return false;
    }
    if (video) {
      // Mute/unmute video track
      if (!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
        TvRTC.warn("No video track");
        return false;
      }
      config.myStream.getVideoTracks()[0].enabled = !mute;
      return true;
    } else {
      // Mute/unmute audio track
      if (!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
        TvRTC.warn("No audio track");
        return false;
      }
      config.myStream.getAudioTracks()[0].enabled = !mute;
      return true;
    }
  }

  function getQos(handleId, callbacks) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      callbacks.error("Invalid handle");
      return;
    }
    let config = pluginHandler.webrtcStuff;
    if (!config.pc){
      callbacks.error("Invalid PeerConnection");
      return;
    }

    config.pc.getStats().then(res => {
      let reports = [];
      res.forEach(report => {
        if (report.type === 'outbound-rtp' ||
            report.type === "inbound-rtp" ||
            report.type === "track") {
          reports.push(report);
        }
      });
      callbacks.success(reports);
    });
  }

  function getBitrate(handleId) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return "Invalid handle";
    }
    var config = pluginHandler.webrtcStuff;
    if (!config.pc)
      return "Invalid PeerConnection";
    // Start getting the bitrate, if getStats is supported
    if (config.pc.getStats) {
      if (!config.bitrate.timer) {
        TvRTC.log("Starting bitrate timer (via getStats)");
        config.bitrate.timer = setInterval(function() {
          config.pc.getStats()
              .then(function(stats) {
                stats.forEach(function(res) {
                  if (!res)
                    return;
                  var inStats = false;
                  console.log("ssssssssssssssss")
                  // Check if these are statistics on incoming media
                  if ((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) &&
                      res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
                    // New stats
                    inStats = true;
                  } else if (res.type == 'ssrc' && res.bytesReceived &&
                      (res.googCodecName === "VP8" || res.googCodecName === "")) {
                    // Older Chromer versions
                    inStats = true;
                  }
                  // Parse stats now
                  if (inStats) {
                    config.bitrate.bsnow = res.bytesReceived;
                    config.bitrate.tsnow = res.timestamp;
                    if (config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
                      // Skip this round
                      config.bitrate.bsbefore = config.bitrate.bsnow;
                      config.bitrate.tsbefore = config.bitrate.tsnow;
                    } else {
                      // Calculate bitrate
                      var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
                      if (TvRTC.webRTCAdapter.browserDetails.browser === "safari")
                        timePassed = timePassed / 1000; // Apparently the timestamp is in microseconds, in Safari
                      var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
                      if (TvRTC.webRTCAdapter.browserDetails.browser === "safari")
                        bitRate = parseInt(bitRate / 1000);
                      config.bitrate.value = bitRate + ' kbits/sec';
                      //~ TvRTC.log("Estimated bitrate is " + config.bitrate.value);
                      config.bitrate.bsbefore = config.bitrate.bsnow;
                      config.bitrate.tsbefore = config.bitrate.tsnow;
                    }
                  }
                });
              });
        }, 1000);
        return "0 kbits/sec"; // We don't have a bitrate value yet
      }
      return config.bitrate.value;
    } else {
      TvRTC.warn("Getting the video bitrate unsupported by browser");
      return "Feature unsupported by browser";
    }
  }

  function setBitrate(handleId, callbacks) {
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler || !pluginHandler.webrtcStuff) {
      TvRTC.warn("Invalid handle");
      return callbacks.error("Invalid handle");
    }
    var config = pluginHandler.webrtcStuff;
    if (!config.pc)
      return callbacks.error("Invalid PeerConnection");

    if ((adapter.browserDetails.browser === 'chrome' ||
        adapter.browserDetails.browser === 'electron' ||
        adapter.browserDetails.browser === 'safari' ||
        (adapter.browserDetails.browser === 'firefox' &&
            adapter.browserDetails.version >= 64)) &&
        'RTCRtpSender' in window &&
        'setParameters' in window.RTCRtpSender.prototype) {
      const sender = config.pc.getSenders()[0];
      const parameters = sender.getParameters();
      if (!parameters.encodings) {
        parameters.encodings = [{}];
      }
      if (callbacks.bandwidth === 'unlimited') {
        delete parameters.encodings[0].maxBitrate;
      } else {
        parameters.encodings[0].maxBitrate = callbacks.bandwidth;
      }
      sender.setParameters(parameters)
          .catch(e => TvRTC.error(e));
      return callbacks.success();
    }
    // Fallback to the SDP munging with local renegotiation way of limiting
    // the bandwidth.
    config.pc.createOffer()
        .then(offer => config.pc.setLocalDescription(offer))
        .then(() => {
          const desc = {
            type: config.pc.remoteDescription.type,
            sdp: callbacks.bandwidth === 'unlimited' ?
                removeBandwidthRestriction(config.pc.remoteDescription.sdp) :
                updateBandwidthRestriction(config.pc.remoteDescription.sdp, callbacks.bandwidth)
          };
          console.log('Applying bandwidth restriction to setRemoteDescription:\n' +
              desc.sdp);
          config.pc.setRemoteDescription(desc).catch(function (e) {
            callbacks.error(e);
          });
          return callbacks.success();
        })
        .catch(function (e) {
          callbacks.error(e);
        });
  }

  function webrtcError(error) {
    TvRTC.error("WebRTC error:", error);
  }

  function cleanupWebrtc(handleId, hangupRequest) {
    TvRTC.log("Cleaning WebRTC stuff");
    var pluginHandler = pluginHandles[sessionId]
    if (!pluginHandler) {
      // Nothing to clean
      return;
    }
    var config = pluginHandler.webrtcStuff;
    if (config) {
      if (hangupRequest === true) {
        // Send a hangup request (we don't really care about the response)
        var request = {
          "janus": "message",
          "transaction": TvRTC.randomString(12)
        };
        let message = {
          "request": "streamstop"
        };
        request["body"] = message;
        TvRTC.debug(request);
        if (websockets) {
          request["session_id"] = sessionId;
          request["handle_id"] = handleId;
          ws.send(JSON.stringify(request));
        } else {
          TvRTC.httpAPICall(server + "/" + sessionId + "/" + handleId, {
            verb: 'POST',
            withCredentials: withCredentials,
            body: request
          });
        }
      }
      // Cleanup stack
      config.remoteStream = null;
      if (config.volume) {
        if (config.volume["local"] && config.volume["local"].timer)
          clearInterval(config.volume["local"].timer);
        if (config.volume["remote"] && config.volume["remote"].timer)
          clearInterval(config.volume["remote"].timer);
      }
      config.volume = {};
      if (config.bitrate.timer)
        clearInterval(config.bitrate.timer);
      config.bitrate.timer = null;
      config.bitrate.bsnow = null;
      config.bitrate.bsbefore = null;
      config.bitrate.tsnow = null;
      config.bitrate.tsbefore = null;
      config.bitrate.value = null;
      try {
        // Try a MediaStreamTrack.stop() for each track
        if (!config.streamExternal && config.myStream) {
          TvRTC.log("Stopping local stream tracks");
          var tracks = config.myStream.getTracks();
          for (var mst of tracks) {
            TvRTC.log(mst);
            if (mst)
              mst.stop();
          }
        }
      } catch (e) {
        // Do nothing if this fails
      }
      config.streamExternal = false;
      config.myStream = null;
      // Close PeerConnection
      try {
        TvRTC.log(tvlogTag.SDK2RTC, 'sessionId', sessionId, 'close');
        config.pc.close();
      } catch (e) {
        // Do nothing
      }
      config.pc = null;
      config.candidates = null;
      config.mySdp = null;
      config.remoteSdp = null;
      config.iceDone = false;
      config.dataChannel = {};
      config.dtmfSender = null;
    }
    pluginHandler.oncleanup();
  }

  // Helper method to munge an SDP to enable simulcasting (Chrome only)
  function mungeSdpForSimulcasting(sdp) {
    // Let's munge the SDP to add the attributes for enabling simulcasting
    // (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)
    var lines = sdp.split("\r\n");
    var video = false;
    var ssrc = [-1],
        ssrc_fid = [-1];
    var cname = null,
        msid = null,
        mslabel = null,
        label = null;
    var insertAt = -1;
    for (var i = 0; i < lines.length; i++) {
      var mline = lines[i].match(/m=(\w+) */);
      if (mline) {
        var medium = mline[1];
        if (medium === "video") {
          // New video m-line: make sure it's the first one
          if (ssrc[0] < 0) {
            video = true;
          } else {
            // We're done, let's add the new attributes here
            insertAt = i;
            break;
          }
        } else {
          // New non-video m-line: do we have what we were looking for?
          if (ssrc[0] > -1) {
            // We're done, let's add the new attributes here
            insertAt = i;
            break;
          }
        }
        continue;
      }
      if (!video)
        continue;
      var fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);
      if (fid) {
        ssrc[0] = fid[1];
        ssrc_fid[0] = fid[2];
        lines.splice(i, 1);
        i--;
        continue;
      }
      if (ssrc[0]) {
        var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
        if (match) {
          cname = match[1];
        }
        match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
        if (match) {
          msid = match[1];
        }
        match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
        if (match) {
          mslabel = match[1];
        }
        match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
        if (match) {
          label = match[1];
        }
        if (lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
          lines.splice(i, 1);
          i--;
          continue;
        }
        if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
          lines.splice(i, 1);
          i--;
          continue;
        }
      }
      if (lines[i].length == 0) {
        lines.splice(i, 1);
        i--;
        continue;
      }
    }
    if (ssrc[0] < 0) {
      // Couldn't find a FID attribute, let's just take the first video SSRC we find
      insertAt = -1;
      video = false;
      for (var i = 0; i < lines.length; i++) {
        var mline = lines[i].match(/m=(\w+) */);
        if (mline) {
          var medium = mline[1];
          if (medium === "video") {
            // New video m-line: make sure it's the first one
            if (ssrc[0] < 0) {
              video = true;
            } else {
              // We're done, let's add the new attributes here
              insertAt = i;
              break;
            }
          } else {
            // New non-video m-line: do we have what we were looking for?
            if (ssrc[0] > -1) {
              // We're done, let's add the new attributes here
              insertAt = i;
              break;
            }
          }
          continue;
        }
        if (!video)
          continue;
        if (ssrc[0] < 0) {
          var value = lines[i].match(/a=ssrc:(\d+)/);
          if (value) {
            ssrc[0] = value[1];
            lines.splice(i, 1);
            i--;
            continue;
          }
        } else {
          var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
          if (match) {
            cname = match[1];
          }
          match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
          if (match) {
            msid = match[1];
          }
          match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
          if (match) {
            mslabel = match[1];
          }
          match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
          if (match) {
            label = match[1];
          }
          if (lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
            lines.splice(i, 1);
            i--;
            continue;
          }
          if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
            lines.splice(i, 1);
            i--;
            continue;
          }
        }
        if (lines[i].length === 0) {
          lines.splice(i, 1);
          i--;
          continue;
        }
      }
    }
    if (ssrc[0] < 0) {
      // Still nothing, let's just return the SDP we were asked to munge
      TvRTC.warn("Couldn't find the video SSRC, simulcasting NOT enabled");
      return sdp;
    }
    if (insertAt < 0) {
      // Append at the end
      insertAt = lines.length;
    }
    // Generate a couple of SSRCs (for retransmissions too)
    // Note: should we check if there are conflicts, here?
    ssrc[1] = Math.floor(Math.random() * 0xFFFFFFFF);
    ssrc[2] = Math.floor(Math.random() * 0xFFFFFFFF);
    ssrc_fid[1] = Math.floor(Math.random() * 0xFFFFFFFF);
    ssrc_fid[2] = Math.floor(Math.random() * 0xFFFFFFFF);
    // Add attributes to the SDP
    for (var i = 0; i < ssrc.length; i++) {
      if (cname) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
        insertAt++;
      }
      if (msid) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
        insertAt++;
      }
      if (mslabel) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + mslabel);
        insertAt++;
      }
      if (label) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + label);
        insertAt++;
      }
      // Add the same info for the retransmission SSRC
      if (cname) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' cname:' + cname);
        insertAt++;
      }
      if (msid) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' msid:' + msid);
        insertAt++;
      }
      if (mslabel) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' mslabel:' + mslabel);
        insertAt++;
      }
      if (label) {
        lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' label:' + label);
        insertAt++;
      }
    }
    lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[2] + ' ' + ssrc_fid[2]);
    lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[1] + ' ' + ssrc_fid[1]);
    lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[0] + ' ' + ssrc_fid[0]);
    lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
    sdp = lines.join("\r\n");
    if (!sdp.endsWith("\r\n"))
      sdp += "\r\n";
    return sdp;
  }

  // Helper methods to parse a media object
  function isAudioSendEnabled(media) {
    TvRTC.debug("isAudioSendEnabled:", media);
    if (!media)
      return false; // Default
    if (!media.audio)
      return false; // Generic audio has precedences
    return media.audio.sendaudio === true;
  }

  function isAudioRecvEnabled(media) {
    TvRTC.debug("isAudioRecvEnabled:", media);
    if (!media)
      return false; // Default
    if (!media.audio)
      return false; // Generic audio has precedence
    return media.audio.recvaudio === true;
  }

  function isVideoSendEnabled(media) {
    TvRTC.debug("isVideoSendEnabled:", media);
    if (!media)
      return true; // Default
    if (!media.video)
      return false; // Generic video has precedence
    return (media.video.sendvideo === true);
  }

  function isVideoRecvEnabled(media) {
    TvRTC.debug("isVideoRecvEnabled:", media);
    if (!media)
      return true; // Default
    if (!media.video)
      return false; // Generic video has precedence
    return (media.video.recvvideo === true);
  }

  function isScreenSendEnabled(media) {
    TvRTC.debug("isScreenSendEnabled:", media);
    if (!media)
      return false;
    if (!media.video)
      return false;
    if(media.video.videosend && (media.video.type === "screen" || media.video.type === "window"))
      return true;
    else
      return false;
  }

  function isDataEnabled(media) {
    TvRTC.debug("isDataEnabled:", media);
    if (TvRTC.webRTCAdapter.browserDetails.browser === "edge") {
      TvRTC.warn("Edge doesn't support data channels yet");
      return false;
    }
    if (media === undefined || media === null)
      return false; // Default
    return (media.data === true);
  }

  function isTrickleEnabled(trickle) {
    TvRTC.debug("isTrickleEnabled:", trickle);
    return (trickle === false) ? false : true;
  }


  function updateBandwidthRestriction(sdp, bandwidth) {
    let modifier = 'AS';
    if (adapter.browserDetails.browser === 'firefox') {
      bandwidth = (bandwidth >>> 0) * 1000;
      modifier = 'TIAS';
    }
    if (sdp.indexOf('b=' + modifier + ':') === -1) {
      // insert b= after c= line.
      sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
    } else {
      sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
    }
    return sdp;
  }

  function removeBandwidthRestriction(sdp) {
    return sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
  }
}

export
default TvRTC;
