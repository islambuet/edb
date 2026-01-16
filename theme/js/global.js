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
    if (typeof systemPageLoaded === 'function') {
        systemPageLoaded();
    }
})
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