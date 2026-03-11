// Show integration status
function initializeConfig() {
    console.log('%c✅ Sistema Meu Chamado Iniciado', 'color: #007e7a; font-size: 14px; font-weight: bold;');
    console.log('%c📊 Google Sheets Integrado: 1Rf-1Se4wTUry4Nu7cZJKSyw6j8rU21FysafSiwWVNYA', 'color: #ffc20e; font-size: 12px;');
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConfig);
} else {
    initializeConfig();
}
