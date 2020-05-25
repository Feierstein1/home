/*const themeMap = {
  dark: "red",
  light: "blue",
  blue: "dark",
  red: "light",
};*/
if (localStorage.getItem("theme") == "undefined") {
  const theme = localStorage.setItem("theme", themeMap["light"]);
  console.log("set theme");
}
const theme = localStorage.getItem("theme");
const bodyClass = document.body.classList;
theme && bodyClass.add(theme);
console.log(theme && bodyClass.add(theme));

/*function toggleTheme() {
  console.log("toggle");
  const current = localStorage.getItem("theme");
  console.log("current", current);
  const next = themeMap[current];
  console.log("next", next);
  bodyClass.replace(current, next);
  localStorage.setItem("theme", next);
  console.log(current);
}*/

$(".sub-settings").click(function () {
  console.log(this.id);
  const current = localStorage.getItem("theme");
  bodyClass.replace(current, this.id);
  localStorage.setItem("theme", this.id);
});

/*document.getElementById("settings").onclick = toggleTheme;*/

//This was my attempt at making the sub-nav appear on clicking
//became too complicated through dynamically keeping the nav bar open and closing other
//sub -nav links that were open

/*$("#courses").click(function () {
  $(this).toggleClass("sub-nav-expand");
  $(".sub-courses").slideToggle(300);

  //showSubNav("courses");
});

function showSubNav(n) {
  $("#" + n).css({ height: "8rem" });
  $(".sub-" + n).slideToggle(300);
}*/
