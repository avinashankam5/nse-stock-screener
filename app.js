let allStocks = [];
let currentStocks = [];
let sortDirection = {};

function formatPercent(value){

    if(value == null || value === "")
        return "";

    return (value * 100).toFixed(2) + "%";
}

function recommendationColor(rec){

    if(!rec)
        return "";

    rec = rec.toLowerCase();

    if(rec === "strong_buy")
        return "strong-buy";

    if(rec === "buy")
        return "buy";

    if(rec === "hold")
        return "hold";

    if(rec === "sell")
        return "sell";

    return "";
}

function renderTable(data){

    currentStocks = data;

    const tbody =
        document.querySelector(
            "#stocks tbody"
        );

    tbody.innerHTML = "";

    data.forEach(stock => {

        const tr =
            document.createElement("tr");

        tr.innerHTML =

            "<td>" + (stock.symbol || "") + "</td>" +

            "<td>" + (stock.close || "") + "</td>" +

            "<td>" + (stock.rsi || "") + "</td>" +

            "<td>" + (stock.dma20_gap_pct || "") + "</td>" +

            "<td>" + (stock.dma50_gap_pct || "") + "</td>" +

            "<td>" + (stock.dma100_gap_pct || "") + "</td>" +

            "<td>" + (stock.dma200_gap_pct || "") + "</td>" +

            "<td>" + (stock.dma300_gap_pct || "") + "</td>" +

            "<td>" + (stock.target || "") + "</td>" +

            "<td>" + (stock.target_upside_pct || "") + "</td>" +

            "<td>" + (stock.sector || "") + "</td>" +

            "<td>" + (stock.industry || "") + "</td>" +

            "<td>" + (stock.trailing_pe || "") + "</td>" +

            "<td>" + (stock.forward_pe || "") + "</td>" +

            "<td>" + (stock.price_to_book || "") + "</td>" +

            "<td>" + formatPercent(stock.roe) + "</td>" +

            "<td>" + (stock.debt_to_equity || "") + "</td>" +

            "<td>" + formatPercent(stock.revenue_growth) + "</td>" +

            "<td>" + formatPercent(stock.earnings_growth) + "</td>" +

            "<td class='" +
            recommendationColor(
                stock.recommendation
            ) +
            "'>" +
            (stock.recommendation || "") +
            "</td>" +

            "<td>" +
            (stock.analyst_count || "") +
            "</td>";

        tbody.appendChild(tr);

    });
}

async function loadData(){

    try{

        const response =
            await fetch("stocks.json");

        allStocks =
            await response.json();

        currentStocks =
            [...allStocks];

        renderTable(
            currentStocks
        );

    }
    catch(error){

        console.error(error);

        alert(
            "Error loading stocks.json"
        );
    }
}

function sortTable(field){

    let dir =
        sortDirection[field] || 1;

    currentStocks.sort(
        (a,b)=>{

            let av =
                a[field];

            let bv =
                b[field];

            if(av == null)
                av = "";

            if(bv == null)
                bv = "";

            if(
                typeof av ===
                "string"
            ){

                return dir *
                av.localeCompare(
                    bv
                );
            }

            return dir *
            (av - bv);
        }
    );

    sortDirection[field] =
        dir * -1;

    renderTable(
        currentStocks
    );
}

function searchStocks(){

    const term =
        document
        .getElementById(
            "search"
        )
        .value
        .toLowerCase();

    const filtered =
        allStocks.filter(
            stock =>

                (
                    stock.symbol || ""
                )
                .toLowerCase()
                .includes(term)

                ||

                (
                    stock.sector || ""
                )
                .toLowerCase()
                .includes(term)

                ||

                (
                    stock.industry || ""
                )
                .toLowerCase()
                .includes(term)
        );

    renderTable(
        filtered
    );
}

window.onload = function(){

    loadData();

    document
    .getElementById(
        "search"
    )
    .addEventListener(
        "keyup",
        searchStocks
    );
};
