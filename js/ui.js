function UIChat(element) {
    this.element = element;
    this.name = this.element.getAttribute('data-name');
    this.recipient = this.element.getAttribute('data-recipient');
    this.title = element.querySelector('.chat_header');
    this.feed = element.querySelector('.chat_feed');
    this.input = element.querySelector('.chat_input');
    this.controller = new Unit(this.name);
    this.controller.registerReceiveCallback(this.receive.bind(this));

    this.title.innerHTML = this.name;
    this.bindEvents();
}

UIChat.prototype.bindEvents = function () {
    this.input.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) {
            this.send(this.input.value);
            this.input.value = '';
        }
    }.bind(this), false);
}

UIChat.prototype.print = function (owner, message, hash, callback) {
    var className = (this.name === owner)
        ? '__mine'
        : '__recipient';

    var hashCode = hash || '';
    var callback = callback || function () {};

    this.feed.insertAdjacentHTML('beforeend', '<div class="chat_feed-item ' + className + '" data-hash="' + hashCode + '"><div class="chat_feed-item_content">' + message + '</div></div>');
    callback();
}

UIChat.prototype.send = function (message) {
    var that = this;
    var sendMessage = {
        recipient: that.recipient,
        type: "message",
        content: message,
        timestamp: Date.now()
    };
    var hash = SHA256(sendMessage.content + sendMessage.timestamp);

    this.print(this.name, sendMessage.content, hash, function () {
        this.controller.sendOriginalMessage(sendMessage);
    }.bind(this));
}

UIChat.prototype.receive = function (type, message) {
    if (type === 'received') {
        this.print(this.recipient, message, null);
        console.log(this);
    } else if (type === 'delivered') {
        var messageElement = this.element.querySelector('[data-hash="' + message + '"]');
        messageElement && messageElement.classList.add('__delivered');
    }
}

Array.prototype.forEach.call(document.querySelectorAll('.chat'), function (element) {
    var instance = new UIChat(element);
});