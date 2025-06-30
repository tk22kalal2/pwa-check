// Initialize PWA functionality
function initPWA(pageType) {
    // Register service worker with absolute path
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
    
    // Handle install prompt only on landing page
    if (pageType === 'landing') {
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');
        const installPromptBtn = document.getElementById('installPromptBtn');
        const dismissBtn = document.getElementById('dismissBtn');
        const notification = document.getElementById('notification');
        
        // Only show install button on landing page
        if (installBtn) {
            installBtn.style.display = 'inline-block';
        }
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show notification after 5 seconds
            setTimeout(() => {
                if (notification) notification.style.display = 'flex';
            }, 5000);
        });
        
        // Button click handlers
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                showInstallPrompt();
            });
        }
        
        if (installPromptBtn) {
            installPromptBtn.addEventListener('click', () => {
                showInstallPrompt();
                if (notification) notification.style.display = 'none';
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                if (notification) notification.style.display = 'none';
            });
        }
        
        function showInstallPrompt() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    
                    deferredPrompt = null;
                    if (installBtn) installBtn.style.display = 'none';
                });
            }
        }
        
        // Track if the app is successfully installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            if (installBtn) installBtn.style.display = 'none';
            if (notification) notification.style.display = 'none';
        });
    }
}
