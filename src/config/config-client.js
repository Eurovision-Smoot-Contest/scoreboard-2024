const JURY_POINTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

(async () => {
    const data = await (await fetch("/getData")).json();
    const juryTotalElts = {};
    const finalTotalElts = {};
    let countriesOptions = "";
    for (const country in data.countries) {
        const countryData = data.countries[country];
        countriesOptions += `<option value="${countryData.id}">${countryData.name}</option>`;
        $(".country-head").append(`<th class="country-name" style="--flag: url('${countryData.flag}'); --name: '${countryData.name}';">${countryData.name}</th>`);
        const totalElt = $("<td></td>");
        $("#jury-total").append(totalElt);
        juryTotalElts[countryData.id] = totalElt;
    }
    for (const jury of data.juries) {
        const mainElt = $(`<tr><th>${jury.jury.name}</th></tr>`);
        for (let i = 0; i < 10; i++) {
            const selectElt = $(`<select name="jury-${jury.jury.id}-${i}" id="">${countriesOptions}</select>`);
            selectElt.children(`option[value=${jury.points[i]}]`)[0].setAttribute("selected", true);
            mainElt.append(`<td>${selectElt[0].outerHTML}</td>`);
        }
        $("#jury-body").append(mainElt);
    }
    for (const country in data.public) {
        $("#public-points").append(`<td><input type="number" name="public-${country}" id="" value="${data.public[country]}" required></td>`);
        const totalElt = $("<td></td>");
        $("#public-total").append(totalElt);
        finalTotalElts[country] = totalElt;
    }

    function calculateTotals() {
        const total = {};

        // Jury
        for (const country in data.countries) {
            total[country] = 0;
        }
        for (const line of $("#jury-body").children()) {
            const tds = $(line).children();
            for (let i = 0; i < 10; i++) {
                const country = $(tds[i+1]).children()[0].value;
                total[country] += JURY_POINTS[i]
            }
        }
        for (const country in juryTotalElts) {
            juryTotalElts[country].text(total[country]);
        }

        // Public
        const points = $("#public-points").children();
        for (let i = 0; i < points.length - 1; i++) {
            const input = $(points[i+1]).children()[0];
            const country = input.name.split("-")[1];
            total[country] += Number(input.value);
        }
        for (const country in juryTotalElts) {
            finalTotalElts[country].text(total[country]);
        }
    }

    $("input[type=number]").on("input", calculateTotals);
    $("select").on("input", calculateTotals);

    calculateTotals();
})();