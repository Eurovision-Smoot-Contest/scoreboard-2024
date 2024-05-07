const delay = ms => new Promise(res => setTimeout(res, ms));
const POINTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

(async () => {
    const data = await (await fetch("/getData")).json();
    const score = [];
    for (const country in data.countries) {
        const countryData = data.countries[country];
        countryData.points = 0;
        $("#score-second").append(`
        <div class="score-out">
            <div id="country-${countryData.id}" class="score">
                <img class="flag" src="${countryData.flag}" alt="">
                <span class="name">${countryData.name}</span>
                <span style="left: 170px;" class="recieved"></span>
                <span style="left: 0;" class="current">0</span>
            </div>
        </div>
        `);
        score.push(countryData);
    }

    for (const jury of data.juries) {
        for (let i = 0; i < 10; i++) {
            addScore(jury.points[i], POINTS[i]);
        }
    }
    for (const country in data.countries) {
        $(`#country-${country} .current`).text(getScore(country));
    }

    sortFullLeaderboard();

    const line = [];
    for (const country of score) {
        line.push(country.id);
    }

    function getScore(countryId) {
        for (const countryData of score) {
            if (countryData.id === countryId) return countryData.points;
        }
        return null;
    }

    function addScore(countryId, nb) {
        for (let i = 0; i < score.length; i++) {
            if (score[i].id === countryId) score[i].points += nb;
        }
    }

    function sortFullLeaderboard() {
        score.sort((a, b) => {
            return b.points - a.points;
        });
        const spacing = 770 / 50;
        for (let i = 0; i < score.length; i++) {
            const country = score[i].id;
            $(`#country-${country}`).parent()
                .css("z-index", 256 - i)
                .css("top", `${(50 + spacing) * i}px`);
        }
    }

    let end = false;
    let block = false;
    $("body").keypress(async e => {
        if (e.keyCode === 32) {
            if (line.length !== 0) {
                const country = line.pop();
                addScore(country, data.public[country]);
                const finalScore = getScore(country);
                const currentElt = $(`#country-${country} .current`);
                const recievedElt = $(`#country-${country} .recieved`);
                currentElt.css("left", "85px");
                await delay(500);
                currentElt
                    .text(finalScore)
                    .css("left", 0);
                recievedElt
                    .text(data.public[country])
                    .css("left", "10px");
                await delay(1250);
                sortFullLeaderboard();
                await delay(3000);
                recievedElt.css("left", "85px");
                await delay(1000);
                $(`#country-${country}`).addClass("disabled");
            } else {
                if (!end) {
                    $("#jury").css("display", "none");
                    $("#score-second").css("display", "none");
                    $("#score-final").css("display", "initial");
                    for (let i = 1; i <= score.length; i++) {
                        const countryData = score[i-1];
                        const place = i >= 10 ? i : `0${i}`;
                        $("#score-final-in").append(`
                        <div class="final-score">
                            <img class="flag" src="${countryData.flag}" alt="">
                            <span class="place">${place}</span>
                            <span class="name">${countryData.name}</span>
                            <span class="points">${countryData.points}</span>
                        </div>
                        `);
                    }
                    end = true;
                } else {
                    if (!block) {
                        for (const elt of $("#score-final-in").children()) {
                            $(elt).css("width", "480px");
                            await delay(100);
                        }
                        block = true;
                    }
                }
            }
        }
    });
})();