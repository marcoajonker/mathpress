var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SHIFT = 16;

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
    var reverse = false;
    var operations = {};
    operations[KEY_LEFT]  = new Subtract(4);
    operations[KEY_UP]    = new Add(1);
    operations[KEY_RIGHT] = new Add(2);
    operations[KEY_DOWN]  = new Subtract(3);

    function refresh_display() {
        $('#me').text(number);
        $('#left').text(reverse ? operations[KEY_LEFT].reverse() : operations[KEY_LEFT]);
        $('#up').text(reverse ? operations[KEY_UP].reverse() : operations[KEY_UP]);
        $('#right').text(reverse ? operations[KEY_RIGHT].reverse() : operations[KEY_RIGHT]);
        $('#down').text(reverse ? operations[KEY_DOWN].reverse() : operations[KEY_DOWN]);
    }

    refresh_display();
    $(document).on('keydown', function(e) {
        if (e.which === 16) {
            reverse = true;
            refresh_display();
            return;
        }
        if (!operations[e.which]) {
            return;
        }
        number = reverse ? operations[e.which].reverse().act(number) : operations[e.which].act(number);
        refresh_display();
    });
    $(document).on('keyup', function(e) {
        if (e.which === 16) {
            reverse = false;
            refresh_display();
            return;
        }
    });
});
