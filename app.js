let allStocks = [];
let filteredStocks = [];
let currentSortField = null;
let currentSortDirection = 1;

// ----------------------------------
// Load Data
// ----------------------------------

async function loadData() {

    try {

        const response =
            await fetch(
                "stocks.json?v=" +
                new Date().getTime()
            );

        allStocks =
            await response.json();

        filteredStocks =
            [...allStocks];

        populateFilters();

        applyFilters();

    }
    catch (err) {

        console.error(err);

        alert(
            "Unable to load stocks.json"
        );
    }
}

// ----------------------------------
// Populate Filters
// ----------------------------------

function populateFilters() {

    const sectorFilter =
        document.getElementById(
            "sectorFilter"
        );

    const industryFilter =
        document.getElementById(
            "industryFilter"
        );

    const sectors =
        [...new Set(
            allStocks
            .map(
                s => s.sector
            )
            .filter(Boolean)
        )]
        .sort();

    const industries =
        [...new Set(
            allStocks
            .map(
                s => s.industry
            )
            .filter(Boolean)
        )]
        .sort();

    sectorFilter.innerHTML =
        '<option value="">All Sectors</option>';

    sectors.forEach(sec => {

        sectorFilter.innerHTML +=
            `<option value="${sec}">
                ${sec}
            </option>`;
    });

    industryFilter.innerHTML =
        '<option value="">All Industries</option>';

    industries.forEach(ind => {

        industryFilter.innerHTML +=
            `<option value="${ind}">
                ${ind}
            </option>`;
    });
}

function updateIndustryFilter() {

    const selectedSector =
        document.getElementById(
            "sectorFilter"
        ).value;

    const industryFilter =
        document.getElementById(
            "industryFilter"
        );

    let sourceStocks =
        allStocks;

    if (selectedSector) {

        sourceStocks =
            allStocks.filter(
                stock =>
                stock.sector ===
                selectedSector
            );
    }

    const industries =
        [...new Set(
            sourceStocks
            .map(
                stock =>
                stock.industry
            )
            .filter(Boolean)
        )]
        .sort();

    industryFilter.innerHTML =
        '<option value="">All Industries</option>';

    industries.forEach(industry => {

        industryFilter.innerHTML +=
            `<option value="${industry}">
                ${industry}
            </option>`;
    });
}
// ----------------------------------
// Apply Filters
// ----------------------------------

function applyFilters() {

    const search =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    const sector =
        document
        .getElementById(
            "sectorFilter"
        )
        .value;

    const industry =
        document
        .getElementById(
            "industryFilter"
        )
        .value;

    const reco =
        document
        .getElementById(
            "recommendationFilter"
        )
        .value;

    const minReturn =
        parseFloat(
            document
            .getElementById(
                "minReturn"
            )
            .value
         );

    const maxReturn =
        parseFloat(
            document
            .getElementById(
                "maxReturn"
            )
            .value
         );

     const periodField =
         document
         .getElementById(
             "periodSelector"
         )
         .value;

    filteredStocks =
        allStocks.filter(stock => {

            const matchSearch =

                !search ||

                (
                    stock.symbol || ""
                )
                .toLowerCase()
                .includes(search);

            const matchSector =

                !sector ||

                stock.sector === sector;

            const matchIndustry =

                !industry ||

                stock.industry === industry;

            const matchReco =

                !reco ||

                stock.recommendation === reco;

            const selectedReturn =
                Number(
                    stock[periodField]
                );

            const matchMinReturn =

                isNaN(minReturn) ||

                selectedReturn >=
                minReturn;

            const matchMaxReturn =

                isNaN(maxReturn) ||

                selectedReturn <=
                maxReturn;


            return (

                matchSearch &&
                matchSector &&
                matchIndustry &&
                matchReco &&
                matchMinReturn &&
                matchMaxReturn

            );

        });

    renderTable();
}

// ----------------------------------
// Format Helpers
// ----------------------------------

function formatValue(v) {

    if (
        v === null ||
        v === undefined ||
        v === ""
    )
        return "";

    return v;
}

function formatPercent(v) {

    if (
        v === null ||
        v === undefined
    )
        return "";

    return Number(v)
        .toFixed(2) + "%";
}

function heatmapClass(value) {

    if (
        value === null ||
        value === undefined
    )
        return "";

    value = Number(value);

    if (value >= 20)
        return "green-4";

    if (value >= 10)
        return "green-3";

    if (value >= 5)
        return "green-2";

    if (value > 0)
        return "green-1";

    if (value <= -20)
        return "red-4";

    if (value <= -10)
        return "red-3";

    if (value <= -5)
        return "red-2";

    if (value < 0)
        return "red-1";

    return "";
}

