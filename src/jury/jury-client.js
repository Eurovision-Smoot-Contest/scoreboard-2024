const delay = ms => new Promise(res => setTimeout(res, ms));
const POINTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

(async () => {
    const data = await (await fetch("/getData")).json();
    const juriesNb = data.juries.length;
    $("#score-final h1").text(`${juriesNb} of ${juriesNb} juries voted`);
    const score = [];
    let currentJury;
    for (const country in data.countries) {
        const countryData = data.countries[country];
        countryData.points = 0;
        $("#score-second").append(`
        <div class="score-out">
            <div id="second-country-${countryData.id}" class="score">
                <img class="flag" src="${countryData.flag}" alt="">
                <span class="name">${countryData.name}</span>
                <span class="recieved"></span>
                <span class="current">0</span>
            </div>
        </div>
        `);
        score.push(countryData);
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

    function resetAnimation() {
        // Host
        $("#host").css("width", "1000px");
        // Points
        $("#points div").css("width", 0).css("height", 0);
        $("#points span").css("left", "40px");
        $(".to-remove").remove();
        // Countries
        $("#score-first").css("justify-items", "start");
        $(".score-out").css("justify-content", "start")
            .css("transition", "width 1.5s ease-in-out, top 1s ease-in-out")
            .css("width", 0);
        $("#score-second .recieved").css("left", "85px");
        sortFullLeaderboard();
    }

    function loadJury() {
        const jury = data.juries.shift();
        currentJury = jury;
        const points = jury.points;
        for (let i = 0; i < 9; i++) {
            const country = points[i];
            addScore(country, POINTS[i])
        }
        for (const country of score) {
            $(`#second-country-${country.id} .current`).text(country.points);
        }
        const currentNb = juriesNb - data.juries.length;
        $("#current-country").text(jury.jury.name);
        let th = "th";
        if (currentNb === 1) th = "st";
        if (currentNb === 2) th = "nd";
        if (currentNb === 3) th = "rd";
        $("#nb-countries").text(`${currentNb}${th} of ${juriesNb} juries`);
        const juryCoutriesPoints = jury.points.reverse();
        for (let i = 0; i < 9; i++) {
            const countryData = data.countries[juryCoutriesPoints[i+1]];
            $(`#first-country-${i} > .flag`).attr("src", countryData.flag);
            $(`#first-country-${i} > .name`).text(countryData.name);
            $(`#first-country-${i} > .current`).text(getScore(countryData.id));
        }
    }

    function playIntroAnimation() {
        // Points
        (async () => {
            $("#points div").css("width", "40px").css("height", "40px");
            await delay(1000);
            $("#points span").css("left", 0);
        })();
        // Countries
        (async () => {
            for (let i = 8; i >= 0; i--) {
                $(`#first-country-${i}`).parent().css("width", "480px");
                await delay(375);
            }
        })();
    }

    function toLeaderboardVue() {
        // Host
        $("#host").css("width", 0);
        // First scoreboard
        $("#score-first").css("justify-items", "end");
        $("#score-first .score-out")
            .css("transition", "width 0.25s ease-in-out")
            .css("justify-content", "end");
        (async () => {
            for (let i = 0; i < 5; i++) {
                $(`#first-country-${i}`).parent().css("width", 0);
                await delay(100);
            }
        })();
        (async () => {
            for (let i = 5; i < 9; i++) {
                $(`#first-country-${i}`).parent().css("width", 0);
                await delay(100);
            }
        })();
        // Second scoreboard
        (async () => {
            for (const countryData of score) {
                $(`#second-country-${countryData.id}`).parent().css("width", "480px");
                await delay(50);
            }
            await delay(1000);
            const points = currentJury.points.reverse();
            for (let i = 0; i < 10; i++) {
                const country = points[i];
                const elt = $(`#second-country-${country} .recieved`);
                elt.text(POINTS[i]);
                if (i !== 9) {
                    elt.css("left", "10px");
                }
            }
            await delay(1500);
            sortFullLeaderboard();
        })();
    }

    function sortFullLeaderboard() {
        score.sort((a, b) => {
            return b.points - a.points;
        });
        const spacing = 770 / 50;
        for (let i = 0; i < score.length; i++) {
            const country = score[i].id;
            $(`#second-country-${country}`).parent()
                .css("z-index", 256 - i)
                .css("top", `${(50 + spacing) * i}px`);
        }
    }

    let notEnd = true;
    async function give12points() {
        const target = currentJury.points[9];
        $("#points").append("<div class='to-remove'>");
        $(`#second-country-${target} .recieved`).text("12").css("left", "10px");
        const elt = $("<div class='underline'>12 points</div>");
        $(`#second-country-${target}`).append(elt);
        await delay(1);
        elt.css("transform", "translateX(0)");
        await delay(250);
        addScore(target, 12);
        $(`#second-country-${target} .current`).text(getScore(target));
        elt.css("color", "var(--pink)");
        await delay(1000);
        elt.css("opacity", 0);
        await delay(250);
        elt.remove();
        sortFullLeaderboard();
        if (data.juries.length === 0) notEnd = false;
    }

    let state = 3;
    let finalScoreboard = false;
    $("body").keypress(e => {
        if (e.keyCode === 32) {
            if (state === 0) {
                playIntroAnimation();
            } else if (state === 1) {
                toLeaderboardVue();
            } else if (state === 2) {
                give12points();
            } else if (state === 3) {
                resetAnimation();
                if (notEnd) loadJury();
                else state = -1;
            }
            if (state === -1) {
                if (!finalScoreboard) {
                    // Prepare
                    $("#host").css("display", "none");
                    $("#jury").css("display", "none");
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
                    finalScoreboard = true;
                } else {
                    // Animate
                    (async () => {
                        for (const elt of $("#score-final-in").children()) {
                            $(elt).css("width", "480px");
                            await delay(100);
                        }
                    })();
                    state = -2;
                }
                return;
            }
            if (state === -2) return;
            state = (state + 1) % 4;
        }
    });
})();