// noinspection DuplicatedCode

(function (wHandle, wjQuery) {
	var SKIN_URL = "./skins/";

	var touchX, touchY, touchable = 'ontouchstart' in window, touches = [];

	var leftTouchID = -1,
		leftTouchPos = new Vector2(0, 0),
		leftTouchStartPos = new Vector2(0, 0),
		leftVector = new Vector2(0, 0);

	function gameLoop() {
		ma = true;
		document.getElementById("canvas").focus();
		var isTyping = false;
		var chattxt;

		mainCanvas = nCanvas = document.getElementById("canvas");
		ctx = mainCanvas.getContext("2d");

		mainCanvas.onmousemove = function (event) {
			if (typeof event['isTrusted'] !== 'boolean' || event['isTrusted'] === false) return;
			if (touchable) return;

			rawMouseX = event.clientX;
			rawMouseY = event.clientY;
			mouseCoordinateChange()
		};

		mainCanvas.addEventListener('touchstart', onTouchStart, false);
		mainCanvas.addEventListener('touchmove', onTouchMove, false);
		mainCanvas.addEventListener('touchend', onTouchEnd, false);

		if (/firefox/i.test(navigator.userAgent)) {
			document.addEventListener("DOMMouseScroll", handleWheel, false);
		} else {
			document.body.onmousewheel = handleWheel;
		}

		mainCanvas.onfocus = function() {
			isTyping = false;
		};

		document.getElementById("chat_textbox").onblur = function() {
			isTyping = false;
		};

		document.getElementById("chat_textbox").onfocus = function() {
			isTyping = true;
		};

		var spacePressed = false,
			qPressed = false,
			ePressed = false,
			rPressed = false,
			tPressed = false,
			wPressed = false;

		wHandle.onkeydown = function (event) {
      if (
        typeof event["isTrusted"] !== "boolean" ||
        event["isTrusted"] === false
      )
        return;

      switch (event.keyCode) {
        case 32: // split
          if (!spacePressed && !isTyping) {
            sendMouseMove();
            sendUint8(17);
            if (!sMacro) spacePressed = true;
          }
          break;
        case 81: // key q pressed
          if (!qPressed && !isTyping) {
            sendUint8(18);
            if (!qMacro) qPressed = true;
          }
          break;
        case 87: // eject mass
          if (!wPressed && !isTyping) {
            sendMouseMove();
            sendUint8(21);
            if (!wMacro) wPressed = true;
          }
          break;
        case 69: // e key
          if (!ePressed && !isTyping) {
            sendMouseMove();
            sendUint8(22);
            if (!eMacro) ePressed = true;
            console.log("E pressed");
          }
          break;
        case 82: // r key
          if (!rPressed && !isTyping) {
            sendMouseMove();
            sendUint8(23);
            if (!rMacro) rPressed = true;
            console.log("R pressed");
          }
          break;
        case 84: // T key
          if (!rPressed && !isTyping) {
            sendMouseMove();
            sendUint8(24);
            tPressed = true;
            console.log("T pressed");
          }
          break;
        case 66: // B key - Skoru 100 artır
          if (!isTyping) {
            userScore += 100; // Skoru 100 artır
            console.log("B pressed - Yeni skor: " + userScore);
          }
          break;
        case 27: // quit
          showOverlays(true);
          wHandle.isSpectating = false;
          break;
        case 13:
          event.preventDefault();
          if (isTyping) {
            isTyping = false;
            document.getElementById("chat_textbox").blur();
            chattxt = document.getElementById("chat_textbox").value;
            if (chattxt.length > 0) sendChat(chattxt);
            document.getElementById("chat_textbox").value = "";
          } else {
            if (!hasOverlay) {
              document.getElementById("chat_textbox").focus();
              isTyping = true;
            }
          }
          break;
      }
    };

		wHandle.onkeyup = function (event) {
			if (typeof event['isTrusted'] !== 'boolean' || event['isTrusted'] === false) return;

			switch (event.keyCode) {
				case 32:
					spacePressed = false;
					break;
				case 87:
					wPressed = false;
					break;
				case 69:
					ePressed = false;
					break;
				case 82:
					rPressed = false;
					break;
				case 84:
					tPressed = false;
					break;
				case 81:
					if (qPressed) {
						sendUint8(19);
						qPressed = false;
					}
					break;
			}
		};
		wHandle.onblur = function (event) {
			sendUint8(19);
			wPressed = qPressed = spacePressed = false
		};
		wHandle.onresize = canvasResize;
		canvasResize();
		if (wHandle.requestAnimationFrame) {
			wHandle.requestAnimationFrame(redrawGameScene);
		} else {
			setInterval(drawGameScene, 1E3 / 60);
		}
		mouseinterval = setInterval(sendMouseMove, 40);
		setInterval(function() {
			try {
				clearInterval(mouseinterval)
			} catch (e) {
				console.log("e at 204");
			}
			mouseinterval = setInterval(sendMouseMove, 40);

		}, 5000);
		if (w) {
			wjQuery("#region").val(w);
		}
		Ha();
		setRegion(wjQuery("#region").val());
		null == ws && w && showConnecting();
		canvasResize();
	}

	function openFullscreen(elem) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		} else if (elem.webkitEnterFullscreen) {
			elem.webkitEnterFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		}
	}

	function closeFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}

	function onTouchStart(e) {
		if (typeof e['isTrusted'] !== 'boolean' || e['isTrusted'] === false) return;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];

			if ((leftTouchID < 0) && (touch.clientX < canvasWidth / 2)) {
				leftTouchID = touch.identifier;
				leftTouchStartPos.reset(touch.clientX, touch.clientY);
				leftTouchPos.copyFrom(leftTouchStartPos);
				leftVector.reset(0, 0);
			}

			var size = ~~(canvasWidth / 10);

			if ((touch.clientX > canvasWidth - size) && (touch.clientY > canvasHeight - size)) {
				sendMouseMove();
				sendUint8(17); //split
			}

			if ((touch.clientX > canvasWidth - size) && (touch.clientY > canvasHeight - 2 * size - 10) && (touch.clientY < canvasHeight - size - 10)) {
				sendMouseMove();
				sendUint8(21); //eject
			}

			if ((touch.clientX > canvasWidth - size) && (touch.clientY > canvasHeight - 3 * size - 20) && (touch.clientY < canvasHeight - 2 * size - 30)) {
				sendMouseMove();

				if (!document.fullscreenElement) {
					openFullscreen(document.documentElement);
				} else {
					closeFullscreen();
				}
			}
		}
		touches = e.touches;
	}

	function onTouchMove(e) {
		// Prevent the browser from doing its default thing (scroll, zoom)
		e.preventDefault();

		touchable = true;

		if (typeof e['isTrusted'] !== 'boolean' || e['isTrusted'] === false) return;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			if (leftTouchID === touch.identifier) {
				leftTouchPos.reset(touch.clientX, touch.clientY);
				leftVector.copyFrom(leftTouchPos);
				leftVector.minusEq(leftTouchStartPos);
				rawMouseX = leftVector.x * 3 + canvasWidth / 2;
				rawMouseY = leftVector.y * 3 + canvasHeight / 2;
				mouseCoordinateChange();
				sendMouseMove();
			}
		}

		touches = e.touches;
	}

	function onTouchEnd(e) {
		if (typeof e['isTrusted'] !== 'boolean' || e['isTrusted'] === false) return;

		touches = e.touches;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			if (leftTouchID === touch.identifier) {
				leftTouchID = -1;
				leftVector.reset(0, 0);
				break;
			}
		}
	}

	function handleWheel(event) {
		if (typeof event['isTrusted'] !== 'boolean' || event['isTrusted'] === false) return;

		zoom *= Math.pow(.9, event.wheelDelta / -120 || event.detail || 0);
		1 > zoom && (zoom = 1);
		zoom > 4 / viewZoom && (zoom = 4 / viewZoom)
	}

	function buildQTree() {
		if (.4 > viewZoom) qTree = null;
		else {
			var a = Number.POSITIVE_INFINITY,
				b = Number.POSITIVE_INFINITY,
				c = Number.NEGATIVE_INFINITY,
				d = Number.NEGATIVE_INFINITY,
				e = 0;
			for (var i = 0; i < nodelist.length; i++) {
				var node = nodelist[i];
				if (node.shouldRender() && !node.prepareData && 20 < node.size * viewZoom) {
					e = Math.max(node.size, e);
					a = Math.min(node.x, a);
					b = Math.min(node.y, b);
					c = Math.max(node.x, c);
					d = Math.max(node.y, d);
				}
			}
			qTree = Quad.init({
				minX: a - (e + 100),
				minY: b - (e + 100),
				maxX: c + (e + 100),
				maxY: d + (e + 100),
				maxChildren: 2,
				maxDepth: 4
			});
			for (i = 0; i < nodelist.length; i++) {
				node = nodelist[i];
				if (node.shouldRender() && !(20 >= node.size * viewZoom)) {
					for (a = 0; a < node.points.length; ++a) {
						b = node.points[a].x;
						c = node.points[a].y;
						b < nodeX - canvasWidth / 2 / viewZoom || c < nodeY - canvasHeight / 2 / viewZoom || b > nodeX + canvasWidth / 2 / viewZoom || c > nodeY + canvasHeight / 2 / viewZoom || qTree.insert(node.points[a]);
					}
				}
			}
		}
	}

	function mouseCoordinateChange() {
		X = (rawMouseX - canvasWidth / 2) / viewZoom + nodeX;
		Y = (rawMouseY - canvasHeight / 2) / viewZoom + nodeY
	}

	function hideOverlays() {
		hasOverlay = false;
		wjQuery("#adsBottom").hide();
		wjQuery("#overlays").hide();
		Ha()
	}

	function setRegion(a) {
		if (a && a != w) {
			if (wjQuery("#region").val() != a) {
				wjQuery("#region").val(a);
			}
			w = wHandle.localStorage.location = a;
			wjQuery(".region-message").hide();
			wjQuery(".region-message." + a).show();
			wjQuery(".btn-needs-server").prop("disabled", false);
			ma && showConnecting();
		}
	}

	function showOverlays(arg) {
		hasOverlay = true;
		userNickName = null;
		wjQuery("#overlays").fadeIn(arg ? 200 : 3E3);
		arg || wjQuery("#adsBottom").fadeIn(3E3)
	}

	function Ha() {
		wjQuery("#region").val() ? wHandle.localStorage.location = wjQuery("#region").val() : wHandle.localStorage.location && wjQuery("#region").val(wHandle.localStorage.location);
		wjQuery("#region").val() ? wjQuery("#locationKnown").append(wjQuery("#region")) : wjQuery("#locationUnknown").append(wjQuery("#region"))
	}

	function attemptConnection() {
		if (typeof grecaptcha !== 'undefined') {
			grecaptcha.ready(() => {
				grecaptcha.execute('6LdxZMspAAAAAOVZOMGJQ_yJo2hBI9QAbShSr_F3', { action: 'connect' }).then(token => {
					var location = ~window.location.hostname.indexOf('emupedia.net') ? 'emupedia.net' : (~window.location.hostname.indexOf('emupedia.org') ? 'emupedia.org' : (~window.location.hostname.indexOf('emupedia.games') ? 'emupedia.games' : (~window.location.hostname.indexOf('emuos.net') ? 'emuos.net' : (~window.location.hostname.indexOf('emuos.org') ? 'emuos.org' : (~window.location.hostname.indexOf('emuos.games') ? 'emuos.games' : 'emupedia.net')))));
					wsConnect('wss://agar.' + location + '/ws1/?token=' + token);
				});
			});
		}
	}

	function showConnecting() {
		if (ma) {
			wjQuery("#connecting").show();
			attemptConnection();
		}
	}

	function wsConnect(wsUrl) {
		if (ws) {
			ws.onopen = null;
			ws.onmessage = null;
			ws.onclose = null;
			try {
				ws.close()
			} catch (b) {}
			ws = null
		}

		nodesOnScreen = [];
		playerCells = [];
		nodes = {};
		nodelist = [];
		Cells = [];
		leaderBoard = [];
		mainCanvas = teamScores = null;
		userScore = 0;
		//console.log('Connecting to ' + wsUrl + '...');
		ws = new WebSocket(wsUrl);
		ws.binaryType = 'arraybuffer';
		ws.onopen = onWsOpen;
		ws.onmessage = onWsMessage;
		ws.onclose = onWsClose;
		ws.onerror = function(e) {
			//console.log('Error ' + e);
			gameMode = 1;
			wjQuery("#gamemode").val(1);
			return 54;
		}
	}

	function prepareData(a) {
		return new DataView(new ArrayBuffer(a))
	}

	function wsSend(a) {
		ws.send(a.buffer)
	}

	function onWsOpen() {
		var msg;
		wjQuery('#connecting').hide();
		msg = prepareData(5);
		msg.setUint8(0, 254);
		msg.setUint32(1, 4, true);
		wsSend(msg);
		msg = prepareData(5);
		msg.setUint8(0, 255);
		msg.setUint32(1, 1332175218, true);
		wsSend(msg);
		sendNickName();
		// console.log('Connection successful!');
		if (reconnectTimeout === null) {
			reconnectTimeout = setTimeout(function() {
				delay = 500;
			}, 5000);
		} else {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	}

	function onWsClose() {
		// console.log('Connection closed!');
		setTimeout(showConnecting, delay);
		delay *= 1.8
	}

	function onWsMessage(msg) {
		handleWsMessage(new DataView(msg.data))
	}

	function handleWsMessage(msg) {
		function getString() {
			var text = '',
				char;
			while ((char = msg.getUint16(offset, true)) != 0) {
				offset += 2;
				text += String.fromCharCode(char);
			}
			offset += 2;
			return text;
		}

		var offset = 0,
			setCustomLB = false;
		240 == msg.getUint8(offset) && (offset += 5);
		switch (msg.getUint8(offset++)) {
			case 16: // update nodes
				updateNodes(msg, offset);
				break;
			case 17: // update position
				posX = msg.getFloat32(offset, true);
				offset += 4;
				posY = msg.getFloat32(offset, true);
				offset += 4;
				posSize = msg.getFloat32(offset, true);
				offset += 4;
				break;
			case 70: // clientpacket
				clientPacket(msg, offset);
				break;
			case 20: // clear nodes
				playerCells = [];
				nodesOnScreen = [];
				break;
			case 45: // info
				infoPacket(msg, offset)
				break;
			case 21: // draw line
				lineX = msg.getInt16(offset, true);
				offset += 2;
				lineY = msg.getInt16(offset, true);
				offset += 2;
				if (!drawLine) {
					drawLine = true;
					drawLineX = lineX;
					drawLineY = lineY;
				}
				break;
			case 32: // add node
				nodesOnScreen.push(msg.getUint32(offset, true));
				offset += 4;
				break;
			case 48: // update leaderboard (custom text)
				setCustomLB = true;
				noRanking = true;
				break;
			case 49: // update leaderboard (ffa)
				if (!setCustomLB) {
					noRanking = false;
				}
				teamScores = null;
				var LBplayerNum = msg.getUint32(offset, true);
				offset += 4;
				leaderBoard = [];
				for (i = 0; i < LBplayerNum; ++i) {
					var nodeId = msg.getUint32(offset, true);
					offset += 4;
					leaderBoard.push({
						id: nodeId,
						name: getString()
					})
				}
				drawLeaderBoard();
				break;
			case 50: // update leaderboard (teams)
				teamScores = [];
				var LBteamNum = msg.getUint32(offset, true);
				offset += 4;
				for (var i = 0; i < LBteamNum; ++i) {
					teamScores.push(msg.getFloat32(offset, true));
					offset += 4;
				}
				drawLeaderBoard();
				break;
			case 64: // set border
				leftPos = msg.getFloat64(offset, true);
				offset += 8;
				topPos = msg.getFloat64(offset, true);
				offset += 8;
				rightPos = msg.getFloat64(offset, true);
				offset += 8;
				bottomPos = msg.getFloat64(offset, true);
				offset += 8;
				posX = (rightPos + leftPos) / 2;
				posY = (bottomPos + topPos) / 2;
				posSize = 1;
				if (0 == playerCells.length) {
					nodeX = posX;
					nodeY = posY;
					viewZoom = posSize;
				}
				break;
			case 99:
				//alert("get message");
				addChat(msg, offset);
				break;
		}
	}

	function addChat(view, offset) {
		function getString() {
			var text = '',
				char;
			while ((char = view.getUint16(offset, true)) != 0) {
				offset += 2;
				text += String.fromCharCode(char);
			}
			offset += 2;
			return text;
		}

		var flags = view.getUint8(offset++);
		// for future expansions
		if (flags & 2) {
			offset += 4;
		}
		if (flags & 4) {
			offset += 8;
		}
		if (flags & 8) {
			offset += 16;
		}

		var r = view.getUint8(offset++),
			g = view.getUint8(offset++),
			b = view.getUint8(offset++),
			color = (r << 16 | g << 8 | b).toString(16);
		while (color.length > 6) {
			color = '0' + color;
		}
		color = '#' + color;
		chatBoard.push({
			"name": getString(),
			"color": color,
			"message": getString(),
			"time": Date.now()
		});
		drawChatBoard();
		//drawChatBoardLine();
	}

	function drawChatBoard() {
		// chatCanvas = null;
		chatCanvas = document.createElement("canvas");
		var ctx = chatCanvas.getContext("2d");
		var scaleFactor = Math.min(Math.max(canvasWidth / 1200, 0.75), 1); //scale factor = 0.75 to 1
		chatCanvas.width = 1000 * scaleFactor;
		chatCanvas.height = 550 * scaleFactor;
		ctx.scale(scaleFactor, scaleFactor);
		var nowtime = Date.now();
		var lasttime = 0;

		if (chatBoard.length >= 1)
			lasttime = chatBoard[chatBoard.length - 1].time;
		else return;

		var deltat = nowtime - lasttime;

		ctx.globalAlpha = 0.8 * Math.exp(-deltat / 25000);

		var len = chatBoard.length;
		var from = len - 15;
		if (from < 0) from = 0;
		for (var i = 0; i < (len - from); i++) {
			var chatName = new UText(18, chatBoard[i + from].color);
			chatName.setValue(chatBoard[i + from].name);
			var width = chatName.getWidth();
			var a = chatName.render();
			ctx.drawImage(a, 15, chatCanvas.height / scaleFactor - 24 * (len - i - from));

			var chatText = new UText(18, '#666666');
			chatText.setValue(': ' + chatBoard[i + from].message);
			a = chatText.render();
			ctx.drawImage(a, 12 + width * 1.8, chatCanvas.height / scaleFactor - 24 * (len - from - i));
		}
		//ctx.restore();
	}

	function infoPacket(view, offset) {
		isNewProto = true;

		function getString() {
			var text = '',
				char;
			while ((char = view.getUint8(offset, true)) != 0) {
				offset++;
				text += String.fromCharCode(char);
			}
			offset++;
			return text;
		}

		wjQuery("#gamemode").empty()
		var info = getString()
		var regi = info.split("|");
		for (var i in regi) {
			if (!regi[i]) continue;
			var det = regi[i].split(":");
			if (!det[2] || det[2] == "undefined") det[2] = defaultPort;
			wjQuery('#gamemode').append(wjQuery("<option></option>").attr("value", det[0]).text(det[1]));
			var pu = {
				id: det[0],
				name: det[1],
				port: det[2]
			}
		}
	}

	function clientPacket(view, offset) {
		function getString() {
			var text = '',
				char;
			while ((char = view.getUint8(offset, true)) != 0) {
				offset++;
				text += String.fromCharCode(char);
			}
			offset++;
			return text;
		}

		var rawData = getString();
		var Data = JSON.parse(rawData);
		for (var i in Data) {
			if (Data[i]) clientData[i] = Data[i];
		}
		/*
		 // Macros
			sMacro: 0,
			wMacro: 0,
			qMacro: 0,
			eMacro: 0,
			rMacro: 0,

			// Current client configs
			darkBG: 1,
			chat: 2,
			skins: 2,
			grid: 2,
			acid: 1,
			colors: 2,
			names: 2,
			showMass: 1,
			smooth: 1,

			// Future feature
			minionCount: 0,
			minimap: 0,

			// Others
			maxName: 15,
			instructions: "";
			customHTML:  "";
		*/
		if (Data.leavemessage) {
			wjQuery(window).bind('beforeunload', function() {
				return clientData.leavemessage
			});
		}
		if (Data.title) {
			wjQuery(document).prop('title', clientData.title);
			wjQuery("#titleh").text(clientData.title);
		}
		if (Data.defaultusername) wjQuery("#nick").val(clientData.defaultusername);
		if (Data.nickplaceholder) wjQuery("#nick").attr("placeholder", clientData.nickplaceholder)
		if (Data.instructions) wjQuery("#customins").text(clientData.instructions);
		if (Data.customHTML) wjQuery("#customht").html(clientData.customHTML);
		if (Data.maxName) wjQuery("#nick").attr("maxlength", clientData.maxName);
		if (Data.wMacro) wMacro = (clientData.wMacro == 1) ? true : false;
		if (Data.sMacro) sMacro = (clientData.sMacro == 1) ? true : false;
		if (Data.eMacro) eMacro = (clientData.eMacro == 1) ? true : false;
		if (Data.rMacro) rMacro = (clientData.rMacro == 1) ? true : false;
		if (Data.qMacro) qMacro = (clientData.qMacro == 1) ? true : false;
		if (Data.chat) {
			if (clientData.chat < 2) wjQuery("#chat_textbox").hide(); else wjQuery("#chat_textbox").show();
		}
		if (Data.darkBG) showDarkTheme = (clientData.darkBG < 2) ? false : true;
		if (Data.skins) showSkin = (clientData.skins >= 2) ? true : false;
		if (Data.grid) hideGrid = (clientData.grid >= 2) ? false : true;
		if (Data.acid) xa = (clientData.acid < 2) ? false : true;
		if (Data.colors) showColor = (clientData.colors >= 2) ? false : true;
		if (Data.names) showName = (clientData.names < 2) ? false : true;
		if (Data.showMass) showMass = (clientData.showMass < 2) ? false : true;
		if (Data.smooth) smoothRender = (clientData.smooth >= 2) ? 2 : .4;
		if (clientData.chat == 0 || clientData.chat == 3) wjQuery('#cchat').attr('disabled', true); else wjQuery('#cchat').attr('disabled', false);
		if (clientData.darkBG == 0 || clientData.darkBG == 3) wjQuery('#cdark').attr('disabled', true); else wjQuery('#cdark').attr('disabled', false);
		if (clientData.skins == 0 || clientData.skins == 3) wjQuery('#cskin').attr('disabled', true); else wjQuery('#cskin').attr('disabled', false);
		if (clientData.grid == 0 || clientData.grid == 3) wjQuery('#cgrid').attr('disabled', true); else wjQuery('#cgrid').attr('disabled', false);
		if (clientData.acid == 0 || clientData.acid == 3) wjQuery('#cacid').attr('disabled', true); else wjQuery('#cacid').attr('disabled', false);
		if (clientData.colors == 0 || clientData.colors == 3) wjQuery('#ccolor').attr('disabled', true); else wjQuery('#ccolor').attr('disabled', false);
		if (clientData.names == 0 || clientData.names == 3) wjQuery('#cname').attr('disabled', true); else wjQuery('#cname').attr('disabled', false);
		if (clientData.showMass == 0 || clientData.showMass == 3) wjQuery('#cmass').attr('disabled', true); else wjQuery('#cmass').attr('disabled', false);
		if (clientData.smooth == 0 || clientData.smooth == 3) wjQuery('#csmooth').attr('disabled', true); else wjQuery('#csmooth').attr('disabled', false);
	}

	function updateNodes(view, offset) {
		timestamp = +new Date;
		var code = Math.random();
		ua = false;
		var queueLength = view.getUint16(offset, true);
		offset += 2;
		for (i = 0; i < queueLength; ++i) {
			var killer = nodes[view.getUint32(offset, true)],
				killedNode = nodes[view.getUint32(offset + 4, true)];
			offset += 8;
			if (killer && killedNode) {
				killedNode.destroy();
				killedNode.ox = killedNode.x;
				killedNode.oy = killedNode.y;
				killedNode.oSize = killedNode.size;
				killedNode.nx = killer.x;
				killedNode.ny = killer.y;
				killedNode.nSize = killedNode.size;
				killedNode.updateTime = timestamp;
			}
		}
		for (var i = 0; ;) {
			var nodeid = view.getUint32(offset, true);
			offset += 4;
			if (0 == nodeid) break;
			++i;
			var size, posY, posX = view.getInt16(offset, true);
			offset += 2;
			posY = view.getInt16(offset, true);
			offset += 2;
			size = view.getInt16(offset, true);
			offset += 2;
			for (var r = view.getUint8(offset++), g = view.getUint8(offset++), b = view.getUint8(offset++),
					 color = (r << 16 | g << 8 | b).toString(16); 6 > color.length;) color = "0" + color;
			var colorstr = "#" + color,
				flags = view.getUint8(offset++),
				flagVirus = !!(flags & 1),
				flagAgitated = !!(flags & 16);
			flags & 2 && (offset += 4);
			flags & 4 && (offset += 8);
			flags & 8 && (offset += 16);
			if (isNewProto) {
				for (var char, skin = ""; ;) {
					char = view.getUint8(offset, true);
					offset++;
					if (0 == char) break;
					skin += String.fromCharCode(char);
				}
			}
			for (var char, name = ""; ;) {
				char = view.getUint16(offset, true);
				offset += 2;
				if (0 == char) break;
				name += String.fromCharCode(char)
			}


			var node = null;
			if (nodes.hasOwnProperty(nodeid)) {
				node = nodes[nodeid];
				node.updatePos();
				node.ox = node.x;
				node.oy = node.y;
				node.oSize = node.size;
				node.color = colorstr;
			} else {
				node = new Cell(nodeid, posX, posY, size, colorstr, name);
				nodelist.push(node);
				nodes[nodeid] = node;
				node.ka = posX;
				node.la = posY;
			}
			node.isVirus = flagVirus;
			node.isAgitated = flagAgitated;
			node.nx = posX;
			node.ny = posY;
			node.nSize = size;
			node.updateCode = code;
			node.updateTime = timestamp;
			node.flag = flags;
			node.skin = skin;
			name && node.setName(name);
			if (-1 != nodesOnScreen.indexOf(nodeid) && -1 == playerCells.indexOf(node)) {
				document.getElementById("overlays").style.display = "none";
				playerCells.push(node);
				if (1 == playerCells.length) {
					nodeX = node.x;
					nodeY = node.y;
				}
			}
		}
		queueLength = view.getUint32(offset, true);
		offset += 4;
		for (i = 0; i < queueLength; i++) {
			var nodeId = view.getUint32(offset, true);
			offset += 4;
			node = nodes[nodeId];
			null != node && node.destroy();
		}
		ua && 0 == playerCells.length && showOverlays(false)
	}

	function sendMouseMove() {
		var msg;
		if (wsIsOpen()) {
			msg = rawMouseX - canvasWidth / 2;
			var b = rawMouseY - canvasHeight / 2;
			if (64 <= msg * msg + b * b && !(.01 > Math.abs(oldX - X) && .01 > Math.abs(oldY - Y))) {
				oldX = X;
				oldY = Y;
				msg = prepareData(21);
				msg.setUint8(0, 16);
				msg.setFloat64(1, X, true);
				msg.setFloat64(9, Y, true);
				msg.setUint32(17, 0, true);
				wsSend(msg);
			}
		}
	}

	function sendNickName() {
		if (wsIsOpen() && null != userNickName) {
			var msg = prepareData(1 + 2 * userNickName.length);
			msg.setUint8(0, 0);
			for (var i = 0; i < userNickName.length; ++i) msg.setUint16(1 + 2 * i, userNickName.charCodeAt(i), true);
			wsSend(msg)
		}
	}

	function sendChat(str) {
		if (wsIsOpen() && (str.length < 200) && (str.length > 0) && !hideChat) {
			var msg = prepareData(2 + 2 * str.length);
			var offset = 0;
			msg.setUint8(offset++, 99);
			msg.setUint8(offset++, 0); // flags (0 for now)

			for (var i = 0; i < str.length; ++i) {
				msg.setUint16(offset, str.charCodeAt(i), true);
				offset += 2;
			}

			wsSend(msg);
		}
	}

	function wsIsOpen() {
		return null != ws && ws.readyState == ws.OPEN
	}

	function sendUint8(a) {
		if (wsIsOpen()) {
			var msg = prepareData(1);
			msg.setUint8(0, a);
			wsSend(msg)
		}
	}

	function redrawGameScene() {
		drawGameScene();
		wHandle.requestAnimationFrame(redrawGameScene)
	}

	function canvasResize() {
		window.scrollTo(0, 0);
		canvasWidth = wHandle.innerWidth;
		canvasHeight = wHandle.innerHeight;
		nCanvas.width = canvasWidth;
		nCanvas.height = canvasHeight;

		var hello = wjQuery("#helloDialog");
		hello.css("transform", "none");
		var modalHeight = hello.height();
		modalHeight > canvasHeight / 1.1 ? hello.css("transform", "translate(-50%, -50%) scale(" + canvasHeight / modalHeight / 1.1 + ")") : hello.css("transform", "translate(-50%, -50%)");
		drawGameScene()
	}

	function viewRange() {
		var ratio;
		ratio = Math.max(canvasHeight / 1080, canvasWidth / 1920);
		return ratio * zoom;
	}

	function calcViewZoom() {
		if (0 != playerCells.length) {
			for (var newViewZoom = 0, i = 0; i < playerCells.length; i++) newViewZoom += playerCells[i].size;
			newViewZoom = Math.pow(Math.min(64 / newViewZoom, 1), .4) * viewRange();
			viewZoom = (9 * viewZoom + newViewZoom) / 10
		}
	}

	function drawGameScene() {
		var a, oldtime = Date.now();
		++cb;
		timestamp = oldtime;
		if (0 < playerCells.length) {
			calcViewZoom();
			var c = a = 0;
			for (var d = 0; d < playerCells.length; d++) {
				playerCells[d].updatePos();
				a += playerCells[d].x / playerCells.length;
				c += playerCells[d].y / playerCells.length;
			}
			posX = a;
			posY = c;
			posSize = viewZoom;
			nodeX = (nodeX + a) / 2;
			nodeY = (nodeY + c) / 2
		} else {
			nodeX = (29 * nodeX + posX) / 30;
			nodeY = (29 * nodeY + posY) / 30;
			viewZoom = (9 * viewZoom + posSize * viewRange()) / 10;
		}
		buildQTree();
		mouseCoordinateChange();
		xa || ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		if (xa) {
			if (showDarkTheme) {
				ctx.fillStyle = '#111111';
				ctx.globalAlpha = .05;
				ctx.fillRect(0, 0, canvasWidth, canvasHeight);
				ctx.globalAlpha = 1;
			} else {
				ctx.fillStyle = '#F2FBFF';
				ctx.globalAlpha = .05;
				ctx.fillRect(0, 0, canvasWidth, canvasHeight);
				ctx.globalAlpha = 1;
			}
		} else {
			drawGrid();
		}
		nodelist.sort(function (a, b) {
			return a.size === b.size ? a.id - b.id : a.size - b.size
		});
		ctx.save();
		ctx.translate(canvasWidth / 2, canvasHeight / 2);
		ctx.scale(viewZoom, viewZoom);
		ctx.translate(-nodeX, -nodeY);
		for (d = 0; d < Cells.length; d++) Cells[d].drawOneCell(ctx);

		for (d = 0; d < nodelist.length; d++) nodelist[d].drawOneCell(ctx);

		if (drawLine) {
			drawLineX = (3 * drawLineX + lineX) /
				4;
			drawLineY = (3 * drawLineY + lineY) / 4;
			ctx.save();
			ctx.strokeStyle = "#FFAAAA";
			ctx.lineWidth = 10;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.globalAlpha = .5;
			ctx.beginPath();
			for (d = 0; d < playerCells.length; d++) {
				ctx.moveTo(playerCells[d].x, playerCells[d].y);
				ctx.lineTo(drawLineX, drawLineY);
			}
			ctx.stroke();
			ctx.restore()
		}

		ctx.restore();

		lbCanvas && lbCanvas.width && ctx.drawImage(lbCanvas, canvasWidth - lbCanvas.width - 10, 10); // draw Leader Board
		if (!hideChat) {
			if ((chatCanvas != null) && (chatCanvas.width > 0)) ctx.drawImage(chatCanvas, 0, canvasHeight - chatCanvas.height - 50); // draw Chat Board
		}

		drawMinimap();

		userScore = Math.max(userScore, calcUserScore());
		if (0 != userScore) {
			if (null == scoreText) {
				scoreText = new UText(24, '#FFFFFF');
			}
			scoreText.setValue('Score: ' + ~~(userScore / 100));
			c = scoreText.render();
			a = c.width;
			ctx.globalAlpha = .2;
			ctx.fillStyle = '#000000';
			ctx.fillRect(10, 10, a + 10, 34);//canvasHeight - 10 - 24 - 10
			ctx.globalAlpha = 1;
			ctx.drawImage(c, 15, 15);//canvasHeight - 10 - 24 - 5
		}
		drawTouchButtons(ctx);
		drawTouch(ctx);
		//drawChatBoard();
		var deltatime = Date.now() - oldtime;
		deltatime > 1E3 / 60 ? z -= .01 : deltatime < 1E3 / 65 && (z += .01);
		.4 > z && (z = .4);
		1 < z && (z = 1)
	}

	function drawTouch(ctx) {
		ctx.save();

		if (touchable) {
			for (var i = 0; i < touches.length; i++) {

				var touch = touches[i];

				if (touch.identifier === leftTouchID) {
					ctx.beginPath();
					ctx.strokeStyle = "#0096ff";
					ctx.lineWidth = 6;
					ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 40, 0, Math.PI * 2, true);
					ctx.stroke();
					ctx.beginPath();
					ctx.strokeStyle = "#0096ff";
					ctx.lineWidth = 2;
					ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 60, 0, Math.PI * 2, true);
					ctx.stroke();
					ctx.beginPath();
					ctx.strokeStyle = "#0096ff";
					ctx.arc(leftTouchPos.x, leftTouchPos.y, 40, 0, Math.PI * 2, true);
					ctx.stroke();
				} else {
					//ctx.beginPath();
					//ctx.fillStyle = "#0096ff";
					//ctx.fillText("touch id : "+touch.identifier+" x:"+touch.clientX+" y:"+touch.clientY, touch.clientX+30, touch.clientY-30);
					ctx.beginPath();
					ctx.strokeStyle = "#0096ff";
					ctx.lineWidth = "6";
					ctx.arc(touch.clientX, touch.clientY, 40, 0, Math.PI * 2, true);
					ctx.stroke();
				}
			}
		} else {
			//ctx.fillStyle	 = "white";
			//ctx.fillText("mouse : "+touchX+", "+touchY, touchX, touchY);
		}
		//c.fillText("hello", 0,0);
		ctx.restore();
	}

	function drawGrid() {
		ctx.fillStyle = showDarkTheme ? "#111111" : "#F2FBFF";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		if (showBackgroundSectors) {
			ctx.save();
			ctx.strokeStyle = showDarkTheme ? "#666666" : "#dddddd";
			ctx.fillStyle = showDarkTheme ? "#666666" : "#dddddd";
			ctx.lineWidth = 100;

			// Calculate sector size based on actual map dimensions
			const sectorCount = 5;
			const sectorWidth = (rightPos - leftPos) / sectorCount;
			const sectorHeight = (bottomPos - topPos) / sectorCount;

			// Transform to game world coordinates
			ctx.scale(viewZoom, viewZoom);
			ctx.translate(-nodeX + canvasWidth / (2 * viewZoom), -nodeY + canvasHeight / (2 * viewZoom));

			// Draw sector grid
			for (let x = 0; x <= sectorCount; x++) {
				const xPos = leftPos + x * sectorWidth;
				ctx.beginPath();
				ctx.moveTo(xPos, topPos);
				ctx.lineTo(xPos, bottomPos);
				ctx.stroke();
			}

			for (let y = 0; y <= sectorCount; y++) {
				const yPos = topPos + y * sectorHeight;
				ctx.beginPath();
				ctx.moveTo(leftPos, yPos);
				ctx.lineTo(rightPos, yPos);
				ctx.stroke();
			}

			// Draw sector labels
			ctx.font = "bold " + Math.max(sectorWidth / 3, 100) + "px Ubuntu";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			for (let y = 0; y < sectorCount; y++) {
				for (let x = 0; x < sectorCount; x++) {
					const letter = String.fromCharCode(65 + x); // A-E
					const number = y + 1; // 1-5
					const label = letter + number;
					const centerX = leftPos + (x + 0.5) * sectorWidth;
					const centerY = topPos + (y + 0.5) * sectorHeight;
					ctx.fillText(label, centerX, centerY);
				}
			}

			ctx.restore();
		}

		if (!hideGrid) {
			ctx.save();
			ctx.strokeStyle = showDarkTheme ? "#AAAAAA" : "#000000";
			ctx.globalAlpha = .2;
			ctx.scale(viewZoom, viewZoom);
			var a = canvasWidth / viewZoom,
				b = canvasHeight / viewZoom;
			for (var c = -.5 + (-nodeX + a / 2) % 50; c < a; c += 50) {
				ctx.beginPath();
				ctx.moveTo(c, 0);
				ctx.lineTo(c, b);
				ctx.stroke();
			}
			for (c = -.5 + (-nodeY + b / 2) % 50; c < b; c += 50) {
				ctx.beginPath();
				ctx.moveTo(0, c);
				ctx.lineTo(a, c);
				ctx.stroke();
			}
			ctx.restore();
		}
	}

	function drawTouchButtons(ctx) {
		if (touchable && splitIcon.width) {
			var size = ~~(canvasWidth / 10);
			ctx.drawImage(splitIcon, canvasWidth - size, canvasHeight - size, size, size);
		}

		if (touchable && splitIcon.width) {
			var size = ~~(canvasWidth / 10);
			ctx.drawImage(ejectIcon, canvasWidth - size, canvasHeight - 2 * size - 10, size, size);
		}

		if (touchable && splitIcon.width) {
			var size = ~~(canvasWidth / 10);
			ctx.drawImage(!document.fullscreenElement ? fullscreenIcon : fullscreenOffIcon, canvasWidth - size, canvasHeight - 3 * size - 20, size, size);
		}
	}

	function calcUserScore() {
		for (var score = 0, i = 0; i < playerCells.length; i++) score += playerCells[i].nSize * playerCells[i].nSize;
		return score
	}

	function drawLeaderBoard() {
		lbCanvas = null;
		if (null != teamScores || 0 != leaderBoard.length)
			if (null != teamScores || showName) {
				lbCanvas = document.createElement("canvas");
				var ctx = lbCanvas.getContext("2d"),
					boardLength = 60;
				boardLength = null == teamScores ? boardLength + 24 * leaderBoard.length : boardLength + 180;
				var scaleFactor = Math.min(0.22 * canvasHeight, Math.min(200, .3 * canvasWidth)) / 200;
				lbCanvas.width = 200 * scaleFactor;
				lbCanvas.height = boardLength * scaleFactor;

				ctx.scale(scaleFactor, scaleFactor);
				ctx.globalAlpha = .4;
				ctx.fillStyle = "#000000";
				ctx.fillRect(0, 0, 200, boardLength);

				ctx.globalAlpha = 1;
				ctx.fillStyle = "#FFFFFF";
				var c = "Leaderboard";
				ctx.font = "30px Ubuntu";
				ctx.fillText(c, 100 - ctx.measureText(c).width / 2, 40);
				var b;
				if (null == teamScores) {
					for (ctx.font = "20px Ubuntu", b = 0; b < leaderBoard.length; ++b) {
						c = leaderBoard[b].name || "An unnamed cell";
						if (!showName) {
							(c = "An unnamed cell");
						}
						if (-1 != nodesOnScreen.indexOf(leaderBoard[b].id)) {
							playerCells[0].name && (c = playerCells[0].name);
							ctx.fillStyle = "#FFAAAA";
							if (!noRanking) {
								c = b + 1 + ". " + c;
							}
							ctx.fillText(c, 100 - ctx.measureText(c).width / 2, 70 + 24 * b);
						} else {
							ctx.fillStyle = "#FFFFFF";
							if (!noRanking) {
								c = b + 1 + ". " + c;
							}
							ctx.fillText(c, 100 - ctx.measureText(c).width / 2, 70 + 24 * b);
						}
					}
				} else {
					for (b = c = 0; b < teamScores.length; ++b) {
						var d = c + teamScores[b] * Math.PI * 2;
						ctx.fillStyle = teamColor[b + 1];
						ctx.beginPath();
						ctx.moveTo(100, 140);
						ctx.arc(100, 140, 80, c, d, false);
						ctx.fill();
						c = d
					}
				}
			}
	}

	function Cell(uid, ux, uy, usize, ucolor, uname) {
		this.id = uid;
		this.ox = this.x = ux;
		this.oy = this.y = uy;
		this.oSize = this.size = usize;
		this.color = ucolor;
		this.points = [];
		this.pointsAcc = [];
		this.createPoints();
		this.setName(uname);
	}

	function UText(usize, ucolor, ustroke, ustrokecolor) {
		usize && (this._size = usize);
		ucolor && (this._color = ucolor);
		this._stroke = !!ustroke;
		ustrokecolor && (this._strokeColor = ustrokecolor)
	}

	var localProtocol = wHandle.location.protocol, localProtocolHttps = "https:" == localProtocol;

	var nCanvas, ctx, mainCanvas, lbCanvas, chatCanvas, canvasWidth, canvasHeight, qTree = null,
	ws = null,
	delay = 500,
	oldX = -1,
	oldY = -1,
	z = 1,
	scoreText = null,
	skins = {},
	nodeX = 0,
	nodeY = 0,
	nodesOnScreen = [],
	playerCells = [],
	nodes = {}, nodelist = [],
	Cells = [],
	leaderBoard = [],
	chatBoard = [],
	rawMouseX = 0,
	rawMouseY = 0,
	X = -1,
	Y = -1,
	cb = 0,
	timestamp = 0,
	userNickName = null,
	leftPos = 0,
	topPos = 0,
	rightPos = 1E4,
	bottomPos = 1E4,
	viewZoom = 1,
	w = null,
	showSkin = true,
	showName = true,
	showColor = false,
	hideGrid = false,
	ua = false,
	userScore = 0,
	sMacro = false,
	wMacro = false,
	qMacro = false,
	eMacro = false,
	rMacro = false,
	reconnectTimeout = null,
	mouseinterval = false,
	clientData = { // Levels of "permission": 0 = not allowed, 1 = checked off but changeable, 2 = checked on but changeable, 3 = always on
		// Macros
		sMacro: 0,
		wMacro: 0,
		qMacro: 0,
		eMacro: 0,
		rMacro: 0,

		// Current client configs
		darkBG: 1,
		chat: 2,
		skins: 2,
		grid: 2,
		acid: 1,
		colors: 2,
		names: 2,
		showMass: 1,
		smooth: 1,

		// Future feature
		minionCount: 0,
		minimap: 0,

		// Others
		maxName: 15,
		customHTML: "",
		title: "",
		defaultusername: "",
		nickplaceholder: "",
		leavemessage: "",
		instructions: "Control your cell using the mouse, w for eject, space for split. Add &lt;skinname&gt; in your username for skins."
	},
	showDarkTheme = false,
	showMass = false,
	showMinimap = true,
	connectUrl = "",
	isNewProto = false,
	defaultPort = 0,
	smoothRender = .4,
	hideChat = false,
	posX = nodeX = ~~((leftPos + rightPos) / 2),
	posY = nodeY = ~~((topPos + bottomPos) / 2),
	posSize = 1,
	gameMode = "",
	teamScores = null,
	ma = false,
	hasOverlay = true,
	drawLine = false,
	lineX = 0,
	lineY = 0,
	drawLineX = 0,
	drawLineY = 0,
	teamColor = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
	xa = false,
	zoom = 1,
	fullscreenIcon = new Image,
	fullscreenOffIcon = new Image,
	splitIcon = new Image,
	ejectIcon = new Image,
	noRanking = false,
	showBackgroundSectors = true;
	fullscreenIcon.src = 'img/fullscreen.png';
	fullscreenOffIcon.src = 'img/fullscreen_off.png';
	splitIcon.src = 'img/split.png';
	ejectIcon.src = 'img/feed.png';
	// var wCanvas = document.createElement("canvas");
	var playerStat = null;
	wHandle.isSpectating = false;
	wHandle.setNick = function (arg) {
		hideOverlays();
		userNickName = arg;
		sendNickName();
		userScore = 0
	};
	wHandle.setRegion = setRegion;
	wHandle.setSkins = function (arg) {
		if (clientData.skins != 0 && clientData.skins != 3) showSkin = arg;
	};
	wHandle.setNames = function (arg) {
		if (clientData.names != 0 && clientData.names != 3) showName = arg
	};
	wHandle.setDarkTheme = function (arg) {
		if (clientData.darkBG != 0 && clientData.darkBG != 3) showDarkTheme = arg
	};
	wHandle.setColors = function (arg) {
		if (clientData.colors != 0 && clientData.colors != 3) showColor = arg
	};
	wHandle.setShowMass = function (arg) {
		if (clientData.showMass != 0 && clientData.showMass != 3) showMass = arg
	};
	wHandle.setHideGrid = function (arg) {
		if (clientData.grid != 0 && clientData.grid != 3) hideGrid = arg
	};
	wHandle.setSmooth = function (arg) {
		if (clientData.smooth != 0 && clientData.smooth != 3) smoothRender = arg ? 2 : .4
	};
	wHandle.setHideChat = function (arg) {
		hideChat = arg;
		if (clientData.chat != 0 && clientData.chat != 3)
			if (arg) {
				wjQuery("#chat_textbox").hide();
			} else {
				wjQuery("#chat_textbox").show();
			}
	};
	wHandle.spectate = function() {
		userNickName = null;
		wHandle.isSpectating = true;
		sendUint8(1);
		hideOverlays()
	};
	wHandle.setGameMode = function (arg) {
		if (arg != gameMode) {
			gameMode = arg;
			showConnecting();
		}
	};
	wHandle.setAcid = function (arg) {
		if (clientData.acid != 0 && clientData.acid != 3) xa = arg
	};
	wHandle.setMinimap = function (arg) {
		showMinimap = arg;
	};
	wHandle.setBackgroundSectors = function (arg) {
		showBackgroundSectors = arg;
	};
	wHandle.connect = wsConnect;

	Cell.prototype = {
		id: 0,
		points: null,
		pointsAcc: null,
		name: null,
		nameCache: null,
		sizeCache: null,
		x: 0,
		y: 0,
		size: 0,
		ox: 0,
		oy: 0,
		oSize: 0,
		nx: 0,
		ny: 0,
		nSize: 0,
		flag: 0, //what does this mean
		updateTime: 0,
		updateCode: 0,
		drawTime: 0,
		destroyed: false,
		isVirus: false,
		isAgitated: false,
		wasSimpleDrawing: true,
		destroy: function() {
			var tmp;
			for (tmp = 0, len = nodelist.length; tmp < len; tmp++)
				if (nodelist[tmp] === this) {
					nodelist.splice(tmp, 1);
					break
				}
			delete nodes[this.id];
			tmp = playerCells.indexOf(this);
			if (-1 != tmp) {
				ua = true;
				playerCells.splice(tmp, 1);
			}
			tmp = nodesOnScreen.indexOf(this.id);
			if (-1 != tmp) nodesOnScreen.splice(tmp, 1);
			this.destroyed = true;
			Cells.push(this)
		},
		getNameSize: function() {
			return Math.max(~~(.3 * this.size), 24)
		},
		setName: function (a) {
			if (this.name = a) {
				if (null == this.nameCache) {
					this.nameCache = new UText(this.getNameSize(), "#FFFFFF", true, "#000000");
					this.nameCache.setValue(this.name);
				} else {
					this.nameCache.setSize(this.getNameSize());
					this.nameCache.setValue(this.name);
				}
			}
		},
		createPoints: function() {
			for (var samplenum = this.getNumPoints(); this.points.length > samplenum;) {
				var rand = ~~(Math.random() * this.points.length);
				this.points.splice(rand, 1);
				this.pointsAcc.splice(rand, 1)
			}
			if (0 == this.points.length && 0 < samplenum) {
				this.points.push({
					ref: this,
					size: this.size,
					x: this.x,
					y: this.y
				});
				this.pointsAcc.push(Math.random() - .5);
			}
			while (this.points.length < samplenum) {
				var rand2 = ~~(Math.random() * this.points.length),
					point = this.points[rand2];
				this.points.splice(rand2, 0, {
					ref: this,
					size: point.size,
					x: point.x,
					y: point.y
				});
				this.pointsAcc.splice(rand2, 0, this.pointsAcc[rand2])
			}
		},
		getNumPoints: function() {
			if (0 == this.id) return 16;
			var a = 10;
			if (20 > this.size) a = 0;
			if (this.isVirus) a = 30;
			var b = this.size;
			if (!this.isVirus) (b *= viewZoom);
			b *= z;
			if (this.flag & 32) (b *= .25);
			return ~~Math.max(b, a);
		},
		movePoints: function() {
			this.createPoints();
			for (var points = this.points, pointsacc = this.pointsAcc, numpoints = points.length, i = 0; i < numpoints; ++i) {
				var pos1 = pointsacc[(i - 1 + numpoints) % numpoints],
					pos2 = pointsacc[(i + 1) % numpoints];
				pointsacc[i] += (Math.random() - .5) * (this.isAgitated ? 3 : 1);
				pointsacc[i] *= .7;
				10 < pointsacc[i] && (pointsacc[i] = 10);
				-10 > pointsacc[i] && (pointsacc[i] = -10);
				pointsacc[i] = (pos1 + pos2 + 8 * pointsacc[i]) / 10
			}
			for (var ref = this, isvirus = this.isVirus ? 0 : (this.id / 1E3 + timestamp / 1E4) % (2 * Math.PI), j = 0; j < numpoints; ++j) {
				var f = points[j].size,
					e = points[(j - 1 + numpoints) % numpoints].size,
					m = points[(j + 1) % numpoints].size;
				if (15 < this.size && null != qTree && 20 < this.size * viewZoom && 0 != this.id) {
					var l = false,
						n = points[j].x,
						q = points[j].y;
					qTree.retrieve2(n - 5, q - 5, 10, 10, function (a) {
						if (a.ref != ref && 25 > (n - a.x) * (n - a.x) + (q - a.y) * (q - a.y)) {
							l = true;
						}
					});
					if (!l && points[j].x < leftPos || points[j].y < topPos || points[j].x > rightPos || points[j].y > bottomPos) {
						l = true;
					}
					if (l) {
						if (0 < pointsacc[j]) {
							(pointsacc[j] = 0);
						}
						pointsacc[j] -= 1;
					}
				}
				f += pointsacc[j];
				0 > f && (f = 0);
				f = this.isAgitated ? (19 * f + this.size) / 20 : (12 * f + this.size) / 13;
				points[j].size = (e + m + 8 * f) / 10;
				e = 2 * Math.PI / numpoints;
				m = this.points[j].size;
				this.isVirus && 0 == j % 2 && (m += 5);
				points[j].x = this.x + Math.cos(e * j + isvirus) * m;
				points[j].y = this.y + Math.sin(e * j + isvirus) * m
			}
		},
		updatePos: function() {
			if (0 == this.id) return 1;
			var a;
			a = (timestamp - this.updateTime) / 120;
			a = 0 > a ? 0 : 1 < a ? 1 : a;
			var b = 0 > a ? 0 : 1 < a ? 1 : a;
			this.getNameSize();
			if (this.destroyed && 1 <= b) {
				var c = Cells.indexOf(this);
				-1 != c && Cells.splice(c, 1)
			}
			this.x = a * (this.nx - this.ox) + this.ox;
			this.y = a * (this.ny - this.oy) + this.oy;
			this.size = b * (this.nSize - this.oSize) + this.oSize;
			return b;
		},
		shouldRender: function() {
			if (0 == this.id) {
				return true
			} else {
				return !(this.x + this.size + 40 < nodeX - canvasWidth / 2 / viewZoom || this.y + this.size + 40 < nodeY - canvasHeight / 2 / viewZoom || this.x - this.size - 40 > nodeX + canvasWidth / 2 / viewZoom || this.y - this.size - 40 > nodeY + canvasHeight / 2 / viewZoom);
			}
		},
		drawOneCell: function (ctx) {
			if (this.shouldRender()) {
				var b = (0 != this.id && !this.isVirus && !this.isAgitated && smoothRender > viewZoom);
				if (5 > this.getNumPoints()) b = true;
				if (this.wasSimpleDrawing && !b)
					for (var c = 0; c < this.points.length; c++) this.points[c].size = this.size;
				this.wasSimpleDrawing = b;
				ctx.save();
				this.drawTime = timestamp;
				c = this.updatePos();
				this.destroyed && (ctx.globalAlpha *= 1 - c);
				ctx.lineWidth = 10;
				ctx.lineCap = "round";
				ctx.lineJoin = this.isVirus ? "miter" : "round";
				if (showColor) {
					ctx.fillStyle = "#FFFFFF";
					ctx.strokeStyle = "#AAAAAA";
				} else {
					ctx.fillStyle = this.color;
					ctx.strokeStyle = this.color;
				}
				if (b) {
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
				} else {
					this.movePoints();
					ctx.beginPath();
					var d = this.getNumPoints();
					ctx.moveTo(this.points[0].x, this.points[0].y);
					for (c = 1; c <= d; ++c) {
						var e = c % d;
						ctx.lineTo(this.points[e].x, this.points[e].y)
					}
				}
				ctx.closePath();

				var skinName = this.name.toLowerCase().split('|')[0];
				var skinurl = '';

				if (this.skin) {
					var fir = this.skin.charAt(0);

					if (fir === '%') {
						skinurl = SKIN_URL + this.skin.substring(1).split('|')[0] + '.png';
					} else if (fir === ':') {
						skinurl = this.skin.substring(1).split('|')[0];
					}
				}

				if (!this.isAgitated && showSkin && skinurl !== '' && skinurl !== './skins/.png') {
					if (!skins.hasOwnProperty(skinName)) {
						skins[skinName] = new Image;
						skins[skinName].src = skinurl;
					}

					if (0 !== skins[skinName].width && skins[skinName].complete) {
						c = skins[skinName];
					} else {
						c = null;
					}
				} else {
					c = null;
				}

				c = (e = c) ? true : false;
				b || ctx.stroke();
				ctx.fill();
				if (e) {
					ctx.save();
					ctx.clip();
					ctx.drawImage(e, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
					ctx.restore();
				}
				if ((showColor || 15 < this.size) && !b) {
					ctx.strokeStyle = '#000000';
					ctx.globalAlpha *= .1;
					ctx.stroke();
				}
				ctx.globalAlpha = 1;

				c = -1 != playerCells.indexOf(this);
				var ncache;
				//draw name
				if (0 != this.id) {
					var b = ~~this.y;
					if ((showName || c) && this.name && this.nameCache) {
						ncache = this.nameCache;
						ncache.setValue(this.name);
						ncache.setSize(this.getNameSize());
						var ratio = Math.ceil(10 * viewZoom) / 10;
						ncache.setScale(ratio);
						var rnchache = ncache.render(),
							m = ~~(rnchache.width / ratio),
							h = ~~(rnchache.height / ratio);
						ctx.drawImage(rnchache, ~~this.x - ~~(m / 2), b - ~~(h / 2), m, h);
						b += rnchache.height / 2 / ratio + 4
					}

					//draw mass
					if (showMass && (c || 0 == playerCells.length && (!this.isVirus || this.isAgitated) && 20 < this.size)) {
						if (null == this.sizeCache) {
							this.sizeCache = new UText(this.getNameSize() / 2, "#FFFFFF", true, "#000000")
						}
						c = this.sizeCache;
						c.setSize(this.getNameSize() / 2);
						c.setValue(~~(this.size * this.size / 100));
						ratio = Math.ceil(10 * viewZoom) / 10;
						c.setScale(ratio);
						e = c.render();
						m = ~~(e.width / ratio);
						h = ~~(e.height / ratio);
						ctx.drawImage(e, ~~this.x - ~~(m / 2), b - ~~(h / 2), m, h);
					}
				}
				ctx.restore()
			}
		}
	};

	UText.prototype = {
		_value: "",
		_color: "#000000",
		_stroke: false,
		_strokeColor: "#000000",
		_size: 16,
		_canvas: null,
		_ctx: null,
		_dirty: false,
		_scale: 1,
		setSize: function (a) {
			if (this._size != a) {
				this._size = a;
				this._dirty = true;
			}
		},
		setScale: function (a) {
			if (this._scale != a) {
				this._scale = a;
				this._dirty = true;
			}
		},
		setStrokeColor: function (a) {
			if (this._strokeColor != a) {
				this._strokeColor = a;
				this._dirty = true;
			}
		},
		setValue: function (a) {
			if (a != this._value) {
				this._value = a;
				this._dirty = true;
			}
		},
		render: function() {
			if (null == this._canvas) {
				this._canvas = document.createElement("canvas");
				this._ctx = this._canvas.getContext("2d");
			}
			if (this._dirty) {
				this._dirty = false;
				var canvas = this._canvas,
					ctx = this._ctx,
					value = this._value,
					scale = this._scale,
					fontsize = this._size,
					font = fontsize + 'px Ubuntu';
				ctx.font = font;
				var h = ~~(.2 * fontsize), wd = fontsize * 0.1;
				var h2 = h * 0.5;
				canvas.width = ctx.measureText(value).width * scale + 3;
				canvas.height = (fontsize + h) * scale;
				ctx.font = font;
				ctx.globalAlpha = 1;
				ctx.lineWidth = wd;
				ctx.strokeStyle = this._strokeColor;
				ctx.fillStyle = this._color;
				ctx.scale(scale, scale);
				this._stroke && ctx.strokeText(value, 0, fontsize - h2);
				ctx.fillText(value, 0, fontsize - h2)
			}
			return this._canvas
		},
		getWidth: function() {
			return (ctx.measureText(this._value).width + 6);
		}
	};

	Date.now || (Date.now = function() {
		return (new Date).getTime()
	});

	var Quad = {
		init: function (args) {
			function Node(x, y, w, h, depth) {
				this.x = x;
				this.y = y;
				this.w = w;
				this.h = h;
				this.depth = depth;
				this.items = [];
				this.nodes = []
			}

			var c = args.maxChildren || 2,
				d = args.maxDepth || 4;
			Node.prototype = {
				x: 0,
				y: 0,
				w: 0,
				h: 0,
				depth: 0,
				items: null,
				nodes: null,
				exists: function (selector) {
					for (var i = 0; i < this.items.length; ++i) {
						var item = this.items[i];
						if (item.x >= selector.x && item.y >= selector.y && item.x < selector.x + selector.w && item.y < selector.y + selector.h) return true
					}
					if (0 != this.nodes.length) {
						var self = this;
						return this.findOverlappingNodes(selector, function (dir) {
							return self.nodes[dir].exists(selector)
						})
					}
					return false;
				},
				retrieve: function (item, callback) {
					for (var i = 0; i < this.items.length; ++i) callback(this.items[i]);
					if (0 != this.nodes.length) {
						var self = this;
						this.findOverlappingNodes(item, function (dir) {
							self.nodes[dir].retrieve(item, callback)
						})
					}
				},
				insert: function (a) {
					if (0 != this.nodes.length) {
						this.nodes[this.findInsertNode(a)].insert(a);
					} else {
						if (this.items.length >= c && this.depth < d) {
							this.devide();
							this.nodes[this.findInsertNode(a)].insert(a);
						} else {
							this.items.push(a);
						}
					}
				},
				findInsertNode: function (a) {
					return a.x < this.x + this.w / 2 ? a.y < this.y + this.h / 2 ? 0 : 2 : a.y < this.y + this.h / 2 ? 1 : 3
				},
				findOverlappingNodes: function (a, b) {
					return a.x < this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(0) || a.y >= this.y + this.h / 2 && b(2)) || a.x >= this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(1) || a.y >= this.y + this.h / 2 && b(3)) ? true : false
				},
				devide: function() {
					var a = this.depth + 1,
						c = this.w / 2,
						d = this.h / 2;
					this.nodes.push(new Node(this.x, this.y, c, d, a));
					this.nodes.push(new Node(this.x + c, this.y, c, d, a));
					this.nodes.push(new Node(this.x, this.y + d, c, d, a));
					this.nodes.push(new Node(this.x + c, this.y + d, c, d, a));
					a = this.items;
					this.items = [];
					for (c = 0; c < a.length; c++) this.insert(a[c])
				},
				clear: function() {
					for (var a = 0; a < this.nodes.length; a++) this.nodes[a].clear();
					this.items.length = 0;
					this.nodes.length = 0
				}
			};
			var internalSelector = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			};
			return {
				root: new Node(args.minX, args.minY, args.maxX - args.minX, args.maxY - args.minY, 0),
				insert: function (a) {
					this.root.insert(a)
				},
				retrieve: function (a, b) {
					this.root.retrieve(a, b)
				},
				retrieve2: function (a, b, c, d, callback) {
					internalSelector.x = a;
					internalSelector.y = b;
					internalSelector.w = c;
					internalSelector.h = d;
					this.root.retrieve(internalSelector, callback)
				},
				exists: function (a) {
					return this.root.exists(a)
				},
				clear: function() {
					this.root.clear()
				}
			}
		}
	};

	wHandle.onload = gameLoop;

	function drawMinimap() {
		if (!showMinimap) return;

		var minimapSize = Math.min(200, canvasWidth * 0.2);
		var minimapPadding = 10;
		var minimapX = canvasWidth - minimapSize - minimapPadding;
		var minimapY = canvasHeight - minimapSize - minimapPadding;

		ctx.save();

		ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
		ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

		ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
		ctx.lineWidth = 2;
		ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

		var mapSizeX = rightPos - leftPos;
		var mapSizeY = bottomPos - topPos;
		var miniScale = minimapSize / Math.max(mapSizeX, mapSizeY);

		ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.font = "bold 14px Arial";
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		var sectorWidth = minimapSize / 5;
		var sectorHeight = minimapSize / 5;

		var currentSectorX = Math.floor((nodeX - leftPos) / (mapSizeX / 5));
		var currentSectorY = Math.floor((nodeY - topPos) / (mapSizeY / 5));
		var currentSectorLetter = String.fromCharCode(65 + currentSectorX);
		var currentSectorNumber = currentSectorY + 1;

		for (var i = 0; i <= 5; i++) {
			var x = minimapX + (i * sectorWidth);
			ctx.beginPath();
			ctx.moveTo(x, minimapY);
			ctx.lineTo(x, minimapY + minimapSize);
			ctx.stroke();

			var y = minimapY + (i * sectorHeight);
			ctx.beginPath();
			ctx.moveTo(minimapX, y);
			ctx.lineTo(minimapX + minimapSize, y);
			ctx.stroke();
		}

		for (var row = 0; row < 5; row++) {
			for (var col = 0; col < 5; col++) {
				var sectorLetter = String.fromCharCode(65 + col);
				var sectorNumber = row + 1;
				var centerX = minimapX + (col * sectorWidth) + sectorWidth/2;
				var centerY = minimapY + (row * sectorHeight) + sectorHeight/2;
				ctx.fillText(sectorLetter + sectorNumber, centerX, centerY);
			}
		}

		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";

		var sectorX = minimapX + (currentSectorX * sectorWidth);
		var sectorY = minimapY + (currentSectorY * sectorHeight);
		ctx.fillStyle = "rgba(255, 255, 102, 0.2)"; // Semi-transparent yellow color
		ctx.fillRect(sectorX, sectorY, sectorWidth, sectorHeight);

		ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
		ctx.lineWidth = 1;
		var gridSize = mapSizeX / 5; // Make grid size match sector size

		var startX = Math.floor(leftPos / gridSize) * gridSize;
		var startY = Math.floor(topPos / gridSize) * gridSize;

		for (var x = startX; x <= rightPos; x += gridSize) {
			var miniX = minimapX + (x - leftPos) * miniScale;
			if (miniX >= minimapX && miniX <= minimapX + minimapSize) {
				ctx.beginPath();
				ctx.moveTo(miniX, minimapY);
				ctx.lineTo(miniX, minimapY + minimapSize);
				ctx.stroke();
			}
		}

		for (var y = startY; y <= bottomPos; y += gridSize) {
			var miniY = minimapY + (y - topPos) * miniScale;
			if (miniY >= minimapY && miniY <= minimapY + minimapSize) {
				ctx.beginPath();
				ctx.moveTo(minimapX, miniY);
				ctx.lineTo(minimapX + minimapSize, miniY);
				ctx.stroke();
			}
		}

		ctx.fillStyle = "#FFFFFF";
		for (var i = 0; i < playerCells.length; i++) {
			var cell = playerCells[i];
			var miniX = minimapX + (cell.x - leftPos) * miniScale;
			var miniY = minimapY + (cell.y - topPos) * miniScale;
			var miniSize = Math.max(2, cell.size * miniScale);
			ctx.beginPath();
			ctx.arc(miniX, miniY, miniSize, 0, 2 * Math.PI);
			ctx.fill();
		}

		ctx.fillStyle = "#FF0000";
		for (var i = 0; i < nodelist.length; i++) {
			var cell = nodelist[i];
			if (cell.isVirus || cell.size < 50 || playerCells.indexOf(cell) !== -1) continue;
			var miniX = minimapX + (cell.x - leftPos) * miniScale;
			var miniY = minimapY + (cell.y - topPos) * miniScale;
			var miniSize = Math.max(2, cell.size * miniScale);
			ctx.beginPath();
			ctx.arc(miniX, miniY, miniSize, 0, 2 * Math.PI);
			ctx.fill();
		}

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1;
		var viewX = minimapX + (nodeX - leftPos) * miniScale;
		var viewY = minimapY + (nodeY - topPos) * miniScale;
		var viewW = (canvasWidth / viewZoom) * miniScale;
		var viewH = (canvasHeight / viewZoom) * miniScale;
		ctx.strokeRect(viewX - viewW/2, viewY - viewH/2, viewW, viewH);

		ctx.font = "bold 14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var coordText = "X: " + ~~nodeX + ", Y: " + ~~nodeY + " [" + currentSectorLetter + currentSectorNumber + "]";

		var textWidth = ctx.measureText(coordText).width;
		var padding = 5;
		var textHeight = 18;
		var textY = minimapY - 15;

		ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
		ctx.fillRect(
			minimapX + minimapSize/2 - textWidth/2 - padding,
			textY - textHeight/2 - padding,
			textWidth + padding * 2,
			textHeight + padding * 2
		);

		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(coordText, minimapX + minimapSize/2, textY);

		ctx.restore();
	}
})(window, window.jQuery);