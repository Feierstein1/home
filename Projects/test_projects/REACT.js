//REACT CODE
//creating page lyouts for nav buttons

"use strict";

const e = React.createElement;
const home = e("h3", { className: "greeting" }, "Hello, Home!");
const clients = e("h3", { className: "greeting" }, "Hello, Clients!");
const courses = e("h3", { className: "greeting" }, "Hello, Courses!");
const students = e("h3", { className: "greeting" }, "Hello, Students!");

const domContainer = document.querySelector("#render-main");

$("#home").click(function () {
  ReactDOM.render(home, domContainer);
});

$("#clients").click(function () {
  ReactDOM.render(clients, domContainer);
});

$("#courses").click(function () {
  ReactDOM.render(courses, domContainer);
});

$("#students").click(function () {
  ReactDOM.render(students, domContainer);
});
