/**
 * @module Display client side message
 * @author jacky-jiang
 * @since 2015.5.8
 */

function disEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function disSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;
	
	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		
		if (systemMessage) {
			$('#messages').append(disSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(disEscapedContentElement(message));
		$('#messages').scrollTop($('#message').prop('scrollHeight'));
	}
	
	$('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
	var chatApp = new Chat(socket);
	
	socket.on('nameResult', function(result) {
		var message;
		
		if (result.success) {
			message = 'You are now known as ' + result.name + '.';
		} else {
			message = result.message;
		}
		
		$('#messages').append(disSystemContentElement(message));
	});
	
	socket.on('joinResult', function(result) {
		$('#room').text('result.room');
		$('#messages').append(disSystemContentElement('Room changed.'));
	});
	
	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		
		$('#messages').append(newElement);
	});
	
	// display list of rooms available
	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		
		for (var room in rooms) {
			room = room.substring(1, room.length);
			if ( room != '') {
				$('#room-list').append(disEscapedContentElement(room));
			}
		}
		
		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);
	
	$('#send-message').focus();
	
	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});

