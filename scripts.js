var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

function Add(x) {
    this.act = function(n) {
        return n + x;
    };
    this.toString = function() {
        return '+' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Subtract(x));
    };
}

function Subtract(x) {
    this.act = function(n) {
        return n - x;
    };
    this.toString = function() {
        return '-' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Add(x));
    };
}

$(function() {
    var number = 1;
    var operations = {};
    operations[KEY_LEFT]  = new Subtract(4);
    operations[KEY_UP]    = new Add(1);
    operations[KEY_RIGHT] = new Add(2);
    operations[KEY_DOWN]  = new Subtract(3);

    function refresh_display() {
        $('#me').text(number);
        $('#left').text(operations[KEY_LEFT]);
        $('#up').text(operations[KEY_UP]);
        $('#right').text(operations[KEY_RIGHT]);
        $('#down').text(operations[KEY_DOWN]);
    }

    refresh_display();
    $(document).on('keydown', function(e) {
        if (!operations[e.which]) {
            return;
        }
        number = operations[e.which].act(number);
        refresh_display();
    });
});
