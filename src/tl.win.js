/**
 * 窗体控件
 * Fork from lx.ui
 * 兼容：
 *     Chrome  13+
 *     Firefox 4+
 *     IE      10+
 * lxrmido@lxrmido.com
 * 最后更新：
 *     2014-1
 * --------------------
 * 常用:
 * --------------------
 *     #### 常用窗体API
 * --------------------
 *         Win.alert(文本, 关闭时回调函数, 窗体标题)
 *         弹出消息窗体，部分替代alert使用，返回值为窗体的jQuery对象
 *         ----
 *         Win.quest(文本, 确认时回调函数(输入内容), 预设值, 取消时回调函数, 窗体标题)
 *         弹出询问窗体，返回值为窗体的jQuery对象
 *         ----
 *         Win.confirm(文本, 确认时回调函数, 关闭时回调函数, 窗体标题)
 *         弹出确认窗体，返回值为窗体的jQuery对象
 *         ----
 *         Win.calendar(初始时间戳, 窗体标题, 回调函数(时间), 回调函数的传入值是否时间戳)
 *         弹出时间日期选择窗体，当最后一个参数为true时回调函数将接受一个时间戳参数，否则将接受一个Date对象，返回值为窗体的jQuery对象
 *         ----
 *         Win.win(窗体标题, 窗体宽度, 窗体高度, 关闭时的回调函数, 是否可以最小化)
 *         弹出一个居中的空白窗体，返回值为窗体的jQuery对象
 * --------------------
 * #### 时间日期API
 * --------------------
 *         Win.time_to_str(时间戳)
 *         返回 Y-m-d H:i:s 格式字符串
 *         ----
 *         Win.str_to_time(字符串)
 *         传入 Y-m-d H:i:s 格式字符串，返回时间戳
 * --------------------
 */
