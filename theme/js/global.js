/**
 * Created by Shaiful Islam on 2026-01-15.
 */
// ---------------

const {ipcRenderer} = require('electron');
let basic_info={};
$(document).ready(function ()
{
    ipcRenderer.send("sendRequestToIpcMain", "basic_info");
});
ipcRenderer.on("basic_info", function(e, data) {
    basic_info=data;
    $('title').text(systemSiteName+" "+systemVersion+"--"+basic_info['currentMenu']['title'])
    setSidebarMenu(basic_info['user']['tasks'])

    if (typeof systemPageLoaded === 'function') {
        systemPageLoaded();
    }
})
function getTaskMenu(task){
    let html='<li '+(task['type']=='TASK'?'class="system_task_link" data-file="'+task['url']+'/index" data-title="'+task['name']+'"':'class=""')+'  >';
    if(task['type']=='MODULE'){
        html+='<a href="#side_menu_'+task['id']+'" data-toggle="collapse" aria-expanded="false">' +
            '<i class="bi bi-pentagon-fill"></i> '+task['name']+' <span class="fe-menu-arrow"></span></a>';
    }
    else{
        html+='<a href="#" class="'+(basic_info['currentMenu']['file']==(task['url']+'/index')?'router-link-active router-link-exact-active':'')+'" aria-current="page"><i class="bi bi-life-preserver"></i> '+task['name']+'</a>'
    }
    if(task['children'] && task['children'].length){
        html+='<ul id="side_menu_'+task['id']+'" class="list-unstyled collapse">';
        for(let index in task['children']){
            html+=getTaskMenu(task['children'][index])
        }
        html+='</ul>';
    }
    html+='</li>';
    return html;
}
function setSidebarMenu(tasks){
    let html='<ul class="list-unstyled">';
    html+='<li class="system_task_link" data-title="Dashboard" data-file="dashboard/index">' +
        '<a href="#"  class="'+(basic_info['currentMenu']['file']=='dashboard/index'?'router-link-active router-link-exact-active':'')+'" aria-current="page"><i class="bi bi-life-preserver"></i> Dashboard</a>' +
        '</li>';
    for(let index in tasks['tasksTree']) {
        html+=getTaskMenu(tasks['tasksTree'][index]);
    }

    html+='</ul>';
    $("#system_left_sidebar").html(html)
}
$(document).ajaxSend(function( event, request, settings )
{
    if(settings.url.startsWith('/')){
        settings.url =  basic_info['baseURLApiServer']+ settings.url;
    }
    request.setRequestHeader('Authorization', 'Bearer ' + basic_info['user']['authToken']);
});
$(document).ajaxStart(function()
{
    clearToast()
    $("#system_loading").show();
});
$(document).ajaxError(function(event,xhr,options)
{
    $("#system_loading").hide();
    showServerNotRespondingError()

});
$(document).ajaxComplete(function(event,xhr,options)
{
    $("#system_loading").hide();
});
//toast functions
function clearToast() {
    $.toast().reset('all');
}
function showServerNotRespondingError() {
    $.toast({
        heading: 'Internet Problem',
        text: 'Please Check your Internet Connection.<br> Wait some moment and Try again. You may contact with admin.!',
        icon: 'error', // predefined icon type
        position: 'top-center',
        hideAfter: false // auto-dismiss after 3 seconds
    });
}
function showResponseError(data,where=0) {
    let displayMessages='';
    if (data.error == 'VALIDATION_FAILED') {
        if(typeof data['messages']=='string'){
            displayMessages = data['messages'];
        }else if(typeof data['messages']=='object'){
            let messages='';
            for (let message in data['messages']) {
                messages+=data['messages'][message]+'<br>';
            }
            displayMessages = messages;
        } else{
            displayMessages = data['messages'];
        }
    }
    else {
        displayMessages = data['messages'];
    }
    if(displayMessages){
        $.toast({
            //heading: '&nbsp',
            text: displayMessages,
            icon: 'error', // predefined icon type
            position: 'top-center',
            hideAfter: false // auto-dismiss after 3 seconds
        });
    }
}
//toast end
$(document).on("click", "#handler_left_sidebar", function(event)
{
    $('#system_left_sidebar').toggleClass('inactive');
    $('#system_content').toggleClass('inactive_left_sidebar');
});
$(document).on("click", ".eye_password", function(event)
{
    let input=$(this).siblings('input');
    if(input.attr('type')=='password')
    {
        $(this).find('i').removeClass('icon-eye').addClass('icon-eye-off');
        input.attr('type','text');
    }
    else
    {
        $(this).find('i').removeClass('icon-eye-off').addClass('icon-eye');
        input.attr('type','password');
    }
});
$(document).on('click','.system_task_link',function (event){
    let file=$(this).attr('data-file');
    let title=$(this).attr('data-title');
    ipcRenderer.send("sendRequestToIpcMain", "changeMenu",{'currentMenu':{'file':file,'title':title}});
})
$(document).on('click','#menu_logout',function (event){
    ipcRenderer.send("sendRequestToIpcMain", "logout");
})