var fs = require('fs');


var repositoryLocation = './repository/';


$(function () {


    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
        $(this).toggleClass('opened');
    });


    function getFileItemDetails(path) {
        var fullPath = repositoryLocation + path;
        var stat = fs.lstatSync(fullPath);

        var icon = 'fa fa-folder';
        var name = path.substring(path.lastIndexOf('/') + 1);
        var type = 'folder';

        if (stat.isFile()) {
            type = 'file';
            icon = 'fa fa-file-o';
            var data = fs.readFileSync(fullPath);
            var firstLine = new String(data).split('\n', 1)[0];
            var regExp = /\[(\w+)]\s*(.+)\s*/;
            if (regExp.test(firstLine)) {
                matches = regExp.exec(firstLine);
                type = matches[1];
                name = matches[2];

                switch (type) {
                    case 'document':
                        icon = 'fa fa-file-text-o';
                        break;
                    case 'component':
                        icon = 'fa fa-folder-o';
                        break;

                    case 'requirement':
                        icon = 'fa fa-bolt';
                        break;

                    case 'diagram':
                        icon = 'fa fa-picture-o';
                        break;
                }

            }
        }

        return {
            name: name,
            path: path,
            real_path: fullPath,
            directory: stat.isDirectory(),
            icon: icon,
            type: type
        };
    }


    $('#sidebar-tree').jstree({
        core: {
            multiple: false,
            data: function (node, callback) {
                var path = node.id === '#' ? '' : node.id;
                var files = [];
                $.each(fs.readdirSync(repositoryLocation + path), function (index, file) {
                    var details = getFileItemDetails(path + '/' + file);
                    files.push({
                        id: details.path,
                        text: details.name,
                        icon: details.icon,
                        children: details.directory,
                        details: details
                    });
                });
                callback(files);
            }
        }
    })
        .on('changed.jstree', function (e, data) {
            if (data && data.node) {
                var details = data.node.original.details;
                var panel = $('#entry-panel');
                panel.find('.panel-heading').html('<i class="' + details.icon + '"></i> ' + details.name);
                panel.find('.panel-footer').html('<small class="text-muted">' + details.real_path + '</small>');

                if (!details.directory) {
                    var data = fs.readFileSync(details.real_path);
                    var split = new String(data).split('\n');
                    var content = split.slice(1).join('<br />');

                    panel.find('.panel-body').html(content);
                } else {
                    panel.find('.panel-body').html('Package details will be here');

                }
            }

        }).on('open_node.jstree close_node.jstree', function (e, data) {
            console.log(data);
            if (data && data.node) {
                var details = data.node.original.details;
                if (details.directory) {
                    var icon = data.node.state.opened ? 'fa fa-folder-open' : 'fa fa-folder';
                    data.instance.set_icon(data.node, icon);
                }
            }
        });


});