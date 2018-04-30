function sha256(imageData) {
  return crypto.subtle.digest("SHA-256", imageData.data).then(function (hash) {
    return hex(hash);
  });
}

function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    var value = view.getUint32(i)
    var stringValue = value.toString(16)
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
  }

  return hexCodes.join("");
}

function getVideoImage(path, secs, callback) {
  var me = this, video = document.createElement('video');
  console.log(video);
  video.onloadedmetadata = function() {
    console.log("onloadedmetadata");
    if ('function' === typeof secs) {
      secs = secs(this.duration);
    }
    this.currentTime = Math.min(Math.max(0, (secs < 0 ? this.duration : 0) + secs), this.duration);
  };
  video.onseeked = function(e) {
    console.log("seek");
    var canvas = document.createElement('canvas');
    document.body.append(canvas);
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      sha256(data).then(function(digest) {
        callback(digest);
      }, function(error) {
        console.log(error);
        callback(null);
      });
    } catch(e) {
      console.log(e);
      callback(null);
    }
  };
  video.onerror = function(e) {
    console.log("err");
    callback(null);
  };
  video.src = path;
  document.body.append(video);
  console.log("Appended");
}

getVideoImage("video.mp4", 0, function(digest) {
  console.log("Digested");
	document.body.append(digest);
});

console.log("Loaded");
