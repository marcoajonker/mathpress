var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;

$(function() {
    var current = { area: $(), cell: $() };
    var areas = {};
    load_area('stage-selector');

    $(window).on('resize', function() {
        var position = current.cell.position();
        current.area.css('transform', 'translate3d(' + ($(window).width() / 2 - position.left) + 'px, ' +
                                                       ($(window).height() / 2 - position.top) + 'px, 0)');
    });

    $(document).on('keydown', function(e) {
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
        current.cell = next_cell;
        $(window).resize();
    });

    function load_area(area_name) {
        if (areas[area_name]) {
            return on_load(areas[area_name]);
        }
        areas[area_name] = $('<div class="area"></div>').load('/areas/' + area_name + '.html', function(contents, status) {
            if (status !== 'success' && status !== 'notmodified') {
                console.error('error', status);
                return;
            }
            var grid = areas[area_name].find('.row').get().map(function(row) {
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
            on_load(areas[area_name]);
        });
        function on_load(element) {
            current.area = element;
            current.area.appendTo('body');
            current.cell = current.area.find('#start');
            current.cell.trigger('enter');
            $(window).resize();
        }
    }
});
