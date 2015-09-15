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

function Multiply(x) {
    this.act = function(n) {
        return n * x;
    };
    this.toString = function() {
        return '*' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Divide(x));
    };
}

function Divide(x) {
    this.act = function(n) {
        return n / x;
    };
    this.toString = function() {
        return '/' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Multiply(x));
    };
}

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SHIFT = 16;
var NAMESPACE = 'mathpress';

$(function() {
    var viewport = $('#viewport');
    var position = { y: 1, x: 1 };
    var space = {};
    for (var y = 0; y < 10; y++) {
        space[y] = {};
        for (var x = 0; x < 10; x++) {
            space[y][x] = true;
        }
    }

    var reversed = false;
    var number = 1;
    var operations = { left:  new Add(2),
                       up:    new Multiply(4),
                       right: new Add(1),
                       down:  new Multiply(2) };

    function draw_space() {
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var real_y = y + position.y - 2;
                var real_x = x + position.x - 2;
                $('#cell_' + y + '_' + x).toggleClass('wall', !space[real_y] || !space[real_y][real_x]);
            }
        }
    }
    function draw_operations() {
        $('#cell_2_1').text(reversed ? (operations.right ? operations.right.reverse() : '') : operations.left);
        $('#cell_1_2').text(reversed ? (operations.down  ? operations.down.reverse()  : '') : operations.up);
        $('#cell_2_3').text(reversed ? (operations.left  ? operations.left.reverse()  : '') : operations.right);
        $('#cell_3_2').text(reversed ? (operations.up    ? operations.up.reverse()    : '') : operations.down);
    }

    $('#cell_2_2')
        .addClass('me')
        .text(number);
    draw_space();
    $(document).on('keydown', function(e) {
        var destination = { y: position.y, x: position.x };
        var new_number;
        switch (e.which) {
            case KEY_LEFT:
                destination.x--;
                new_number = reversed ? operations.right.reverse().act(number) : operations.left.act(number);
                break;
            case KEY_UP:
                destination.y--;
                new_number = reversed ? operations.down.reverse().act(number) : operations.up.act(number);
                break;
            case KEY_RIGHT:
                destination.x++;
                new_number = reversed ? operations.left.reverse().act(number) : operations.right.act(number);
                break;
            case KEY_DOWN:
                destination.y++;
                new_number = reversed ? operations.up.reverse().act(number) : operations.down.act(number);
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
        number = new_number;
        $('#cell_2_2').text(number);
    });
    draw_operations();
    $(document).on('keydown keyup', function(e) {
        if (e.which !== KEY_SHIFT) {
            return;
        }
        reversed = e.type === 'keydown';
        draw_operations();
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
