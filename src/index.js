const injectedScript = document.createElement('script');
injectedScript.src = chrome.runtime.getURL('injected.js');
injectedScript.onload = () => injectedScript.remove();
(document.head || document.documentElement).appendChild(injectedScript);
