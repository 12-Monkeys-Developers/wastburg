import { WastburgUtility } from "../system/utility.mjs";

export class WastburgHelpers {

  /* -------------------------------------------- */
  static registerHelpers() {
    Handlebars.registerHelper('count', function (list) {
      return (list) ? list.length : 0;
    })
    Handlebars.registerHelper('includes', function (array, val) {
      return array.includes(val);
    })
    Handlebars.registerHelper('upper', function (text) {
      return text.toUpperCase();
    })
    Handlebars.registerHelper('lower', function (text) {
      return text.toLowerCase()
    })
    Handlebars.registerHelper('upperFirst', function (text) {
      if (typeof text !== 'string') return text
      return text.charAt(0).toUpperCase() + text.slice(1)
    })
    Handlebars.registerHelper('notEmpty', function (list) {
      return list.length > 0;
    })
    Handlebars.registerHelper('mul', function (a, b) {
      return parseInt(a) * parseInt(b);
    })
    Handlebars.registerHelper('add', function (a, b) {
      return parseInt(a) + parseInt(b);
    });
    Handlebars.registerHelper('sub', function (a, b) {
      return parseInt(a) - parseInt(b);
    })

    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function () {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    })

    Handlebars.registerHelper('toLowerCase', function (str) {
      return str.toLowerCase();
    })

    Handlebars.registerHelper('getLevel', function (str) {
      return WastburgUtility.getLevelFromValue( str)
    })
    
  }
}

