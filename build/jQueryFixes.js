(function(global) {
  // Used to ensure the build, which contains jQuery, works by ignoring jQuery in non-browser
  // environments.
  if (typeof window !== undefined && window.isShimmed !== true) {
    // EXISTING CODE GOES HERE
  } else {
    define('jquery',[], function() {
      console.error('jQuery cannot be used in non-browser environments.');
    });
  }
})(this);
