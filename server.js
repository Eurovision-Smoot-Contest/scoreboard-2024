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

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});