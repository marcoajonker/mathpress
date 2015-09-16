$(function() {
    var areas = {};
    function load_area(area_name, callback) {
        if (areas[area_name]) {
            return callback(null, areas[area_name]);
        }
        areas[area_name] = $('<div class="area"></div>').load('/areas/' + area_name + '.html', function(contents, status) {
            if (status !== 'success' && status !== 'notmodified') {
                return callback(status);
            }
            callback(null, areas[area_name]);
        });
    }

    var area = $();
    var cell = $();

    $(window).on('resize', function() {
        var position = cell.position();
        area.offset({ top:  ($(window).height() - cell.height()) / 2 - position.top,
                      left: ($(window).width()  - cell.width()) / 2 - position.left });
    });

    load_area('stage-selector', function(err, element) {
        if (err) {
            return;
        }
        area = element;
        element
            .css('visibility', 'hidden')
            .appendTo('body');
        cell = element.find('#start');
        $(window).resize();
        element.css('visibility', 'initial');
    });
});
