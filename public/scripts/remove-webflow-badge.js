// Remove Webflow badge
document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing Webflow badges
    const removeWebflowBadge = () => {
        // Remove by class
        const badges = document.querySelectorAll('.w-webflow-badge, [class*="webflow-badge"]');
        badges.forEach(badge => badge.remove());
        
        // Remove by href containing webflow
        const webflowLinks = document.querySelectorAll('a[href*="webflow.com"]');
        webflowLinks.forEach(link => {
            if (link.querySelector('img[alt*="Webflow"]') || 
                link.querySelector('img[src*="webflow-badge"]') ||
                link.textContent.includes('Made in Webflow')) {
                link.remove();
            }
        });
        
        // Remove any element with Webflow branding images
        const webflowImages = document.querySelectorAll('img[src*="webflow-badge"], img[alt*="Made in Webflow"]');
        webflowImages.forEach(img => {
            const parent = img.closest('a, div');
            if (parent) parent.remove();
        });
    };
    
    // Remove immediately
    removeWebflowBadge();
    
    // Also check after a delay (in case it's added dynamically)
    setTimeout(removeWebflowBadge, 100);
    setTimeout(removeWebflowBadge, 500);
    setTimeout(removeWebflowBadge, 1000);
    setTimeout(removeWebflowBadge, 2000);
    
    // Watch for new elements being added
    const observer = new MutationObserver(() => {
        removeWebflowBadge();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Also add CSS to hide it
const style = document.createElement('style');
style.textContent = `
    .w-webflow-badge,
    [class*="webflow-badge"],
    a[href*="webflow.com?utm_campaign"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
    }
`;
document.head.appendChild(style);