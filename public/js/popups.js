

let arrayCountPopUp = [];
$.fn.sys_popupSystem = async function(code, valueMsg){
    $("#system-section-notification").fadeIn();//deixando visivel a section principal

    if(code == "SYS01"){
        let idPopUp = arrayCountPopUp.push(+1);

        $("#sys-notifi-container-main").fadeIn()
        .append(`<div class="sys-notifi-box-one" id="sys-notifi-box-one-${idPopUp}">
        <div class="sys-notifi-mark-left-one"></div>
            <div class="sys-notifi-main-msg-display-one">
                <div class="sys-notifi-container-msg-center-one">
                    <div class="sys-notifi-icon-one"><i class="ri-check-line"></i></div>
                    <div class="sys-notifi-text-one">
                        <span id="sys-nofiti-text-one">${valueMsg}</span>
                    </div>
                </div>
            </div>
        </div>`);

        setTimeout(()=> {
            $("#sys-notifi-box-one-"+idPopUp).fadeOut(1000,function() { $(this).remove(); })
            arrayCountPopUp.splice(arrayCountPopUp.indexOf(idPopUp), 1)
        },5000)
    }
    
    if(code == "SYS02"){
        let idPopUp = arrayCountPopUp.push(+1);

        $("#sys-notifi-container-main").fadeIn()
        .append(`<div class="sys-notifi-box-two" id="sys-notifi-box-two-${idPopUp}">
        <div class="sys-notifi-mark-left-two"></div>
            <div class="sys-notifi-main-msg-display-two">
                <div class="sys-notifi-container-msg-center-two">
                    <div class="sys-notifi-icon-two"><i class="ri-error-warning-line"></i></div>
                    <div class="sys-notifi-text-two">
                        <span id="sys-nofiti-text-two">${valueMsg}</span>
                    </div>
                </div>
            </div>
        </div>`);

        setTimeout(()=> {
            $("#sys-notifi-box-two-"+idPopUp).fadeOut(1000,function() { $(this).remove(); })
            arrayCountPopUp.splice(arrayCountPopUp.indexOf(idPopUp), 1)
        },6000)
    }
    
    if(code == "SYS03"){

        let idPopUp = arrayCountPopUp.push(+1);

        $("#sys-notifi-container-main").fadeIn()
        .append(`<div class="sys-notifi-box-three" id="sys-notifi-box-three-${idPopUp}">
        <div class="sys-notifi-mark-left-three"></div>
            <div class="sys-notifi-main-msg-display-three">
                <div class="sys-notifi-container-msg-center-three">
                    <div class="sys-notifi-icon-three"><i class="ri-close-circle-line"></i></div>
                    <div class="sys-notifi-text-three">
                        <span id="sys-nofiti-text-three">${valueMsg}</span>
                    </div>
                </div>
            </div>
        </div>`);

        setTimeout(()=> {
            $("#sys-notifi-box-three-"+idPopUp).fadeOut(1000,function() { $(this).remove(); })
        },7000)

    }

    
    //Deletando os cookies
    await Cookies.remove("SYS-NOTIFICATION-EXE1")
    await Cookies.remove("SYS-NOTIFICATION-EXE2")
    await Cookies.remove("SYS-NOTIFICATION-EXE3")
}

//SISTEMA DE POPUP {Sucesso, atenção, erro}
if(Cookies.get("SYS-NOTIFICATION-EXE1") != undefined){
    //Sucesso!!
    const valuesCookiesEXE1 = Cookies.get("SYS-NOTIFICATION-EXE1").split("|");
    $.fn.sys_popupSystem(valuesCookiesEXE1[0], valuesCookiesEXE1[1]);
}
if(Cookies.get("SYS-NOTIFICATION-EXE2") != undefined){
    //Sucesso!!
    const valuesCookiesEXE2 = Cookies.get("SYS-NOTIFICATION-EXE2").split("|");
    $.fn.sys_popupSystem(valuesCookiesEXE2[0], valuesCookiesEXE2[1]);
}
if(Cookies.get("SYS-NOTIFICATION-EXE3") != undefined){
    //Sucesso!!
    const valuesCookiesEXE3 = Cookies.get("SYS-NOTIFICATION-EXE3").split("|");
    $.fn.sys_popupSystem(valuesCookiesEXE3[0], valuesCookiesEXE3[1]);
}