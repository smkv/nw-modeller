var fs = require('fs');


$(function() {


  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
    $(this).toggleClass('opened');
  });




  $('#sidebar-tree').jstree({
                              core: {
                                data: function(node , callback){
                                  var path = node.id === '#' ? '.' : node.id;
                                  var files = [];
                                  $.each(fs.readdirSync(path), function(index, file) {
                                    var isADirectory = fs.statSync(path + '/' + file).isDirectory();
                                    files.push({
                                                 id: path + '/' + file,
                                                 text: file,
                                                 icon: isADirectory ? 'glyphicon glyphicon-folder-open' : 'glyphicon glyphicon-file',
                                                 children: isADirectory
                                               });
                                  });
                                  callback(files);
                                }
                              }
                            });


});