/**
 * В карточке предмета расчитывает прибыль от первой заявки.
 */
if ($(".rectanglestats > .rectanglestat").length > 0) {
    let rectanglestat = document.getElementsByClassName('rectanglestats')[1]
        .getElementsByClassName('rectanglestat')[1];

    let bestPrice = getPriceWithWhiteSpace($('.ip-bestprice')[0].innerText);

    let price = getPriceWithWhiteSpace(rectanglestat.getElementsByTagName('b')[0].outerText);

    var comm = Math.floor(bestPrice * (1 - 0.05) * 100) / 100;
    var profit = (comm - price).toFixed(2);

    let p = document.createElement("span");
    p.textContent = `Прибыль от лучшей цены(${bestPrice}): +-${profit}`;
    p.style.fontSize = '15px';
    p.style.color = 'red';

    rectanglestat.appendChild(p);
}

/**
 * Удаляет из карточки лишние предметы с другим качеством. 
 */
if($('.sameitem').length > 0){
    let propertySelectedItems = $('.item-appearance')[0].dataset.wear;
    let items = $('.sameitem');

    for (let i = 0; i < items.length; i++) {
        if(items[i].dataset.wear !== propertySelectedItems){
            items[i].remove();
        }
    }
}
/**
 * Добавляет в заявках основную цену.
 */
if($('.table-list.tracking-items').length > 0){
    let ordersItems = getAllOrder();
    for (let i = 0; i < ordersItems.length; i++) {
        if(ordersItems[i].dataset.item === undefined){
            continue;
        }
        let info = ordersItems[i].dataset.item.split('/');
        setPriceItemInOrders(info[0], info[1], localStorage.getItem('token'), ordersItems[i]);
    }
}

/**
 * Добавляет кнопка рядом с REMOVE ALL
 */
if($('.pagination.pagination-top').length > 0) {
    let buttons = $('.pagination.pagination-top')[0];
    let b = document.createElement("a");
    b.className = `pagi-link reset-price-all`;
    b.innerText = 'RESET SUKA';
    buttons.appendChild(b)
}

/**
 * Обработчик новой кнопки.
 */
$('.pagi-link.reset-price-all').click(async function(){
    debugger;
    var orders = getAllOrder();
    for(let i = 0; i < orders.length; i++){
        if(orders[i].dataset.item === undefined){
            continue;
        }

        let info = orders[i].dataset.item.split('/');
        orders[i].children[1].children[0].innerText  = "0.01";
        await fetch(`https://market.csgo.com/api/UpdateOrder/${info[0]}/${info[1]}/1/?key=${localStorage.getItem('token')}`)
        .then(response => response.json())
        .then(result => {
            if(result.success)
            console.log("Обновлён");
        });
    }
})

/**
 * 
 * @param {*} price цена с пробелом.
 * @returns 
 */
function getPriceWithWhiteSpace(price) {
    var newPrice = price.replace(/\s/g, "")
    return parseFloat(newPrice);
}

/**
 * Получает все завки
 * @returns заявки.
 */
function getAllOrder(){
    return $('.table-list.tracking-items')[0].childNodes[1].children;
}

/**
 * Обработчик наведении на предмет.
 */
$('.item').hover(function name(event) {
    var target = event.currentTarget;
	if(target.getElementsByClassName('info').length > 0){
		return;
	} 
    
    let href = target.href.replace('https://market.csgo.com/item/', "");
    let countslash = 0;
    let classid = "";
    let instanceid = "";
    for (let i = 0; i < href.length; i++) {
        if (href[i] === "-") {
            countslash++;
            continue;
        }
        if (href[i] !== "-" && countslash === 0) {
            classid += href[i];
        }
        if (href[i] !== "-" && countslash === 1) {
            instanceid += href[i];
        }
        if (countslash === 2) {
            break;
        }
    }
    if (localStorage.getItem('token')) {
        setInfoInMarket(classid, instanceid, localStorage.getItem('token'), target);
        console.log(`${classid}, ${instanceid}`);
    } else {
        alert("Не введён токен");
    }
})

