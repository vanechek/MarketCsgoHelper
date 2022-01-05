$(function () {
    $('#success_token').prop('checked', false);
    
    if (localStorage.getItem('token')) {
        $('.token.text').val(localStorage.getItem('token'));
        sendRequest($('.token.text').val());
    }

    $('.token.profit_button').click(function () {
        if ($('.token.text').val().length = 0) {
            $('.content').append("Не введён");
        } else {
            sendRequest($('.token.text').val());
        }
    })


    async function sendRequest(token) {
        debugger;
        let response = await fetch(`https://market.csgo.com/api/v2/get-money?key=${token}`)
            .then(response => response.json())
            .then(result => {

                let sendToken = (code) => {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.executeScript(
                            tabs[0].id,
                            {
                                code: code
                            }
                        )
                    })
                }

                if (result.success) {
                    $('#success_token').prop('checked', true);
                    localStorage.setItem('token', token);
                    debugger;
                    sendToken("localStorage.setItem('token', '" + localStorage.getItem('token') + "')");

                }
                else {
                    $('#success_token').prop('checked', false);
                    sendToken("localStorage.removeItem('token')")
                    localStorage.removeItem('token');
                }
            })
    }
})
