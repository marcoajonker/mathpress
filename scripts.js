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

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
/*
var KEY_SHIFT = 16;
var opposites = {};
opposites[KEY_LEFT] = KEY_RIGHT;
opposites[KEY_UP] = KEY_DOWN;
opposites[KEY_RIGHT] = KEY_LEFT;
opposites[KEY_DOWN] = KEY_UP;
*/
var NAMESPACE = 'mathpress';

$(function() {
    var viewport = $('#viewport');
    var space = { '-1': { '-1': true, 0: true, 1: true },
                  0:    { '-1': true, 0: true, 1: true },
                  1:    { '-1': true, 0: true, 1: true } };
    var position = { y: 0, x: 0 };

    function draw_space() {
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var real_y = y + position.y - 2;
                var real_x = x + position.x - 2;
                $('#cell_' + y + '_' + x).toggleClass('wall', !space[real_y] || !space[real_y][real_x]);
            }
        }
    }

    $('#cell_2_2').addClass('me');
    draw_space();
    $(document).on('keydown', function(e) {
        var destination = { y: position.y, x: position.x };
        switch (e.which) {
            case KEY_LEFT:
                destination.x--;
                break;
            case KEY_UP:
                destination.y--;
                break;
            case KEY_RIGHT:
                destination.x++;
                break;
            case KEY_DOWN:
                destination.y++;
                break;
            default:
                return;
        }
        if (!space[destination.y] || !space[destination.y][destination.x]) {
            return;
        }
        position.y = destination.y;
        position.x = destination.x;
        draw_space();
    });

    /*
    var number = 1;
    var reverse = false;
    var operations = {};
    operations[KEY_LEFT]  = new Subtract(4);
    operations[KEY_UP]    = new Add(1);
    operations[KEY_RIGHT] = new Add(2);
    operations[KEY_DOWN]  = new Subtract(3);

    function refresh_display() {
        $('#me').text(number);
        $('#left').text(reverse ? operations[opposites[KEY_LEFT]].reverse() : operations[KEY_LEFT]);
        $('#up').text(reverse ? operations[opposites[KEY_UP]].reverse() : operations[KEY_UP]);
        $('#right').text(reverse ? operations[opposites[KEY_RIGHT]].reverse() : operations[KEY_RIGHT]);
        $('#down').text(reverse ? operations[opposites[KEY_DOWN]].reverse() : operations[KEY_DOWN]);
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
        number = reverse ? operations[opposites[e.which]].reverse().act(number) : operations[e.which].act(number);
        refresh_display();
    });
    $(document).on('keyup', function(e) {
        if (e.which === 16) {
            reverse = false;
            refresh_display();
            return;
        }
    });
    */
});
