const themeMap = {
  dark: 'light',
  light: 'solar',
  solar: 'dark'
};

const theme = localStorage.getItem('theme');
const bodyClass = document.body.classList;
theme && bodyClass.add(theme);

function toggleTheme() {
  console.log("toggle");
  const current = localStorage.getItem('theme');
  console.log("current", current);
  const next = themeMap[current];

  bodyClass.replace(current, next);
  localStorage.setItem('theme', next);
}

document.getElementById('themeButton').onclick = toggleTheme;
