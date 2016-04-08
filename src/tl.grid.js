/**
 * 表格控件
 * lx.grid
 * 兼容：
 *     Chrome  13+
 *     Firefox 4+
 *     IE      10+
 * lxrmido@lxrmido.com
 *
 * 修改日志：
 *     2013-10-25 添加工具栏编辑框
 *     2013-10-26 修复工具栏编辑框在列选择模式下不自动更改的BUG
 *                添加右上角查找
 *     2013-10-28 修正鼠标拖放超出边界的响应
 *                修正取消焦点后ctrl键的响应
 *                修正编辑状态下键盘事件的响应
 *     2013-11-01 增加行详细编辑
 *                增加钩子机制
 *                -- 索引：hook_map
 *     2013-11-05 修复因添加钩子而出现的空对象BUG
 *     2013-11-08 将刷新前的行删除操作逻辑改为先清空再重新添加遮罩等元素以提升效率
 *                将刷新的方式从逐个DOM操作改为先批量文本操作再建立节点以提升效率
 *     2013-11-09 将添加行的逻辑修改为先批量文本操作再建立节点以提升效率
 *     2013-11-11 修复双击空白地方的错误响应
 *     2013-11-14 增加刷新表格时的loading提示
 *                修正页面跳转的若干BUG
 *                修正垂直滚动条滚动到底部时实际页面还未到底部的异常
 *     2013-11-15 增加插件机制，为导入Excel文件(tl.import.js)的功能而准备
 *     2013-11-18 删除新增行时，同时删除append数组中的成员
 *                将循环中定义的计数变量提取到函数开头以避免歧义
 *     2013-12-10 对css参数的返回值要求从对象修改为字符串
 *     2013-12-18 修改select参数允许其为函数
 *                修改replace参数添加其函数的传入参数
 *     2013-12-23 添加priv_apd、priv_del、priv_mdf属性以控制修改禁止事项
 *     2013-12-25 右下角添加“全部”按钮
 *     2013-12-28 修正新增行的对象初始值赋值失败问题
 *     2014-01-06 修正replace参数调用的传参数量不正确问题
 *                修正priv_del
 *                过滤器增加“不等于”
 *     2014-01-14 修改“替换”及“导出”界面中元素查找方式为通过class查找
 *     2014-01-25 去除侵入式的代码
 *     2014-02-07 详细编辑界面，当select属性是function时的修改
 *     2014-02-08 当没有选中单元格时，点击“详细编辑”将自动建立新行进行编辑
 *                按下 ESC 后取消对单元格的选中 
 *     2014-02-12 当只选中一个单元格时，高亮单元格所在行
 *                左上角编辑框显示格式修改为“列名称:行主键值”
 */
