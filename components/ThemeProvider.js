// reference: https://github.com/ishan-me/tailwind_darkmode/blob/main/src/components/themeContext.js
import React, { useContext, useState } from "react";

// const getInitialTheme = () => {
//   // if (typeof window !== 'undefined' && window.localStorage) {
//   //   const storedPrefs = window.localStorage.getItem('theme');
//   //   if (typeof storedPrefs === 'string') return storedPrefs;
//   //   if (window.matchMedia('(prefers-color-scheme: light)').matches) {
//   //     return 'light';
//   //   }
//   // }
//   // return 'dark';

//   let theme = "light";
//   if ((localStorage.theme === 'dark') || window.matchMedia('(prefers-color-scheme: dark)').matches) {
//     theme = "dark"
//   }
//   document.documentElement.setAttribute("data-theme", theme);
//   localStorage.theme = theme
// };

const ThemeContext = React.createContext("darkela");

const ThemeProvider = ({ initialTheme, children }) => {
  // const ThemeContext = useContext(null);
  // const [theme, toggleTheme] = useState(getInitialTheme);

  // const checkTheme = (existing) => {
  //   const root = window.document.documentElement;
  //   const isDark = existing === 'dark';

  //   root.classList.remove(isDark ? 'light' : 'dark');
  //   root.classList.add(existing);

  //   localStorage.setItem('current-theme', existing);
  // };

  // if (initialTheme) checkTheme(initialTheme);

  // React.useEffect(() => {
  //   checkTheme(theme);
  // }, [theme]);

  return (
    <ThemeContext.Provider value={"lightee"}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
