const themeMap = {
  dark: 'light',
  light: 'solar',
  solar: 'dark'
};
if(localStorage.getItem('theme') == 'undefined'){
	const theme = localStorage.setItem('theme', themeMap['dark']);
	console.log("set theme");
}
const theme = localStorage.getItem('theme');
const bodyClass = document.body.classList;
theme && bodyClass.add(theme);
console.log(theme && bodyClass.add(theme));

function toggleTheme() {
  console.log("toggle");
  const current = localStorage.getItem('theme');
  console.log("current", current);
  const next = themeMap[current];
  console.log("next", next);
  bodyClass.replace(current, next);
  localStorage.setItem('theme', next);
  console.log(current);
}

document.getElementById('themeButton').onclick = toggleTheme;
