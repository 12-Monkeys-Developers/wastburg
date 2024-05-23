/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WastburgActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }
  /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
  prepareDerivedData() {
    const actorData = this;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'personnage') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }



  /**
   * Override getData() that's supplied to rolls.
   */
  getData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterData(data);
    this._getNpcData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterData(data) {
    if (this.type !== 'personnage') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  /* -------------------------------------------- */
  setAubaineGroupe( value ) {
    if ( this.type =="personnage") {
      let aubaine = this.system.aubainegroupe
      aubaine.value = game.settings.get("wastburg", "aubaine-de-groupe")
      aubaine.value = Math.max(aubaine.value, 0)
      if ( this.sheet.rendered) {
        this.sheet.render(true)
      } 
    }
  }

  /* -------------------------------------------- */
  async incDecAubainePerso(value) {
    let aubaine = foundry.utils.duplicate(this.system.aubaine)
    aubaine.value += value
    aubaine.value = Math.max(aubaine.value, 0)
    await this.update({ 'system.aubaine': aubaine })
  }
  /* -------------------------------------------- */
  modifySante(value) {
    let q = this.system.combat.santecurrent + Number(value)
    q = Math.max(q, 0)
    this.update( { 'system.combat.santecurrent'  : q } )
  }
  /* -------------------------------------------- */
  modifyGelder( value) {
    let q = this.system.gelder.value + Number(value)
    q = Math.max(q, 0)
    this.update( { 'system.gelder.value'  :q } )
  }

  /* -------------------------------------------- */
  clearInitiative() {
    this.setFlag("world", "last-initiative", -1)
  }

  /* -------------------------------------------- */
  setInitiative(value) {
    this.setFlag("world", "last-initiative", value)
  }
  /* -------------------------------------------- */
  async getInitiative(fromCombat = false) {
    if ( game.settings.get("wastburg", "house-combat-rules") ) {
      let value = this.getFlag("world", "last-initiative")
      if ( fromCombat && (!value || value == -1) ) {
        ui.notifications.warn("Votre Initiative n'a pas été initialisée pour ce combat. Faites un jet depuis votre fiche de personnage.")
      }
      return value || -1  
    } else {
      let r = await new Roll("1d6").roll()
      return r.total
    }
  }  
}