const express = require("express");
const path = require("path");
const expressEjsLayout = require("express-ejs-layouts");
const configEngine = (app) => {
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "ejs");
  app.use(expressEjsLayout);
  app.set("layout", "layout/main");
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
module.exports = configEngine;
