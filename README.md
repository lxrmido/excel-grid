# excel-grid

这是一个编写于2013年的项目，用于提供一个基于HTML的、操作接近于excel的工作界面，使用场景大概是比较大量的数据编辑以及需要看上去很专业的演示的时候

僵尸项目，经过2013年半年的开发后功能已经趋近稳定，也没有进一步的开发需求了，先放上来github声明一下著作权

## 现有功能包括：

1. 多行多列多选编辑
1. 替换显示值与实际值
1. 下拉选择、日期选择、以及各种各样奇奇怪怪的选择
1. 列宽自由调整、隐藏、过滤、查找功能
1. 导入xlsx表格的功能
1. 可导出为XML等
1. 可禁止对特定行列进行编辑
1. 编辑时自动计算单元格的值

## 项目本体包括

1. tl.win.js  (UI)
1. tl.grid.js (表格本体)
1. tl.win.css
1. tl.grid.css

此外，需要jquery；

当需要使用导入xlsx的功能时, 需要额外引入

1. tl.import.js
1. inflate.js
1. zip.js


## 运行截图：

![excel-grid](http://i.imgur.com/0Bd2244.png)

demo参见：http://runjs.cn/detail/gcdxdyct