function createReturnBar(value) {

    if (
        value === null ||
        value === undefined
    )
        return "";

    value = Number(value);

    const maxRange = 100;

    const pct =
        Math.min(
            Math.abs(value),
            maxRange
        );

    if (value >= 0) {

        return `
        <div class="returnBar">
            <div class="returnBarCenter"></div>
            <div
                class="returnPositive"
                style="width:${pct / 2}%;"></div>
        </div>
        `;
    }

    return `
    <div class="returnBar">
        <div class="returnBarCenter"></div>
        <div
            class="returnNegative"
            style="width:${pct / 2}%;"></div>
    </div>
    `;
}

function calculateDateReturn(
    history,
    fromDate,
    toDate
) {

    if (
        !history ||
        !fromDate ||
        !toDate
    )
        return null;

    let fromPoint = null;
    let toPoint = null;

    history.forEach(h => {

        if (
            !fromPoint &&
            h.date >= fromDate
        ) {
            fromPoint = h;
        }

        if (
            h.date <= toDate
        ) {
            toPoint = h;
        }

    });

    if (
        !fromPoint ||
        !toPoint
    )
        return null;

    return (
        (
            toPoint.close -
            fromPoint.close
        )
        /
        fromPoint.close
    ) * 100;
}

function calculateCustomReturn(
    history,
    days
) {

    if (
        !history ||
        history.length <= days
    )
        return null;

    const latest =
        history[
            history.length - 1
        ];

    const previous =
        history[
            history.length - 1 - days
        ];

    if (
        !latest ||
        !previous
    )
        return null;

    return (
        (
            latest.close -
            previous.close
        )
        /
        previous.close
    ) * 100;
}

function createSparkline(
    history,
    days
) {

    if (
        !history ||
        history.length < 2
    ) {
        return "No Data";
    }

    const slice =
        history.slice(-days);

    let html =
        '<div class="sparklineBox">';

    for (
        let i = 1;
        i < slice.length;
        i++
    ) {

        const prev =
            Number(
                slice[i - 1].close
            );

        const curr =
            Number(
                slice[i].close
            );

        const pctMove =
            (
                (
                    curr - prev
                )
                /
                prev
            ) * 100;

        const height =
            Math.max(
                4,
                Math.min(
                    Math.abs(
                        pctMove
                    ) * 8,
                    40
                )
            );

        let cls =
            "sparkFlat";

        if (
            curr > prev
        )
            cls =
                "sparkUp";

        if (
            curr < prev
        )
            cls =
                "sparkDown";

        html +=
            `
            <div
                class="${cls}"
                title="
Date: ${slice[i].date}
Change: ${pctMove.toFixed(2)}%
"
                style="
                    height:${height}px;
                "
            ></div>
            `;
    }

    html += "</div>";

    return html;
}
// ----------------------------------
// Render Table
// ----------------------------------

