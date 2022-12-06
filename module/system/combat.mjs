/************************************************************************************/

export class WastburgCombatManager extends Combat {

  /************************************************************************************/
  async rollInitiative(ids, formula = undefined, messageOptions = {}) {
    console.log(`${game.system.title} | Combat.rollInitiative()`, ids, formula, messageOptions);
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    //const currentId = this.combatant.id;

    // calculate initiative
    for (let cId = 0; cId < ids.length; cId++) {
      const combatant = this.combatants.get(ids[cId])
      let fvttInit = combatant.actor.getInitiative(true)
      fvttInit += (cId / 100)
      await this.updateEmbeddedDocuments("Combatant", [{ _id: ids[cId], initiative: fvttInit }]);
    }
  }

  /************************************************************************************/
  _onDelete() {
    let combatants = this.combatants.contents
    for (let c of combatants) {
      let actor = game.actors.get(c.data.actorId)
      actor.clearInitiative()
    }
    super._onDelete()
  }
  
}