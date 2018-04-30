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
  video.onloadedmetadata = function() {
    if ('function' === typeof secs) {
      secs = secs(this.duration);
    }
    this.currentTime = Math.min(Math.max(0, (secs < 0 ? this.duration : 0) + secs), this.duration);
  };
  video.onseeked = function(e) {
    var canvas = document.createElement('canvas');
    document.body.append(canvas);
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	sha256(ctx.getImageData(0, 0, canvas.width, canvas.height)).then(function(digest) {
	  callback(digest);
	});
  };
  video.onerror = function(e) {
    callback(undefined);
  };
  video.src = path;
}

getVideoImage("video.mp4", 0, function(digest) {
	document.body.append(digest);
});
