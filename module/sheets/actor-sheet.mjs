import { WastburgUtility } from "../system/utility.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
 export class WastburgActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastburg", "sheet", "actor", "personnage", "trait","prevot","caid"],
      template: "systems/wastburg/templates/actor/actor-sheet.hbs",
      width: 620,
      height: 740,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "etats-list" }]
    });
  }

  /** @override */
  get template() {
    return `systems/wastburg/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

   /** @override */
   async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData()
    

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system
    context.flags = actorData.flags
    context.aubaindeDeGroupe = game.settings.get("wastburg", "aubaine-de-groupe") // Roll armor or not
    context.selectRollInput = 0 // Per default level 0
    context.combatRules = game.settings.get("wastburg", "house-combat-rules")
    context.initiative = this.actor.getInitiative()
    context.biography = await TextEditor.enrichHTML(this.object.system.biography, { async: true })
    context.config = CONFIG.WASTBURG

    // Prepare character data and items.
    if (actorData.type == 'personnage' || actorData.type == 'prevot' || actorData.type == 'caid') {
      this._prepareItems(context);
      this._prepareCharacterData(context);     
    } else if (actorData.type == 'npc') { // NPC stuff
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();
    return context;
  }
  
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
  }
  
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Assign and return
    context.item = context.items.filter( item => item.type == "item") 
    context.traits = context.items.filter( item => item.type == "trait") 
    context.contacts = context.items.filter( item => item.type == "contact") 
   }


  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find('.gelder-plus').click(event => {
      this.actor.modifyGelder( 1 );
    } );
    html.find('.gelder-minus').click(event => {
      this.actor.modifyGelder( -1 );
    } );

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Button Rooll
    html.find('.roll-simple').click(this._onButtonSimpleRoll.bind(this))
    html.find('.roll-complex').click(this._onButtonComplexRoll.bind(this))
    html.find('.roll-initiative').click(this._onButtonInitiative.bind(this))
    html.find('.fas fa-dice-d6').click(this._onButtonSimpleRoll.bind(this))
    

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      WastburgUtility.confirmDelete(this, li);
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
    
    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }


  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
   async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /* -------------------------------------------- */
  async _onButtonSimpleRoll () {    
    let formula = document.getElementById("selectRollInput")    
    WastburgUtility.manageWastburgSimpleRoll( this.actor, Number(formula.value) )
  }

  /* -------------------------------------------- */
  async _onButtonComplexRoll () {    
    WastburgUtility.manageWastburgComplexRoll( this.actor, false )
  }
  async _onButtonInitiative() {
    WastburgUtility.manageWastburgComplexRoll( this.actor, true )
  }
}  
