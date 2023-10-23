// ==UserScript==
// @name        快速预约仪器
// @namespace   Violentmonkey Scripts
// @include     http://202.116.118.158/*
// @version     3.0.1
// @author      Ming
// @description 加油呀
// @note        2022-09-05 4.0.0 老是要预约仪器，查找很麻烦，添加快速搜索功能。
// @note        2022-04-19 21:49:16 3.0.1 {final version}. 添加非工作时段预约自动确认；改进选取预约时间功能；更改样式设置。 全部完工！
// @note        2022-04-17 21:04:39 3.0.0 {final version}. 脚本自动加载到网页，无需复制粘贴；数字键1一键运行；鼠标悬停显示已勾选时间段。各种想要的功能全部完成，总计耗时2天整。
// @note        2022-04-16 17:00:00 2.0.0 添加一键运行按钮、新增双击选取预约时间段，完成基本功能
// @note        2022-04-15 00:30:00 1.1.0 搞定核心代码，可以通过console运行
// @note        2022-04-14 22:32:32 1.0.0 start learning and coding
// ==/UserScript==

// 双击选取预约时间
var targetTimeRegions=[];
const onClick = (event) => {
    let reDateTime = /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
    // var isDateTime = reDateTime.test('2012-01-31 09:00:22');
    if (reDateTime.test(event.target.id)) {
        let targetTimeRegions_confirm=window.confirm(event.target.id);
        console.log(event.target.id);
        if (targetTimeRegions_confirm) {
            console.log("%s : Selected.", event.target.id);
            targetTimeRegions.push(event.target.id);
        };
    };
};
window.addEventListener('dblclick', onClick);

// 设置一键运行预约
let yuyue=document.createElement("input");
yuyue.id="yuyue"
yuyue.type="button";
yuyue.value="[预约] / [右键清空所选时间段]";
yuyue.style.cssText += ";    font-family: sans-serif; \
    list-style: none outside none; \
    line-height: 52px; \
    cursor: pointer; \
    text-decoration: none; \
    border:none; \
    padding: 0; \
    border-radius: 10px;\
    background: #E6CEAC;\
    color: #666666; \
    font-size: 14px; \
    width: 230px; \
    color: #4F2F4F; \
    font-weight: bold;"
let target=document.querySelector("body > div.layout-top > div > div > div > ul > li.last")
target.appendChild(yuyue)

yuyue.onclick= function (){
    targetTimeRegions=unique(targetTimeRegions);
    for (var i = 0; i < targetTimeRegions.length; i++) {
        targetTimeRegion=document.getElementById(targetTimeRegions[i])
        if ( targetTimeRegion.classList=='valid' ) {
            targetTimeRegion.click();
        }
    };
    document.querySelector("#btnNext > span > span").click();

    let messager=document.querySelector("body > div.panel.window.panel-htop.messager-window > div.messager-body.panel-body.panel-body-noborder.window-body > div:nth-child(2)")
    let messager_question_info='该时段仅对熟悉操作者开放，请依据您样品的重要程度和设备操作熟练程度衡量，是否能自行完成所有实验操作？（非工作时段，技术员无法及时解决问题和提供操作培训，请理解。）'
    let messager_warning_info='请选择预约时间段'
    let messager_confirm=document.querySelector("body > div.panel.window.panel-htop.messager-window > div.dialog-button.messager-button > a:nth-child(1) > span")
    if (messager!==null && messager.innerHTML===messager_question_info){
        console.log('已确认非工作时段预约。');
        messager_confirm.click();
    }else if (messager!==null && messager.innerHTML===messager_warning_info) {
        console.log('请选择预约时间段。')
        return;
    };

    // 基本信息页面，点击下一步
    let num=0;
    var yuyue = setInterval( function () {
        loadInfo=document.querySelector("#divUserRelativeInfo");
        if ( loadInfo.innerHTML==='' && num<=500 ) {
            console.log("Waiting for loading.%s",++num)
        }else if( num>500 ) {
            window.confirm("加载超时，重新运行预约。");
            console.log('加载超时，重新运行预约。');
            clearInterval(yuyue);
            return;
        }else{
            console.log('loading succeed.')
            document.querySelector("#btnNext > span > span").click();

            document.querySelector("#HasReadTheNotice").checked=true;
            document.querySelector("#btnNext > span > span").click();
            console.log('Appointment succeed.')

            clearInterval(yuyue);
            return;
        }
    },20);
    // setTimeout(function (){document.querySelector("#btnNext > span > span").click()}, 300);
    // 完成页面，勾选我已仔细阅读并同意以上条款，点击完成
    // document.querySelector("#HasReadTheNotice").checked=false;
    // setTimeout(function (){document.querySelector("#btnNext > span > span").click()}, 600);
    return;
}

yuyue.oncontextmenu = function () {
    targetTimeRegions_clear=window.confirm("确认清除所有已选时间，可重新添加。");
    if (targetTimeRegions_clear) {
        targetTimeRegions = [];
        console.log("已清除所有已选时间。");

    };
};