(function($, window, grid_key, Win){

    function INT(n){return parseInt(n, 0); }
    function mkdiv(div_class, inner){return $('<div ' + (div_class ? ('class="' + div_class + '" ') : '') + '>' + (inner || '') + '</div>');}
    function crdiv(){return document.createElement('div');}
    function mkico(ico, tit, func){return $('<div class="lxg-tbctrl-iconbut lx-icon-' + ico + '" title="' + tit + '">').click(func);}
    function checkbox(id, checked){ return '<input' + (id ? ' id="' + id + '"' : '') + ' type="checkbox"' + (checked ? ' checked="checked"' : '') + '/>';}

    var Grid = window[grid_key] = {

        // 全局ID，当一个页面存在多个表格时以此区分
        guid : 0,

        // 语言字典
        Lang : {
            ADD                : '添加',
            ALL                : '全部',
            APPLY              : '应用',
            CANCEL             : '取消',
            CHOOSE_DATE        : '选择日期',
            CLEAN              : '清空',
            CLEAR              : '清除内容',
            CLONE_LINE         : '克隆选中行',
            COL                : '列',
            COL_AUTO_FILL      : '自动填充列',
            COL_NAME           : '列名',
            COMPARE            : '比较',
            COPY               : '复制',
            COPY_TO_EXCEL      : '复制到Excel',
            DEFAULT_TITLE      : '数据表',
            DEL_LINE           : '删除选中行',
            DETAIL_EDIT        : '行详细编辑',
            DISPLAY            : '显示',
            DUPLICATE_IN_APD   : '新增行中发现重复的主键：',
            EDIT               : '编辑',
            EXPORT             : '导出',
            EXPORT_ASFILE      : '导出为文件',
            EXPORT_CURPAGE     : '只导出当前页',
            EXPORT_FILTER      : '只导出过滤后的行',
            EXPORT_NOHIDE      : '不导出隐藏的列',
            EXPORT_TRUEVAL     : '导出实际值',
            EXPORT_XML         : '导出XML',
            FILTER             : '过滤',
            FIND               : '查找',
            FIND_FROM_START    : '从头开始查找',
            FIND_NEXT          : '查找下一个',
            FRAME_NOT_FOUND    : '创建表格失败：未找到DOM',
            FULL_SCREEN        : '全屏',
            HIDE               : '隐藏',
            HIDE_COL           : '隐藏列',
            HIDE_DISPLAY_COL   : '隐藏/显示列',
            IMPORT             : '导入',
            INPUT_REPLACE_FIND : '在此输入要查找的内容',
            INPUT_REPLACE_TO   : '把查找到的文本替换为此处的内容',
            JUMP               : '跳转',
            LOADING            : '正在加载……',
            MOD_APD            : '新增',
            MOD_CONTENT        : '修改内容',
            MOD_DEL            : '删除',
            MOD_LINE           : '修改行',
            MOD_LIST           : '修改列表',
            MOD_MDF            : '修改',
            NEW_LINE_AFTER     : '行',
            NEW_LINE_BEFORE    : '新建',
            OK                 : '确定',
            OPERATION          : '操作',
            OPT_EQ             : '等于',
            OPT_IN             : '包含',
            OPT_IN_AND         : '过滤不满足任一条件的数据行',
            OPT_IN_OR          : '显示满足任一条件的数据行',
            OPT_LG             : '大于',
            OPT_LGE            : '不小于',
            OPT_LT             : '小于',
            OPT_LTE            : '不大于',
            OPT_NE             : '不等于',
            PASTE              : '粘贴',
            PASTE_FROM_EXCEL   : '粘贴自Excel',
            PRIV_APD           : '此表禁止新增行',
            PRIV_DEL           : '此表禁止删除行',
            PRIV_MDF           : '此表禁止编辑',
            REPLACE            : '替换',
            REPLACE_ALL        : '全部替换',
            REPLACE_AREA       : '选区替换',
            REPLACE_CASE       : '区分大小写',
            REPLACE_FIND       : '查找内容',
            REPLACE_REGEXP     : '正则表达式',
            REPLACE_TO         : '替换为',
            ROW                : '行',
            SAVE               : '保存',
            SAVE_ING           : '正在保存……',
            SAVE_TIPS          : '选择需要保存的内容',
            SEARCH_AS_FILTER   : '以此关键词为过滤器查找',
            SEARCH_IN_CUR_COL  : '在当前列查找',
            SELECT_ALL         : '全选',
            SELECT_REV         : '反选',
            STRIP_AFTER        : '条',
            STRIP_BEFORE       : '第',
            VALUE              : '值',
            sReady : function(){
                return '就绪，右击表格弹出菜单';
            },
            sAfterReplace : function(replacedCount){
                return '替换完成，共有' + replacedCount + '处被替换';
            },
            sAfterFill : function(filledCount){
                return '已对' + filledCount + '个单元格进行了填充';
            },
            sAfterSort : function(keyName, isReversed){
                return '已按' + keyName + '进行了' + (isReversed ? '从大到小' : '从小到大') + '的排序';
            },
            sLineStripCount : function(count){
                return '共' + count + '条';
            },
            sAfterSelect : function(selectedCount){
                return '已选中' + selectedCount + '个单元格';
            },
            sAfterSelectMulti : function(selectedCount){
                return '复选 已选中' + selectedCount + '个单元格';
            },
            sAfterSelectBlock : function(row1, col1, row2, col2, selectedCount){
                return '已选中' + selectedCount + '个单元格(' + row1 + ',' + col1 + ')~(' + row2 + ',' + col2 + ')';
            },
            sRowCol : function(row, col){
                return '第' + row + '行，第' + col + '列'; 
            },
            sAfterSelectCol : function(col, selectedCount){
                return '已选中第' + col + '列，共' + selectedCount + '个单元格';
            },
            sAfterCopy : function(count){
                return '已将' + count + '个单元格的数据复制到剪贴板';
            },
            sAfterPaste : function(formCount, toCount){
                return '以' + formCount + '个单元格的内容修改了' + toCount + '个单元格';
            },
            sNoSelected : function(){
                return '未选中内容！';
            },
            sCopyFromExcel : function(){
                return '在下方文本框中粘贴：';
            },
            sCopyToExcel : function(){
                return '复制下方文本框的内容，在Excel中粘贴：';
            },
            // 扩展语言字典
            extend : function(e){
                for(var i in e){
                    Grid.Lang[i] = e[i];
                }
            }
        },
        Plugins : {

        },
        // 判断是否在范围内
        in_range : function(element, x, y){
            var offset = $(element).offset();
            return (
                x >= offset.left &&
                x <= offset.left + $(element).width() &&
                y >= offset.top  &&
                y <= offset.top  + $(element).height() 
            );
        },
        // 判断某个格子是否在某个选区内
        in_area : function(grid, area){
            for(var i in area){
                if(area[i].col != grid.col){
                    continue;
                }
                if(area[i].row != grid.row){
                    continue;
                }
                return true;
            }
            return false;
        },
        // 选区排序
        area_sort  : function(area){
            return area.sort(function(a, b){
                if(a.row < b.row){
                    return -1;
                }
                if(a.row == b.row){
                    if(a.col < b.col){
                        return -1;
                    }else if(a.col == b.col){
                        return 0;
                    }else{
                        return 1;
                    }
                }
                return 1;
            });
        },
        // 选区去重
        area_dedup : function(area){
            area = Grid.area_sort(area);
            var new_area = [area[0]];
            var i;
            for(i = 1; i < area.length; i++){
                if(area[i].col == area[i - 1].col && area[i].row == area[i - 1].row){
                    continue;
                }
                new_area.push(area[i]);
            }
            return new_area;
        },
        // 选区相减
        area_minus : function(area_1, area_2){
            var area_3 = [], i;
            for(i = 0; i < area_1.length; i++){
                if(Grid.in_area(area_1[i], area_2)){
                    continue;
                }
                area_3[area_3.length] = {
                    row : area_1[i].row,
                    col : area_1[i].col
                }
            }
            return area_3;
        },
        // 选区行列化
        area_rows : function(area){
            if(area.length == 0){
                return [];
            }
            area = Grid.area_sort(area);
            var rows = [area[0].row];
            var i;
            for(i = 1; i < area.length; i ++){
                if(rows[rows.length - 1] == area[i].row){
                    continue;
                }
                rows.push(area[i].row);
            }
            return rows;
        },



        // 点
        Pos   : function(x, y){
            this.x = x || 0;
            this.y = y || 0;
        },
        // 格子
        Grid  : function(x, y, col, row){
            this.x   = x   || 0;
            this.y   = y   || 0;
            this.col = col || 0;
            this.row = row || 0;
        },
        // 选区
        Area : function(grids){
            var i, j = 0, k = 0; 
            var row = [];
            // 选区是否矩形选区
            this.col_equ = true;
            // 列数最大值
            this.col_max = 0;
            // 列数最小值
            this.col_min = 0;
            // 列数最多的行
            this.max_col = 0;
            // 列数最少的行
            this.min_col = 0;
            // 格子重排
            this.grids = Grid.area_sort(grids);
            if(grids.length > 0){
                k = grids[0].row;
                row[0] = [];
            }
            // 格子分行
            for(i in grids){
                if(grids[i].row != k){
                    if(row[j].length > this.col_max){
                        this.col_max = row[j].length;
                        this.max_col = j;
                    }
                    if(row[j].length < this.col_min){
                        this.col_min = row[j].length;
                        this.min_col = j;
                    }
                    j ++;
                    row[j] = [];
                }
                row[j].push(grids[i]);
            }
            this.rows = row;
            // if(this.col_max != this.col_min){
            //     this.col_equ = false;
            // }else{
            //     for(i = 0; i < this.col_max; i ++){

            //     }
            // }
        },
        // 表
        Table : function(frame, data, from, to){
            var that = this;
            // 前缀，用于ID
            var prefix    = 'lxg-tab-' + (Grid.guid ++) + '-';
            // 显示表格的主体
            var element   = crdiv();  
            // 工具栏
            var toolbar   = crdiv();
            // 表头
            var header    = crdiv();
            // 底部导航
            var footer    = crdiv();
            // 水平滚动槽
            var scroll_h  = crdiv();
            // 垂直滚动槽
            var scroll_v  = crdiv();
            // 第一个描述选中的框，用以兼容旧版本jq
            var $selected_0 = mkdiv("lxg-selected").hide();
            var i;

            this.$loading = mkdiv("lxg-loading", Grid.Lang.LOADING).attr('id', prefix + 'loading');
            // 外壳
            this.frame = $(frame)[0];
            if(!this.frame){
                Win.alert(Grid.Lang.FRAME_NOT_FOUND);
                return;
            }
            $(this.frame).append(
                toolbar,
                header,
                element,
                scroll_h,
                scroll_v,
                footer,
                this.$loading
            );
            $(frame).addClass('lxg-frame');
            // 左上角显示当前位置的编辑框
            this.$ctrl_pos = $('<input class="lxg-tbctrl-input"/>');
            // 左上方显示格子内容的编辑框
            this.$ctrl_arg = $('<textarea class="lxg-tbctrl-input long"></textarea>');
            // 右上角的搜索框
            this.$ctrl_search = $('<input class="lx-search slim" placeholder="'+Grid.Lang.SEARCH_IN_CUR_COL+'"/>');

            $(toolbar).addClass('lxg-toolbar').append(
                // 顶部菜单
                mkdiv("lxg-tbmenu-bar").append(
                    // 标题
                    mkdiv("lxg-tbmenu-title", Grid.Lang.DEFAULT_TITLE),
                    // 菜单项
                    mkdiv("lxg-tbmenu-item", Grid.Lang.SAVE + '(<u>S</u>)'          ).click(function(){
                        that.saveAction();
                    }),
                    mkdiv("lxg-tbmenu-item", Grid.Lang.FIND + '/' + Grid.Lang.FILTER).click(function(){
                        that.filtAction();
                    }),
                    mkdiv("lxg-tbmenu-item", Grid.Lang.HIDE_COL                     ).click(function(){
                        that.colAction();
                    }),
                    mkdiv("lxg-tbmenu-item", Grid.Lang.EXPORT                       ).click(function(){
                        that.exportAction();
                    }),
                    mkdiv("lxg-tbmenu-item", Grid.Lang.FULL_SCREEN                  ).click(function(){
                        that.act_fullscreen() + (that.visi.fullscreen ? $(this).addClass("selected") : $(this).removeClass("selected"));
                    })
                ),


                // 上方工具栏
                mkdiv("lxg-tbctrl-bar").append(
                    this.$ctrl_pos,
                    mkico('plus', Grid.Lang.NEW_LINE_BEFORE+'1'+Grid.Lang.NEW_LINE_AFTER, function(){
                        that.append_empty(1).scroll_down(that.scroll.v);
                        that.cursor = new Grid.Grid(
                            1,
                            that.size.row_to[that.size.row_from.length - 1] + 1,
                            1, that.data.row.length);
                    }),
                    mkico('minus', Grid.Lang.DEL_LINE, function(){
                        that.act_del_line().dis_selected();
                    }),
                    mkico('autodown', Grid.Lang.COL_AUTO_FILL, function(){
                        that.act_col_auto_fill();
                    }),
                    mkico('edit', Grid.Lang.DETAIL_EDIT, function(){
                        that.detailAction();
                    }),
                    this.$ctrl_arg.keyup(function(){
                        that.act_apply_arg();
                    }).mouseup(function(){
                        that.act_apply_arg();
                    }),
                    mkico('remove', Grid.Lang.CLEAR, function(){
                        that.ctrl_arg_set('').act_clear();
                    }),
                    // 当做过滤器搜索
                    mkico('filt right search end', Grid.Lang.SEARCH_AS_FILTER, function(){
                        that.act_search_as_filter();
                    }),
                    // 查找下一个
                    mkico('down right search', Grid.Lang.FIND_NEXT, function(){
                        that.act_search_in_cur_col(that.col_search_ptr + 1);
                    }),
                    // 从头开始查找
                    mkico('search right search', Grid.Lang.FIND_FROM_START, function(){
                        that.act_search_in_cur_col();
                    }),
                    this.$ctrl_search.keyup(function(e){
                        if(e.keyCode == Grid.Keyboard.KEY_ENTER){
                            // ctrl + enter 时，当做过滤器搜索
                            if(e.ctrlKey){
                                that.act_search_as_filter();
                            }else{
                                that.act_search_in_cur_col();
                            }
                        }
                    })
                )
            );
            $(header  ).addClass('lxg-header');
            $(footer  ).addClass('lxg-footer');
            $(scroll_h).addClass('lxg-scroll-h');
            $(scroll_v).addClass('lxg-scroll-v');
            this.element  = element;
            this.toolbar  = toolbar;
            this.header   = header;
            this.footer   = footer;
            this.scroll_h = scroll_h;            
            this.scroll_v = scroll_v;          
            this.data     = data;
            // 设置表格主键
            if(!this.data.primary){
                this.data.primary = this.data.col[0].name;
            }
            if(this.data.primary){
                for(i = 0; i < this.data.row.length; i++){
                    this.data.row[i].lxg_pri_org = this.data.row[i][data.primary];
                }
            }
            this.size     = {
                TB_HEIGHT     : 0,      // 工具栏高度
                HD_HEIGHT     : 0,      // 整个头部的高度
                FT_HEIGHT     : 0,      // 底部导航栏高度
                SC_HEIGHT     : 0,      // 水平滚动槽高度
                SC_WIDTH      : 0,      // 垂直滚动槽宽度
                EX_HEIGHT     : 0,      // 表格本体外的高度和    
                LN_HEIGHT     : 25,     // 默认行高 
                GD_WIDTH      : 92,     // 默认格子宽度
                STEP_SCROLL_V : 20, // 垂直滚动条在鼠标滚轮下滚动步进
                STEP_SCROLL_H : 50, // 水平滚动条在鼠标滚轮下滚动步进
                STEP_SCROLL_D : 50, // 使用方向键时滚动条的滚动步进
                width         : 0,
                height        : 0,
                col           : [0],          // 列尺寸
                row           : [0],          // 行尺寸
                col_from      : [0],     // 列左上角点横向偏移
                col_to        : [0],        // 列右下角点横向偏移
                row_from      : [0],     // 行左上角点纵向偏移
                row_to        : [0]        // 行右下角点纵向偏移
            }
            // 各size值计算
            this.size.TB_HEIGHT = $(toolbar).outerHeight();
            this.size.HD_HEIGHT = this.size.TB_HEIGHT + $(header).outerHeight();
            this.size.FT_HEIGHT = $(footer).outerHeight();
            this.size.SC_HEIGHT = $(this.scroll_h).outerHeight();
            this.size.SC_WIDTH  = $(this.scroll_v).outerWidth();
            this.size.EX_HEIGHT = this.size.HD_HEIGHT + this.size.FT_HEIGHT + this.size.SC_HEIGHT;
            this.size.width     = $(frame).width();
            this.size.height    = $(frame).height();
            $(header  ).css('top', this.size.TB_HEIGHT);
            $(scroll_v).css('top', this.size.TB_HEIGHT);
            // 数据初始化
            for(i in this.data.col){
                // 不存在显示名display则用列数据名name作为显示名称
                if(!this.data.col[i].display){
                    this.data.col[i].display = this.data.col[i].name;
                }
                // 不存在宽度定义则使用默认宽度值
                if(!this.data.col[i].width){
                    this.data.col[i].width = this.size.GD_WIDTH;
                }
            }
            this.scroll   = {
                v  : 0,     // 总垂直高度
                h  : 0,     // 总水平宽度
                x  : 0,     // 滚动偏移X
                y  : 0,     // 滚动偏移Y
                ch : 0,     // 视觉宽度
                cv : 0,     // 视觉高度
                $bar_h : mkdiv("lxg-scroll-bar"),   // 滚动条
                $bar_v : mkdiv("lxg-scroll-bar"),   // 滚动条
                sh : 0,     // 横向滚动槽宽度
                sv : 0,     // 纵向滚动槽高度
                bh : 0,     // 横向滚动条宽度
                bv : 0,     // 纵向滚动条高度
                bx : 0,     // 滚动条偏移X
                by : 0      // 滚动条偏移Y
            }
            this.prefix   = prefix;
            // 状态
            // 选中区域
            this.selected = [];
            // 是否处于拖动
            this.dragging = false;
            // 编辑中的对象
            this.editing  = null;
            // 右键菜单是否可见
            this.on_menu  = false;

            // 是否允许增加新行
            this.priv_apd = true;
            // 是否允许修改
            this.priv_mdf = true;
            // 是否允许删除
            this.priv_del = true;

            this.mouse    = {
                // override为true时大部分作用在表格本体上的鼠标事件不响应
                override   : false, 
                // 拖放起始点及结束点
                dragStartX : null,
                dragStartY : null,
                dragOverX  : null,
                dragOverY  : null,
                // 点击坐标
                clickX     : null,
                clickY     : null,
                // 滚动条鼠标响应
                scrollV    : false,
                scrollH    : false,
                scroll_y   : 0,
                scroll_x   : 0
            }
            this.keyboard = {
                // override为true时大部分作用在表格本体上的键盘事件不响应
                override : false,
                ctrlKey  : false,
                shiftKey : false
            }
            // 
            this.editStack = [];
            this.clipBoard = null;
            this.autoDrag  = false;
            this.autoFill  = null;
            // 当前点
            this.cursor    = {
                row : 0,
                col : 0,
                x   : 0,
                y   : 0
            };
            // 可视状态
            this.visi = {
                fullscreen : false,
                width  : 0,
                height : 0
            }
            // 排序配置
            this.sort_cfg = {
                key : null,
                sc  : null
            }
            // 快速查找指针
            this.col_search_ptr = -1;
            // 是否在操作表格
            this.operating = false;
            // 修改MAP
            this.modified  = {};
            // 增加的行
            this.appended  = [];
            // 删除的行
            this.removed   = [];
            // 当前页起始
            this.from      = from || 0;
            // 当前页结束
            this.to        = to   || 99;
            // 经过筛选之后的行数据
            this.raw_row   = this.data.row;
            // 原始纪录数据
            this.rec_row   = this.data.row;
            this.cache     = {};
            // 过滤器
            this.filter    = null;
            // 过滤类型
            this.filter_andor = Grid.Lang.OPT_IN_AND;
            // 钩子集
            this.hook_map = [];

            if(this.to >= this.data.row.length){ this.to = this.data.row.length - 1 }

            // 监听

            $(window).mousedown(function(e){
                if(!that.operating){
                    return
                }
                return Grid.Mouse.table_down.call(that, e);
            }).mouseup(function(e){
                if(!that.operating && !that.dragging){
                    return;
                }
                return Grid.Mouse.table_up.call(that, e);
            }).mouseleave(function(e){
                if(!that.operating){
                    return;
                }
                return Grid.Mouse.table_leave.call(that, e);
            }).dblclick(function(e){
                if(!that.operating){
                    return;
                }
                return Grid.Mouse.table_dblclick.call(that, e);
            }).keydown(function(e){
                if(!that.operating){
                    return;
                }
                return Grid.Keyboard.down.call(that, e);
            }).keyup(function(e){
                if(!that.operating){
                    return;
                }
                return Grid.Keyboard.up.call(that, e);
            }).mousewheel(function(e, d, dx, dy){
                if(!that.operating){
                    return;
                }
                return Grid.Mouse.table_scroll.call(that, e, d, dx, dy);
            }).mousedown(function(e){
                if(that.mouse.scrollV){
                    return Grid.Mouse.scroll_v_down.call(that, e);
                }
                if(that.mouse.scrollH){
                    return Grid.Mouse.scroll_h_down.call(that, e);
                }
            }).mouseup(function(e){
                if(that.mouse.scrollV){
                    return Grid.Mouse.scroll_v_up.call(that, e);
                }
                if(that.mouse.scrollH){
                    return Grid.Mouse.scroll_h_up.call(that, e);
                }
            });
            // 覆盖于表格上方的透明面板，用于接收操作
            this.$cover       = mkdiv('lxg-cover').attr('id', prefix + 'cover');
            // 虚线选择框
            this.$select      = mkdiv("lxg-select").hide();
            // 内容预览面板
            this.$preview     = mkdiv("lxg-select-display").hide();
            // 自动填充的右下角方块
            this.$auto        = mkdiv("lxg-auto").hide();
            // 自动填充选择框
            this.$auto_select = mkdiv("lxg-auto-select").hide();
            // 选区
            this.$selected    = [$selected_0];  
            // 选中行
            this.$sel_line    = mkdiv("lxg-selected-line").hide();
            // 右键菜单
            this.$menu        = mkdiv("lxg-menu").append(
                // 编辑
                mkdiv("lxg-menu-item b").click(function(){
                    that.act_edit($(this)).pdown();
                }).append(Grid.Lang.EDIT + '(<u>E</u>)'),
                // 复制
                mkdiv("lxg-menu-item").click(function(){
                    that.act_copy($(this)).pdown();
                }).append(Grid.Lang.COPY + '(<u>C</u>)'),
                //粘贴
                mkdiv("lxg-menu-item").click(function(){
                    that.act_paste($(this)).pdown();
                }).append(Grid.Lang.PASTE + '(<u>V</u>)'),
                // 分隔
                mkdiv("lxg-menu-sep"),
                // 清除
                mkdiv("lxg-menu-item").click(function(){
                    that.act_clear($(this)).pdown();
                }).append(Grid.Lang.CLEAR),
                // 替换
                mkdiv("lxg-menu-item").click(function(){
                    that.act_replce($(this)).pdown();
                }).append(Grid.Lang.REPLACE_AREA + '(<u>H</u>)'),
                // 分隔
                mkdiv("lxg-menu-sep"),
                // 复制到Excel
                mkdiv("lxg-menu-item").click(function(){
                    that.act_copy_excel($(this)).pdown();
                }).append(Grid.Lang.COPY_TO_EXCEL),
                // 粘贴自Excel
                mkdiv("lxg-menu-item").click(function(){
                    that.act_paste_excel($(this)).pdown();
                }).append(Grid.Lang.PASTE_FROM_EXCEL),
                // 分隔
                mkdiv("lxg-menu-sep"),
                // 新建行
                mkdiv("lxg-menu-item").click(function(){
                    that.act_new_line($(this)).pdown();
                }).append(
                    Grid.Lang.NEW_LINE_BEFORE,
                    $('<input />').click(function(){
                        return false;
                    }).dblclick(function(){
                        return false;
                    }).mouseup(function(){
                        return false;
                    }).val(1),
                    Grid.Lang.NEW_LINE_AFTER
                ),
                // 克隆行
                mkdiv("lxg-menu-item").click(function(){
                    that.act_clone_line($(this)).pdown();
                }).append(Grid.Lang.CLONE_LINE),
                // 分隔
                mkdiv("lxg-menu-sep"),
                // 删除行
                mkdiv("lxg-menu-item").click(function(){
                    that.act_del_line($(this)).pdown();
                }).append(Grid.Lang.DEL_LINE)
            ).hide();
            $(element).html('').addClass('lxg-tab');
            this.restore(true);
            $(element).mouseenter(function(){
                that.operating = true;
            }).mouseleave(function(){
                that.operating = false;
            });
            // 底部导航条
            $(footer).append(
                mkdiv("lxg-footer-tips"),
                mkdiv("lxg-footer-button").click(function(){
                    that.act_page_showall($(this));
                }).append(Grid.Lang.ALL),
                mkdiv("lxg-footer-button").click(function(){
                    that.act_page_jump($(this));
                }).append(Grid.Lang.JUMP),
                mkdiv("lxg-footer-tri-r").click(function(){
                    that.act_page_next($(this));
                }),
                mkdiv("lxg-footer-label").append(Grid.Lang.STRIP_AFTER),
                $('<input class="lxg-footer-input to" />').keydown(function(e){
                    if(e.keyCode == Grid.Keyboard.KEY_ENTER){
                        that.act_page_jump($(this));
                    }
                }).val(this.to + 1),
                mkdiv("lxg-footer-label").append(Grid.Lang.STRIP_AFTER + '~' + Grid.Lang.STRIP_BEFORE),
                $('<input class="lxg-footer-input from" />').keydown(function(e){
                    if(e.keyCode == Grid.Keyboard.KEY_ENTER){
                        that.act_page_jump($(this));
                    }
                }).val(this.from + 1),
                mkdiv("lxg-footer-label").append(Grid.Lang.STRIP_BEFORE),
                mkdiv("lxg-footer-tri-l").click(function(){
                    that.act_page_prev($(this));
                }),
                mkdiv("lxg-footer-sep"),
                mkdiv("lxg-footer-label count", Grid.Lang.sLineStripCount(this.raw_row.length))
            );
            $(this.scroll_h).append(
                this.scroll.$bar_h.mousedown(function(){
                    that.mouse.scrollH = true
                })
            );
            $(this.scroll_v).append(
                this.scroll.$bar_v.mousedown(function(){
                    that.mouse.scrollV = true
                })
            );
            this.element.oncontextmenu = function(e){
                if(that.editing == null){
                     return false;
                }
            }
            document.getElementById(prefix + 'cover').oncontextmenu = function(e){
                return false;
            }
            this.remap_col().refresh().tips_footer(Grid.Lang.sReady());

        },
        // 键盘工具及事件
        Keyboard : {
            // 键盘码
            KEY_A : 65, KEY_B : 66, KEY_C : 67, KEY_D : 68, KEY_E : 69, KEY_F : 70, KEY_G : 71, KEY_H : 72,
            KEY_I : 73, KEY_J : 74, KEY_K : 75, KEY_L : 76, KEY_M : 77, KEY_N : 78, KEY_O : 79, KEY_P : 80,
            KEY_Q : 81, KEY_R : 82, KEY_S : 83, KEY_T : 84, KEY_U : 85, KEY_V : 86, KEY_W : 87, KEY_X : 88,
            KEY_Y : 89, KEY_Z : 90, KEY_0 : 48, KEY_1 : 49, KEY_2 : 50, KEY_3 : 51, KEY_4 : 52, KEY_5 : 53,
            KEY_6 : 54, KEY_7 : 55, KEY_8 : 56, KEY_9 : 57,
            KEY_NUM_1 :  96, KEY_NUM_2 :  97, KEY_NUM_3 :  98, KEY_NUM_4 :  99, KEY_NUM_5 : 100, 
            KEY_NUM_6 : 101, KEY_NUM_7 : 102, KEY_NUM_8 : 103, KEY_NUM_9 : 104, KEY_NUM_0 : 105,
            KEY_ESC   :  27, KEY_ENTER :  13, KEY_SPACE :  32,
            KEY_LEFT  :  37, KEY_UP    :  38, KEY_RIGHT :  39, KEY_DOWN  :  40,
            KEY_SHIFT :  16, KEY_CTRL  :  17, KEY_ALT   :  18,
            // 右键菜单可见时对键盘的响应
            menu_down : function(keyCode){
                switch(keyCode){
                    case Grid.Keyboard.KEY_A:
                        this.keyboard.ctrlKey = false;
                        this.all_selected().pdown();
                        return false;
                    case Grid.Keyboard.KEY_C:
                        this.act_copy().pdown();
                        return false;
                    case Grid.Keyboard.KEY_E:
                        var p1 = this.cursor;
                        var p2 = new Grid.Grid(
                            p1.x + this.size.col[p1.col],
                            p1.y + this.size.row[p1.row],
                            p1.col, p1.row);
                        this.edit(p1, p2).pdown();
                        return false;
                    case Grid.Keyboard.KEY_V:
                        this.act_paste().pdown();
                        return false;
                    case Grid.Keyboard.KEY_S:
                        this.saveAction().pdown();
                        return false;
                    case Grid.Keyboard.KEY_H:
                        this.replaceAction().pdown();
                        return false;
                    default:
                        break;
                }
            },
            // 通常状态下对键盘的响应
            down : function(e){
                if(this.keyboard.override){
                    return;
                }
                if(this.on_menu){
                    return Grid.Keyboard.menu_down.call(this, e.keyCode);
                }
                if(!e.ctrlKey){
                    if(e.keyCode == Grid.Keyboard.KEY_ESC){
                        if(this.editing){
                            this.editing.element.remove();
                            this.grid_to(this.cursor.row, this.cursor.col);
                        }else{
                            this.dis_selected();
                        }
                        return false;
                    }
                    if(e.keyCode == Grid.Keyboard.KEY_UP){
                        if(this.editing){
                            var p = this.editing;
                            this.editing.element.blur();
                            this.edit_grid(p.row - 1, p.col, true);
                            this.scroll_up(this.size.LN_HEIGHT);
                            return false;
                        }else{
                            this.grid_up();
                            return false;
                        }
                    }
                    if(e.keyCode == Grid.Keyboard.KEY_DOWN){
                        if(this.editing){
                            var p = this.editing;
                            this.editing.element.blur();
                            this.edit_grid(p.row + 1, p.col, true);
                            this.scroll_down(this.size.LN_HEIGHT);
                            return false;
                        }else{
                            this.grid_down();
                            return false;
                        }
                    }
                    if(e.keyCode == Grid.Keyboard.KEY_LEFT){
                        if(this.editing){

                        }else{
                            this.grid_left();
                            return false;
                        }
                    }
                    if(e.keyCode == Grid.Keyboard.KEY_RIGHT){
                        if(this.editing){

                        }else{
                            this.grid_right();
                            return false;
                        }
                    }
                    if(e.keyCode == Grid.Keyboard.KEY_ENTER){
                        if(this.editing){
                            this.editing.element.blur();
                            this.grid_down();
                            return false;
                        }
                    }
                    if( (e.keyCode >= Grid.Keyboard.KEY_A && e.keyCode <= Grid.Keyboard.KEY_Z) ||
                        (e.keyCode >= Grid.Keyboard.KEY_0 && e.keyCode <= Grid.Keyboard.KEY_9) ||
                        (e.keyCode >= Grid.Keyboard.KEY_NUM_1 && e.keyCode <= Grid.Keyboard.KEY_NUM_0)){
                        if(this.selected.length == 1 && !this.editing){
                            this.edit_grid(this.selected[0].row, this.selected[0].col, true)
                        }
                    }
                }else{
                    switch(e.keyCode){
                        case Grid.Keyboard.KEY_A:
                            this.keyboard.ctrlKey = false;
                            this.all_selected();
                            return false;
                        case Grid.Keyboard.KEY_C:
                            this.act_copy();
                            return false;
                        case Grid.Keyboard.KEY_E:
                            var p1 = this.cursor;
                            var p2 = new Grid.Grid(
                                p1.x + this.size.col[p1.col],
                                p1.y + this.size.row[p1.row],
                                p1.col,
                                p1.row
                            )
                            this.edit(p1, p2).pdown();
                            return false;
                        case Grid.Keyboard.KEY_V:
                            this.act_paste();
                            return false;
                        case Grid.Keyboard.KEY_S:
                            this.saveAction();
                            return false;
                        case Grid.Keyboard.KEY_H:
                            this.replaceAction();
                            return false;
                        default:
                            break;
                    }
                }
                switch(e.keyCode){
                    case Grid.Keyboard.KEY_CTRL:
                        this.keyboard.ctrlKey = true;
                        break;
                    case Grid.Keyboard.KEY_SHIFT:
                        this.keyboard.shiftKey = true;
                        break;
                    default:
                        break;
                }
            },
            up : function(e){
                if(this.keyboard.override){
                    return;
                }
                switch(e.keyCode){
                    case Grid.Keyboard.KEY_CTRL:
                        this.keyboard.ctrlKey = false;
                        break;
                    case Grid.Keyboard.KEY_SHIFT:
                        this.keyboard.shiftKey = false;
                        break;
                    default:
                        break;
                }
            }
        },
        // 鼠标事件
        Mouse : {
            table_down : function(e){
                if(this.mouse.override){
                    return;
                }
                if(!e.ctrlKey && this.keyboard.ctrlKey){
                    this.keyboard.ctrlKey = false;
                }
                var handle_move = true,
                    offset      = $(this.element).offset(),
                    dx          = e.pageX - offset.left,
                    dy          = e.pageY - offset.top + $(this.element).scrollTop(),
                    that        = this;
                if(this.on_menu){
                    if(Grid.in_range(this.$menu[0], e.pageX, e.pageY)){
                        handle_move = false;
                    }
                }
                if(this.$selected.length == 1 && 
                    Grid.in_range(this.$auto, e.pageX, e.pageY)){
                    this.autoDrag = true;
                    handle_move   = false;
                    window.onmousemove = function(e){
                        return Grid.Mouse.table_move_auto.call(that, e);
                    }
                    return false;
                }
                if(e.which == 1 && handle_move){
                    if(!this.dragging){
                        this.$select.hide();
                        this.mouse.dragStartX = dx;
                        this.mouse.dragStartY = dy;
                    }
                    window.onmousemove = function(e){
                        return Grid.Mouse.table_move.call(that, e);
                    }
                    return false;
                }
            },
            table_move_auto : function(e){
                var offset = $(this.element).offset(),
                    dx     = e.pageX - offset.left,
                    dy     = e.pageY - offset.top + $(this.element).scrollTop(),
                    x1, x2, y1, y2, p1, p2, 
                    pos    = this.get_pos(this.selected[0].row, this.selected[0].col, true);
                if(dx < pos.x || dy < pos.y){
                    pos = this.get_pos(
                        this.selected[this.selected.length - 1].row, 
                        this.selected[this.selected.length - 1].col, true
                    );
                }
                pos.x += 5;
                pos.y += 5;
                if(pos.x < dx){
                    x1 = pos.x;
                    x2 = dx;
                }else{
                    x2 = pos.x;
                    x1 = dx;
                }
                if(pos.y < dy){
                    y1 = pos.y;
                    y2 = dy;
                }else{
                    y2 = pos.y;
                    y1 = dy;
                }
                p1 = this.get_grid(x1, y1, true);
                p2 = this.get_grid(x2, y2);
                this.autoFill = [p1, p2];
                this.$auto_select.show().css(
                    {
                        'left'   : p1.x - 2,
                        'top'    : p1.y - 2,
                        'width'  : p2.x - p1.x - 1,
                        'height' : p2.y - p1.y - 1
                    }
                );
                return false;
            },
            table_move : function(e){
                if(this.mouse.override){
                    return;
                }
                var offset = $(this.element).offset();
                this.mouse.dragOverX = e.pageX - offset.left;
                this.mouse.dragOverY = e.pageY - offset.top + $(this.element).scrollTop();
                if(!this.dragging){
                    if(this.mouse.dragStartX == this.mouse.dragOverX && this.mouse.dragStartY == this.mouse.dragOverY){
                        
                    }else{
                        this.dragging = true;
                        this.$select.show();
                    }
                }
                if(this.dragging){
                    var x1, x2, y1, y2, dx, dy;
                    if(this.mouse.dragStartX < this.mouse.dragOverX){
                        x1 = this.mouse.dragStartX;
                        x2 = this.mouse.dragOverX;
                        dx = true;
                    }else{
                        x2 = this.mouse.dragStartX;
                        x1 = this.mouse.dragOverX;
                        dx = false;
                    }
                    if(this.mouse.dragStartY < this.mouse.dragOverY){
                        y1 = this.mouse.dragStartY;
                        y2 = this.mouse.dragOverY;
                        dy = true;
                    }else{
                        y2 = this.mouse.dragStartY;
                        y1 = this.mouse.dragOverY;
                        dy = false;
                    }
                    var p1 = this.get_grid(x1, y1, true);
                    var p2 = this.get_grid(x2, y2);
                    this.$select.css(
                        {
                            'left'   : p1.x - 2,
                            'top'    : p1.y - 2,
                            'width'  : p2.x - p1.x - 1,
                            'height' : p2.y - p1.y - 1
                        }
                    );
                    if(dy){
                        if(p2.y > this.scroll.y + this.scroll.cv - this.size.HD_HEIGHT){
                            this.scroll_down(this.size.STEP_SCROLL_V);
                        }
                        if(p2.y < this.scroll.y){
                            this.scroll_up(this.size.STEP_SCROLL_V);
                        }
                    }else{
                        if(p1.y > this.scroll.y + this.scroll.cv - this.size.HD_HEIGHT){
                            this.scroll_down(this.size.STEP_SCROLL_V);
                        }
                        if(p1.y < this.scroll.y){
                            this.scroll_up(this.size.STEP_SCROLL_V);
                        }
                    }
                    if(dx){
                        if(p2.x > this.scroll.x + this.scroll.ch){
                            this.scroll_right();
                        }
                        if(p2.x < this.scroll.x){
                            this.scroll_left();
                        }
                    }else{
                        if(p1.x > this.scroll.x + this.scroll.ch){
                            this.scroll_right();
                        }
                        if(p1.x < this.scroll.x){
                            this.scroll_left();
                        }
                    }
                    return false;
                }
            },
            table_up   : function(e){
                if(this.mouse.override){
                    return;
                }
                var offset = $(this.element).offset();
                var st = $(this.element).scrollTop();
                var dx = e.pageX - offset.left;
                var dy = e.pageY - offset.top + st;
                if(this.autoDrag){
                    this.autoDrag = false;
                    window.onmousemove = null;
                    this.$auto_select.hide();
                    if(this.autoFill){
                        this.auto_fill();
                        this.autoFill = null;
                    }
                    return;
                }
                var handle_move = true;
                if(this.on_menu){
                    if(Grid.in_range(this.$menu[0], e.pageX, e.pageY)){
                        handle_move = false;
                    }else{
                        this.pdown();
                        this.on_menu = false;
                    }
                }
                this.mouse.clickX = dx;
                this.mouse.clickY = dy;
                // 左键
                if(e.which == 1 && handle_move){
                    this.mouse.dragOverX = dx;
                    this.mouse.dragOverY = dy;
                    // 拖拉中
                    if(this.dragging){
                        this.dragging = false;
                        var x1, x2, y1, y2;
                        if(this.mouse.dragStartX < this.mouse.dragOverX){
                            x1 = this.mouse.dragStartX;
                            x2 = this.mouse.dragOverX;
                        }else{
                            x2 = this.mouse.dragStartX;
                            x1 = this.mouse.dragOverX;
                        }
                        if(this.mouse.dragStartY < this.mouse.dragOverY){
                            y1 = this.mouse.dragStartY;
                            y2 = this.mouse.dragOverY;
                        }else{
                            y2 = this.mouse.dragStartY;
                            y1 = this.mouse.dragOverY;
                        }
                        var p1 = this.get_grid(x1, y1, true);
                        var p2 = this.get_grid(x2, y2);
                        this.add_selected(p1, p2);
                    }else{
                        if(
                            (this.mouse.dragOverY < 0 && this.mouse.dragOverX > 0) ||
                            (this.mouse.dragOverY < st)
                        ){
                            
                        }else{
                            var p1 = this.get_grid(this.mouse.dragOverX, this.mouse.dragOverY, true);
                            var p2 = this.get_grid(this.mouse.dragOverX, this.mouse.dragOverY);
                            this.add_selected(p1, p2);
                        }
                    }
                    this.$select.hide();
                    window.onmousemove = null;
                }else if(e.which == 2){

                }else if(e.which == 3){
                    var p1 = this.get_grid(dx, dy, true);
                    if(!Grid.in_area(p1, this.selected)){
                        this.mouse.dragOverX = dx;
                        this.mouse.dragOverY = dy;
                        var p2 = this.get_grid(dx, dy);
                        this.add_selected(p1, p2);
                    }
                    if(this.editing == null){
                        this.popup();
                    }
                }
            },
            table_leave : function(e){

            },
            table_dblclick : function(e){
                if(this.mouse.override){
                    return;
                }
                if(!e.ctrlKey && this.keyboard.ctrlKey){
                    this.keyboard.ctrlKey = false;
                }
                if(this.mouse.dragOverX <= 0 || this.mouse.dragOverY <= 0){
                    return;
                }
                if(this.mouse.dragOverX > this.size.col_to[this.data.col.length]){
                    return;
                }
                if(this.mouse.dragOverY > this.size.row_to[this.data.row.length]){
                    return;
                }
                var p1 = this.get_grid(this.mouse.dragOverX, this.mouse.dragOverY, true);
                var p2 = this.get_grid(this.mouse.dragOverX, this.mouse.dragOverY);
                this.dis_selected();
                this.cursor = p1;
                this.edit(p1, p2);
            },
            table_scroll : function(e, d, dx, dy){
                if(dy != 0){
                    if(dy < 0){
                        this.scroll_down();
                        return false;
                    }else{
                        this.scroll_up();
                        return false;
                    }
                }
            },
            scroll_v_down : function(e){
                this.mouse.scroll_y = e.pageY - this.scroll.by;
                var that = this;
                window.onmousemove = function(e){
                    return Grid.Mouse.scroll_v_move.call(that, e);
                }
                return false;
            },
            scroll_v_move : function(e){
                var oy = e.pageY - this.mouse.scroll_y;
                if(oy < 0){
                    oy = 0;
                }
                if(oy > this.scroll.sv - this.scroll.bv){
                    oy = this.scroll.sv - this.scroll.bv;
                }
                this.scroll.by = oy;
                if(this.scroll.by + this.scroll.bv >= this.scroll.sv){
                    this.scroll.y = this.scroll.v - this.scroll.cv;
                }else{
                    this.scroll.y = Math.ceil(this.scroll.by / this.scroll.sv * this.scroll.v);
                }
                this.apply_scroll_v();
                return false;
            },
            scroll_v_up : function(e){
                window.onmousemove = null;
                this.mouse.scrollV = false;
            },
            scroll_h_down : function(e){
                this.mouse.scroll_x = e.pageX - this.scroll.bx;
                var that = this;
                window.onmousemove = function(e){
                    return Grid.Mouse.scroll_h_move.call(that, e);
                }
                return false;
            },
            scroll_h_move : function(e){
                var ox = e.pageX - this.mouse.scroll_x;
                if(ox < 0){
                    ox = 0;
                }
                if(ox > this.scroll.sh - this.scroll.bh){
                    ox = this.scroll.sh - this.scroll.bh;
                }
                this.scroll.bx = ox;
                this.scroll.x = INT(this.scroll.bx / this.scroll.sh * this.scroll.h);
                this.apply_scroll_h();
                return false;
            },
            scroll_h_up : function(e){
                window.onmousemove = null;
                this.mouse.scrollH = false;
            }
        }
    }
    /**
     * 重映射表格数据的列信息
     */
    Grid.Table.prototype.remap_col = function(){
        var i;
        this.map_col = {
            name    : {},
            display : {}
        };
        for(i in this.data.col){
            this.map_col.name[this.data.col[i].name]       = i;
            this.map_col.display[this.data.col[i].display] = i;
        }
        return this;
    }
    /**
     * 应用表格配置的过滤器
     */
    Grid.Table.prototype.apply_filter = function(){
        if(!this.filter){
            this.raw_row = this.rec_row;
            return;
        }
        if(this.filter_andor == Grid.Lang.OPT_IN_AND){
            this.apply_filter_and();
        }else{
            this.apply_filter_or();
        }
        return this;
    }
    /**
     * 以“与”模式应用过滤器
     * @return {[type]} [description]
     */
    Grid.Table.prototype.apply_filter_and = function(){
        var i, j, k, r, fo, fv;
        var raw = [];
        var filt;
        for(i in this.rec_row){
            r = this.rec_row[i];
            filt = false;
            for(j in this.filter){
                for(k in this.filter[j]){
                    fo = this.filter[j][k][0];
                    fv = this.filter[j][k][1];

                    if(fo == Grid.Lang.OPT_EQ){
                        if(r[j] != fv){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_IN){
                        if(r[j].indexOf(fv) < 0){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LT){
                        if(INT(r[j]) >= INT(fv)){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LTE){
                        if(INT(r[j]) > INT(fv)){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LG){
                        if(INT(r[j]) <= INT(fv)){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LGE){
                        if(INT(r[j]) < INT(fv)){
                            filt = true;
                        }
                    }else if(fo == Grid.Lang.OPT_NE){
                        if(INT(r[j]) == INT(fv)){
                            filt = true;
                        }
                    }
                    if(filt){
                        continue;
                    }
                }
                if(filt){
                    continue;
                }
            }
            if(!filt){
                raw.push(r);
            }
        }
        this.raw_row = raw;
        return this;
    }
    /**
     * 以“或”模式应用过滤器
     */
    Grid.Table.prototype.apply_filter_or = function(){
        var i, j, k, r, fo, fv;
        var raw = [];
        var display;
        for(i in this.rec_row){
            r = this.rec_row[i];
            display = false;
            for(j in this.filter){
                for(k in this.filter[j]){
                    fo = this.filter[j][k][0];
                    fv = this.filter[j][k][1];
                    if(fo == Grid.Lang.OPT_EQ){
                        if(r[j] == fv){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_IN){
                        if(r[j].indexOf(fv) >= 0){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LT){
                        if(INT(r[j]) < INT(fv)){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LTE){
                        if(INT(r[j]) <= INT(fv)){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LG){
                        if(INT(r[j]) > INT(fv)){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_LGE){
                        if(INT(r[j]) >= INT(fv)){
                            display = true;
                        }
                    }else if(fo == Grid.Lang.OPT_NE){
                        if(INT(r[j]) != INT(fv)){
                            display = true;
                        }
                    }
                    if(display){
                        continue;
                    }
                }
                if(display){
                    continue;
                }
            }
            if(display){
                raw.push(r);
            }
        }
        this.raw_row = raw;
        return this;
    }
    Grid.Table.prototype.restore = function(clear){
        if(clear){
            this.dis_selected().$preview.hide();
        }
        $(this.element).append(
            this.$cover, 
            this.$select, 
            this.$preview, 
            this.$auto,
            this.$auto_select,
            this.$menu,
            this.$selected[0],
            this.$sel_line
        );
        return this;
    }
    /**
     * 刷新表格
     */
    Grid.Table.prototype.refresh = function(){
        var that = this;
        this.$loading.css({
            'left' : (this.size.width - 128) / 2,
            'top'  : (this.size.height - 24) / 2
        }).fadeIn('fast', function(){
            that._refresh();
            that.$loading.fadeOut('fast');
        });
        return this;
    }
    Grid.Table.prototype._refresh = function(){
        var i, j, $l, $ls, $g, rpval, pri;
        var prefix = this.prefix;
        var c_mod, c_color, c_css;
        
        this.data.row = [];
        this.hook_map.length = 0;
        i = this.from;
        // 选取要显示的若干条数据
        while(i <= this.to && i < this.raw_row.length){
            this.data.row.push(this.raw_row[i]);
            this.hook_map.push(new Array(this.data.col.length));
            i ++;
        }
        this.data.w = this.data.col.length;
        this.data.h = this.data.row.length;
        var $e = $(this.element);
        var that = this;

        this.element.innerHTML = "";
        this.restore();

        // 表头ID = prefix-l-0
        $l = $('<div class="lxg-line" id="' + prefix + 'l-0"></div>');
        // 产生表头
        for(j = 1; j <= this.data.w; j ++){
            if(this.data.col[j - 1].hide){
                continue;
            }
            $l = $l.append(
                // 表头格子ID = prefix-g-0-列
                $('<div class="lxg-grid hd" id="' + prefix + 'g-0-' + j + '"></div>').html(
                    this.data.col[j - 1].display
                ).css({'width' : this.data.col[j - 1].width - 2}).data('col', j).click(function(){
                    that.add_selected_col($(this).data('col'));
                }).append(
                    // 小到大排序三角
                    $('<div class="lxg-tri-u'+(this.sort_cfg.key == this.data.col[j - 1].name && !this.sort_cfg.sc ? ' active' : '')+'"></div>').data('key', this.data.col[j - 1].name).click(function(){
                        that.sort($(this).data('key'));
                    })
                ).append(
                    // 大到小排序三角
                    $('<div class="lxg-tri-d'+(this.sort_cfg.key == this.data.col[j - 1].name && this.sort_cfg.sc ? ' active' : '')+'"></div>').data('key', this.data.col[j - 1].name).click(function(){
                        that.sort($(this).data('key'), true);
                    })
                ),
                // 列宽调节
                $('<div class="lxg-hdsep" id="' + prefix + 's-0-' + j + '"></div>').data('col', j).mousedown(function(e){
                    var $kono = $(this);
                    var kono_col = $kono.data('col');
                    var sX = e.pageX;
                    var sW = $('#' + prefix + 'g-0-' + kono_col).width();
                    window.onmousemove = function(e){
                        var dX = e.pageX;
                        var dW = dX - sX + sW;
                        that.dis_selected();
                        $('#' + prefix + 'g-0-' + kono_col).width(dW);
                        $(that.frame).find('.col-' + kono_col).width(dW + 2);
                        that.data.col[kono_col - 1].width = INT(dW) + 2;
                        return false;
                    }
                    window.onmouseup = function(e){
                        window.onmousemove = null;
                        that.resize();
                    }
                    return false;
                })
            );
        }
        $(this.header).html($l);
        // 产生行
        $ls = '';
        for(i = 1; i <= this.data.h; i ++){
            // $l = $('<div class="lxg-line" id="' + prefix + 'l-' + i + '"></div>');
            $l = '<div class="lxg-line" id="' + prefix + 'l-' + i + '">';
            if(this.data.primary){
                pri = this.data.row[i - 1].lxg_pri_org;
            }
            for(j = 1; j <= this.data.w; j ++){
                if(this.data.col[j - 1].hide){
                    continue;
                }
                try{
                    if(this.data.col[j - 1].replace){
                        rpval = this.data.col[j - 1].replace(this.data.row[i - 1][this.data.col[j - 1].name], i, j, this);
                    }else{
                        rpval = this.data.row[i - 1][this.data.col[j - 1].name];
                    }
                    if(rpval == undefined){
                        rpval = "";
                    }
                    // 若有颜色配置，则设置对应单元格的颜色
                    if(this.data.col[j - 1].color){
                        c_color = ' color-' + this.data.row[i - 1][this.data.col[j - 1].color];
                    }else{
                        c_color = "";
                    }
                    // 若单元格被修改过，则设置修改过的样式
                    if(this.data.row[i - 1].lxg_atr_apd || (this.modified[pri] && this.modified[pri][this.data.col[j - 1].name] != null)){
                        c_mod = " mod";
                    }else{
                        c_mod = "";
                    }
                    // 若有CSS配置，则设置对应单元格的CSS
                    if(this.data.col[j - 1].css){
                        c_css = this.data.col[j - 1].css(i, j, this);
                    }else{
                        c_css = "";
                    }
                    // $g = $('<div class="lxg-grid col-'+j+c_color+c_mod+'" id="' + prefix + 'g-' + i + '-' + j + '" style="width:'+this.data.col[j - 1].width+'px;">'+rpval+'</div>');
                    // $g = '<div class="lxg-grid col-'+j+c_color+c_mod+'" id="' + prefix + 'g-' + i + '-' + j + '" style="width:'+this.data.col[j - 1].width+'px;'+c_css+'">'+rpval+'</div>';
                    $l += '<div class="lxg-grid col-'+j+c_color+c_mod+'" id="' + prefix + 'g-' + i + '-' + j + '" style="width:'+this.data.col[j - 1].width+'px;'+c_css+'">'+rpval+'</div>';
                    // $l = $l.append($g);
                }catch(e){
                    console.log([e.message, i, j, this.data.row[i]]);
                }
            }
            $ls += $l + '</div>';
            this.size.row[i] = this.size.LN_HEIGHT;
            // $e = $e.append(l);
        }
        $e = $e.append($ls);
        // var date3 = (new Date).getTime();
        // $e.show();
        // console.log(date3 - date2);
        this.resize();
        $(this.footer).find('.count').html(Grid.Lang.sLineStripCount(this.raw_row.length));
        return this;
    }
    Grid.Table.prototype.append_empty = function(n){
        if(!this.priv_apd){
            Win.alert(Grid.Lang.PRIV_APD);
            return;
        }
        var c_mod, c_color, c_css;
        var obj_default = {};
        var rpval;
        var obj;
        var i, j, k, $l, $ls = '';
        if(this.data.empty){
            $.extend(obj_default, this.data.empty);
            for(i in obj_default){
                obj_default[i] = this.data.empty[i];
            }
        }else if(this.data.row.length > 0){
            $.extend(obj_default, this.data.row[0]);
            for(i in obj_default){
                obj_default[i] = "";
            }
        }else{
            for(i in this.data.col){
                obj_default[this.data.col[i].name] = "";
            }
        }
        for(i = 0; i < n; i ++){
            obj = {};
            for(k in obj_default){
                obj[k] = obj_default[k];
            }
            obj.lxg_pri_org = null;
            obj.lxg_atr_apd = true;
            this.data.row.push(obj);
            this.raw_row.push(obj);
            this.appended.push(obj);
            this.hook_map.push(new Array(this.data.col.length));
            this.data.h ++;
            $l = '<div class="lxg-line" id="' + this.prefix + 'l-' + this.data.h + '">';
            for(var j = 1; j <= this.data.w; j ++){
                if(this.data.col[j - 1].hide){
                    continue;
                }
                // 若有颜色配置，则设置对应单元格的颜色
                if(this.data.col[j - 1].color){
                    c_color = ' color-' + obj[this.data.col[j - 1].color];
                }else{
                    c_color = "";
                }
                // 若有CSS配置，则设置对应单元格的CSS
                if(this.data.col[j - 1].css){
                    c_css = this.data.col[j - 1].css(this.data.h, j, this);
                }else{
                    c_css = "";
                }
                // replace规则检查
                if(this.data.col[j - 1].replace){
                    rpval = this.data.col[j - 1].replace(obj[this.data.col[j - 1].name], this.data.row.length, j, this);
                }else{
                    rpval = obj[this.data.col[j - 1].name];
                }
                if(rpval == undefined){
                    rpval = "";
                }
                $l += '<div class="lxg-grid mod col-'+j+c_color+c_mod+'" id="' + this.prefix + 'g-' + this.data.h + '-' + j + '" style="width:'+this.data.col[j - 1].width+'px;'+c_css+'">'+rpval+'</div>';
            }
            $ls += $l + '</div>';
        }
        $(this.element).append($ls);
        // 滚动到底部
        this.resize();
        $(this.footer).find(".lxg-footer-label.count").html(
            Grid.Lang.sLineStripCount(this.raw_row.length)
        );
        if(this.to >= this.raw_row.length - 2){
            this.to = this.raw_row.length - 1;
            $(this.footer).find(".lxg-footer-input.to").val(this.raw_row.length);
        }
        return this;
    }
    /**
     * 向表格添加行
     * @param  ColInfo obj 行数据
     */
    Grid.Table.prototype.append = function(obj){
        if(!this.priv_apd){
            Win.alert(Grid.Lang.PRIV_APD);
            return;
        }
        // obj为空则尝试取data.empty中配置的空行模板
        // 模板不存在则尝试取第一行数据键克隆并将其数据值清空
        if(!obj){
            obj = {};
            if(this.data.empty){
                $.extend(obj, this.data.empty);
            }else if(this.data.row.length > 0){
                $.extend(obj, this.data.row[0]);
                for(var i in obj){ obj[i] = "" }
            }else{
                for(var i in this.data.col){ obj[this.data.col[i].name] = "" }
            }
        }
        // 新建的行未在数据库中拥有索引
        obj.lxg_pri_org = null;
        obj.lxg_atr_apd = true;
        this.data.row.push(obj);
        this.raw_row.push(obj);
        // 建立钩子
        this.hook_map.push(new Array(this.data.col.length));
        this.data.h ++;
        var rpval;
        var $l = $('<div class="lxg-line" id="' + this.prefix + 'l-' + this.data.h + '"></div>');
        var $g;
        for(var j = 1; j <= this.data.w; j ++){
            if(this.data.col[j - 1].hide){
                continue;
            }
            try{
                // replace规则检查
                if(this.data.col[j - 1].replace){
                    rpval = this.data.col[j - 1].replace(obj[this.data.col[j - 1].name], this.data.row.length, j, this);
                }else{
                    rpval = obj[this.data.col[j - 1].name];
                }
                if(rpval == undefined){
                    rpval = "";
                }
                // 创建DOM
                $g = $('<div class="lxg-grid mod" id="' + this.prefix + 'g-' + this.data.h + '-' + j + '" style="width:'+this.data.col[j - 1].width+'px;">'+rpval+'</div>')
                $l = $l.append($g);
                if(this.data.col[j - 1].css){
                    $g.css(this.data.col[j - 1].css(this.data.h, j));
                }
                if(this.data.col[j - 1].color){
                    $g.addClass('color-' + obj[this.data.col[j - 1].color]);
                }
            }catch(e){
                console.log([i, j, obj, e, e.name, e.message, e.stack]);
            }
        }
        $(this.element).append($l);
        this.resize();
        this.appended.push(obj);
        $(this.footer).find(".lxg-footer-label.count").html(
            Grid.Lang.sLineStripCount(this.raw_row.length)
        );
        if(this.to >= this.raw_row.length - 2){
            this.to = this.raw_row.length - 1;
            $(this.footer).find(".lxg-footer-input.to").val(this.raw_row.length);
        }
        return this;
    }
    /**
     * 重新计算尺寸
     */
    Grid.Table.prototype.resize = function(){
        var w = $(this.element).width();
        var h = $(this.element).height();
        var i, $line, $grid;
        var ws = 0, hs = 0;
        for(i = 1; i <= this.data.w; i ++){
            $grid = $('#' + this.prefix + 'g-0-' + i);
            // 隐藏列=0
            if($grid.hasClass('lxg-hide')){
                this.size.col[i] = 0;
            }else if(this.data.col[i - 1].hide){
                this.size.col[i] = 0;
            }else{
                this.size.col[i] = INT($grid.outerWidth()) + 3;
            }
            this.size.col_from[i] = ws;
            ws += this.size.col[i];
            this.size.col_to[i] = ws;
        }
        for(i = 1; i <= this.data.h; i ++){
            $line = $('#' + this.prefix + 'l-' + i);
            if($line.hasClass('lxg-hide')){
                this.size.row[i] = 0;
            }else{
                this.size.row[i] = this.size.LN_HEIGHT;
            }
            this.size.row_from[i] = hs;
            hs += this.size.row[i];
            this.size.row_to[i] = hs;
        }
        this.size.w = ws;
        this.size.h = hs;
        this.$cover.css(
            {
                'width'  : ws + 100,
                'height' : hs
            }
        );
        var wo = $(this.frame).width() - this.size.SC_WIDTH;
        var ho = $(this.frame).height() - this.size.EX_HEIGHT;
        $(this.element).css(
            {
                'width'  : ws + 100, 
                'height' : hs,
                'min-height' : ho,
                'min-width'  : wo
            }
        );
        $(this.header).css(
            {
                'width'  : ws + 100
            }
        );
        this.size.width = $(this.frame).width();
        this.size.height = $(this.frame).height();
        this.scroll.h  = $(this.element).width();
        this.scroll.v  = $(this.element).height();
        this.scroll.ch = wo;
        this.scroll.cv = ho;
        this.scroll.sh = $(this.scroll_h).width();
        this.scroll.sv = $(this.scroll_v).height();
        if(this.scroll.cv >= this.scroll.v){
            this.scroll.bv = this.scroll.sv;
            this.scroll.by = 0;
        }else{
            this.scroll.bv = Math.ceil(this.scroll.cv / this.scroll.v * this.scroll.sv);
            this.scroll.by = Math.ceil(this.scroll.y  / this.scroll.v * this.scroll.sv);
        }
        if(this.scroll.ch >= this.scroll.h){
            this.scroll.bh = this.scroll.sh;
            this.scroll.bx = 0;
        }else{
            this.scroll.bh = Math.ceil(this.scroll.ch / this.scroll.h * this.scroll.sh);
            this.scroll.bx = Math.ceil(this.scroll.x  / this.scroll.h * this.scroll.sh);
        }
        if(this.scroll.x + this.scroll.ch > this.scroll.h){
            this.scroll.x = this.scroll.h - this.scroll.ch; 
            this.scroll.bx = INT(this.scroll.x / this.scroll.h * this.scroll.sh);
        }
        if(this.scroll.y + this.scroll.cv > this.scroll.v){
            this.scroll.y = this.scroll.v - this.scroll.cv; 
            this.scroll.by = INT(this.scroll.y / this.scroll.v * this.scroll.sv);
        }
        this.scroll.$bar_v.css({ 'height' : this.scroll.bv });
        this.scroll.$bar_h.css({ 'width'  : this.scroll.bh });
        return this.apply_scroll_v().apply_scroll_h();
    }
    /**
     * 应用纵向滚动
     */
    Grid.Table.prototype.apply_scroll_v = function(){
        if(this.scroll.y < 0){
            this.scroll.y = 0;
        }
        if(this.scroll.cv >= this.scroll.v){
            this.scroll.bv = this.scroll.sv;
            this.scroll.by = 0;
        }else{
            this.scroll.bv = Math.ceil(this.scroll.cv / this.scroll.v * this.scroll.sv);
            this.scroll.by = Math.ceil(this.scroll.y  / this.scroll.v * this.scroll.sv);
        }
        if(this.scroll.y + this.scroll.cv > this.scroll.v){
            this.scroll.y  = this.scroll.v - this.scroll.cv; 
            this.scroll.by = INT(this.scroll.y / this.scroll.v * this.scroll.sv);
        }
        $(this.element).css({
            'top' : -this.scroll.y + this.size.HD_HEIGHT
        });
        this.scroll.by = INT(this.scroll.y / this.scroll.v * this.scroll.sv);
        this.scroll.$bar_v.css({
            'top' : this.scroll.by
        });
        return this;
    }
    /**
     * 应用横向滚动
     */
    Grid.Table.prototype.apply_scroll_h = function(){
        if(this.scroll.x < 0){
            this.scroll.x = 0;
        }
        if(this.scroll.ch >= this.scroll.h){
            this.scroll.bh = this.scroll.sh;
            this.scroll.bx = 0;
        }else{
            this.scroll.bh = Math.ceil(this.scroll.ch / this.scroll.h * this.scroll.sh);
            this.scroll.bx = Math.ceil(this.scroll.x  / this.scroll.h * this.scroll.sh);
        }
        if(this.scroll.x + this.scroll.ch > this.scroll.h){
            this.scroll.x  = this.scroll.h - this.scroll.ch; 
            this.scroll.bx = INT(this.scroll.x / this.scroll.h * this.scroll.sh);
        }
        $(this.element).css({
            'left' : -this.scroll.x
        });
        $(this.header).css({
            'left' : -this.scroll.x
        });
        this.scroll.bx = INT(this.scroll.x/ this.scroll.h * this.scroll.sh);
        this.scroll.$bar_h.css({
            'left' : this.scroll.bx
        });
        return this;
    }
    /**
     * 滚动到某个格子
     * @param  {int} row
     * @param  {int} col
     * @param  {int} type 0=center, 1=top, 2=bottom
     */
    Grid.Table.prototype.scroll_to = function(row, col, type){
        this.scroll.y = this.size.row_from[row] || 0;
        this.scroll.x = this.size.col_from[col] || 0;
        type = type || 0;
        switch(type){
            case 0:
                this.scroll.y -= this.scroll.cv / 2;
                this.scroll.x -= this.scroll.ch / 2;
                break;
            case 2:
                this.scroll.y -= this.scroll.cv;
                this.scroll.x -= this.scroll.ch;
                break;
            default:
                break;
        }
        return this.apply_scroll_v().apply_scroll_h();
    }
    /**
     * 上滚
     * @param  {int} n 滚动步进
     */
    Grid.Table.prototype.scroll_up = function(n){
        if(this.scroll.cv >= this.scroll.v){
            return this;
        }
        n = n || this.size.STEP_SCROLL_D;
        this.scroll.y -= n;
        if(this.scroll.y < 0){
            this.scroll.y = 0;
        }
        this.scroll.by = INT(this.scroll.y / this.scroll.v * this.scroll.sv);
        return this.apply_scroll_v();
    }
    /**
     * 下滚
     * @param  {int} n 滚动步进
     */
    Grid.Table.prototype.scroll_down = function(n){
        if(this.scroll.cv >= this.scroll.v){
            return this;
        }
        n = n || this.size.STEP_SCROLL_D;
        this.scroll.y += n;
        if(this.scroll.y + this.scroll.cv > this.scroll.v){
            this.scroll.y = this.scroll.v - this.scroll.cv; 
        }
        this.scroll.by = INT(this.scroll.y / this.scroll.v * this.scroll.sv);
        return this.apply_scroll_v();
    }
    /**
     * 左滚
     * @param  {int} n 滚动步进
     */
    Grid.Table.prototype.scroll_left = function(n){
        if(this.scroll.ch >= this.scroll.h){
            return this;
        }
        n = n || this.size.STEP_SCROLL_D;
        this.scroll.x -= n;
        if(this.scroll.x < 0){
            this.scroll.x = 0;
        }
        this.scroll.bx = INT(this.scroll.x / this.scroll.h * this.scroll.sh);
        return this.apply_scroll_h();
    }
    /**
     * 右滚
     * @param  {int} n 滚动步进
     */
    Grid.Table.prototype.scroll_right = function(n){
        if(this.scroll.ch >= this.scroll.h){
            return this;
        }
        n = n || this.size.STEP_SCROLL_D;
        this.scroll.x += n;
        if(this.scroll.x + this.scroll.ch > this.scroll.h){
            this.scroll.x = this.scroll.h - this.scroll.ch; 
        }
        this.scroll.bx = INT(this.scroll.x / this.scroll.h * this.scroll.sh);
        return this.apply_scroll_h();
    }
    /**
     * 取消所有选择
     */
    Grid.Table.prototype.dis_selected = function(){
        var i;
        this.$preview.hide();
        this.$sel_line.hide();
        for(i = 1; i < this.$selected.length; i++){
            this.$selected[i].remove();
        }
        this.$selected.length = 1;
        this.selected.length  = 0;
        if(this.$selected.length > 0){
            this.$selected[0].hide();
        }
        this.$auto.hide();
        return this;
    }
    /**
     * 扩展选区
     * @param  Grid p1 点1
     * @param  Grid p2 点2
     * @param  Grid p3 点3
     * @param  Grid p4 点4
     */
    Grid.Table.prototype.extend_selected = function(p1, p2, p3, p4){
        var rows = [p1.row, p2.row, p3.row, p4.row];
        var cols = [p1.col, p2.col, p3.col, p4.col];
        var row1 = Math.min.apply(null, rows);
        var row2 = Math.max.apply(null, rows);
        var col1 = Math.min.apply(null, cols);
        var col2 = Math.max.apply(null, cols);
        var pos1 = this.get_pos(row1, col1);
        var pos2 = this.get_pos(row2, col2);
        var pot1 = this.get_grid(pos1.x, pos1.y, true);
        var pot2 = this.get_grid(pos2.x, pos2.y);
        return [pot1, pot2];
    }
    /**
     * 格子选区上移
     */
    Grid.Table.prototype.grid_up = function(){
        var row  = this.cursor.row > 1 ? this.cursor.row - 1 : 1;
        var col  = this.cursor.col;
        this.grid_to(row, col);
        if(!this.is_inview(row, col)){
            this.scroll_up(this.size.row[row]);
        }
        return this;
    }
    /**
     * 格子选区下移
     */
    Grid.Table.prototype.grid_down = function(){
        var row  = this.cursor.row < this.data.row.length ? this.cursor.row + 1 : this.data.row.length;
        var col  = this.cursor.col;
        this.grid_to(row, col);
        if(!this.is_inview(row, col)){
            this.scroll_down(this.size.row[row]);
        }
        return this;
    }
    /**
     * 格子选区左移
     */
    Grid.Table.prototype.grid_left = function(){
        var row  = this.cursor.row;
        var col  = this.cursor.col > 1 ? this.cursor.col - 1 : 1;
        this.grid_to(row, col);
        if(!this.is_inview(row, col)){
            this.scroll_left(this.size.col[col]);
        }
        return this;
    }
    /**
     * 格子选区右移
     */
    Grid.Table.prototype.grid_right = function(){
        var row  = this.cursor.row;
        var col  = this.cursor.col < this.data.col.length ? this.cursor.col + 1 : this.data.col.length;
        this.grid_to(row, col);
        if(!this.is_inview(row, col)){
            this.scroll_right(this.size.col[col]);
        }
        return this;
    }
    /**
     * 格子选区移动到某个坐标
     * @param  {int} row1 左上角行
     * @param  {int} col1 左上角列
     * @param  {int} row2 右下角行
     * @param  {int} col2 右下角列
     */
    Grid.Table.prototype.grid_to = function(row1, col1, row2, col2){
        row2 = row2 || row1;
        col2 = col2 || col1;
        var pos1 = this.get_pos(row1, col1, true),
            pos2 = this.get_pos(row2, col2);
        var p1 = new Grid.Grid(pos1.x, pos1.y, col1, row1),
            p2 = new Grid.Grid(pos2.x, pos2.y, col2, row2);
        return this.add_selected(p1, p2);
    }
    /**
     * 格子选区移动到当前cursor描述的位置
     */
    Grid.Table.prototype.show_cursor = function(){
        return this.grid_to(this.cursor.row, this.cursor.col);
    }
    /**
     * 增加选区
     * @param {Grid} p1 左上角
     * @param {Grid} p2 右下角
     */
    Grid.Table.prototype.add_selected = function(p1, p2, multi){
        if(this.data.row.length == 0){
            return this.dis_selected();
        }
        this.cursor.x = p1.x;
        this.cursor.y = p1.y;
        this.cursor.col = p1.col;
        this.cursor.row = p1.row;
        this.$selected[0].show();
        this.$preview.hide().html('');
        var i;
        if(this.keyboard.ctrlKey || multi){
            this.$auto.hide();
            var $s = $('<div class="lxg-selected"></div>');
            this.$selected.push($s);
            $(this.element).append($s);
            $s.css(
                {
                    'left'   : p1.x - 1,
                    'top'    : p1.y - 1,
                    'width'  : p2.x - p1.x - 2,
                    'height' : p2.y - p1.y - 2
                }
            );
            var area = this.calc_selected(p1, p2);
            Array.prototype.push.apply(this.selected, area);
            this.tips_footer(Grid.Lang.sAfterSelectMulti(this.selected.length));
        }else if(this.keyboard.shiftKey){
            var area_sorted = Grid.area_sort(this.selected);
            var area_extend = this.extend_selected(area_sorted[0], area_sorted[area_sorted.length - 1], p1, p2);
            for(i = 1; i < this.$selected.length; i++){
                this.$selected[i].remove();
            }
            this.$selected.length = 1;
            this.$selected[0].css(
                {
                    'left'   : area_extend[0].x - 1,
                    'top'    : area_extend[0].y - 1,
                    'width'  : area_extend[1].x - area_extend[0].x - 3,
                    'height' : area_extend[1].y - area_extend[0].y - 3
                }
            );
            this.$auto.show().css(
                {
                    'left'   : area_extend[1].x - 5,
                    'top'    : area_extend[1].y - 5
                }
            );
            this.selected.length = 0;
            this.selected = this.calc_selected(area_extend[0], area_extend[1]);
            this.cursor.row = area_extend[1].row;
            this.cursor.col = area_extend[1].col;
            var pos = this.get_pos(area_extend[1].row, area_extend[1].col);
            this.cursor.x = pos.x;
            this.cursor.y = pos.y;
            this.tips_footer(Grid.Lang.sAfterSelectBlock(this.selected[0].row, this.selected[0].col, this.selected[this.selected.length - 1].row, this.selected[this.selected.length - 1].col, this.selected.length));
        }else{
            for(i = 1; i < this.$selected.length; i++){
                this.$selected[i].remove();
            }
            this.$selected.length = 1;
            this.$selected[0].css(
                {
                    'left'   : p1.x - 1,
                    'top'    : p1.y - 1,
                    'width'  : p2.x - p1.x - 3,
                    'height' : p2.y - p1.y - 3
                }
            );
            this.$auto.show().css(
                {
                    'left'   : p2.x - 5,
                    'top'    : p2.y - 5
                }
            );
            this.selected.length = 0;
            this.selected = this.calc_selected(p1, p2);
            this.cursor.row = p1.row,
            this.cursor.col = p1.col;
            this.cursor.x = p1.x;
            this.cursor.y = p1.y;
            var $og = $('#' + this.prefix + 'g-' + p1.row + '-' + p1.col);
            var og_html = $og.html();
            if(this.selected.length == 1){
                this.$sel_line.css({
                    'left'   : 0,
                    'top'    : this.size.row_from[p1.row],
                    'width'  : this.size.col_to[this.size.col_to.length - 1],
                    'height' : this.size.LN_HEIGHT
                }).show();
            }else{
                this.$sel_line.hide();
            }
            if(this.selected.length == 1 && og_html.length > 0){
                this.$preview.css({
                    'left'   : p1.x,
                    'top'    : p1.y
                }).html($og.html()).css(
                    {
                        'margin'     : $og.css('margin'),
                        'font-size'  : $og.css('font-size'),
                        'color'      : $og.css('color'),
                        'min-width'  : $og.css('width')
                    }
                ).show();
                this.tips_footer(Grid.Lang.sRowCol(p1.row, p1.col));
            }else{
                this.tips_footer(Grid.Lang.sAfterSelect(this.selected.length));
            }
        }
        this.selected = Grid.area_dedup(this.selected);
        var last_row = this.selected[0].row;
        var xls      = this.get_val(this.selected[0].row, this.selected[0].col) + '';
        for(i = 1; i < this.selected.length; i++){
            if(this.selected[i].row != last_row){
                last_row = this.selected[i].row;
                xls += "\n";
            }else{
                xls += "\t";
            }
            xls += this.get_val(this.selected[i].row, this.selected[i].col);
        }
        return this.ctrl_pos_set(this.data.col[this.cursor.col - 1].display + ' : ' + this.data.row[this.cursor.row - 1][this.data.primary]).ctrl_arg_set(xls);
    }
    /**
     * 增加一列选区
     * @param {int} col
     */
    Grid.Table.prototype.add_selected_col = function(col){
        if(this.data.row.length == 0){
            return this.dis_selected();
        }
        if(col <= 0 || col > this.data.col.length){
            return this;
        }
        // 左上
        var p1 = new Grid.Grid(
            this.size.col_from[col], 
            0, 
            col, 
            1
        );
        // 右下
        var p2 = new Grid.Grid(
            this.size.col_to[col], 
            this.size.row_to[this.data.row.length],
            col,
            this.data.row.length
        );
        return this.add_selected(p1, p2);
    }
    /**
     * 全选
     */
    Grid.Table.prototype.all_selected = function(){
        if(this.data.row.length == 0){
            return this.dis_selected();
        }
        var p1 = new Grid.Grid(
            0, 
            0, 
            1, 
            1
        );
        var p2 = new Grid.Grid(
            this.size.col_to[this.data.col.length], 
            this.size.row_to[this.data.row.length],
            this.data.col.length,
            this.data.row.length
        );
        return this.add_selected(p1, p2);
    }
    /**
     * 坐标是否在可视区域内
     * @param  {int}  row 
     * @param  {int}  col 
     * @return {Boolean}
     */
    Grid.Table.prototype.is_inview = function(row, col){
        if(row < 1){
            return false;
        }else if(row > this.data.row.length){
            return false;
        }
        if(col < 1){
            return false;
        }else if(col > this.data.col.length){
            return false;
        }
        return  this.is_visible(
                    this.size.col_from[col], 
                    this.size.row_from[row]) && 
                this.is_visible(this.size.col_to[col], 
                    this.size.row_to[row]);
    }
    /**
     * 某个点是否在可视区域内
     * @param  {int}  x 
     * @param  {int}  y 
     * @return {Boolean}  
     */
    Grid.Table.prototype.is_visible = function(x, y){
        return  x >= this.scroll.x &&
                x <= this.scroll.x + this.scroll.ch &&
                y >= this.scroll.y &&
                y <= this.scroll.y + this.scroll.cv;
    }
    /**
     * 检查行是否合法，否则返回合法行
     * @param  {int} row
     */
    Grid.Table.prototype.check_row = function(row){
        if(row < 1){
            row = 0;
        }else if(row > this.data.row.length){
            row = this.data.row.length;
        }
        return row;
    }
    /**
     * 检查列是否合法，否则返回合法列
     * @param  {int} col
     */
    Grid.Table.prototype.check_col = function(col){
        if(col < 1){
            col = 0;
        }else if(col > this.data.col.length){
            col = this.data.col.length;
        }
        while(this.data.col[col - 1].hide && col > 0){
            col --;
        }
        while(this.data.col[col - 1].hide && col < this.col.length){
            col ++;
        }
        return col;
    }
    /**
     * 编辑某单元格
     * @param  {int} p1    左上角
     * @param  {int} p2    右下角
     * @param  {boolean} clear 编辑前是否清空
     */
    Grid.Table.prototype.edit = function(p1, p2, clear){
        if(this.editing && this.editing.element){
            try{
                this.editing.element.remove();
            }catch(e){
                console.log([e.message, p1, p2]);
            }
        }
        this.dis_selected();
        this.cursor.row = p1.row;
        this.cursor.col = p1.col;
        this.cursor.x = p1.x;
        this.cursor.y = p1.y;
        if(this.data.col[p1.col - 1].locked){
            return this;
        }
        if(this.data.col[p1.col - 1].callback){
            this.data.col[p1.col - 1].callback(this, p1.row, p1.col);
        }
        if(this.data.col[p1.col - 1].select){
            this.edit_select(p1, p2);
        }else{
            this.edit_text(p1, p2, clear);
        }
        return this;
    }
    /**
     * 编辑某坐标
     * @param  {int} row    行
     * @param  {int} col    列
     * @param  {boolean} clear 编辑前是否清空
     */
    Grid.Table.prototype.edit_grid = function(row, col, clear){
        if(!this.priv_mdf){ 
            Win.alert(Grid.Lang.PRIV_MDF);
            return this;
        }
        var pos = this.get_pos(row, col);
        var p1  = this.get_grid(pos.x, pos.y, true);
        var p2  = this.get_grid(pos.x, pos.y);
        this.edit(p1, p2, clear); 
        return this;
    }
    /**
     * 以列表形式编辑某单元格
     * @param  {int} p1
     * @param  {int} p2
     */
    Grid.Table.prototype.edit_select = function(p1, p2){
        this.editing = p1;
        var $e = $('<select class="lxg-edit-select"></select>');
        var sd = typeof this.data.col[p1.col - 1].select == "function" ? this.data.col[p1.col - 1].select(p1.row, p1.col, this) : this.data.col[p1.col - 1].select;
        var i;
        for(i in sd){
            $e = $e.append(
                $('<option value="'+sd[i].value+'">' + sd[i].display + '</option>')
            );
        }
        this.editing.element = $e;
        $e.val(this.get_val(p1.row, p1.col));
        $(this.element).append($e);
        this.mouse.override = true;
        $e.css(
            {
                'left'       : p1.x - 1,
                'top'        : p1.y - 1,
                'width'      : p2.x - p1.x,
                'height'     : p2.y - p1.y
            }
        ).focus().blur(function(e){
            var edit_data = $(this).data('edit-text-data');
            edit_data.tab.editing = null;
            edit_data.tab.set_val(edit_data.row, edit_data.col, $(this).val());
            edit_data.tab.mouse.override = false;
            var that = $(this);
            setTimeout(function(){
                that.remove();
            }, 20)
        }).change(function(e){
            var edit_data = $(this).data('edit-text-data');
            edit_data.tab.mouse.override = true;
        }).data('edit-text-data', {
            'row' : p1.row,
            'col' : p1.col,
            'tab' : this
        });
        return this;
    }
    /**
     * 编辑框形式编辑某单元格
     * @param  {int} p1
     * @param  {int} p2
     * @param  {boolean} clear 编辑前是否清空
     */
    Grid.Table.prototype.edit_text = function(p1, p2, clear){
        this.editing = p1;
        var $e = $('<textarea class="lxg-edit-text"></textarea>');
        if(!clear){
            $e.val(this.get_val(p1.row, p1.col));
        }
        $(this.element).append($e);
        this.editing.element = $e;
        this.mouse.override = true;
        this.keyboard.override = true;
        $e.css(
            {
                'left'       : p1.x - 1,
                'top'        : p1.y - 1,
                'width'      : p2.x - p1.x - 3,
                'height'     : p2.y - p1.y - 3
            }
        ).focus().blur(function(e){
            var edit_data = $(this).data('edit-text-data');
            edit_data.tab.editing = null;
            edit_data.tab.set_val(edit_data.row, edit_data.col, $(this).val());
            edit_data.tab.mouse.override = false;
            edit_data.tab.keyboard.override = false;
            var that = $(this);
            setTimeout(function(){
                that.remove();
            }, 20)
        }).data('edit-text-data', {
            'row' : p1.row,
            'col' : p1.col,
            'tab' : this
        }).keydown(function(e){
            if(e.keyCode != Grid.Keyboard.KEY_ESC){
                return;
            }
            var edit_data = $(this).data('edit-text-data');
            edit_data.tab.editing = null;
            $(this).unbind();
            edit_data.tab.mouse.override = false;
            var that = $(this);
            edit_data.tab.show_cursor();
            setTimeout(function(){
                that.remove();
            }, 20)
        });
        return this;
    }
    /**
     * 弹出右键菜单
     * @param  {int} x
     * @param  {int} y
     */
    Grid.Table.prototype.popup = function(x, y){
        this.on_menu = true;
        x = x || this.mouse.clickX;
        y = y || this.mouse.clickY;
        var w = this.$menu.width();
        var h = this.$menu.height();
        if(this.scroll.x + this.scroll.ch < x + w){
            x -= w;
        }
        if(this.scroll.y + this.scroll.cv - this.size.HD_HEIGHT < y + h){
            y -= h;
        }
        this.$menu.show().css(
            {
                'left' : x,
                'top'  : y
            }
        );
        return this;
    }
    /**
     * 关闭右键菜单
     */
    Grid.Table.prototype.pdown = function(){
        this.$menu.hide();
        this.on_menu = false;
        return this;
    }
    /**
     * 获取某坐标单元格的显示值
     * @param  {int} row
     * @param  {int} col
     * @return {String} 
     */
    Grid.Table.prototype.get_display = function(row, col){
        return $('#' + this.prefix + 'g-' + row + '-' + col).html();
    }
    /**
     * 获取某坐标单元格的实际值
     * @param  {int} row
     * @param  {int} col
     * @return {String} 
     */
    Grid.Table.prototype.get_val = function(row, col){
        return this.data.row[row - 1][this.data.col[col - 1].name];
    }
    /**
     * 设置某坐标单元格的值
     * @param  {int} row
     * @param  {int} col
     * @param  {String} val
     * @param  {boolean} undo
     * @return {String} 
     */
    Grid.Table.prototype.set_val = function(row, col, val, undo){
        var oldVal = this.get_val(row, col);
        var $g, i, rpval;
        if(oldVal == val){
            return false;
        }
        if(this.data.col[col - 1].set){
            val = this.data.col[col - 1].set(val);
        }
        this.data.row[row - 1][this.data.col[col - 1].name] = val;
        for(i = 0; i < this.data.col.length; i ++){
            if(this.data.col[i].color && this.data.col[i].color == this.data.col[col - 1].name){
                this.set_color(row, i + 1, val);
            }
        }
        if(this.data.primary && this.data.row[row - 1].lxg_pri_org){
            var primary = this.data.row[row - 1].lxg_pri_org;
            if(!this.modified[primary]){
                this.modified[primary] = {};
            }
            this.modified[primary][this.data.col[col - 1].name] = val;
        }
        if(this.data.col[col - 1].replace){
            rpval = this.data.col[col - 1].replace(val, row, col, this);
        }else{
            rpval = val;
        }
        if(rpval == undefined){
            rpval = val;
        }
        try{
            $g = $('#' + this.prefix + 'g-' + row + '-' + col).html(rpval).addClass('mod');
            if(this.data.col[col - 1].color){
                $g.addClass('color-' + this.data.row[row - 1][this.data.col[col - 1].color]);
            }
            if(this.data.col[col - 1].css){
                $g.attr('style', $g.attr('style') + this.data.col[col - 1].css(row, col, this));
            }
            this.data.row[row - 1][this.data.col[col - 1].name];
            if(!undo){
                this.editStack.push({
                    'type' : 'edit',
                    'row'  : row,
                    'col'  : col,
                    'old'  : oldVal,
                    'new'  : val
                });
            }
        }catch(e){
            console.log([row, col, val]);
        }
        try{
            if(this.hook_map[row - 1][col - 1] && this.hook_map[row - 1][col - 1] instanceof Array){
                for(i in this.hook_map[row - 1][col - 1]){
                    try{
                        this.hook_map[row - 1][col - 1][i].func(val, row, col);
                    }catch(e_hook2){
                        console.log([e_hook2.message, row, col]);
                    }
                }
            }
        }catch(e_hook1){
            console.log([e_hook1.message, row, col]);
        }
        return true;
    }
    Grid.Table.prototype.set_hook = function(row, col, func, name){
        name = name || Math.random();
        if(this.hook_map[row - 1][col - 1]){
            if(!this.hook_map[row - 1][col - 1] instanceof Array){
                this.hook_map[row - 1][col - 1] = [];
            }
        }else{
            this.hook_map[row - 1][col - 1] = [];
        }
        this.hook_map[row - 1][col - 1].push({
            name : name,
            func : func
        });
        return name;
    }
    Grid.Table.prototype.unset_hook = function(row, col, name){
        var new_hook_array = [];
        if(this.hook_map[row - 1][col - 1] && this.hook_map[row - 1][col - 1] instanceof Array){
            for(i in this.hook_map[row - 1][col - 1]){
                if(this.hook_map[row - 1][col - 1][i].name != name){
                    new_hook_array.push(this.hook_map[row - 1][col - 1][i]);
                }
            }
            this.hook_map[row - 1][col - 1] = new_hook_array;
            return true;
        }else{
            return false;
        }
    }
    /**
     * 设置某单元格颜色
     * @param {int} row
     * @param {int} col
     * @param {int} color 颜色序号[0-5]
     */
    Grid.Table.prototype.set_color = function(row, col, color){
        $('#' + this.prefix + 'g-' + row + '-' + col).removeClass('color-0').removeClass('color-1').removeClass('color-2').removeClass('color-3').removeClass('color-4').removeClass('color-5').addClass('color-' + color);
        return this;
    }
    /**
     * 设置某区域的数据
     * @param {Array} data
     * @param {Array} area
     */
    Grid.Table.prototype.set_data = function(data, area){
        var i = 0, j = 0;
        var old_val = [];
        while(j < area.length){
            old_val.push(this.get_val(area[j].row, area[j].col));
            this.set_val(area[j].row, area[j].col, data[i], true);
            i++;
            j++;
            if(i >= data.length){
                i = 0;
            }
        }
        this.editStack.push({
            'type' : 'set',
            'old'  : old_val,
            'new'  : data,
            'area' : area
        });
        return this;
    }
    Grid.Table.prototype.undo = function(row, col){
        if(this.editStack.length < 1){
            return;
        }
        var edit_record = this.editStack[this.editStack.length - 1];
        switch(edit_record.type){
            case 'edit':
                this.set_val(edit_record.row, edit_record.col, edit_record.old, true);
                break;
            default:
                break;
        }
        this.editStack.length = this.editStack.length - 1;
        return this;
    }
    Grid.Table.prototype.calc_selected = function(p1, p2){
        var i, j, area = [];
        for(i = p1.row; i <= p2.row; i++){
            if(this.size.row[i] <= 0){
                continue;
            }
            for(j = p1.col; j <= p2.col; j++){
                if(this.size.col[j] <= 0){
                    continue;
                }
                area.push({col:j, row:i});
            }
        }
        return area;
    }
    Grid.Table.prototype.get_grid = function(x, y, rv){
        var i = 1, 
            j = 1, 
            lc = this.data.col.length, 
            lr = this.data.row.length;
        while(this.size.col_to[i] < x && i < lc){ i ++; }
        while(this.size.row_to[j] < y && j < lr){ j ++; }
        if(this.size.col_to[i] < x){
            while(i > 0 && this.size.col[i] <= 0){
                i --;
            }
        }
        if(this.size.row_to[j] < y){
            while(j > 0 && this.size.row[j] <= 0){
                j --;
            }
        }
        return new Grid.Grid(
            rv ? this.size.col_from[i] : this.size.col_to[i],
            rv ? this.size.row_from[j] : this.size.row_to[j],
            i,
            j
        );
    }
    Grid.Table.prototype.get_pos = function(row, col, lt){
        if(lt){
            return new Grid.Pos(
                this.size.col_from[col],
                this.size.row_from[row]
            );
        }else{
            return new Grid.Pos(
                this.size.col_to[col],
                this.size.row_to[row]
            );
        }
    }
    Grid.Table.prototype.hide_row = function(n){
        $('#' + this.prefix + 'l-' + n).addClass('lxg-hide');
        this.resize();
    }
    Grid.Table.prototype.hide_col = function(n){
        var i;
        for(i = 0; i <= this.data.h; i++){
            $('#' + this.prefix + 'g-' + i + '-' + n).addClass('lxg-hide');
        }
        this.resize();
        return this;
    }
    Grid.Table.prototype.show_row = function(n){
        $('#' + this.prefix + 'l-' + n).removeClass('lxg-hide');
        this.resize();
        return this;
    }
    Grid.Table.prototype.show_col = function(n){
        var i;
        for(i = 0; i <= this.data.h; i++){
            $('#' + this.prefix + 'g-' + i + '-' + n).removeClass('lxg-hide');
        }
        this.resize();
        return this;
    }
    Grid.Table.prototype.remove_rows = function(rows){
        if(!this.priv_del){
            Win.alert(Grid.Lang.PRIV_DEL);
            return this;
        }
        var i;
        for(i = 0; i < rows.length; i ++){
            if(this.data.row[rows[i] - 1].lxg_pri_org){
                this.removed.push(this.data.row[rows[i] - 1].lxg_pri_org);
            }
            this.data.row[rows[i] - 1].lxg_removed = true;
        }
        var new_row = [];
        var new_appended = [];
        for(i = 0; i < this.raw_row.length; i ++){
            if(this.raw_row[i].lxg_removed){
                continue;
            }
            new_row.push(this.raw_row[i]);
        }
        for(i = 0; i < this.appended.length; i ++){
            if(this.appended[i].lxg_removed){
                continue;
            }
            new_appended.push(this.appended[i]);
        }
        this.raw_row = new_row;
        this.appended = new_appended;
        this.refresh();
        $(this.footer).find(".lxg-footer-label.count").html(
            Grid.Lang.sLineStripCount(this.raw_row.length)
        );
        return this;
    }
    Grid.Table.prototype.replace  = function(src, dst, area, cfg){
        var i = 0, j = 0, old_val, new_val, replaced = 0;
        var t = "/" + src + "/g";
        if(cfg){
            if(cfg.i){
                t += "i";
            }
        }
        var p = eval(t);
        while(j < area.length){
            old_val = this.get_val(area[j].row, area[j].col) + "";
            new_val = old_val.replace(p, dst);
            if(this.set_val(area[j].row, area[j].col, new_val, true)){
                replaced ++;
            }
            j++;
        }
        return replaced;
    }
    Grid.Table.prototype.sort = function(key, reversed, no_refresh){
        var i;
        this.sort_cfg.key = key;
        this.sort_cfg.sc  = reversed;
        if(reversed){
            this.raw_row = this.raw_row.sort(function(a, b){
                var c = INT(a[key]);
                var d = INT(b[key]);
                if(isNaN(c) || isNaN(d)){
                    if(b[key] > a[key]){
                        return 1;
                    }else if(b[key] == a[key]){
                        return 0;
                    }else{
                        return -1;
                    }
                }else{
                    if(d > c){
                        return 1;
                    }else if(d == c){
                        return 0;
                    }else{
                        return -1;
                    }
                }
            });
        }else{
            this.raw_row = this.raw_row.sort(function(a, b){
                var c = INT(a[key]);
                var d = INT(b[key]);
                if(isNaN(c) || isNaN(d)){
                    if(b[key] < a[key]){
                        return 1;
                    }else if(b[key] == a[key]){
                        return 0;
                    }else{
                        return -1;
                    }
                }else{
                    if(d < c){
                        return 1;
                    }else if(d == c){
                        return 0;
                    }else{
                        return -1;
                    }
                }
            });
        }
        if(!no_refresh){
            this.refresh();
        }
        var display = key;
        for(i = 0; i < this.data.col.length; i++){
            if(this.data.col[i].name == key && this.data.col[i].display){
                display = this.data.col[i].display;
                break;
            }
        }
        this.tips_footer(Grid.Lang.sAfterSort(display, reversed));
        return this;
    }
    Grid.Table.prototype.auto_fill = function(){
        if(!this.autoFill || this.autoFill.length < 2){
            return false;
        }
        if(this.selected.length == 0){
            return false;
        }
        var area_ext = this.calc_selected(this.autoFill[0], this.autoFill[1]);
        if(area_ext.length == 0){
            return;
        }
        if(area_ext.length == this.selected){
            return false;
        }
        var area_minused = Grid.area_minus(area_ext, this.selected);
        if( area_ext[0].col == this.selected[0].col &&
            area_ext[0].row == this.selected[0].row){
            var i, j = 0;
            var d = 0;
            var val_org = this.get_val(
                this.selected[this.selected.length - 1].row, 
                this.selected[this.selected.length - 1].col
            );
            if(this.selected.length > 1){
                d = this.get_val(
                    INT(this.selected[1].row), 
                    INT(this.selected[1].col)
                ) - this.get_val(
                    INT(this.selected[0].row), 
                    INT(this.selected[0].col)
                );
                if(d != 0 && !isNaN(d)){
                    val_org = INT(val_org);
                }else{
                    d = 0;
                }
            }
            for(i = 0; i < area_minused.length; i ++){
                if(d != 0){
                    val_org += d;
                }else{
                    val_org = this.get_val(
                        this.selected[j].row, 
                        this.selected[j].col
                    );
                    j ++;
                    if(j >= this.selected.length){
                        j = 0;
                    }
                }
                this.set_val(area_minused[i].row, area_minused[i].col, val_org);
            }
        }else{
            var i, j = this.selected.length - 1;
            var d = 0;
            var val_org = this.get_val(
                this.selected[0].row, 
                this.selected[0].col
            );
            if(this.selected.length > 1){
                d = this.get_val(
                    INT(this.selected[this.selected.length - 2].row), 
                    INT(this.selected[this.selected.length - 2].col)
                ) - this.get_val(
                    INT(this.selected[this.selected.length - 1].row), 
                    INT(this.selected[this.selected.length - 1].col)
                );
                if(d != 0 && d != NaN){
                    val_org = INT(val_org);
                }else{
                    d = 0;
                }
            }
            for(i = area_minused.length - 1; i >= 0; i --){
                if(d != 0){
                    val_org += d;
                }else{
                    val_org = this.get_val(
                        this.selected[j].row, 
                        this.selected[j].col
                    );
                    j --;
                    if(j < 0){
                        j = this.selected.length - 1;
                    }
                }
                this.set_val(area_minused[i].row, area_minused[i].col, val_org);
            }
        }
        this.add_selected(this.autoFill[0], this.autoFill[1]);
        this.tips_footer(Grid.Lang.sAfterFill(area_minused.length));
        return this;
    }
    Grid.Table.prototype.tips_footer = function(str){
        $(this.footer).find('.lxg-footer-tips').html(str);
        return this;
    }
    Grid.Table.prototype.ctrl_pos_set = function(str){
        this.$ctrl_pos.val(str).blur();
        return this;
    }
    Grid.Table.prototype.ctrl_pos_get = function(str){
        return this.$ctrl_pos.val();
    }
    Grid.Table.prototype.ctrl_arg_set = function(str){
        this.$ctrl_arg.val(str).blur();
        return this;
    }
    Grid.Table.prototype.ctrl_arg_get = function(str){
        return this.$ctrl_arg.val();
    }
    Grid.Table.prototype.set_title = function(str){
        $(this.toolbar).find('.lxg-tbmenu-title').html(str);
        return this;
    }
    Grid.Table.prototype.act_fullscreen = function(){
        if(this.visi.fullscreen){
            $(this.frame).removeClass('lxg-fullscreen').css({
                'width'  : this.visi.width,
                'height' : this.visi.height
            });
            this.visi.fullscreen = false;
        }else{
            this.visi.width  = $(this.frame).width();
            this.visi.height = $(this.frame).height();
            $(this.frame).addClass('lxg-fullscreen').css({
                'width'  : $(window).width(),
                'height' : $(window).height()
            });
            this.visi.fullscreen = true;
        }
        this.refresh();
        return this;
    }
    Grid.Table.prototype.act_edit = function($m){
        this.edit_grid(this.selected[0].row, this.selected[0].col);
        return this;
    }
    Grid.Table.prototype.act_copy = function($m){
        if(this.selected.length < 1){
            Win.alert(Grid.Lang.sNoSelected());
            return this;
        }
        var data = [];
        for(var i in this.selected){
            data.push(this.get_val(this.selected[i].row, this.selected[i].col));
        }
        this.clipBoard = {
            type : 'grid',
            data : data
        };
        this.tips_footer(Grid.Lang.sAfterCopy(data.length));
        return this;
    }
    Grid.Table.prototype.act_paste = function($m){
        if(!this.clipBoard){
            return this;
        }
        this.$preview.hide();
        switch(this.clipBoard.type){
            case 'grid':
                this.set_data(this.clipBoard.data, this.selected);
                this.tips_footer(Grid.Lang.sAfterPaste(this.clipBoard.data.length, this.selected.length));
                break;
            default:
                break;
        }
        return this;
    }
    Grid.Table.prototype.act_replce = function($m){
        this.replaceAction();
        return this;
    }
    Grid.Table.prototype.act_clear = function($m){
        this.set_data([''], this.selected);
        this.$preview.hide();
        return this;
    }
    Grid.Table.prototype.act_col_auto_fill = function($m){
        if(!this.cursor){
            return this;
        }
        if(this.cursor.col == 0){
            return this;
        }
        this.autoFill = [
            this.cursor,
            new Grid.Grid(
                0, 0,
                this.cursor.col,
                this.data.row.length
            )
        ];
        this.auto_fill();
        return this;
    }
    Grid.Table.prototype.act_copy_excel = function($m){
        var i;
        if(this.selected.length < 1){
            Win.alert(Grid.Lang.sNoSelected());
            return this;
        }
        var area     = Grid.area_sort(this.selected);
        var last_row = area[0].row;
        var xls      = this.get_val(area[0].row, area[0].col) + '';
        for(i = 1; i < area.length; i++){
            if(area[i].row != last_row){
                last_row = area[i].row;
                xls += "\n";
            }else{
                xls += "\t";
            }
            xls += this.get_val(area[i].row, area[i].col);
        }
        Win.quest(Grid.Lang.sCopyToExcel(), null, xls, null, Grid.Lang.COPY).find('textarea')[0].select();
        return this;
    }
    Grid.Table.prototype.act_paste_excel = function($m){
        var that = this;
        Win.quest(Grid.Lang.sCopyFromExcel(), function(xls){
            var lines = xls.split("\n"),
                data  = [],
                li, gs, g;
            for(li in lines){
                if(lines[li] == ""){ continue; }
                gs = lines[li].split("\t");
                for(g in gs){ data.push(gs[g]); }
            }
            that.$preview.hide();
            that.set_data(data, that.selected);
            that.tips_footer(Grid.Lang.sAfterPaste(data.length, that.selected.length));
        }, null, null, Grid.Lang.PASTE);
        return this;
    }
    Grid.Table.prototype.act_apply_arg = function(){
        var xls = this.ctrl_arg_get(),
            lines, li, gs, g,
            data;
        if(xls.length == 0){
            this.act_clear();
            return this;
        }
        lines = xls.split("\n");
        data  = [];
        for(li in lines){
            if(lines[li] == ""){ continue; }
            gs = lines[li].split("\t");
            for(g in gs){ data.push(gs[g]); }
        }
        this.$preview.hide();
        this.set_data(data, this.selected);
        return this;
    }
    Grid.Table.prototype.act_search_in_cur_col = function(from){
        var key = this.$ctrl_search.val();
        if(key.length < 1){
            return this;
        }
        var col = this.cursor.col,
            col_name = this.data.col[col - 1].name,
            i = from || 0;
        for(; i < this.data.row.length; i++){
            if(this.data.row[i][col_name].indexOf(key) >= 0){
                this.col_search_ptr = i;
                this.grid_to(i + 1, col);
                this.scroll_to(i + 1, col);
                return this;
            }
        }
        return this;
    }
    Grid.Table.prototype.act_search_as_filter = function(){
        this.filter = {};
        this.filter[this.data.col[this.cursor.col - 1].name] = [[Grid.Lang.OPT_IN, this.$ctrl_search.val()]];
        this.apply_filter();
        this.refresh();
        this.dis_selected();
        return this;
    }
    Grid.Table.prototype.act_new_line = function($m){
        this.append_empty(INT($m.find('input').val()));
        this.scroll_down(this.scroll.v);
        return this;
    }
    Grid.Table.prototype.act_clone_line = function($m){
        if(this.selected.length < 1){
            Win.alert(Grid.Lang.sNoSelected());
            return this;
        }
        var rows = Grid.area_rows(this.selected);
        var i, obj;
        for(i = 0; i < rows.length; i++){
            obj = {};
            $.extend(obj, this.data.row[rows[i] - 1]);
            if(this.data.primary){
                obj[this.data.primary] = null;
            }
            this.append(obj);
        }
        this.scroll_down(this.scroll.v);
        return this;
    }
    Grid.Table.prototype.act_del_line = function($m){
        if(this.selected.length < 1){
            if(window.Win){
                Win.alert(Grid.Lang.sNoSelected());
            }
            return this;
        }
        this.remove_rows(Grid.area_rows(this.selected));
        return this;
    }
    Grid.Table.prototype.act_page_showall = function($m){
        $m.parent().find('.lxg-footer-input.from').val(1);
        $m.parent().find('.lxg-footer-input.to').val(this.raw_row.length);
        this.act_page_jump($m);
        return this;
    }
    Grid.Table.prototype.act_page_jump = function($m){
        var from  = INT($m.parent().find('.lxg-footer-input.from').val());
        var to    = INT($m.parent().find('.lxg-footer-input.to').val());
        if(from < 1 || from > this.raw_row.length){
            from = 1;
            $m.parent().find('.lxg-footer-input.from').val(1);
        }
        if(from > this.raw_row.length){
            from = this.raw_row.length;
            $m.parent().find('.lxg-footer-input.from').val(from);
        }
        if(to > this.raw_row.length){
            to = this.raw_row.length;
            $m.parent().find('.lxg-footer-input.to').val(to);
        }
        this.from = from - 1;
        this.to   = to - 1;
        this.refresh();
        return this;
    }
    Grid.Table.prototype.act_page_prev = function($m){
        var $from = $m.parent().find('.lxg-footer-input.from');
        var $to   = $m.parent().find('.lxg-footer-input.to');
        var from  = INT($from.val());
        var to    = INT($to.val());
        var d     = to - from + 1;
        if(from <= 1){
            return this;
        }
        from -= d;
        to   -= d;
        if(from < 1){
            from = 1;
        }
        if(to < from){
            to = from + d - 1;
        }
        if(to > this.raw_row.length){
            to = this.raw_row.length;
        }
        if(from > this.raw_row.length){
            from = this.raw_row.length;
        }
        $from.val(from);
        $to.val(to);
        this.from = from - 1;
        this.to   = to - 1;
        this.refresh();
        return this;
    }
    Grid.Table.prototype.act_page_next = function($m){
        var $from = $m.parent().find('.lxg-footer-input.from');
        var $to   = $m.parent().find('.lxg-footer-input.to');
        var from  = INT($from.val());
        var to    = INT($to.val());
        var d     = to - from + 1;
        if(to > this.raw_row.length){
            return this;
        }
        from += d;
        to   += d;
        if(to > this.raw_row.length){
            to = this.raw_row.length;
        }
        if(from > this.raw_row.length){
            from = this.raw_row.length;
        }
        if(from == to){
            from -= d;
        }
        if(from < 1){
            from = 1;
        }
        $from.val(from);
        $to.val(to);
        this.from = from - 1;
        this.to   = to - 1;
        this.refresh();
        return this;
    }
    Grid.Table.prototype.detailAction = function(){
        var that = this;
        // 如没有选中空格，则新建行
        if(that.selected.length == 0){
            that.append_empty(1).scroll_down(that.scroll.v);
            that.cursor = new Grid.Grid(
                1,
                that.size.row_to[that.size.row_from.length - 1] + 1,
                1, that.data.row.length);
        }
        var row  = this.cursor.row;
        var data = this.data.row[row - 1];
        var $d = $('<div class="lxg-detail-area"></div>').css(
            {
                width  : Win.scrW * 0.5,
                height : Win.scrH * 0.5
            }
        );
        var i, j, $i, $e, col, hooks = [], id, sels;
        for(i = 0; i < this.data.col.length; i ++){
            col = this.data.col[i];
            if(col.select){
                if(typeof col.select == 'function'){
                    sels = col.select(this.cursor.row, i+1, this);
                }else{
                    sels = col.select;
                }
                $e = $('<select class="lxselect"></select>').data('col', i+1).data('row', this.cursor.row).change(function(){
                    var col = INT($(this).data('col'));
                    that.set_val(row, col, $(this).val());
                });
                if(typeof col.select == 'function'){
                    $e.mousedown(function(){
                        var c   = INT($(this).data('col'));
                        var r   = INT($(this).data('row'));
                        var v   = $(this).val();
                        var sss = that.data.col[c - 1].select(r, c, that);
                        var s;
                        $(this).html('');
                        for(s in sss){
                            $(this).append('<option value="'+sss[s].value+'">'+sss[s].display+'</option>');
                        }
                        $(this).val(v);
                    });
                }
                for(j in sels){
                    $e.append(
                        $('<option value="'+sels[j].value+'">'+sels[j].display+'</option>')
                    )
                }
                $e.val(data[col.name]);
            }else{
                $e = $('<textarea id="'+that.prefix+'dt-'+row+'-'+(i+1)+'" class="lxinput"></textarea>').data('col', i+1).change(function(){
                    var col = INT($(this).data('col'));
                    that.set_val(row, col, $(this).val());
                });
                $e.val(data[col.name]);
                if(col.callback){
                    that.set_hook(row, i+1, function(val, row, col){
                        $('#' + that.prefix + 'dt-' + row + '-' + col).val(val);
                    }, 'detail');
                    hooks.push(i+1);
                    $e.click(function(){
                        var cb = $(this).data('cb');
                        var col = INT($(this).data('col'));
                        cb(that, row, col);
                    }).data('cb', col.callback);
                }
            }
            $d.append(
                mkdiv("line").append(
                    mkdiv('lxlabel', col.display).css('width', 128),
                    $e
                )
            )
        }
        var $w = Win.win(
            Grid.Lang.EDIT + ':' + this.get_display(row, 1),
            Win.scrW * 0.5, Win.scrH * 0.5,
            function(){
                var i, col;
                for(i in hooks){
                    col = hooks[i];
                    that.unset_hook(row, col, 'detail');
                }
            },
            true
        );
        $w.append(
            $d
        );
        this.$preview.hide();
        return this;
    }
    Grid.Table.prototype.saveAction  = function(){
        var i, j, $l;
        var trans = {};
        var that  = this;
        var pri_ck = {};
        var pri_dp = []; 
        for(i in this.data.col){
            trans[this.data.col[i]['name']] = this.data.col[i]['display'];
        }
        var $lt = mkdiv("lx-list").append(
            mkdiv("lx-litem hd").append(
                $('<p>' + Grid.Lang.SAVE + '</p>').css('width', 32),
                $('<p>' + Grid.Lang.MOD_LINE + '</p>'),
                $('<p>' + Grid.Lang.MOD_CONTENT + '</p>')
            )
        );
        for(i in this.modified){
            $l = mkdiv("lx-litem").append(
                $('<p>' + checkbox('cb-mdf-'+i) + '</p>').css('width', 32),
                $('<p class="hd">'+i+'</p>')
            );
            for(j in this.modified[i]){
                $l = $l.append(
                    $('<p></p>').html(trans[j])
                );
            }
            $lt = $lt.append($l);
        }
        for(i in this.appended){
            if(this.appended[i].lxg_removed){
                continue;
            }
            
            $l = mkdiv("lx-litem").append(
                $('<p>' + checkbox('cb-apd-'+i) + '</p>').css('width', 32)
            );
            if(this.data.primary){
                $l = $l.append(
                    $('<p class="hd"></p>').html(this.appended[i][this.data.primary])
                );
                if(pri_ck[this.appended[i][this.data.primary]]){
                    pri_dp.push(this.appended[i][this.data.primary]);
                }else{
                    pri_ck[this.appended[i][this.data.primary]] = true;
                }
            }else{
                $l = $l.append(
                    $('<p class="hd">-</p>')
                );
            }
            $l = $l.append(
                $('<p>' + Grid.Lang.MOD_APD + '</p>')
            );
            $lt = $lt.append($l);
        }
        for(i in this.removed){
            $l = mkdiv("lx-litem").append(
                $('<p>' + checkbox('cb-del-'+i) + '</p>').css('width', 32),
                $('<p class="hd">'+this.removed[i]+'</p>'),
                $('<p>' + Grid.Lang.MOD_DEL + '</p>')
            );
            $lt = $lt.append($l);
        }
        var $w = Win.win(Grid.Lang.MOD_LIST, null, null, true).append(
            $lt.css({
                width : 502
            }),
            mkdiv("line").append(
                mkdiv("lxlabel tips", Grid.Lang.SAVE_TIPS),
                mkdiv("lxbutton right", Grid.Lang.SAVE).click(function(){
                    var i;
                    var mdf = {}, apd = [], del = [];
                    that.unsaved = {
                        mdf : {},
                        apd : [],
                        del : []
                    }
                    for(i in that.modified){
                        if($('#cb-mdf-'+i)[0].checked){
                            mdf[i] = that.modified[i];
                        }else{
                            that.unsaved.mdf[i] = that.modified[i];
                        }
                    }
                    for(i in that.appended){
                        if($('#cb-apd-'+i)[0].checked){
                            apd[i] = that.appended[i];
                            that.appended[i].lxg_atr_apd = undefined;
                        }else{
                            that.unsaved.apd.push(that.appended[i]);
                        }
                    }
                    for(i in that.removed){
                        if($('#cb-del-'+i)[0].checked){
                            del[i] = that.removed[i];
                        }else{
                            that.unsaved.del.push(that.removed[i]);
                        }
                    }
                    mdf = JSON.stringify(mdf);
                    apd = JSON.stringify(apd);
                    del = JSON.stringify(del);
                    var $ts = $(this).parent().find('.lxlabel.tips');
                    $ts.html(Grid.Lang.SAVE_ING);
                    var F = function(str){
                        str = str || Grid.Lang.SAVE_TIPS;
                        $ts.html(Grid.Lang.SAVE_TIPS);
                        that.modified = that.unsaved.mdf;
                        that.appended = that.unsaved.apd;
                        that.removed  = that.unsaved.del;
                        $.each($l.find('.lx-litem'), function(){
                            if($(this).find('input')[0].checked){
                                $(this).remove();
                            }
                        })
                    }
                    that.commit({mdf:mdf, apd:apd, del:del}, F);
                }),
                mkdiv("lxbutton right", Grid.Lang.SELECT_REV).click(function(){
                    var i;
                    for(i in that.modified){
                        $('#cb-mdf-'+i)[0].checked = !$('#cb-mdf-'+i)[0].checked;
                    }
                    for(i in that.appended){
                        $('#cb-apd-'+i)[0].checked = !$('#cb-apd-'+i)[0].checked;
                    }
                    for(i in that.removed){
                        $('#cb-del-'+i)[0].checked = !$('#cb-del-'+i)[0].checked;
                    }
                }),
                mkdiv("lxbutton right", Grid.Lang.SELECT_ALL).click(function(){
                    var i;
                    for(i in that.modified){ $('#cb-mdf-'+i)[0].checked = true; }
                    for(i in that.appended){ $('#cb-apd-'+i)[0].checked = true; }
                    for(i in that.removed ){ $('#cb-del-'+i)[0].checked = true; }
                })
            )
        );
        if(pri_dp.length > 0){
            Win.alert(Grid.Lang.DUPLICATE_IN_APD + pri_dp.join(','));
        }
        return $w;
    }
    Grid.Table.prototype.colAction = function(){
        var i, j, $l;
        var trans = {};
        var that  = this;
        var $lt = mkdiv("lx-list").append(
            mkdiv("lx-litem hd").append(
                $('<p>' + Grid.Lang.DISPLAY + '</p>').css('width', 32),
                $('<p>' + Grid.Lang.COL_NAME + '</p>').css('width', 192)
            )
        );
        for(i in this.data.col){
            j = this.data.col[i].hide ? '' : 'checked="checked"';
            $lt = $lt.append(
                $('<div class="lx-litem"></div>').append(
                    $('<p>' + checkbox('cb-col-'+i, !this.data.col[i].hide) + '</p>').css('width', 32),
                    $('<p>'+this.data.col[i].display+'</p>').css('width', 192)
                )
            );
        }
        var $w = Win.win(Grid.Lang.HIDE_DISPLAY_COL, null, null, true).append(
            $lt.css('width', 502),
            mkdiv('line').append(
                $('<div class="lxbutton right">' + Grid.Lang.OK + '</div>').click(function(){
                    for(var i in that.data.col){
                        if($('#cb-col-'+i)[0].checked){
                            that.data.col[i].hide = false;
                        }else{
                            that.data.col[i].hide = true;
                        }
                    }
                    that.refresh();
                }),
                $('<div class="lxbutton right">' + Grid.Lang.SELECT_REV + '</div>').click(function(){
                    var i;
                    for(i in that.data.col){
                        $('#cb-col-'+i)[0].checked = !$('#cb-col-'+i)[0].checked;
                    }
                }),
                $('<div class="lxbutton right">' + Grid.Lang.SELECT_ALL + '</div>').click(function(){
                    var i;
                    for(i in that.data.col){
                        $('#cb-col-'+i)[0].checked = true;
                    }
                })
            )
        );
    }
    Grid.Table.prototype.filtAction = function(){
        var i, j, $l;
        var trans = {};
        var that  = this;
        var $lt = mkdiv("lx-list");
        $lt.html(
            mkdiv("lx-litem hd").append(
                $('<p>' + Grid.Lang.APPLY    + '</p>').css('width', 32),
                $('<p>' + Grid.Lang.COL_NAME + '</p>').css('width', 12),
                $('<p>' + Grid.Lang.COMPARE  + '</p>').css('width', 64),
                $('<p>' + Grid.Lang.VALUE    + '</p>').css('width', 19)
            )
        );
        var filt_cfg = [];
        var $w = Win.win(Grid.Lang.FILTER, 512, 536, true).append(
            $lt.css({
                width  : 502,
                height : 430
            }),
            mkdiv('line').append(
                $('<div class="lxbutton white" id="'+this.prefix+'filt-col" style="max-width:72px;">' + this.data.col[0].display + '</div>').click(function(){
                    var i;
                    var its_col = [];
                    for(i in that.data.col){
                        its_col[i] = {
                            text  : that.data.col[i].display,
                            data  : {
                                dis    : that.data.col[i].display,
                                val    : that.data.col[i].name,
                                prefix : that.prefix
                            },
                            click : function(){
                                var ppdata = $(this).data('ppdata');
                                $('#' + ppdata.prefix + 'filt-col').html(ppdata.dis).data('val', ppdata.val)
                            }
                        }
                    }
                    Win.popup(its_col).pop();
                }).data('val', this.data.col[0].name),
                $('<div class="lxbutton white" id="'+this.prefix+'filt-opt">'+Grid.Lang.OPT_EQ+'</div>').click(function(){
                    var i;
                    Win.popup_min(
                        [
                            Grid.Lang.OPT_EQ,
                            Grid.Lang.OPT_IN,
                            Grid.Lang.OPT_LG,
                            Grid.Lang.OPT_LT,
                            Grid.Lang.OPT_LGE,
                            Grid.Lang.OPT_LTE,
                            Grid.Lang.OPT_NE
                        ],
                        function(val){
                            $('#' + that.prefix + 'filt-opt').html(val)
                        }
                    ).pop();
                }),
                $('<input class="lxinput" id="'+this.prefix+'filt-val" />').click(function(){
                    var col_dis = $('#' + that.prefix + 'filt-col').html();
                    var col_idx = that.map_col.display[col_dis];
                    if(that.data.col[col_idx].select){
                        Win.popup_pair(
                            that.data.col[col_idx].select,
                            function(val){
                                $('#' + that.prefix + 'filt-val').val(val)
                            }
                        ).pop();
                    }
                }),
                mkdiv('lxbutton right', Grid.Lang.ADD).click(function(){
                    var dis = $('#' + that.prefix + 'filt-col').html();
                    var cpv = $('#' + that.prefix + 'filt-col').data('val');
                    var cpr = $('#' + that.prefix + 'filt-opt').html();
                    var val = $('#' + that.prefix + 'filt-val').val();
                    var n   = filt_cfg.length;
                    filt_cfg[n] = {
                        col : cpv,
                        opt : cpr,
                        val : val
                    };
                    $lt.append(
                        mkdiv('lx-litem').append(
                            $('<p>' + checkbox(that.prefix+'cb-filt-'+n, true) + '</p>').css({
                                width : 32
                            }),
                            $('<p>' + dis + '</p>').css({
                                width : 125
                            }),
                            $('<p>' + cpr + '</p>').css({
                                width : 64
                            }),
                            $('<p>' + val + '</p>').css({
                                width : 192
                            })
                        )
                    );
                }),
                mkdiv('lxbutton right', Grid.Lang.CHOOSE_DATE).click(function(){
                    Win.calendar(null, Grid.Lang.CHOOSE_DATE, function(date){
                        $('#' + that.prefix + 'filt-val').val(Math.round(date.getTime() / 1000));
                    })
                })
            ),
            mkdiv('line').append(
                $('<div class="lxbutton white" id="'+this.prefix+'filt-andor">'+Grid.Lang.OPT_IN_AND+'</div>').click(function(){
                    var $th = $(this);
                    Win.popup_min(
                        [
                            Grid.Lang.OPT_IN_AND,
                            Grid.Lang.OPT_IN_OR
                        ],
                        function(val){
                            $th.html(val)
                        }
                    ).pop();
                })
            ),
            mkdiv('line').append(
                $('<div class="lxbutton right">' + Grid.Lang.OK + '</div>').click(function(){
                    var filter = {};
                    var i, j = 0;
                    for(i in filt_cfg){
                        if(!$('#' + that.prefix + 'cb-filt-' + i)[0].checked){
                            continue;
                        }
                        if(!filter[filt_cfg[i].col]){
                            filter[filt_cfg[i].col] = []
                        }
                        filter[filt_cfg[i].col][filter[filt_cfg[i].col].length] = [filt_cfg[i].opt, filt_cfg[i].val];
                        j ++;
                    }
                    if(j > 0){
                        that.filter = filter;
                    }else{
                        that.filter = null;
                    }
                    that.filter_andor = $('#' + that.prefix + 'filt-andor').html();
                    that.apply_filter();
                    that.refresh();
                }),
                $('<div class="lxbutton right">' + Grid.Lang.SELECT_REV + '</div>').click(function(){
                    var i;
                    for(i in filt_cfg){
                        $('#' + that.prefix + 'cb-filt-' + i)[0].checked = !$('#' + that.prefix + 'cb-filt-' + i)[0].checked;
                    }
                }),
                $('<div class="lxbutton right">' + Grid.Lang.SELECT_ALL + '</div>').click(function(){
                    var i;
                    for(i in filt_cfg){
                        $('#' + that.prefix + 'cb-filt-' + i)[0].checked = true;
                    }
                }),
                $('<div class="lxbutton right">' + Grid.Lang.CLEAN + '</div>').click(function(){
                    var i;
                    for(i in filt_cfg){
                        $('#' + that.prefix + 'cb-filt-' + i).parent().parent().remove();
                    }
                    filt_cfg.length = 0;
                })
            )
        );
    }
    Grid.Table.prototype.replaceAction = function(){
        var that  = this;
        function cb(cl, lang){
            return $('<div class="lxlabel"><input class="' + cl + '" type="checkbox" />' + lang + '</div>');
        }
        var F = function(e){
            if(e.keyCode && e.keyCode != 13){
                return;
            }
            var recfg = {
                // 忽略大小写
                i : !$(this).parent().parent().find('.cb-ignore-case')[0].checked,
                // 正则表达式
                r : $(this).parent().parent().find('.cb-regexp')[0].checked
            };
            var src = $(this).parent().parent().find('.search-content').val();
            var dst = $(this).parent().parent().find('.replace-value').val();
            if(!recfg.r){
                src = src.replace(/\{/g, "\\\{").replace(/\[/g, "\\\[").replace(/\(/g, "\\\(").replace(/\)/g, "\\\)").replace(/\./g, "\\\.").replace(/\*/g, "\\\*").replace(/\+/g, "\\\+").replace(/\^/g, "\\\^").replace(/\$/g, "\\\$").replace(/\|/g, "\\\|").replace(/\?/g, "\\\?").replace(/\\/g, "\\\\");
            }
            var replaced = that.replace(src, dst, that.selected, recfg);
            Win.alert(Grid.Lang.sAfterReplace(replaced));
        }
        Win.win(Grid.Lang.REPLACE, 378, 124, true).append(
            mkdiv('line').append(
                mkdiv("lxlabel", Grid.Lang.REPLACE_FIND),
                $('<input class="lxinput double search-content" placeholder="' + Grid.Lang.INPUT_REPLACE_FIND + '" />').keyup(F)
            ),
            mkdiv('line').append(
                mkdiv("lxlabel", Grid.Lang.REPLACE_TO),
                $('<input class="lxinput double replace-value" placeholder="' + Grid.Lang.INPUT_REPLACE_TO + '" />').keyup(F)
            ),
            mkdiv('line').append(
                cb('cb-ignore-case', Grid.Lang.REPLACE_CASE),
                cb('cb-regexp', Grid.Lang.REPLACE_REGEXP)
            ),
            mkdiv('line').append(
                $('<input type="button" class="lxbutton right" value="' + Grid.Lang.REPLACE_ALL + '"/>').click(F)
            )
        ).find('.search-content').focus();
    }
    Grid.Table.prototype.exportAction = function(){
        var that  = this;
        function cbl(cl, checked, lang){
            return mkdiv('line').append(
                $('<div class="lxlabel"><input class="' + cl + '" type="checkbox"' + (checked ? ' checked="checked"' : '') + '/>' + lang +'</div>')
            );
        }
        var $w = Win.win(Grid.Lang.EXPORT, 368, 192, true).append(
            cbl('cb-export-nohide' , false, Grid.Lang.EXPORT_NOHIDE ),
            cbl('cb-export-filter' , false, Grid.Lang.EXPORT_FILTER ),
            cbl('cb-export-curpage', false, Grid.Lang.EXPORT_CURPAGE),
            cbl('cb-export-trueval', true , Grid.Lang.EXPORT_TRUEVAL),
            cbl('cb-export-asfile' , true , Grid.Lang.EXPORT_ASFILE ),
            mkdiv('line').append(
                $('<input type="button" class="lxbutton right" value="' + Grid.Lang.EXPORT + '"/>').click(function(){
                    var ex_nohide  = $w.find('.cb-export-nohide' )[0].checked;
                    var ex_filter  = $w.find('.cb-export-filter' )[0].checked;
                    var ex_curpage = $w.find('.cb-export-curpage')[0].checked;
                    var ex_trueval = $w.find('.cb-export-trueval')[0].checked;
                    var ex_asfile  = $w.find('.cb-export-asfile' )[0].checked;
                    var ctx = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>DataSheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table><tr>';
                    var i, j;
                    var uri = ex_asfile ? 'data:application/vnd.ms-excel;base64,' : 'data:text/html;base64,';
                    var data;
                    var drow = ex_curpage ? that.data.row : (ex_filter ? that.raw_row : that.rec_row);
                    for(i in that.data.col){
                        if(ex_nohide && that.data.col[i].hide){ continue; }
                        ctx += '<td>' + that.data.col[i].display + '</td>';
                    }
                    ctx += '</tr>';
                    for(i in drow){
                        ctx += '<tr>';
                        for(j in that.data.col){
                            if(ex_nohide && that.data.col[j].hide){ continue; }
                            ctx += '<td>' + (ex_trueval ? drow[i][that.data.col[j].name] : $('#' + that.prefix + 'g-' + (INT(i) + 1) + '-' + (INT(j) + 1)).html()) + '</td>';
                        }
                        ctx += '</tr>';
                    }
                    ctx += '</table></body></html>';
                    data = window.btoa(unescape(encodeURIComponent(ctx)));
                    window.open(uri + data);
                }),
                $('<input type="button" class="lxbutton right" value="' + Grid.Lang.EXPORT_XML + '"/>').click(function(){
                    var ctx = '<?xml version="1.0" encoding="utf-8"?>\n<root>\n';
                    var ex_nohide  = $w.find('.cb-export-nohide')[0].checked;
                    var ex_filter  = $w.find('.cb-export-filter')[0].checked;
                    var ex_curpage = $w.find('.cb-export-curpage')[0].checked;
                    var ex_trueval = $w.find('.cb-export-trueval')[0].checked;
                    var uri = 'data:text/html;base64,';
                    var i, j;
                    var drow = ex_curpage ? that.data.row : (ex_filter ? that.raw_row : that.rec_row);
                    for(i in drow){
                        ctx += '\t<item>\n';
                        for(j in that.data.col){
                            if(ex_nohide && that.data.col[j].hide){ continue; }
                            ctx += '\t\t<'+that.data.col[j].name+'>' + (ex_trueval ? drow[i][that.data.col[j].name] : $('#' + that.prefix + 'g-' + (INT(i) + 1) + '-' + (INT(j) + 1)).html()) + '</'+that.data.col[j].name+'>\n';
                        }
                        ctx += '\t</item>\n';
                    }
                    ctx += '</root>';
                    Win.quest(Grid.Lang.EXPORT_XML, null, ctx, null, Grid.Lang.EXPORT).find('textarea')[0].select();
                })
            )
        );
    }
})(jQuery, window, 'Grid', window.Win);