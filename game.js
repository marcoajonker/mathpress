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
    var current = { area: $(), cell: $() };
    var areas = {};

    var cell_types = {
        add: function(cell, level) {
            cell.on('enter', function() {
                cell.data('to').forEach(function(id) {
                    var value_cell = level.find('#' + id);
                    value_cell.trigger('set-value', [value_cell.data('value') + cell.data('value')]);
                });
            });
            cell.text('+' + (cell.data('value')));
        },
        equal: function(cell, level) {
            console.log(JSON.stringify(cell.data('key')));
            var key = level.find('#' + cell.data('key'));
            cell
                .toggleClass('nothing', key.data('value') !== cell.data('value'))
                .text(cell.data('value'));
            key.on('set-value', function(e, value) {
                cell.toggleClass('nothing', value !== cell.data('value'))
            });
        },
        load: function(cell, level) {
            cell.on('enter', function() {
                load_area(cell.data('area'), cell.data('start'));
            });
        },
        subtract: function(cell, level) {
            cell.on('enter', function() {
                cell.data('to').forEach(function(id) {
                    var value_cell = level.find('#' + id);
                    value_cell.trigger('set-value', [value_cell.data('value') - cell.data('value')]);
                });
            });
            cell.text('-' + (cell.data('value')));
        },
        variable: function(cell, level) {
            cell.on('set-value', function(e, value) {
                cell.text(cell.data().value = value);
            });
            cell.trigger('set-value', [cell.data('value') || 0]);
        }
    };

    var block = $('#block');
    load_area('stage-selector');

    $(window).on('resize', function() {
        if (!current.area.length || !current.cell.length) {
            return;
        }
        position_area(current.area, current.cell);
    });

    $(document).on('keydown', function keycontrols(e) {
        var next_cell;
        switch (e.which) {
            case KEY_LEFT:
                next_cell = current.cell.prev('.cell');
                break;
            case KEY_RIGHT:
                next_cell = current.cell.next('.cell');
                break;
            case KEY_UP:
            case KEY_DOWN:
                next_cell = $(current.cell.data(KEY_NAMES[e.which]));
                break;
            default:
                return;
        }
        if (!next_cell.length || next_cell.hasClass('nothing')) {
            return;
        }
        current.cell.trigger('leave');
        current.cell = next_cell;
        position_area(current.area, current.cell);
        $(document).off('keydown', keycontrols);
        block.triggerAnimationClass('roll-' + KEY_NAMES[e.which], function() {
            current.cell.trigger('enter');
            $(document).on('keydown', keycontrols);
        });
    });

    function load_area(area_name, start_id) {
        var last_area = current.area;
        current = { area: $(), cell: $() };
        if (areas[area_name]) {
            return on_load(areas[area_name]);
        }
        areas[area_name] = $('<div class="area"></div>').load('/areas/' + area_name + '.html', function(contents, status) {
            if (status !== 'success' && status !== 'notmodified') {
                console.error('error', status);
                return;
            }
            var level = areas[area_name].find('.level');
            var grid = level.find('.row').get().map(function(row) {
                return $(row).find('.cell,.nothing').get();
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
            Object.keys(cell_types).forEach(function(type) {
                level.find('.' + type).each(function() {
                    var $this = $(this);
                    cell_types[type]($this, level);
                });
            });
            on_load(areas[area_name]);
        });
        function on_load(element) {
            last_area.triggerAnimationClass('leave', function() {
                last_area
                    .removeClass('current-area')
                    .detach();
            });
            var start = element.find(start_id ? '#' + start_id : '#start').trigger('enter');
            position_area(element.appendTo('body'), start.trigger('enter'));
            element.triggerAnimationClass(last_area.length ? 'enter' : 'enter-long', function() {
                current = { area: element, cell: start };
                current.area.addClass('current-area');
            });
        }
    }

    function position_area(area, cell) {
        var position = cell.position();
        area.css('transform', 'translate3d(' + (($(window).width() - 120 + 2) / 2 - position.left) + 'px, ' +
                                               (($(window).height() - 120 + 2) / 2 - position.top) + 'px, 0)');
    }
});