function renderTable() {

    const tbody =
        document.querySelector(
            "#stocks tbody"
        );

    tbody.innerHTML = "";

    const periodField =
        document
        .getElementById(
            "periodSelector"
        )
        .value;

    filteredStocks.forEach(stock => {

        const tr =
            document.createElement(
                "tr"
            );

        const selectedReturn =
            stock[periodField];

        const fromDate =
            document
            .getElementById(
                "fromDate"
            )
            .value;

       const toDate =
           document
           .getElementById(
               "toDate"
           )
           .value;

       const dateReturn =
           calculateDateReturn(
           stock.history,
           fromDate,
           toDate
           );

      const customDays =
          Number(
          document
          .getElementById(
          "customDays"
          )
          .value || 30
          );

      const customReturn =
          calculateCustomReturn(
          stock.history,
          customDays
          );

        tr.innerHTML = `

            <td>${stock.symbol || ""}</td>

            <td>${formatValue(stock.close)}</td>
   
            <td>
                ${createReturnBar(
                    selectedReturn
                )}
            </td>

            <td class="${heatmapClass(selectedReturn)}">
                ${formatPercent(selectedReturn)}
            </td>

            <td class="${heatmapClass(customReturn)}">
                ${formatPercent(customReturn)}
            </td>

            <td class="${heatmapClass(dateReturn)}">
                ${formatPercent(dateReturn)}
            </td>

            <td class="sparklineCell">

                ${createSparkline(
                    stock.history,
                    Number(
                        document
                        .getElementById(
                            "customDays"
                        )
                        .value || 30
                    )
               )}

            </td>

            <td>
                ${formatPercent(
                    stock.target_upside_pct
                )}
            </td>

            <td>
                ${stock.recommendation || ""}
            </td>

            <td>
                ${stock.analyst_count || ""}
            </td>

            <td class="${heatmapClass(
                -stock.ath_distance_pct
            )}">
                ${formatPercent(
                    stock.ath_distance_pct
                )}
            </td>

            <td class="${heatmapClass(
                -stock.high52_distance_pct
            )}">
                ${formatPercent(
                    stock.high52_distance_pct
            )}
            </td>

            <td>
                ${stock.sector || ""}
            </td>

            <td>
                ${stock.industry || ""}
            </td>

            <td>
                ${stock.rsi || ""}
            </td>


            <td class="${heatmapClass(
                stock.dma20_gap_pct
            )}">
                ${formatPercent(
                    stock.dma20_gap_pct
            )}
            </td>

            <td class="${heatmapClass(
                stock.dma50_gap_pct
            )}">
                ${formatPercent(
                    stock.dma50_gap_pct
            )}
            </td>

            <td class="${heatmapClass(
                stock.dma100_gap_pct
            )}">
                ${formatPercent(
                    stock.dma100_gap_pct
            )}
            </td>

            <td class="${heatmapClass(
                stock.dma200_gap_pct
            )}">
                ${formatPercent(
                    stock.dma200_gap_pct
            )}
            </td>

            <td class="${heatmapClass(
                stock.dma300_gap_pct
            )}">
                ${formatPercent(
                    stock.dma300_gap_pct
            )}
            </td>
            
            <td>
                ${stock.trailing_pe || ""}
            </td>

            <td>
                ${stock.forward_pe || ""}
            </td>

            <td>
                ${stock.price_to_book || ""}
            </td>

            <td>
                ${formatPercent(
                    stock.roe * 100
                )}
            </td>

            <td>
                ${stock.debt_to_equity || ""}
            </td>

            <td class="${heatmapClass(
                stock.revenue_growth * 100
            )}">

               ${formatPercent(
                   stock.revenue_growth * 100
               )}

           </td>

            <td class="${heatmapClass(
                stock.earnings_growth * 100
            )}">

               ${formatPercent(
                   stock.earnings_growth * 100
               )}

           </td>

           `;

        tbody.appendChild(tr);

    });

    document.getElementById(
        "recordCount"
    ).innerHTML =

        `Stocks Displayed:
         ${filteredStocks.length}`;
}

// ----------------------------------
// Sort
// ----------------------------------

function sortTable(field) {

    if (
        currentSortField === field
    ) {

        currentSortDirection *= -1;
    }
    else {

        currentSortField = field;

        currentSortDirection = 1;
    }

    filteredStocks.sort(
        (a, b) => {

            let av = a[field];
            let bv = b[field];

            if (av == null)
                av = "";

            if (bv == null)
                bv = "";

            if (
                typeof av ===
                "string"
            ) {

                return (
                    av.localeCompare(bv)
                    *
                    currentSortDirection
                );
            }

            return (
                (av - bv)
                *
                currentSortDirection
            );
        }
    );

    renderTable();
}

// ----------------------------------
// Events
// ----------------------------------

window.onload = function () {

    loadData();

    document
        .getElementById(
            "search"
        )
        .addEventListener(
            "keyup",
            applyFilters
        );

    document
        .getElementById(
            "sectorFilter"
        )
        .addEventListener(
            "change",
            () => {

                updateIndustryFilter();

                applyFilters();
            }
        );

    document
        .getElementById(
            "industryFilter"
        )
        .addEventListener(
            "change",
            applyFilters
        );

    document
        .getElementById(
            "recommendationFilter"
        )
        .addEventListener(
            "change",
            applyFilters
        );

    document
        .getElementById(
            "periodSelector"
        )
        .addEventListener(
            "change",
            applyFilters
        );

    document
        .getElementById(
            "minReturn"
        )
        .addEventListener(
            "keyup",
            applyFilters
        );

     document
         .getElementById(
         "maxReturn"
        )
        .addEventListener(
            "keyup",
            applyFilters
       );

    document
         .getElementById(
         "dateRangeBtn"
       )
       .addEventListener(
           "click",
           renderTable
       );

   document
        .getElementById(
        "applyDaysBtn"
      )
      .addEventListener(
          "click",
          renderTable
      );
 
};