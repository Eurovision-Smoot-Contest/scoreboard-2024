const { PASSWORD, COUNTRIES, JURIES, PORT } = require("./config.json");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const DATA = {
    countries: {},
    juries: [],
    public: {}
};
for (const country of COUNTRIES) {
    DATA.countries[country.id] = country;
}
for (const jury of JURIES) {
    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push(COUNTRIES[i].id);
    }
    DATA.juries.push({
        jury: jury,
        points: points
    });
}
for (const country of COUNTRIES) {
    DATA.public[country.id] = 0
}

function indexOfJury(juryId) {
    for (let i = 0; i < DATA.juries.length; i++) {
        if (DATA.juries[i].jury.id === juryId) return i;
    }
    return null;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function randomArray(length, target) {
    const max = Math.floor(target / length);
    const res = [];
    let current = target;
    for (let i = 0; i < length - 1; i++) {
        let points = target;
        while (points >= current) points = randomNumber(0, max);
        res.push(points);
        current -= points;
    }
    res.push(current);
    shuffle(res);
    return res;
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

app.use(cookieParser());
app.use(express.static("src"));
app.use(express.static("public"));

app.get("/", (req, res) => {
    if (req.query.password) res.cookie("password", req.query.password);
    res.sendFile(path.join(__dirname, "src/login/index.html"));
});

app.get("/getData", (req, res) => {
    if (req.cookies.password !== PASSWORD) {
        res.sendStatus(403);
    } else {
        res.send(DATA);
    }
});

for (const page of ["config", "jury", "public"]) {
    app.get(`/${page}`, (req, res) => {
        if (req.cookies.password !== PASSWORD) {
            res.redirect("/");
        } else {
            res.sendFile(path.join(__dirname, `src/${page}/index.html`));
        }
    });
}

app.get("/config/update", (req, res) => {
    const data = req.query;
    for (const key in data) {
        const elts = key.split("-");
        if (elts[0] === "public") {
            DATA.public[elts[1]] = Number(data[key]);
        } else {
            DATA.juries[indexOfJury(elts[1])].points[Number(elts[2])] = data[key];
        }
    }
    res.redirect("/config");
});

app.get("/config/random", (req, res) => {
    if (req.cookies.password !== PASSWORD) {
        res.redirect("/");
    } else {
        for (let i = 0; i < DATA.juries.length; i++) {
            const temp = COUNTRIES.filter(() => true);
            const points = [];
            for (let i = 0; i < 10; i++) {
                const index = randomNumber(0, temp.length);
                points.push(temp[index].id);
                temp.splice(index, 1);
            }
            DATA.juries[i].points = points;
        }
        const randomPoints = randomArray(COUNTRIES.length, 696);
        for (let i = 0; i < COUNTRIES.length; i++) {
            DATA.public[COUNTRIES[i].id] = randomPoints[i];
        }
        res.redirect("/config");
    }
});

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});