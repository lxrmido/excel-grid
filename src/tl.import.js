/**
 * 导入表格
 */
$(document).ready(function(){
    Grid.Lang.extend({
        PREVIEW : '预览',
        IMPORT_EXCEL_FILE : '导入Excel文件',
        CHOOSE_SHEET : '从上方列表中选择要导入的表',
        IMPORT_TO_SELECTED : '导入到选中区域',
        IMPORT_AS_INSERT : '作为新行导入',
        IMPORT_FINISHED : '导入完毕',
        CHOOSE_FILE : '选择文件'
    });
    Grid.Plugins.enableImport = function(tab, obj){
        obj = obj || window;
        function onerror(message){
            Win.alert(message);
        }
        var model = (function(){
            var URL = obj.webkitURL || obj.mozURL || obj.URL;

            return {
                getEntries : function(file, onend){
                    zip.createReader(new zip.BlobReader(file), function(zipReader){
                        zipReader.getEntries(onend);
                    }, onerror);
                },
                getEntryFile : function(entry, creationMethod, onend, onprogress){
                    var writer, zipFileEntry;

                    function getData(){
                        entry.getData(writer, function(blob){
                            var blobURL = URL.createObjectURL(blob);
                            onend(blobURL);
                        }, onprogress);
                    }
                    writer = new zip.BlobWriter();
                    getData();
                }
            };
        })();
        function importPreview(data){
            var i, j;
            var $win = Win.win(Grid.Lang.PREVIEW, Win.scrW * 0.5, Win.scrH * 0.5 + 32);
            var $d = $('<div class="lxg-detail-area"></div>').css(
                {
                    width  : Win.scrW * 0.5,
                    height : Win.scrH * 0.5
                }
            );
            $win.append($d);
            var str = '<table class="lxg-slimtable">';
            for(i = 0; i < data.length; i ++){
                str += '<tr>';
                for(j = 0; j < data[i].length; j ++){
                    str += '<td>' + data[i][j] + '</td>';
                }
                str += '</tr>';
            }
            str += '</table>';
            $d.append(str);
            $win.append(
                $('<div class="line"></div>').append(
                    $('<div class="lxbutton right">' + Grid.Lang.IMPORT_AS_INSERT + '</div>').click(function(){
                        var from = tab.data.row.length + 1;
                        var n = data.length;
                        var i, j
                        tab.append_empty(n);
                        for(i = 0; i < n; i ++){
                            for(j = 0; j < data[i].length; j ++){
                                try{
                                    tab.set_val(from, j + 1, data[i][j]);
                                }catch(e){
                                    console.log([e.message, i, j, data[i][j]])
                                }
                            }
                            from ++;
                        }
                        tab.scroll_down(tab.scroll.v);
                        Win.alert(Grid.Lang.IMPORT_FINISHED);
                    }),
                    $('<div class="lxbutton right">' + Grid.Lang.IMPORT_TO_SELECTED + '</div>').click(function(){
                        var data_array = [], i, j;
                        for(i = 0; i < data.length; i ++){
                            for(j = 0; j < data[i].length; j ++){
                                data_array.push(data[i][j]);
                            }
                        }
                        tab.set_data(data_array, tab.selected);
                        Win.alert(Grid.Lang.IMPORT_FINISHED);
                    })
                )
            );
        }
        tab.importAction = function(){
            var $win = Win.win(Grid.Lang.IMPORT_EXCEL_FILE, 512, 468);
            var $lt = $('<div class="lx-list"></div>').css({
                width  : 502,
                height : 430
            });
            var id = tab.prefix + 'ip-';
            $win.append($lt);
            $win.append('<div class="line" id="'+id+'tips" style="position:relative"><div class="lxbutton right lxg-upload-button">'+Grid.Lang.CHOOSE_FILE+'</div><input class="lxg-upload-input" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" id="'+id+'fi"></div>');
            var fileInput = document.getElementById(id+'fi');
            fileInput.addEventListener('change', function(){
                fileInput.disabled = true;
                $(fileInput).hide();
                $('#' + id + 'tips').html('<div class="lxlabel">'+Grid.Lang.CHOOSE_SHEET+'</div>');
                model.getEntries(fileInput.files[0], function(entries){
                    var i = 0;
                    entries.forEach(function(entry){
                        if(entry.filename.indexOf('xl/worksheets/') == 0 && entry.filename.indexOf('xl/worksheets/_rel') < 0){
                            $lt.append(
                                $('<div class="lx-litem" id="'+id+'-li-'+i+'"><p>'+entry.filename.substr(14).substr(0, entry.filename.length-18)+'</p></div>').click(function(){
                                    var writer = new zip.BlobWriter();
                                    entry.getData(writer, function(blob){
                                        var reader = new FileReader();
                                        reader.onload = function(){
                                            var s1 = reader.result.split('<sheetData>');
                                            var s2 = s1[1].split('</sheetData>');
                                            var s3 = '<root>' + s2[0] + '</root>';
                                            var $t = $(s3);
                                            var row = [];
                                            $t.find('row').each(function(){
                                                var cols = [];
                                                $(this).find('v').each(function(){
                                                    cols[cols.length] = $(this).html();
                                                });
                                                row[row.length] = cols;
                                            });
                                            importPreview(row);
                                        }
                                        reader.readAsText(blob);
                                    }, onprogress);
                                })
                            );
                        }
                    });
                });
            }, false);
        }
        $(tab.toolbar).find('.lxg-tbmenu-item').each(function(){
            if($(this).html() == Grid.Lang.EXPORT){
                $(this).after(
                    $('<div class="lxg-tbmenu-item"></div>').click(function(){
                        tab.importAction();
                    }).append(Grid.Lang.IMPORT)
                );
            }
        })
    }
});
