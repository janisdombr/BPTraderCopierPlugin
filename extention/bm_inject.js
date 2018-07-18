var time = 0;
var market_symbol = "BTC/USD";
var order_type_tab;
var price = 0, quantity = 0, leverage = 0;
var side = ""; // buy / sell
var reduceOnly = false, passive = false, hidden = false, trigger_close = false;
var trigger_type = "Mark Price"; // Last Price / Index Price
var trigger_lifetime = "GoodTillCancel"; // ImmediateOrCancel / FillOrKill
var priceObserver, leverageObserver, controlsObserver;


window.onkeypress = function (e) {
    var key = e.key;
    if (e.shiftKey) {
        //console.log("Shift + " + key);
        var str_type = 'ASDFGHJФЫВАПРО'; // limit market stop
        var str_dir = 'ZXЯЧ'; // sell buy deleteall
        if (key == " ") {
            var check = document.getElementById("reduceOnlyExecInst");
            check.checked = !check.checked;
            console.log("Уменьшение:");
            reduceOnly = check.checked;
            console.log(reduceOnly);
        }
        else if (str_type.includes(key)) {
            /*if (side == "") {
                alert("Select order side first.\n Sell(Short): Shift + Z \n Buy(Long): Shift + X");
            }*/
            time = new Date().getTime();
            chrome.extension.sendMessage({ action: "keypressed", key: e.key, price: price, quantity: quantity, reduceOnly: reduceOnly });
            side = "";
        }
        else if (str_dir.includes(key)) {
            chrome.extension.sendMessage({ action: "keypressed", key: e.key, price: price, quantity: quantity, reduceOnly: reduceOnly });
            if (key == "Z" || key == "Я") { // sell
                side = "Sell";
            }
            else if (key == "X" || key == "Ч") { // buy
                side = "Buy";
            }
        }
    }
    if (e.altKey) console.log("Alt  + " + key);
    if (e.ctrlKey) console.log("Ctrl + " + key);
};

window.onload = () => {
    order_type_tab = document.getElementsByClassName('controlsBody')[0].classList[1];
    if (order_type_tab == "limit") {
        reduceOnly = document.getElementById("reduceOnlyExecInst").checked;
    }
    console.log('bm injected');
    priceObserver = new MutationObserver(priceChanged);
    //var notDiv = document.getElementsByClassName('notifications')[0];
    var button = document.getElementsByClassName('btn-lg btn btn-block btn-danger sell')[0];
    var div_price = button.getElementsByClassName('summary')[0];
    priceObserver.observe(div_price, { characterData: true, childList: true, subtree: true });
    if (order_type_tab == "limit") {
        price = parseFloat(div_price.innerHTML.split(' @ ')[1]);
    }
    else if (order_type_tab == "market") {
        price = parseFloat(div_price.innerHTML.split(' @ ')[1].substr(2));
    }
    else if (order_type_tab == "stopMarket") {
        price = parseFloat(div_price.innerHTML.split(' @ ')[1].split(':')[1].substr(3));
    }
    quantity = div_price.innerHTML.split(' @ ')[0];

    leverageObserver = new MutationObserver(leverageChanged);
    var div_leverage = document.getElementsByClassName('lineIndicator')[0];
    var span_leverage = div_leverage.getElementsByClassName('valueLabel')[0];
    leverageObserver.observe(span_leverage, { characterData: true, childList: true, subtree: true });
    leverage = parseInt(span_leverage.innerHTML);  

    controlsObserver = new MutationObserver(controlsChanges);
    var ulmenu = document.getElementsByClassName('borderWrapper')[0];
    controlsObserver.observe(ulmenu, { childList: true });
    function controlsChanges(mutations) {
        var new_tab = document.getElementsByClassName('controlsBody')[0];
        if (new_tab.classList[1] != order_type_tab) {
            order_type_tab = new_tab.classList[1];
            console.log('tab changed:' + order_type_tab);
            var button = document.getElementsByClassName('btn-lg btn btn-block btn-danger sell')[0];
            var div_price = button.getElementsByClassName('summary')[0];
            priceObserver.observe(div_price, { characterData: true, childList: true, subtree: true });
            var div_leverage = document.getElementsByClassName('lineIndicator')[0];
            var span_leverage = div_leverage.getElementsByClassName('valueLabel')[0];
            leverageObserver.observe(span_leverage, { characterData: true, childList: true, subtree: true });
        }
    }
    function leverageChanged(mutations) {
        //send info to background
        var div_leverage = document.getElementsByClassName('lineIndicator')[0];
        var span_leverage = div_leverage.getElementsByClassName('valueLabel')[0];
        //console.log('leverage observed');
        //console.log(span_leverage.innerHTML);
        var new_leverage = parseInt(span_leverage.innerHTML);
        //chrome.extension.sendMessage({ action: "XUY" });
        if (new_leverage != leverage) {
            leverage = new_leverage;
            console.log('leverage changed:' + leverage);
        }
        chrome.extension.sendMessage({ action: "leverage", leverage: leverage });
    }
    function priceChanged(mutations) {
        //send info to background
        var button = document.getElementsByClassName('btn-lg btn btn-block btn-danger sell')[0];
        var div_price = button.getElementsByClassName('summary')[0];
        var new_quantity = div_price.innerHTML.split(' @ ')[0];
        if (new_quantity != quantity) {
            quantity = new_quantity;
            console.log('quantity changed:' + quantity);
        }
        var new_price = price;
        if (order_type_tab == "limit") {
            new_price = parseFloat(div_price.innerHTML.split(' @ ')[1]);
        }
        else if (order_type_tab == "market") {
            new_price = parseFloat(div_price.innerHTML.split(' @ ')[1].substr(2));
        }
        else if (order_type_tab == "stopMarket") {
            new_price = parseFloat(div_price.innerHTML.split(' @ ')[1].split(':')[1].substr(3));
        }

        if (new_price != price) {
            price = new_price;
            console.log('price changed:' + price);
        }
        //chrome.extension.sendMessage({ action: "price", price: price, quantity: quantity });
        //chrome.extension.sendMessage({ action: "XUY" });
    }
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "nameofaction") {
            //....code to do something      
            console.log('message received from app action - nameofaction');
        }
        else if (request.action === "back") {
            var deff = new Date().getTime() - time;
            console.log("Message exchange, ms:" + deff);
            //alert('OK');
        }
        else {
            
            console.log(request.action);
            console.log(sender);
            console.log('message received from app action - ?');
        }
    });
};
