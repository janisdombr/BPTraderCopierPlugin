var content;
var apiKeys = [];

window.onload = () => {
    var div = document.getElementById('content');
    content = div;
    if (apiKeys.length == 0) chrome.extension.sendMessage({ action: "APIget", from: "popup" });
    var but = document.getElementById('save');
    but.addEventListener("click", function (e) {
        var form = document.getElementById('form');
        if (apiKeys.length > 0) {
            for (var i = 0; i < apiKeys.length; i++) {
                if (form['enable' + i].checked) {
                    apiKeys[i].enable = true;
                }
                else {
                    apiKeys[i].enable = false;
                }
                apiKeys[i].x = parseFloat(form['x' + i].value);
            }
        }
        chrome.extension.sendMessage({
            action: "APIset", from: "popup", apiKeys: apiKeys
        });
        chrome.extension.sendMessage({ action: "APIget", from: "popup" });
    });
    var butord = document.getElementById('getorders');
    butord.addEventListener("click", function (e) {
       chrome.extension.sendMessage({
            action: "getorders", from: "popup"
        });
    });
    //receive messages from background
    //var pageObserver = new MutationObserver(notificationChanged);
    //var notDiv = document.getElementsByClassName('notifications')[0];
    //pageObserver.observe(notDiv, { childList: true, subtree: true });
    /*chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "nameofaction",
            to: 'back'
        });
    });//*/
};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //content.innerHTML +='message received runtime';
    if (request.action == "orders") {
        var str = '';
        if (apiKeys.length > request.id + 1) {
            if (request.orders.length > 0) {
                apiKeys[request.id].orders = request.orders;
                str = '<table><tr><th>id</th><th>datetime</th><th>price</th><th>status</th></tr>';
                for (var i = 0; i < request.orders.length; i++) {
                    str += '<tr><td>' + request.orders[i].id.split('-')[0] + '</td><td>' + request.orders[i].datetime.replace('T', '\n').replace('Z', '') + '</td><td>' + request.orders[i].price + '</td><td>' + request.orders[i].status + '</td></tr>';
                }
                str += '</table>';
            }
        }
        else {
            console.log("Ошибка");
            console.log(request.id);
            console.log(apiKeys);
            console.log(request.orders);
        }
        var orders_cont = document.getElementById('orders' + request.id);
        orders_cont.innerHTML = str;
        //div.innerHTML += request.method + request.data + sendResponse;
    }
    else if (request.action == "APIget" && request.from == "back") {

        var form = document.getElementById('form');
        var formcontent = document.getElementById('formcontent');
        
        apiKeys = request.apiKeys;
        /*form.apiKey.value = request.apiKey;
        form.apiSecret.value = request.apiSecret;*/
        if (apiKeys.length > 0) {
            var str = '<table><tr><th>use</th><th>ApiKey</th><th>id</th><th>BTC</th><th>%</th></tr>';
            for (var i = 0; i < apiKeys.length; i++) {
                var id, BTC, checkbox, inputx;
                if (apiKeys[i].enable) {
                    id = apiKeys[i].info.info[0].account;
                    BTC = apiKeys[i].info.BTC.total;
                    checkbox = '<input type="checkbox" checked="checked" name="enable' + i + '" />';
                    inputx = '<input type="text" name="x' + i + '" value="' + apiKeys[i].x + '" class="inputx" />';
                }
                else {
                    id = i;
                    BTC = 0;
                    checkbox = '<input type="checkbox" name="enable' + i + '" />';
                    inputx = '<input type="text" name="x' + i + '" value="' + apiKeys[i].x + '" class="inputx" />';
                }
                str += '<tr><td>' + checkbox + '</td><td>' + apiKeys[i].apiKey + '</td><td>' + id + '</td><td>' + BTC + '</td><td>' + inputx + '</td></tr>';
                str += '<tr><th colspan="5">Orders</th></tr>';
                str += '<tr><td colspan="5"><div id="orders'+ i +'"></div></td></tr>';
            }
            str += '</table>';
            formcontent.innerHTML = str;
        }
    }
    else if (request.action == "keypressed") {
        //alert('OK');
    }
});

