//REACT CODE
//creating page lyouts for nav buttons

"use strict";

const e = React.createElement;

const domContainer = document.querySelector("#render-main");

$(".sub-nav").click(function () {
  console.log(this.id);
  let message = e("h3", { className: "greeting" }, this.id);
  ReactDOM.render(message, domContainer);
});

$("#home").click(function () {
  console.log(this.id);
  let message = e("h3", { className: "greeting" }, "I'm Home!");
  ReactDOM.render(message, domContainer);
});

$("#profile").click(function () {
  console.log(this.id);
  let message = e("h3", { className: "greeting" }, "Profile settings");
  ReactDOM.render(message, domContainer);
});

$("#logo").click(function () {
  console.log(this.id);
  let message = e("h3", { className: "greeting" }, "You clicked the logo");
  ReactDOM.render(message, domContainer);
});

$("#support").click(function () {
  ReactDOM.render(<h1>Hello</h1>, document.getElementById("render-main"));
});
