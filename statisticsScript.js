let currentPage = 0;
let tableId = "";
let statisticsTableUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10&page=${currentPage}1`;
// let chartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`;
let tableContainer = document.createElement("statisticsTableContainer");
let coinsData = [];

async function getCoinsDataAsync(url) {
    try{
        let response = await fetch(url);
        console.log(response);
        return await response.json();
    }catch(err){
        console.error(err);
        // Handle errors here
    }
}

function renderStatisticsTable(data){
    let str = [];
    str.push(`<table class="table table-hover table-responsive table-fit">
    <thead>
      <tr>
        <th scope="col">Rank</th>
        <th scope="col">Logo</th>
        <th scope="col">Name</th>
        <th scope="col">Market Cap</th>
        <th scope="col">Price</th>
        <th scope="col">Price change in % <br>(last 24h)</th>
        <th scope="col">Total supply</th>
        <th scope="col">Price change<br>(last 7 days)</th>
      </tr>
    </thead>
    <tbody>
    `); 
    for(let coin of data){
        str.push( `<tr class="${coin.id}"><td>${coin.market_cap_rank}</td>
        <td class="img-fluid align-middle"><img src="${coin.image}" height="50px" alt="${coin.id}"}"></td>
        <td class="align-middle">${coin.name}</td>
        <td class="align-middle">${coin.market_cap.toLocaleString('en-US')}</td>
        <td class="align-middle">${coin.current_price.toLocaleString('en-US')}</td>
        <td class="align-middle">${coin.price_change_percentage_24h > 0 ? "<strong class='increase'>↑</strong>" : "<strong class='decrease'>↓</strong>"}&nbsp &nbsp${coin.price_change_percentage_24h}% </td>
        <td class="align-middle">${coin.total_supply !=null ? coin.total_supply.toLocaleString('en-US') : "N/A"}</td>
        <td class="align-middle"><div class="smallChartContainer chart-container"></div><canvas id="${coin.id}" style ="max-width:200px !important; max-height:9vh"></canvas></div></td>
        </tr>
        `)
    }
    str.push(`</tbody></table>`)
    return str.join('');
}

async function drawChartAsync(coinId) {  

    let currentUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`;
    let chartCanvas = document.getElementById(coinId);
    let ctx = chartCanvas.getContext("2d"); 
    let config = await showChart(currentUrl);
    new Chart(
        ctx,
        config
    );
}



window.addEventListener('load', async (event) => {
    let data = [];
    try{
        data = await getCoinsDataAsync(statisticsTableUrl);
        let statisticsTableContainer = document.getElementById("statisticsTableContainer");
        statisticsTableContainer.innerHTML = renderStatisticsTable(data);
        data.forEach(async coin => {
            console.log(document.getElementById(coin.id).getContext("2d"));
            await drawChartAsync(coin.id)
        });
    }
    catch(err){
        console.log("Error");
    }
    console.log(data);
  });



function convertUnixToDate(unix) {
    let date = new Date(unix);

    let formattedDate = date.toLocaleString("en-US", { day: "numeric", month: "long", hour: "numeric", minute: 'numeric', year: 'numeric' });
    return formattedDate
}

async function showChart(url) {

    let chartData = await getCoinsDataAsync(url)
    let priceResult = [];
    let timeResult = [];
    let convertedDate;


    for (const data of chartData.prices) {
        convertedDate = convertUnixToDate(data[0])
        timeResult.push(convertedDate);
        priceResult.push(data[1])
    }

    const data = {
        labels: timeResult,
        datasets: [{
            backgroundColor: 'rgb(255,215,0)',
            borderColor: 'rgb(218,165,32)',
            data: priceResult,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    ticks: {
                        display: false,
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            events: [],
            maintainAspectRatio    : false
        }
    };
    return config;
}