/**
 * Установка цены в карточке предмета.
 * @param {*} classid Номер класса.
 * @param {*} instanceid Номер источника.
 * @param {*} token Ключ апи.
 * @param {*} target Элемент в котором будем проставка цены.
 */
async function setPriceItemInOrders(classid, instanceid, token, target){
    await fetch(`https://market.csgo.com/api/ItemInfo/${classid}_${instanceid}/ru/?key=${token}`)
    .then(response => response.json())
    .then(result => {
        if (result.success || result.offers.length > 0) {
            let firstPrice = result.offers[0].price;

            let two = firstPrice.length - 2;
             let newPrice = "";
             for (let i = 0; i < firstPrice.length; i++) {
                 if (two == i) {
                     newPrice += "."
                 }
                  newPrice += firstPrice[i];
             }

            let price =  getPriceWithWhiteSpace(newPrice);

            target.children[0].children[0].innerText = " " + target.children[0].children[0].innerText + "Первая цена: " + price;
        }
    });
}

/**
 * Расчёт профита предмета и добавление кнопки для добавления в автозакуп. 
 * @param {*} classid Номер класса.
 * @param {*} instanceid Номер источника.
 * @param {*} token Ключ апи.
 * @param {*} target Элемент в котором будем проставка цены.
 */
async function setInfoInMarket(classid, instanceid, token, target) {

    if (target.getElementsByClassName('profit').length === 0) {
        var tg = target.getElementsByClassName("image")[0];
        let p = document.createElement("div");
        p.className = 'profit'
        p.innerText = `Профит загрузка`;
        p.style.color = 'blue';
        p.style.fontSize = '15px';
        p.style.fontWeight = '600'
        p.style.background = 'white'
        tg.appendChild(p)
    }
    await fetch(`https://market.csgo.com/api/ItemInfo/${classid}_${instanceid}/ru/?key=${token}`)
        .then(response => response.json())
        .then(result => {
            if (result.success || result.offers.length > 0) {

                let bestPrice = getPriceWithWhiteSpace(target.getElementsByClassName('price')[0].innerText);
                let href = target.href;

                if (target.href !== "") {
                    let name = target.getElementsByClassName("name")[0];
                    name.innerHTML = '<a class=\"link12\" href=\"' + href + `\" style=\"color: #000000;\">\n${name.outerText}\n</a>`;
                }
                target.removeAttribute("href");

                let bestOffer = result.buy_offers[0].o_price;

                let two = bestOffer.length - 2;
                let newPrice = "";
                for (let i = 0; i < bestOffer.length; i++) {
                    if (two == i) {
                        newPrice += "."
                    }
                    newPrice += bestOffer[i];
                }

                let price = getPriceWithWhiteSpace(newPrice);

                var comm = Math.floor(bestPrice * (1 - 0.05) * 100) / 100;
                var profit = (comm - price).toFixed(2);
                if (target.getElementsByClassName('add-order').length === 0) {
                    var tg = target.getElementsByClassName("image")[0];
                    let b = document.createElement("button");
                    b.className = `add-order`
                    b.id = `${classid} ${instanceid} ${price}`
                    b.innerText = 'добавить'
                    tg.appendChild(b)

                }
                if (target.getElementsByClassName('profit')[0].innerText === "Профит загрузка") {
                    target.getElementsByClassName('profit')[0].innerText = "Профит " + profit;
                }

                $(".add-order").click(async function (event) {
                    if (event.target.className !== "add-order clicked") {
                        event.target.classList.add("clicked")
                        let col = event.target.id.split(" ");
                        await fetch(`https://market.csgo.com/api/InsertOrder/${col[0]}/${col[1]}/${col[2]}//?key=${localStorage.getItem('token')}`)
                            .then(response => response.json())
                            .then(result => {
                                if (result.error) {
                                    alert(result.error);
                                }
                                if (result.success) {
                                }
                                event.target.classList.remove("clicked")
                            })
                    }
                })
            }
        })
}