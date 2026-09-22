const express = require("express");
const session = require("express-session");
require("dotenv").config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,//jabtak session me changes nahi hote tabtak session ko save nahi karega
  saveUninitialized: false//jabtak session me initialization nahi hote tabtak session ko save nahi karega
}));

app.get("/", (req, res) => {
  if (req.session.user)
    return res.send(`Hello this is i am ${req.session.user.login} <a href="/logout">Logout</a>`);

  res.send(`<a href="/auth/github">Login with GitHub</a>`);
});

app.get("/auth/github", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  );
});


//after login runs that blocks
app.get("/auth/github/callback", async (req, res) => {
  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,//req kis owth app ka hai 
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: req.query.code
    })
  });

  const token = await r.json();

  const user = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    }
  });

  req.session.user = await user.json();
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.listen(3000, () => console.log("http://localhost:3000"));