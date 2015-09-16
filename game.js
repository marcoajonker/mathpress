var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;

var cell_types = {};

$(function() {
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
        current.area.css('transform', 'translate3d(' + ($(window).width() / 2 - 75 / 2 - position.left) + 'px, ' +
                                                       ($(window).height() / 2 - 75 / 2 - position.top) + 'px, 0)');
    });

    block.on('animationend', function(e) {
        if (e.originalEvent.animationName.indexOf('spin-') !== 0) {
            return;
        }
        block
            .removeClass('roll-left')
            .removeClass('roll-right')
            .removeClass('roll-up')
            .removeClass('roll-down');
    });

    $(document).on('keydown', function(e) {
        if (!current.area.length || !current.cell.length || block.is('.roll-left,.roll-right,.roll-up,.roll-down')) {
            return;
        }
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
        switch (e.which) {
            case KEY_LEFT:
                block.addClass('roll-left');
                break;
            case KEY_RIGHT:
                block.addClass('roll-right');
                break;
            case KEY_UP:
                block.addClass('roll-up');
                break;
            case KEY_DOWN:
                block.addClass('roll-down');
                break;
        }
        current.cell.trigger('enter');
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
            last_area.detach();
            current.cell = current.area.find(start_id ? '#' + start_id : '#start');
            current.cell.trigger('enter');
            $(window).resize();
        }
    }
});
