//var crypto = require('crypto');


var orders = [];
var time = 0;
update_apikeys();

var market_symbol = "BTC/USD";

var order_side = null;
var order_type = null;
var press_time = null;


function update_apikeys() {
    if (apiKeys.length > 0) {
        for (var i = 0; i < apiKeys.length; i++) {
            if (apiKeys[i].enable && !apiKeys[i].bitmex) {
                apiKeys[i].bitmex = new ccxt.bitmex({
                    apiKey: apiKeys[i].apiKey,
                    secret: apiKeys[i].apiSecret,
                });
                apiKeys[i].info = {};
                (async () => {
                    apiKeys[i].info = await apiKeys[i].bitmex.fetchBalance();
                    //apiKeys[i].info = { id: bal.info.account, BTC: bal.BTC.total };
                })();
            }
        }
    }
}

function query(verb, path, postBody) {
    var expires = parseInt((new Date().getTime() + (60 * 1000)) / 1000); //'1518064238';//
    var req = new XMLHttpRequest();
    //var data = { symbol: "XBTUSD", startTime: "2018-06-22T22%3A50%3A16.818Z", count: 1, reverse: true };
    //var postBody = '{"orderID":"810e400a-e408-7184-3c23-21e8316d3e10"}';//'{symbol: "XBTUSD", side: "Buy", orderQty: 1, ordType: "Limit", price: 6100}';//'{"symbol": "XBTUSD", "startTime": "2018-06-22", "count": 1, "reverse": true}';//JSON.stringify(data);
    //var path = '/api/v1/order/all';// '/api/v1/order' '/api/v1/instrument?filter=%7B%22symbol%22%3A+%22XBTUSD%22%7D';
    var signature = '';//var signature = sha256.hmac.create(apiSecret).update(verb + path + expires + postBody).hex();
    var body = 'method=' + verb + '&url=' + 'https://www.bitmex.com' + path + '&expires=' + expires;
    for (var i = 0; i < apiKeys.length; i++) {
        if (apiKeys[i].enable) {
            var cloneOfpostBody = JSON.parse(JSON.stringify(postBody));
            if (cloneOfpostBody.orderQty) {
                cloneOfpostBody.orderQty = parseInt(cloneOfpostBody.orderQty * apiKeys[i].x);
            }
            var pbody = JSON.stringify(cloneOfpostBody);
            signature = sha256.hmac.create(apiKeys[i].apiSecret).update(verb + path + expires + postBody).hex();
            body += '&keys[' + i + ']=' + apiKeys[i].apiKey;
            body += '&signatures[' + i + ']=' + signature;
            body += '&body[' + i + ']=' + signature;
        }
    }
    //body += '&body=' + postBody;
    //console.log(verb + path + expires + postBody);
    //console.log('signature:' + signature);
    //req.open(verb, "https://www.bitmex.com" + path, true);
    req.open("POST", "http://test.myexpert.lv/req.php", true);
    //req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //req.setRequestHeader('api-expires', expires);
    //req.setRequestHeader('api-nonce', nonce);
    //req.setRequestHeader('api-key', apiKey);
    //req.setRequestHeader('api-signature', signature);
    /*req.setRequestHeader('Cookie', '');
    req.setRequestHeader('Host', '');*/
    //req.withCredentials = false;
    req.onreadystatechange = function () {
        //console.log(this.readyState);
        if (this.status == 200 && this.readyState == 4) {
            var diff = new Date().getTime() - time;
            console.log("Delay (ms):" + diff);
            console.log("\n OK! \n");
            if (this.responseText) {
                try {
                    var resp = JSON.parse(this.responseText);
                    console.log(resp);
                    //return resp;
                }
                catch (e) {
                    console.log("ERROR:\n");
                    console.log(this.responseText);
                    //return false;
                }
            }
        }
        else {
            console.log("??:\n");
            console.log("Status! \n" + this.status + "\n" + this.readyState + this.responseText);
            return false;
        }
    };
    time = new Date().getTime();
    req.send(body); //*/        
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Message received from:");
    console.log(sender);
    console.log("action:" + request.action);
    if (request.action === "XYU") {
        console.log("Start XYU:");
        var path = '/api/v1/order';
        var verb = "POST";
        var postBody = '{"symbol": "XBTUSD", "side": "Buy", "orderQty": 1, "ordType": "Limit", "price": 6000}';

        //query(verb, path, postBody);
        path = '/api/v1/order/all';
        verb = "DELETE";
        postBody = '';

        //query(verb, path, postBody);

        //var bitmex = apiKeys[0].bitmex;
    /*new ccxt.bitmex({
        apiKey: apiKey,
        secret: apiSecret
    });//*/
    //console.log(bitmex);
        //var postBody = '{"symbol":"XBTUSD",leverage:3}';
        //var signature = sha256.hmac.create(apiSecret).update('POST' + '/api/v1/position/leverage' + expires + postBody).hex();
        /*(async function () {
            amount = 1;
            price = 6100;
            var lev = await bitmex.createLimitBuyOrder(market_symbol, amount, price);//bitmex.privatePostPositionLeverage({symbol:"XBTUSD",leverage:3});
            var diff = new Date().getTime() - time;
            console.log(diff);
            console.log(lev);
            var time = new Date().getTime();
            await bitmex.cancelOrder(lev.id);//'a5b4f5c8-4bcd-f36f-0ddb-070c723a061e');//
            var diff = new Date().getTime() - time;
            console.log(diff);
        })();
        /*(async function () {
            orders = await bitmex.fetchOrders('BTC/USD', new Date().getTime() - (10 * 24 * 60 * 60 * 1000), 1, { open: true, reverse: true });
            var diff = new Date().getTime() - time;
            console.log(diff);
            console.log(orders);
            if (orders.length > 0) {
                console.log(orders[0].id);
                //chrome.extension.sendMessage({ action: "orders", orders: orders });
            }
        })();//*/
        
    }
    else if (request.action === "price"){
        
        console.log("price:" + request.price);
        console.log("quantity:" + request.quantity);
    }
    else if (request.action == "APIget" && request.from == "popup") {
        console.log("APIget from popup");
        chrome.extension.sendMessage({ action: "APIget", from: "back", apiKeys: apiKeys});
    }
    else if (request.action == "APIset" && request.from == "popup") {
        console.log("apiKeys before:");
        console.log(apiKeys);
        console.log("apiKeys changed:");
        console.log(request.apiKeys);
        if (request.apiKeys.length == apiKeys.length) {
            for (var i = 0; i < apiKeys.length; i++) {
                apiKeys[i].enable = request.apiKeys[i].enable;
                apiKeys[i].x = request.apiKeys[i].x;
            }
            update_apikeys();
        }
        console.log("apiKeys after:");
        console.log(apiKeys);
        chrome.extension.sendMessage({ action: "APIget", from: "back", apiKeys: apiKeys });
    }
    else if (request.action == "getorders" && request.from == "popup") {
        console.log("getorders from popup");
        if (apiKeys.length > 0) {
            for (var i = 0; i < apiKeys.length; i++) {
                if (apiKeys[i].enable) {
                    if (!apiKeys[i].bitmex) {
                        apiKeys[i].bitmex = new ccxt.bitmex({
                            apiKey: apiKeys[i].apiKey,
                            secret: apiKeys[i].apiSecret,
                        });
                    }
                    time = new Date().getTime();
                    (async () => {
                        var ind = i;
                        var open_orders = await apiKeys[ind].bitmex.fetchOrders(market_symbol, new Date().getTime() - (10 * 24 * 60 * 60 * 1000), 10, { reverse: true }); //open: true, 
                        var diff = new Date().getTime() - time;
                        console.log(diff);
                        console.log(open_orders);
                        chrome.extension.sendMessage({ action: "orders", orders: open_orders, id: ind });
                        console.log("orders sent:" + ind);
                    })();
                }
            }
        }
    }
    else if (request.action == "keypressed") {
        console.log("keypressed");
        var key = request.key;
        //alert('Отправление ордеров временно отключено. Вы нажали: Shift + ' + key);
        var limit = false;
        var stop = false;
        var params = {};
        var path = '';
        var verb = '';
        var postBody = '';

        
        if (key == "A" || key == "Ф") { // market
            if (order_side && (new Date().getTime() - press_time) < 1000) {
                var path = '/api/v1/order';
                var verb = 'POST';
                var postBody = {symbol: "XBTUSD", side: order_side, orderQty: request.quantity, ordType: "Market"};
                query(verb, path, postBody);
                press_time = new Date().getTime() - 1000;
                order_type = null;
                order_side = null;
            }
            else {
                press_time = new Date().getTime();
                order_type = "Market";
            }
        }
        else if (key == "S" || key == "Ы") { // limit
            if (order_side && (new Date().getTime() - press_time) < 1000) {
                var path = '/api/v1/order';
                var verb = 'POST';
                var postBody = { symbol: "XBTUSD", side: order_side, orderQty: request.quantity, ordType: "Limit", price: request.price };
                if (request.reduceOnly)
                    postBody.execInst = "ReduceOnly";
                query(verb, path, postBody);
                press_time = new Date().getTime() - 1000;
                order_type = null;
                order_side = null;
            }
            else {
                press_time = new Date().getTime();
                order_type = "Limit";
            }
        }
        else if (key == "D" || key == "В") {  // stop market
            if (order_side && (new Date().getTime() - press_time) < 1000) {
                var path = '/api/v1/order';
                var verb = 'POST';
                var postBody = {symbol: "XBTUSD", side: order_side, orderQty: request.quantity, ordType: "Stop", stopPx: request.price };
                query(verb, path, postBody);
                press_time = new Date().getTime() - 1000;
                order_type = null;
                order_side = null;
            }
            else {
                press_time = new Date().getTime();
                order_type = "Stop";
            }
        }
        else if (key == "Z" || key == "Я") {  // sell
            if (order_type && (new Date().getTime() - press_time) < 1000) {
                var path = '/api/v1/order';
                var verb = 'POST';
                var postBody = { symbol: "XBTUSD", side: "Sell", orderQty: request.quantity, ordType: order_type };
                if (order_type == "Stop")
                    postBody.stopPx = request.price;
                else if (order_type == "Limit") {
                    postBody.price = request.price;
                    if (request.reduceOnly)
                        postBody.execInst = "ReduceOnly";
                }
                query(verb, path, postBody);
                press_time = new Date().getTime() - 1000;
                order_type = null;
                order_side = null;
            }
            else {
                press_time = new Date().getTime();
                order_side = "Sell";
            }
        }
        else if (key == "X" || key == "Ч") {  // buy
            if (order_type && (new Date().getTime() - press_time) < 1000) {
                var path = '/api/v1/order';
                var verb = 'POST';
                var postBody = { symbol: "XBTUSD", side: "Buy", orderQty: request.quantity, ordType: order_type };
                if (order_type == "Stop")
                    postBody.stopPx = request.price;
                else if (order_type == "Limit") {
                    postBody.price = request.price;
                    if (request.reduceOnly)
                        postBody.execInst = "ReduceOnly";
                }
                query(verb, path, postBody);
                press_time = new Date().getTime() - 1000;
                order_type = null;
                order_side = null;
            }
            else {
                press_time = new Date().getTime();
                order_side = "Buy";
            }
        }
        else if (key == "C" || key == "С") {  // delete all
            path = '/api/v1/order/all';
            verb = "DELETE";
            postBody = {};
            query(verb, path, postBody);
        }
        
        //side:, price: price, quantity: quantity, leverage: leverage, reduceOnly: reduceOnly, market_symbol: market_symbol
        
        
        if (apiKeys.length > 0) {
            for (var i = 0; i < apiKeys.length; i++) {
                if (apiKeys[i].enable) {
                    if (!limit && request.side == "buy") {
                        (async () => {
                            var ind = i;
                            //var order = await apiKeys[ind].bitmex.createMarketBuyOrder(market_symbol, request.quantity, params); //open: true, 
                            var diff = new Date().getTime() - time;
                            console.log(diff);
                            console.log(open_orders);
                            chrome.extension.sendMessage({ action: "orders", orders: open_orders, id: ind });
                            console.log("orders sent:" + ind);
                        })();
                    }
                    else if (request.side == "buy" && limit) {
                        //apiKeys[i].bitmex.createLimitBuyOrder(market_symbol, params);
                    }
                    else if (request.side == "sell" && limit) {
                        //apiKeys[i].bitmex.createLimitSellOrder(market_symbol, params);
                    }
                    
                    console.log(apiKeys[i].info);
                    console.log(apiKeys[i].bitmex);
                }
            }
        }
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "back"
            });
        });
    }
    else if (request.action == "leverage") {
        var path = '/api/v1/position/leverage';
        var verb = 'POST';
        var postBody = { symbol: "XBTUSD", leverage: request.leverage };

        query(verb, path, postBody);
        //var postBody = '{"symbol":"XBTUSD",leverage:3}';
        //var signature = sha256.hmac.create(apiSecret).update('POST' + '/api/v1/position/leverage' + expires + postBody).hex();
    }
    else {        
    }
});  