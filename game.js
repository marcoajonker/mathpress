var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_NAMES = { 37: 'left', 39: 'right', 38: 'up', 40: 'down' };

$.ajaxSetup ({ cache: false });

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
                .toggleClass('occupied', key.data('value') !== tile.data('value'))
                .text(tile.data('value'));
            key.on('set-value', function(e, value) {
                tile.toggleClass('occupied', value !== tile.data('value'))
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

    var block = block || $('<div class="block"><div class="block-inner"><div class="front"></div><div class="back"></div><div class="top"></div><div class="bottom"></div><div class="left"></div><div class="right"></div></div></div>');

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

    var counter = 0;
    function toggleControls(on) {
        counter += on ? -1 : 1;
        $(document)[counter > 0 ? 'off' : 'on']('keydown', keycontrols);
    }
    function keycontrols(e) {
        var next_tile;
        switch (e.which) {
            case KEY_SPACE:
                next_tile = current.tile;
                break;
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
        if (!next_tile.length || (e.which !== KEY_SPACE && next_tile.hasClass('occupied'))) {
            return;
        }
        current.tile
            .removeClass('occupied')
            .trigger('leave-tile');
        current.tile = next_tile.addClass('occupied');
        position_room(current.room, current.tile);
        toggleControls(false);
        block.triggerAnimationClass(e.which !== KEY_SPACE ? 'roll-' + KEY_NAMES[e.which] : 'jump', function() {
            var tile_offset = current.tile.offset()
            tile_offset.left += 5;
            tile_offset.top  += 5;
            block.offset(tile_offset); // FIXME
            current.tile.trigger('enter-tile');
            toggleControls(true);
        });
    }

    function load_room(room_name, start_id) {
        toggleControls(false);
        var last_room = current.room;
        var last_tile = current.tile;
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
            last_room
                .trigger('leave-room')
                .triggerAnimationClass('leave', function() {
                    last_room
                        .removeClass('current-room')
                        .detach();
                });
            last_tile
                .removeClass('occupied')
                .trigger('leave-tile');
            current = { room: element, tile: element.find(start_id ? '#' + start_id : '#start').addClass('occupied') };
            current.room.appendTo('body');
            position_room(current.room, current.tile);
            current.room.triggerAnimationClass(last_room.length ? 'enter' : 'enter-long', function() {
                current.room.find('.level').trigger('enter-room');
                current.room.addClass('current-room');
                current.room.append(block);
                block.offset(current.tile.offset());
                current.tile.trigger('enter-tile');
                toggleControls(true);
            });
        }
    }

    var tile_width, tile_height
    function position_room(room, tile) {
        var position;
        var room_width  = room.outerWidth(true);
        var room_height = room.outerHeight(true);
        if (room_width > window_width || room_height > window_height) {
            position = tile.position();
            tile_width  = tile_width  || tile.width();
            tile_height = tile_height || tile.height();
        }
        var x = room_width  <= window_width  ? (window_width  - room_width)  / 2 : Math.min(0, Math.max(window_width  - room_width,  (window_width) / 2  - tile_width + 2 - position.left));
        var y = room_height <= window_height ? (window_height - room_height) / 2 : Math.min(0, Math.max(window_height - room_height, (window_height) / 2 - tile_height + 2 - position.top));
        room.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');
    }

    load_room('start');
});
