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
      let fvttInit = combatant.actor.getInitiative()
      fvttInit += (cId / 100)
      await this.updateEmbeddedDocuments("Combatant", [{ _id: ids[cId], initiative: fvttInit }]);
    }
  }
}
  
