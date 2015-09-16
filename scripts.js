var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;

var cell_types = {};

$(function() {
    var current = { area: $(), cell: $() };
    var areas = {};

    cell_types.load = function(cell, level) {
        cell.on('enter', function() {
            load_area(cell.data('value'));
        });
    };

    load_area('stage-selector');

    $(window).on('resize', function() {
        if (!current.area.length || !current.cell.length) {
            return;
        }
        var position = current.cell.position();
        current.area.css('transform', 'translate3d(' + ($(window).width() / 2 - 25 - position.left) + 'px, ' +
                                                       ($(window).height() / 2 - 25 - position.top) + 'px, 0)');
    });

    $(document).on('keydown', function(e) {
        if (!current.area.length || !current.cell.length) {
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
        current.cell.trigger('enter');
        $(window).resize();
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
            level.find('[data-type]').each(function() {
                var $this = $(this);
                cell_types[$this.data('type')]($this, level);
            });
            on_load(areas[area_name]);
        });
        function on_load(element) {
            current.area = element;
            current.area.appendTo('body');
            last_area.detach();
            current.cell = current.area.find(start_id || '#start');
            current.cell.trigger('enter');
            $(window).resize();
        }
    }
});
