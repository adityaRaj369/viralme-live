export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('mmv-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
