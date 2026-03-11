// Show integration status
function initializeConfig() {
    console.log('%c✅ Sistema Meu Chamado Iniciado', 'color: #007e7a; font-size: 14px; font-weight: bold;');
    console.log('%c📊 Google Sheets Integrado: 11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk', 'color: #ffc20e; font-size: 12px;');
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConfig);
} else {
    initializeConfig();
}
