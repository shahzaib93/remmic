// Script to remove Webflow badge
(function() {
  function removeBadge() {
    const badges = document.querySelectorAll("[class*=\"w-webflow-badge\"], [class*=\"webflow-badge\"]");
    badges.forEach(badge => {
      badge.style.display = "none";
      badge.remove();
    });
  }
  
  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeBadge);
  } else {
    removeBadge();
  }
  
  // Run periodically to catch any dynamically added badges
  setInterval(removeBadge, 1000);
})();
