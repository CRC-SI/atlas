(function(global) {

  // Used to construct a closure around the Atlas build and add shims to prevent failure on the
  // NodeJS server due to missing client-side variables. Most of these are needed due to OpenLayers,
  // which expects them on startup (not just at runtime).

  // Re-declaring variables retains existing values on client while creating new ones on the server.
  // Avoid adding/changing global definitions by using local variables in this closure.
  var document = global.document;
  var navigator = global.navigator;
  var window = global.window;

  if (typeof window === 'undefined') {
    document = {
      getElementsByTagName: function() {
        return [];
      },
      createElement: function() {
        return {};
      }
    };
    window = {
      // Used to check if these shims are in use.
      isShimmed: true,
      location: {
        search: ''
      }
    };
    navigator = {
      appVersion: '',
      language: '',
      platform: '',
      userAgent: '',
      vendor: ''
    };
  }

  // EXISTING CODE GOES HERE

})(this);
