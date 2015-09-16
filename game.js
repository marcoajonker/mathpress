var room_PADDING = 50;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_NAMES = { 37: 'left', 39: 'right', 38: 'up', 40: 'down' };

$.fn.extend({
    triggerAnimationClass: function(className, callback) {
        return this
            .addClass(className)
            .on('animationend', function animationend(e) {
                if (e.originalEvent.animationName !== className + '-animation') {
                    return;
                }
                $(this)
                    .off('animationend', animationend)
                    .removeClass(className);
                (callback || $.noop)();
            });
    }
});

$(function() {
    var current = { room: $(), tile: $() };
    var rooms = {};

    var tile_types = {
        add: function(tile, level) {
            tile.on('enter-tile', function() {
                tile.data('to').forEach(function(id) {
                    var value_tile = level.find('#' + id);
                    value_tile.trigger('set-value', [value_tile.data('value') + tile.data('value')]);
                });
            });
            tile.text('+' + (tile.data('value')));
        },
        equal: function(tile, level) {
            var key = level.find('#' + tile.data('key'));
            tile
                .toggleClass('nothing', key.data('value') !== tile.data('value'))
                .text(tile.data('value'));
            key.on('set-value', function(e, value) {
                tile.toggleClass('nothing', value !== tile.data('value'))
            });
        },
        load: function(tile, level) {
            tile.on('enter-tile', function() {
                load_room(tile.data('room'), tile.data('start'));
            });
        },
        subtract: function(tile, level) {
            tile.on('enter-tile', function() {
                tile.data('to').forEach(function(id) {
                    var value_tile = level.find('#' + id);
                    value_tile.trigger('set-value', [value_tile.data('value') - tile.data('value')]);
                });
            });
            tile.text('-' + (tile.data('value')));
        },
        variable: function(tile, level) {
            tile.on('set-value', function(e, value) {
                tile.text(tile.data().value = value);
            });
            tile.trigger('set-value', [tile.data('value') || 0]);
            level.on('enter-room', function() {
                tile.trigger('set-value', [Number(tile.attr('data-value')) || 0]);
            });
        }
    };

    $('body').on('enter-tile', '.tile', function() {
        $(this).addClass('occupied');
    });
    $('body').on('leave-tile', '.tile', function() {
        $(this).removeClass('occupied');
    });

    var block = block || $('<div class="block"><div class="block-inner"><div class="front"></div><div class="back"></div><div class="top"></div><div class="bottom"></div><div class="left"></div><div class="right"></div></div></div>');
    load_room('stage-selector');

    var window_width  = $(window).width();
    var window_height = $(window).height();
    $(window).on('resize', function() {
        window_width  = $(window).width();
        window_height = $(window).height();
        if (!current.room.length || !current.tile.length) {
            return;
        }
        position_room(current.room, current.tile);
    });

    $(document).on('keydown', function keycontrols(e) {
        var next_tile;
        switch (e.which) {
            case KEY_LEFT:
                next_tile = current.tile.prev('.tile');
                break;
            case KEY_RIGHT:
                next_tile = current.tile.next('.tile');
                break;
            case KEY_UP:
            case KEY_DOWN:
                next_tile = $(current.tile.data(KEY_NAMES[e.which]));
                break;
            default:
                return;
        }
        if (!next_tile.length || next_tile.hasClass('nothing')) {
            return;
        }
        current.tile.trigger('leave-tile');
        current.tile = next_tile.trigger('enter-tile');
        position_room(current.room, current.tile);
        $(document).off('keydown', keycontrols);
        block.triggerAnimationClass('roll-' + KEY_NAMES[e.which], function() {
            current.tile.append(block);
            $(document).on('keydown', keycontrols);
        });
    });

    function load_room(room_name, start_id) {
        var last_room = current.room;
        current = { room: $(), tile: $() };
        if (rooms[room_name]) {
            return on_load(rooms[room_name]);
        }
        rooms[room_name] = $('<div class="room"></div>').load('/rooms/' + room_name + '.html', function(contents, status) {
            if (status !== 'success' && status !== 'notmodified') {
                console.error('error', status);
                return;
            }
            var level = rooms[room_name].find('.level');
            var grid = level.find('.row').get().map(function(row) {
                return $(row).find('.tile,.nothing').get();
            });
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {
                    var $this = $(grid[y][x]);
                    if (y > 0 && !$(grid[y - 1][x]).hasClass('nothing')) {
                        $this.data('up', grid[y - 1][x]);
                    }
                    if (y < grid.length - 1 && !$(grid[y + 1][x]).hasClass('nothing')) {
                        $this.data('down', grid[y + 1][x]);
                    }
                }
            }
            Object.keys(tile_types).forEach(function(type) {
                level.find('.' + type).each(function() {
                    var $this = $(this);
                    tile_types[type]($this, level);
                });
            });
            on_load(rooms[room_name]);
        });
        function on_load(element) {
            last_room.triggerAnimationClass('leave', function() {
                last_room
                    .trigger('leave-room')
                    .removeClass('current-room')
                    .detach();
            });
            var start = element.find(start_id ? '#' + start_id : '#start');
            current = { room: element, tile: start };
            current.room.appendTo('body');
            current.room.find('.level').trigger('enter-room');
            current.tile.trigger('enter-tile');
            position_room(current.room, current.tile);
            current.room.triggerAnimationClass(last_room.length ? 'enter' : 'enter-long', function() {
                current.room.addClass('current-room');
                current.tile.append(block);
            });
        }
    }

    function position_room(room, tile) {
        var position;
        var room_width  = room.width();
        var room_height = room.height();
        if (room_width + 2 * room_PADDING > window_width || room_height + 2 * room_PADDING > window_height) {
            position = tile.position();
        }
        room.css('transform', 'translate3d(' + (room_width  + 2 * room_PADDING <= window_width  ? (window_width  - room_width)  / 2 : Math.min(room_PADDING, Math.max(window_width  - room_width  - room_PADDING, window_width  / 2 - position.left))) + 'px, ' +
                                               (room_height + 2 * room_PADDING <= window_height ? (window_height - room_height) / 2 : Math.min(room_PADDING, Math.max(window_height - room_height - room_PADDING, window_height / 2 - position.top))) + 'px, 0)');
    }
});
