var fs = require('fs');
$(function() {

  var repositoryLocation = './repository/';
  var packageInfoFileName = 'package-info.txt';


  $(document.body).on('modeller.entry.open', function(event, data) {
    var details = data.details;
    var panel = $('#entry-panel');
    panel.find('.panel-heading').html('<i class="' + details.icon + '"></i> ' + details.name);
    panel.find('.panel-footer').html('<small class="text-muted">' + details.real_path + '</small>');

    var content = '';
    if (!details.directory) {
      var fileData = fs.readFileSync(details.real_path);
      var split = String(fileData).split('\n');
      content = split.slice(1).join('<br />');
    }
    else {
      if (fs.existsSync(details.real_path + '/' + packageInfoFileName)) {
        var fileData = fs.readFileSync(details.real_path + '/' + packageInfoFileName);
        var split = String(fileData).split('\n');
        content = split.slice(1).join('<br />');

      }
      else {
        content = 'A package ' + details.name;
      }
    }

    var withEditor = $('<div class="container-fluid" contenteditable="true"></div>').html(content);

    panel.find('.panel-body').html(withEditor);
    var editor = CKEDITOR.inline(panel.find('[contenteditable=true]').get(0));
    editor.on('change', function(evt) {
      $(document.body).trigger('modeller.entry.save', {details: details, content: evt.editor.getData()});
    });

  });

  $(document.body).on('modeller.entry.save', function(event, data) {
    var details = data.details;
    var content = data.content;
    if (!details.directory) {
      fs.writeFileSync(details.real_path, '[' + details.type + '] ' + details.name + '\n' + content);
    }
    else {
      fs.writeFileSync(details.real_path + '/' + packageInfoFileName, '[' + details.type + '] ' + details.name + '\n' + content);

    }
  });


  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
    $(this).toggleClass('opened');
  });


  function getEntryDetails(path) {
    var fullPath = repositoryLocation + path;
    var stat = fs.lstatSync(fullPath);
    var icon = 'fa fa-folder';
    var name = path.substring(path.lastIndexOf('/') + 1);
    var type = 'package';

    if (stat.isFile()) {
      type = 'file';
      icon = 'fa fa-file-o';
      var data = fs.readFileSync(fullPath);
      var firstLine = String(data).split('\n', 1)[0];
      var regExp = /\[(\w+)]\s*(.+)\s*/;
      if (regExp.test(firstLine)) {
        var matches = regExp.exec(firstLine);
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
          default :
        }

      }
    }
    else {
      if (fs.existsSync(fullPath + '/' + packageInfoFileName)) {
        var data = fs.readFileSync(fullPath+ '/' + packageInfoFileName);
        var firstLine = String(data).split('\n', 1)[0];
        var regExp = /\[(\w+)]\s*(.+)\s*/;
        if (regExp.test(firstLine)) {
          var matches = regExp.exec(firstLine);
          type = matches[1];
          name = matches[2];
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
                                data: function(node, callback) {
                                  var path = node.id === '#' ? '' : node.id;
                                  var files = [];
                                  $.each(fs.readdirSync(repositoryLocation + path), function(index, file) {
                                    if (file != packageInfoFileName) {
                                      var details = getEntryDetails(path + '/' + file);
                                      files.push({
                                                   id: details.path,
                                                   text: details.name,
                                                   icon: details.icon,
                                                   children: details.directory,
                                                   details: details
                                                 });
                                    }
                                  });
                                  callback(files);
                                }
                              }
                            })
    .on('changed.jstree', function(e, data) {
          if (data && data.node) {
            $(document.body).trigger('modeller.entry.open', {details: data.node.original.details});
          }

        }).on('open_node.jstree close_node.jstree', function(e, data) {
                if (data && data.node) {
                  var details = data.node.original.details;
                  if (details.directory) {
                    var icon = data.node.state.opened ? 'fa fa-folder-open' : 'fa fa-folder';
                    data.instance.set_icon(data.node, icon);
                  }
                }
              });


});