// 添加鼠标悬停显示已勾选时间段功能
yuyue.onmouseover = function () {
    targetTimeRegions=unique(targetTimeRegions);
    let str='';
    for(var i=0;i<targetTimeRegions.length;i++){
        str+=targetTimeRegions[i]+"\n";
        }
    yuyue.title=str;
}

// 添加按键触发
function keyboard(event) {
  let keycode = event.keyCode;
  if (keycode == 49) {
    yuyue.onclick()
  }
}
document.addEventListener("keydown", keyboard);

// 选取时间时防止重复选取
function unique(arr) {
    if (!Array.isArray(arr)) {
        console.log('type error!')
        return
    }
    var array = [];
    for (var i = 0; i < arr.length; i++) {
        if (array .indexOf(arr[i]) === -1) {
            array .push(arr[i])
        }
    }
    return array;
}

//检测页面加载完成函数
jQuery.fn.wait = function (selector, func, times, interval) {
    var _times = times || -1, //100次
    _interval = interval || 20, //20毫秒每次

    _self = this,
    _selector = selector, //选择器
    _iIntervalID; //定时器id
    if( this.length ){ //如果已经获取到了，就直接执行函数
        func && func.call(this);
    } else {
        _iIntervalID = setInterval(function() {
            if(!_times) { //是0就退出
                clearInterval(_iIntervalID);
            }
            _times <= 0 || _times--; //如果是正数就 --

            _self = $(_selector); //再次选择
            if( _self.length ) { //判断是否取到
                func && func.call(_self);
                clearInterval(_iIntervalID);
            }
        }, _interval);
    }
    return this;
}

// //直接进入个人中心
// grzx="body > div.index-page.font_wryh > div.p3th.sameTitle > div > div.rbox.fldi > div.loginSucces > div.item-2 > a:nth-child(1)"
// $(grzx).wait(grzx, function(){ document.querySelector(grzx).click() });

// //进入仪器设备预约选项
// yqsb="#list001"
// $(yqsb).wait(yqsb, function(){ document.querySelector(yqsb).click() });

//快捷搜索仪器
function createKuaiSuSouSuo(element,){
    var newElement = document.createElement("input");
    newElement.id = element;
    newElement.type="button";
    newElement.value=element;
    newElement.style.cssText += ";    font-family: sans-serif; \
        list-style: none outside none; \
        line-height: 52px; \
        cursor: pointer; \
        text-decoration: none; \
        border:none; \
        padding: 0; \
        border-radius: 10px;\
        background: #E6CEAC;\
        color: #666666; \
        font-size: 14px; \
        color: black; \
        width: 100px; \
        font-weight: bold;"
    target.appendChild(newElement);
}

createKuaiSuSouSuo('fortessa')
fortessa.onclick= function () {
  yqsb="#list001"
  $(yqsb).wait(yqsb, function(){ document.querySelector(yqsb).click() });

  searchBox="#SearchEquipmentName"
  $(searchBox).wait(searchBox, function(){ document.querySelector(searchBox).value="fortessa"; document.querySelector("#btnEquipmentSearch").click() });

  jishiyuyue="#btnAppointment_ede6b9f0-b77c-48ce-ae3f-b4b2998b5d42"
  $(jishiyuyue).wait(jishiyuyue, function(){ document.querySelector(jishiyuyue).click() });

  queren="body > div.panel.window.panel-htop.messager-window > div.dialog-button.messager-button > a:nth-child(1)"
  $(queren).wait(queren, function(){ document.querySelector(queren).click() });
}

createKuaiSuSouSuo('酶标仪')
酶标仪.onclick= function () {
  yqsb="#list001"
  $(yqsb).wait(yqsb, function(){ document.querySelector(yqsb).click() });

  searchBox="#SearchEquipmentName"
  $(searchBox).wait(searchBox, function(){ document.querySelector(searchBox).value="酶标仪"; document.querySelector("#btnEquipmentSearch").click() });
}

createKuaiSuSouSuo('chemiDoc')
chemiDoc.onclick= function () {
  yqsb="#list001"
  $(yqsb).wait(yqsb, function(){ document.querySelector(yqsb).click() });

  searchBox="#SearchEquipmentName"
  $(searchBox).wait(searchBox, function(){ document.querySelector(searchBox).value="chemiDoc"; document.querySelector("#btnEquipmentSearch").click() });
}

// createKuaiSuSouSuo('玻片扫描')
// 玻片扫描.onclick= function () {
//   yqsb="#list001"
//   $(yqsb).wait(yqsb, function(){ document.querySelector(yqsb).click() });

//   searchBox="#SearchEquipmentName"
//   $(searchBox).wait(searchBox, function(){ document.querySelector(searchBox).value="玻片扫描"; document.querySelector("#btnEquipmentSearch").click() });

//   jishiyuyue="#btnAppointment_f94ee40d-375d-4cfe-9bba-d812d4d657a5"
//   $(jishiyuyue).wait(jishiyuyue, function(){ document.querySelector(jishiyuyue).click() });

//   mc="#f87232b6-52ea-42e5-8c84-bb433231179f" //明场
//   $(mc).wait(mc, function(){ document.querySelector(mc).click(); });
// }
