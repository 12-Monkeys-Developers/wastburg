/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return foundry.applications.handlebars.loadTemplates([

    // Actor partials.
    //"systems/wastburg/templates/actor/parts/actor-etats.hbs",
    //"systems/wastburg/templates/actor/parts/actor-traits.hbs",
    //"systems/wastburg/templates/actor/parts/actor-contact.hbs",
    //"systems/wastburg/templates/actor/parts/actor-inventaire.hbs",
    //"systems/wastburg/templates/actor/parts/actor-biography.hbs",
    //"systems/wastburg/templates/actor/parts/actor-traits-list.hbs",

  ]);
};
