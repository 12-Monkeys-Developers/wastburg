export class WastburgHelpers {

  /* -------------------------------------------- */
  static registerHelpers() {
    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function () {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    });

    Handlebars.registerHelper('toLowerCase', function (str) {
      return str.toLowerCase();
    });

  }
}

