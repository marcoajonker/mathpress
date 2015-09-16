var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;

var cell_types = {};

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
    $('html').on('animationend', '*', function(e) {
        $(this).trigger(e.originalEvent.animationName);
    });

    var block = $('#block');
    var current = { area: $(), cell: $() };
    var areas = {};

    cell_types.load = cell_types['load-hidden'] = function(cell, level) {
        cell.on('enter', function() {
            load_area(cell.data('area'), cell.data('start'));
        });
    };

    load_area('stage-selector');

    $(window).on('resize', function() {
        if (!current.area.length || !current.cell.length) {
            return;
        }
        var position = current.cell.position();
        current.area.css('transform', 'translate3d(' + (($(window).width() - 120 + 2) / 2 - position.left) + 'px, ' +
                                                       (($(window).height() - 120 + 2) / 2 - position.top) + 'px, 0)');
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
                next_cell = $(current.cell.data('up'));
                break;
            case KEY_DOWN:
                next_cell = $(current.cell.data('down'));
                break;
            default:
                return;
        }
        if (!next_cell.length) {
            return;
        }
        current.cell.trigger('leave');
        current.cell = next_cell;
        $(window).resize();
        var roll_class;
        switch (e.which) {
            case KEY_LEFT:
                roll_class = 'roll-left';
                break;
            case KEY_RIGHT:
                roll_class = 'roll-right';
                break;
            case KEY_UP:
                roll_class = 'roll-up';
                break;
            case KEY_DOWN:
                roll_class = 'roll-down';
                break;
        }
        $(document).off('keydown', keycontrols);
        block.triggerAnimationClass(roll_class, function() {
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
            current.area = element;
            current.area.appendTo('body');
            last_area
                .removeClass('current-area')
                .detach();
            current.cell = current.area.find(start_id ? '#' + start_id : '#start');
            current.cell.trigger('enter');
            $(window).resize();
            setTimeout(function() {
                current.area.addClass('current-area');
            });
        }
    }
});