(function($, window, win_key){

    function INT(n){return parseInt(n, 0); }

    function mkdiv(div_class, inner){ return $('<div ' + (div_class ? ('class="' + div_class + '" ') : '') + '>' + (inner || '') + '</div>'); }
    function mkipt(type, ipt_class, value){ return $('<input type="' + type + '" class="' + ipt_class + '" value="' + value + '" />'); }
    function mktxt(txt_class, value){ return $('<textarea class="' + txt_class + '">' + (value || '') + '</textarea>'); }

    var Win = window[win_key] = {

        // 屏幕宽度
        scrW : 0,   scrW_before : 0,
        // 屏幕高度
        scrH : 0,   scrH_before : 0,

        // 最近一次鼠标按下的坐标
        clickX : 0,              
        clickY : 0,            
        // 当前注册为菜单的组件
        registerMenuDOM : null, 

        // 任务栏
        taskbar : null,

        // 
        hooks_winsize : [],
        hooks_resortz : [],
        hooks_init    : [],

        is_initialed  : false,

        // 窗口列表
        wins : [],  
        // 全局ID
        gid  : 1,    
        // 窗口从此index-z开始排布
        startZ : 60000, 

        // 正在拖放的操作组件
        dragging : null,       
        // 接受拖放的组件 
        draggingParent : null,  

        // 拖放点坐标
        dragX : 0,  
        dragY : 0,

        $body     : null,
        $window   : null,
        $document : null,

        lowestDelta   : undefined,
        lowestDeltaXY : undefined,


        // 语言字典
        Lang : {
            ALERT_TEXT    : '无内容',
            ALERT_TITLE   : '通知',
            CAL_SEC_NUM   : '秒数：',
            CAL_SEP_DAY   : '日',
            CAL_SEP_HOUR  : '时',
            CAL_SEP_MIN   : '分',
            CAL_SEP_MONTH : '月',
            CAL_SEP_SEC   : '秒',
            CAL_SEP_YEAR  : '年',
            CAL_TITLE     : '日期',
            CAL_TODAY     : '今天',
            CAL_WEEK_0    : '日',
            CAL_WEEK_1    : '一',
            CAL_WEEK_2    : '二',
            CAL_WEEK_3    : '三',
            CAL_WEEK_4    : '四',
            CAL_WEEK_5    : '五',
            CAL_WEEK_6    : '六',
            CONFIRM_TEXT  : '确定吗？',
            CONFIRM_TITLE : '询问',
            QUEST_TEXT    : '请输入：',
            QUEST_TITLE   : '询问',
            WIN_TITLE     : 'TITLE',

            sDateStr : function(year, month){
                return year + '年' + month + '月';
            },

            // 扩展语言字典
            extend : function(e){
                var i;
                // 即使是继承来的属性，都添加
                for(i in e){
                    Win.Lang[i] = e[i];
                }
            }
        },

        init : function(){
            var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
                toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
                i;
                if($.event.fixHooks){
                    for(i in toFix){$.event.fixHooks[toFix[i]] = $.event.mouseHooks;}
                }
                $.event.special.mousewheel = {
                    setup    : function(){
                        if(this.addEventListener){
                            for(i in toBind){
                                this.addEventListener(toBind[i], Win.mouseScroll, false);
                            }
                        }else{
                            this.onmousewheel = Win.mouseScroll;
                        }
                    },
                    teardown : function(){
                        if(this.removeEventListener){
                            for(i in toBind){
                                this.removeEventListener(toBind[i], Win.mouseScroll, false);
                            }
                        }else{
                            this.onmousewheel = null;
                        }
                    }
                };
                $.fn.extend({
                    mousewheel  : function(fn){ return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel"); },
                    unmousewheel: function(fn){ return this.unbind("mousewheel", fn); }
                });
            Win.$window   = $(window);
            Win.$document = $(document);

            Win.$document.mousedown(Win.mouseDown).mousemove(Win.mouseMove).mouseup(Win.mouseUp).ready(Win.ready);
        },

        ready : function(){
            Win.$body = $('body');
            Win.timer();
            Win.is_initialed = true;
            Win.hooks_active('init');
        },

        /**
         * 计算某个月的第一天是全年的第几天
         * @param  {int} year  
         * @param  {int} month 
         * @return {int}
         */
        mon_offset : function(year, month){
            for(var i = 1, offset = 0; i < month; i ++){
                offset += Win.mon_days(year, i);
            }
            return offset;
        },
        /**
         * 计算某年某月的天数
         * @param  {int} year 
         * @param  {int} month
         * @return {int}      
         */
        mon_days : function(year, month){
            return (month == 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) ? 29 : [31, 28, 31, 30,31, 30, 31, 31, 30, 31, 30, 31][month - 1];
        },
        /**
         * 计算某年某月某日是星期几
         * @param  {int} year 
         * @param  {int} month
         * @param  {int} day  
         * @return {int}      
         */
        week_day : function(year, month, day){
            function i(n){ return INT((year - 1) / n); }
            return (i(1) + i(4) - i(100) + i(400) + Win.mon_offset(year, month) + day) % 7;
        },
        /**
         * 时间戳转换为 "Y-m-d" 形式的字符串
         * @param  {int} timestamp
         * @return {string}          
         */
        time_to_str : function(timestamp){
            var date = new Date(timestamp * 1000);
            function fm(raw){ return raw < 10 ? ("0" + raw) : raw; }
            return date.getFullYear() + "-" + fm(date.getMonth() + 1) + "-" + fm(date.getDate()) + " " + fm(date.getHours()) + ":" + fm(date.getMinutes()) + ":" + fm(date.getSeconds());
        },
        /**
         * 将 "Y-m-d H:i:s" 形式的字符串转换为时间戳
         * @param  {string}  字符串
         * @return {int}
         */
        str_to_time : function(s){
            s = s.split(/[\s-:]/);
            return INT((new Date(s[0] || 0, (s[1] - 1) || 0, s[2] || 0, s[3] || 0, s[4] || 0, s[5] || 0)).getTime() / 1000);
        },

        xhr : function(){
            if(typeof XMLHttpRequest != "undefined"){
                return new XMLHttpRequest();
            }else if(typeof ActiveXObject != "undefined"){
                if(typeof arguments.callee.activeXString != "string"){
                    var v = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"],
                        i;
                    for(i = 0; i < v.length; i ++){
                        try{
                            new ActiveXObject(v[i]);
                            arguments.callee.activeXString = v[i];
                            break;
                        }catch(e){

                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            }
            throw new Error("No XHR object available");
        },

        taskbar_init : function(){
            Win.taskbar || Win.$body.append(Win.taskbar = mkdiv('lx-taskbar'));
        },

        taskbar_resize : function(){
            var w = Win.taskbar.width();
            if(w < 24){
                Win.taskbar.remove();
                Win.taskbar = null;
                return;
            }
            Win.taskbar.css('left', (Win.scrW - w) / 2);
        },

        min_to_taskbar : function($win, title){
            Win.taskbar_init();
            $win.data('x', $win.css('left')).data('y', $win.css('top')).addClass('min').css(
                { left : Win.srcW / 2, top : Win.scrH - 24});
            setTimeout(function(){
                Win.taskbar.append(
                    mkdiv("lx-taskbar-item").attr('title', title).html(title.slice(0, 1)).click(function(){
                        var ti = $(this), $win = $(this).data('win');
                        $win.addClass('lxlinear').removeClass('min');
                        Win.wintofront($win.css({left : $win.data('x'),  top : $win.data('y')}));
                        setTimeout(function(){ $win.removeClass('lxlinear');      }, 400);
                        setTimeout(function(){ ti.detach(); Win.taskbar_resize(); }, 20);
                    }).data('win', $win));
                Win.taskbar_resize();
            }, 600);
        },

        /**
         * 判断是否在元素的范围内，通常只对fixed的元素使用
         * @param  {jQuery 选择子} $dom 元素
         * @param  {int} x   
         * @param  {int} y    
         * @return {bool}
         */
        inDOMScope : function($dom, x, y){
            var x0 = INT($dom.css('left'));
            var y0 = INT($dom.css('top' ));
            return  (x > x0) && 
                    (x < x0 + INT($dom.css('width' ))) && 
                    (y > y0) && 
                    (y < y0 + INT($dom.css('height')));
        },
        // 注销菜单组件
        dyMenuDOM : function(scope){
            scope = scope || true;
            if(Win.registerMenuDOM === null){
                return;
            }
            if(scope && Win.inDOMScope(Win.registerMenuDOM, Win.clickX, Win.clickY)){
                return;
            }
            if(Win.registerMenuDOM.lxtype === null){
                return;
            }
            if(Win.registerMenuDOM.lxtype == 'menu'){
                Win.registerMenuDOM.fold();
            }
        },
        mouseDown : function(e){
            e = window.event || e;
            Win.clickX = e.x || e.clientX;
            Win.clickY = e.y || e.clientY;
            Win.dyMenuDOM();
        },
        mouseMove : function(e){
            e = window.event || e;
            if(Win.dragging !== null){
                var cx = e.clientX - Win.dragX;
                var cy = e.clientY - Win.dragY;
                Win.draggingParent.css({top:cy, left:cx});
                if(Win.dragCallback){ Win.dragCallback(cx, cy); }
                return false;
            }
        },
        mouseUp : function(e){
            if(Win.dragging !== null){
                Win.dragging = null;
                Win.draggingParent.removeClass('dragging');
                Win.draggingParent = null;
            }
        },

        mouseScroll : function(e){
            var oe         = e || window.event,
                delta      = oe.deltaY ? deltaY : (oe.deltaX ? -deltaX : (oe.detail ? -oe.detail : (oe.wheelDelta ? oe.wheelDelta : 0))),
                deltaX     = oe.wheelDeltaX !== undefined ? -oe.wheelDeltaX : (oe.deltaX ?  oe.deltaX : 0),
                deltaY     = oe.wheelDeltaY !== undefined ?  oe.wheelDeltaY : (oe.deltaY ? -oe.deltaY : 0),
                absDelta   = 0,
                absDeltaXY = 0,
                to_int;
            e = $.event.fix(oe);
            e.type = "mousewheel";
            absDelta = Math.abs(delta);
            if(!Win.lowestDelta || absDelta < Win.lowestDelta){ Win.lowestDelta = absDelta; }
            absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
            if(!Win.lowestDeltaXY || absDeltaXY < Win.lowestDeltaXY){ Win.lowestDeltaXY = absDeltaXY; }
            to_int = delta > 0 ? Math.floor : Math.ceil;
            return ($.event.dispatch || $.event.handle).apply(
                this, 
                [e, 
                    to_int(delta  / Win.lowestDelta  ), 
                    to_int(deltaX / Win.lowestDeltaXY), 
                    to_int(deltaY / Win.lowestDeltaXY)
                ].concat(Array.prototype.slice.call(arguments, 1)));
        },
        startDrag : function(e, d, p, c){
            Win.dragging       = d;
            Win.draggingParent = p;
            Win.dragX          = e.clientX - INT(p.css('left'));
            Win.dragY          = e.clientY - INT(p.css('top'));
            Win.dragCallback   = c;
        },
        /**
         * 激活某fixed的组件为可自由拖放组件
         * @param  {jQuery 选择子} dragItem 接受拖放动作的组件
         * @param  {jQuery 选择子} parent   被拖放的实际组件
         * @param  {function}      callback 拖放时的回调函数
         */
        dragenable : function(dragItem, parent, callback){
            dragItem.mousedown(function(e){
                Win.startDrag(e, dragItem, (parent || dragItem).addClass('dragging'), callback);
                return false;
            });
        },
        timer : function(time){
            var w = INT(Win.$window.width()),
                h = INT(Win.$window.height());
            if(w !== Win.scrW || h !== Win.scrH){
                Win.scrW_before = Win.scrW;
                Win.scrH_before = Win.scrH;
                Win.scrW = w;
                Win.scrH = h;    
                Win.hooks_active('winsize');
            }
            time = time || 50;
            setTimeout(function(){Win.timer(time);}, time);
        },
        hooks_active : function(type){
            var hooks = Win['hooks_' + type];
            for(f in hooks){ hooks[f](); }
        },
        hooks_register : function(type, func){
            switch(type){
                case 'init':
                    if(Win.is_initialed){
                        func();
                        return;
                    }
                    break;
                default:
                    break;
            }
            Win['hooks_' + type].push(func);
        },
        // 加入窗体队列
        addwin : function($w){
            Win.wins[Win.wins.length] = $w;
            Win.resortZ();
        },
        // 移除窗体
        rmwin : function($w){
            var ary = [], i;
            for(i = 0; i < Win.wins.length; i ++){
                if(Win.wins[i].data('gid') == $w.data('gid')){
                    continue;
                }
                ary[ary.length] = Win.wins[i];
            }
            Win.wins = ary;
            Win.resortZ();
            $w.addClass('lxlinear').addClass('closing');
            setTimeout(function(){ $w.detach(); }, 250);
        },
        // 使窗体移到最前方
        wintofront : function($w){
            var ary = [], i;
            for(i = 0; i < Win.wins.length; i++){
                if(Win.wins[i].data('gid') == $w.data('gid')){
                    continue;
                }
                ary[ary.length] = Win.wins[i];
            }
            ary[ary.length] = $w;
            Win.wins = ary;
            Win.resortZ();
        },
        resortZ : function(){
            var z = Win.startZ;
            for(var i = 0; i < Win.wins.length; i ++, z ++){
                Win.wins[i].css('z-index', z);
            }
            Win.hooks_active('resortz');
        },
        /**
         * 产生窗体
         * @param  {string}   title
         * @param  {int}      width   
         * @param  {int}      height  
         * @param  {function} closefunc 关闭窗体时的回调
         * @param  {boolean}  min       窗体可否最小化
         * @return {jQuery[]}          
         */
        win : function(title, width, height, closefunc, min){
            title  = title  || Win.Lang.WIN_TITLE;
            width  = width  || 512;
            height = height || 512;
            var x  = (Win.$window.width()  - width ) / 2,
                y  = (Win.$window.height() - height) / 2;
            var $t, $w, $c;
            // closefunc 用作 min
            if(closefunc === true){
                min = true;
                closefunc = null;
            }
            closefunc = closefunc || function(){};
            $t = mkdiv("lxwintit", title).mousedown(function(){
                Win.wintofront($(this).parent());
            }).append(
                $c = mkipt('button', 'lxwincbut', '').click(function(){
                    var cf = $(this).data('closefunc');
                    if(cf){ cf(); }
                    Win.rmwin($(this).parent().parent());
                }).addClass('lx-icon-cancel').data('closefunc', closefunc));
            if(min){
                $t.append(
                    mkipt('button', 'lxwincbut', '-').click(function(){
                        Win.min_to_taskbar($(this).parent().parent(), title);
                    }));
            }
            Win.$body.append($w = mkdiv('lxwin').append($t).data('gid', Win.gid).data('cbs', 48));
            Win.dragenable($t, $w);
            Win.addwin($w);
            Win.gid ++;
            $w.$close_button = $c;
            $w.$title_bar = $t;
            return $w.css({width:width, height:height, left:x, top:y});
        },
        /**
         * 消息框窗体
         * @param  {string} text 内容
         * @param  {function} func 关闭时的回调
         * @param  {string} titl 标题
         * @return {jQuery[]}
         */
        alert : function(text, func, titl){
            text = text || Win.Lang.ALERT_TEXT;
            titl = titl || Win.Lang.ALERT_TITLE;
            func = func || function(){};
            var $w = Win.win(titl, 384, 128);
            $w.$close_button.click(func).addClass('lx-icon-confirm').focus().keyup(function(e){
                if(e.keyCode == 13){
                    if(func){ func(); }
                    Win.rmwin($(this).parent().parent());
                }
            });
            return $w.append(
                mkdiv('lxalfield', text)).css({'min-height':'128px', 'height':'auto'});
        },
        /**
         * 文本询问框
         * @param  {string} text   询问内容
         * @param  {function} func1  按下确定后的回调
         * @param  {string} preval 预设值
         * @param  {function} func2  按下关闭后的回调
         * @param  {string} titl   标题
         * @return {jQuery[]}      
         */
        quest : function(text, func1, preval, func2, titl){
            text   = text   || Win.Lang.QUEST_TEXT;
            titl   = titl   || Win.Lang.QUEST_TITLE;
            func1  = func1  || function(d){};
            func2  = func2  || function(){};
            preval = preval || '';
            var $w = Win.win(titl, 384, 128);
            $w.$close_button.click(func2);
            $w.$title_bar.append(
                mkipt('button', 'lxwincbut lx-icon-confirm', '').click(function(){
                    func1($(this).parent().parent().find('textarea').val());
                    Win.rmwin($(this).parent().parent());
                }));
            return $w.append(
                mkdiv('lxalfield', text), 
                mktxt('lxquest', preval)).css({'min-height':'128px', 'height':'auto'});
        },
        /**
         * 确认询问窗体
         * @param  {string}   text  询问内容
         * @param  {function} func1 肯定时的回调
         * @param  {function} func2 否定时的回调
         * @param  {string}   titl  标题
         * @return {jQuery[]}
         */
        confirm : function(text, func1, func2, titl){
            text  = text  || Win.Lang.CONFIRM_TEXT;
            titl  = titl  || Win.Lang.CONFIRM_TITLE;
            func1 = func1 || function(){};
            func2 = func2 || function(){};
            var $w = Win.win(titl, 384, 128);
            $w.$close_button.click(func2);
            $w.$title_bar.append(
                mkipt('button', 'lxwincbut lx-icon-confirm', '').click(function(){
                    func1();
                    Win.rmwin($(this).parent().parent());
                }));
            return $w.append(
                mkdiv('lxalfield', text)).css({'min-height':'128px', 'height':'auto'});
        },
        /**
         * 日期选择窗体
         * @param  {int} timestamp 预设时间戳
         * @param  {string} titl   标题
         * @param  {function} func 回调
         * @param  {boolean} 回调是否传入时间戳
         * @return {jQuery[]}
         */
        calendar : function(timestamp, titl, func, callback_as_timestamp){
            var date = timestamp ? new Date(timestamp * 1000) : new Date(), 
                $w   = Win.win((titl || Win.Lang.CAL_TITLE), 256, 286),
                $c   = mkdiv('lx-calendar');
            func = func || function(){};
            Win.render_cal($c, date);
            $w.$title_bar.append(
                mkipt('button', 'lxwincbut lx-icon-confirm', '').click(function(){
                    var vars = $(this).parent().parent().find('.lxinput');
                    var dt   = new Date(
                        vars[0].value, vars[1].value - 1, vars[2].value,
                        vars[3].value, vars[4].value,     vars[5].value);
                    func(callback_as_timestamp ? INT(dt.getTime() / 1000) : dt);
                    Win.rmwin($(this).parent().parent());
                }));
            return $w.append($c);
        },
        _popup : function(){
            var $pp = mkdiv('lxppmenu');
            $pp.lxtype = 'menu';
            $pp.pop = function(time, x, y){
                var wx = Win.scrW - $pp.width() - 8;
                var wy = Win.scrH - $pp.height() - 16;
                x = x || Win.clickX;
                y = y || Win.clickY;
                $pp.slideDown(time || 200).css(
                    {
                        left : (x > wx ? wx : x), 
                        top  : (y > wy ? wy : y)
                    });
                Win.dyMenuDOM(false);
                Win.registerMenuDOM = $pp;
                return $pp;
            };
            $pp.fold = function(time){
                $pp.fadeOut(time || 200);
                Win.registerMenuDOM = null;
                return $pp;
            };
            Win.dragenable($pp, $pp);
            return $pp;
        },
        /**
         * 弹出菜单，被选择后传入菜单项内容到回调函数
         * @param  {Array} its  菜单项文本列表
         * @param  {function} func 回调
         * @return {jQuery[]} 菜单
         */
        popup_min : function(its, func){
            var $pp = mkdiv('lxppmenu'),
                i, $i;
            for(i = 0; i < its.length; i++){
                $pp = $pp.append(mkdiv('it', its[i]).click(function(){
                    func($(this).html());
                    $pp.fold();
                }));
            }
            Win.$body.append($pp);
            return $pp;
        },
        /**
         * 弹出菜单，传入[{display:显示内容, value:值},...]，被点击后将值传入回调函数
         * @param  {Array} its 菜单项
         * @param  {function} func 回调函数
         * @return {jQuery[]} 菜单     
         */
        popup_pair : function(its, func){
            var $pp = Win._popup(),
                i, $i;
            for(i = 0; i < its.length; i++){
                $i = mkdiv('it', its[i].display).click(function(){
                    func($(this).data('val'));
                    $pp.fold();
                }).data('val', its[i].value);
                $pp = $pp.append($i);
            }
            Win.$body.append($pp);
            return $pp;
        },
        /**
         * 弹出菜单
         * @param  {Array} its 菜单项列表
         * @return {jQuery[]}  菜单
         */
        popup : function(its){
            var $pp = Win._popup(),
                i, $i;
            if(its === null || its.length === 0){  its = [{text:'DEMO', click:function(e){alert('Popup Demo!');}}]; }
            for(i = 0; i < its.length; i++){
                $i = mkdiv('it', its[i].text || 'UNDEFINED');
                if(its[i].click !== null){
                    $i.click(its[i].click).click(function(e){$pp.fold();});
                }
                if(its[i].data !== null){
                    $i.data('ppdata', its[i].data);
                }
                $pp.append($i);
            }
            Win.$body.append($pp);
            return $pp;
        },
        render_cal : function($cal, date){
            var year      = date.getFullYear(),
                month     = date.getMonth() + 1,
                day       = date.getDate(),
                hour      = date.getHours(),
                min       = date.getMinutes(),
                sec       = date.getSeconds(),
                wd_1      = Win.week_day(year, month, 1),
                day_last  = (month !== 1 ? (Win.mon_days(year, month - 1)) : (Win.mon_days(year, 12))) - wd_1 + 1,
                day_all   = Win.mon_days(year, month),
                cnt_week  = 0, 
                not_break = true,
                $l        = mkdiv('lx-cal-line'),
                i;
            $cal.html('').append(
                mkdiv('lx-cal-line').append(
                    mkdiv('lx-cal-tri-l').click(function(){
                        if(month == 1){
                            month = 11;
                            year --;
                        }else{
                            month -= 2;
                        }
                        Win.render_cal($cal, new Date(year, month, day, hour, min, sec));
                    }),
                    mkdiv('lx-cal-title').html(Win.Lang.sDateStr(year, month)),
                    mkdiv('lx-cal-tri-r').click(function(){
                        if(month == 12){
                            month = 0;
                            year ++;
                        }
                        Win.render_cal($cal, new Date(year, month, day, hour, min, sec));
                    })),
                mkdiv('lx-cal-line').append(
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_0),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_1),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_2),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_3),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_4),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_5),
                    mkdiv('lx-cal-day', Win.Lang.CAL_WEEK_6)));
            for(i = 0; i < wd_1; i ++){
                $l = $l.append(
                    mkdiv('lx-cal-day last', day_last).click(function(){
                        if(month == 1){
                            month = 11;
                            year --;
                        }else{
                            month -= 2;
                        }
                        Win.render_cal($cal, new Date(year, month, $(this).data('day'), hour, min, sec));
                    }).data('day', day_last));
                day_last ++;
            }
            day_last = 1;
            for(i = wd_1; i < 7; i ++){
                if(day_last == day){
                    $l = $l.append(mkdiv('lx-cal-day cur', day_last));
                }else{
                    $l = $l.append(
                        mkdiv('lx-cal-day', day_last).click(function(){
                            Win.render_cal($cal, new Date(year, month - 1, $(this).data('day'), hour, min, sec));
                        }).data('day', day_last));
                }
                day_last ++;
            }
            $cal.append($l);
            while(day_last <= day_all && not_break){
                $l = mkdiv('lx-cal-line');
                for(i = 0; i < 7; i ++){
                    if(day_last > day_all){
                        day_last  = 1;
                        not_break = false;
                    }
                    if(not_break){
                        if(day_last == day){
                            $l = $l.append(mkdiv('lx-cal-day cur', day_last));
                        }else{
                            $l = $l.append(
                                mkdiv('lx-cal-day', day_last).click(function(){
                                    Win.render_cal($cal, new Date(year, month - 1, $(this).data('day'), hour, min, sec));
                                }).data('day', day_last));
                        }
                    }else{
                        $l = $l.append(
                            mkdiv('lx-cal-day last', day_last).click(function(){
                                if(month == 12){
                                    month = 0;
                                    year ++;
                                }
                                var new_date = new Date(year, month, $(this).data('day'), hour, min, sec);
                                Win.render_cal($cal, new_date);
                            }).data('day', day_last));
                    }
                    day_last ++;
                }
                $cal.append($l);
            }
            function ipt_blur(){
                var vars = $(this).parent().parent().find('.lxinput');
                Win.render_cal($cal, new_date   = new Date(
                    vars[0].value, vars[1].value - 1, vars[2].value,
                    vars[3].value, vars[4].value,     vars[5].value));
            }
            $cal.append(
                mkdiv('lx-cal-line').append(
                    mkipt('text', 'lxinput quad', year).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_YEAR),
                    mkipt('text', 'lxinput quad', month).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_MONTH),
                    mkipt('text', 'lxinput quad', day).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_DAY)),
                mkdiv('lx-cal-line').append(
                    mkipt('text', 'lxinput quad', hour).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_HOUR),
                    mkipt('text', 'lxinput quad', min).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_MIN),
                    mkipt('text', 'lxinput quad', day).blur(ipt_blur),
                    mkdiv('lxlabel slim', Win.Lang.CAL_SEP_SEC)),
                mkdiv('lx-cal-line').append(
                    $('<div class="lxlabel slim">'+Win.Lang.CAL_SEC_NUM+'</div>'),
                    mkipt('text', 'lxinput half', Math.round(date.getTime()/1000)).blur(function(){
                        Win.render_cal($cal, new Date($(this).val() * 1000));
                    }),
                    mkipt('button', 'lxbutton right', Win.Lang.CAL_TODAY).click(function(){
                        Win.render_cal($cal, new Date());
                    })));
        }
    };
    Win.init();
})(jQuery, window, 'Win');