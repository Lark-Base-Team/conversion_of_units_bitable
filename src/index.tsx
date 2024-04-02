// import ReactDOM from 'react-dom/client'
// import './App.css';
// import App from './App';
// import LoadApp from './components/LoadApp';
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<LoadApp ><App /></LoadApp>)

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { bitable } from "@lark-base-open/js-sdk";
import { initI18n } from './i18n'
import App from './App'
// import './locales/i18n' // 支持国际化


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>
)

function LoadApp() {
  const [load, setLoad] = useState(false)
  useEffect(() => {
    bitable.bridge.getLanguage().then((lang) => {
      initI18n(lang as any);
      setLoad(true)
    })
  }, [])

  if (load) {
    return <App />
  }

  return <></>
}
