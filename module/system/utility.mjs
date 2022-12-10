/* -------------------------------------------- */
import { WastburgRollDialog } from "../dialogs/dialog-roll-complex.mjs"

/* -------------------------------------------- */
const __wastburgRollFormula = {
  [-2]: "3d6kl", [-1]: "2d6kl", 0: "1d6", 1: "2d6kh", 2: "3d6kh"
}
const __wastburgValueToLevel = {
  [-2]: "--", [-1]: "-", 0: "0", 1: "+", 2: "++"
}
const __wastburgValueToLevelFull = {
  [-2]: "(--)", [-1]: "(-)", 0: "(0)", 1: "(+)", 2: "(++)"
}

/* -------------------------------------------- */
export class WastburgUtility {

  /* -------------------------------------------- */
  static registerSettings() {
    game.settings.register("wastburg", "aubaine-de-groupe", {
      name: "Nombre d'Aubaines de groupe",
      hint: "Saisir ici la valeur des aubaines de groupe",
      scope: "world",
      config: true,
      default: 0,
      type: Number,
      onChange: value => WastburgUtility.updateAubaineGroupe(value)
    })
    game.settings.register("wastburg", "house-combat-rules", {
      name: "Utiliser les règles maison de combat",
      hint: "Applique les règles de combat maison",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    })
  }
  /* -------------------------------------------- */
  static registerHooks() {
    Hooks.on('renderChatLog', (log, html, data) => WastburgUtility.chatListeners(html))
    Hooks.on('renderChatMessage', (message, html, data) => WastburgUtility.chatMessageHandler(message, html, data))

    // Game socket 
    game.socket.on("system.wastburg", sockmsg => {
      WastburgUtility.onSocketMessage(sockmsg);      
    })

  }

  /* -------------------------------------------- */
  static onSocketMessage(sockmsg) {
    if (sockmsg.name == "msg_cleanup_buttons") {
      $(`#${sockmsg.data.id}`).hide() // Hide the options roll buttons
    }
    if (sockmsg.name == "msg_incdec_aubaine_groupe") {
      WastburgUtility.processIncDecAubaineGroupe(sockmsg.data.value)
    }
  }

  /* -------------------------------------------- */
  static async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.dice3d) {
        let whisper = null;
        let blind = false;
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        switch (rollMode) {
          case "blindroll": //GM only
            blind = true;
          case "gmroll": //GM + rolling player
            whisper = this.getUsers(user => user.isGM);
            break;
          case "roll": //everybody
            whisper = this.getUsers(user => user.active);
            break;
          case "selfroll":
            whisper = [game.user.id];
            break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
      }
    }
  }

  /* -------------------------------------------- */
  static updateAubaineGroupe(value) {
    // Force refresh of actors
    for (let actor of game.actors) {
      actor.setAubaineGroupe(value)
    }
  }
  /* -------------------------------------------- */
  static processIncDecAubaineGroupe(value) {
    let aubainesDeGroupe = game.settings.get("wastburg", "aubaine-de-groupe")
    aubainesDeGroupe += value
    game.settings.set("wastburg", "aubaine-de-groupe", aubainesDeGroupe)

  }

  /* -------------------------------------------- */
  static incDecAubaineGroupe(value) {
    if (game.user.isGM) {
      this.processIncDecAubaineGroupe(value)
    } else {
      game.socket.emit("system.wastburg", { name: "msg_incdec_aubaine_groupe", data: { value: value } });
    }
  }

  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.id);
  }
  /* -------------------------------------------- */
  static getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs(name);
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  static getOtherWhisperRecipients(name) {
    let users = []
    for (let user of game.users) {
      if (!user.isGM && user.name != name) {
        users.push(user.id)
      }
    }
    return users
  }

  /* -------------------------------------------- */
  static getWhisperRecipientsAndGMs(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  static blindMessageToGM(chatOptions) {
    let chatGM = duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blind message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.wastburg", { name: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  static async chatMessageHandler(message, html, data) {
    const chatCard = html.find('.flavor-text')
    if (chatCard.length > 0) {
      // If the user is the message author or the actor owner, proceed
      const actor = game.actors.get(data.message.speaker.actor)
      //console.log("FOUND 1!!! ", actor)
      if (actor && actor.isOwner) return
      else if (game.user.isGM || data.author.id === game.user.id) return

      const divButtons = chatCard.find('.actions-section')
      divButtons.hide()
    }
  }

  /* -------------------------------------------- */
  static cleanupButtons(id) {
    $(`#${id}`).hide() // Hide the options roll buttons
    game.socket.emit("system.wastburg", { name: "msg_cleanup_buttons", data: { id: id } })
  }

  /* -------------------------------------------- */
  static removeChatMessageId(messageId) {
    if (messageId) {
      game.messages.get(messageId)?.delete();
    }
  }

  static findChatMessageId(current) {
    return WastburgUtility.getChatMessageId(WastburgUtility.findChatMessage(current));
  }

  static getChatMessageId(node) {
    return node?.attributes.getNamedItem('data-message-id')?.value;
  }

  static findChatMessage(current) {
    return WastburgUtility.findNodeMatching(current, it => it.classList.contains('chat-message') && it.attributes.getNamedItem('data-message-id'));
  }

  static findNodeMatching(current, predicate) {
    if (current) {
      if (predicate(current)) {
        return current;
      }
      return WastburgUtility.findNodeMatching(current.parentElement, predicate);
    }
    return undefined;
  }

  /* -------------------------------------------- */
  static getRollDataFromMessage(event) {
    let messageId = WastburgUtility.findChatMessageId(event.currentTarget)
    let message = game.messages.get(messageId)
    return message.getFlag("world", "wastburg-roll-data")
  }

  /* -------------------------------------------- */
  static getActorFromRollData(rollData) {
    let actor = game.actors.get(rollData.actorId)
    if (rollData.tokenId) {
      let token = canvas.tokens.placeables.find(t => t.id == rollData.tokenId)
      if (token) {
        actor = token.actor
      }
    }
    return actor
  }

  /* -------------------------------------------- */
  static getRollFormula(value) {
    value = Number(value)
    value = Math.max(value, -2)
    value = Math.min(value, 2)
    return __wastburgRollFormula[value] ?? "1d6"
  }

  /* -------------------------------------------- */
  static getLevelFromValue(value) {
    value = Number(value)
    value = Math.max(value, -2)
    value = Math.min(value, 2)
    return __wastburgValueToLevel[value] ?? "1d6"
  }

  /* -------------------------------------------- */
  static getLevelFullFromValue(value) {
    value = Number(value)
    value = Math.max(value, -2)
    value = Math.min(value, 2)
    return __wastburgValueToLevelFull[value]
  }

  /* -------------------------------------------- */
  static getTraitType(value) {
    return CONFIG.WASTBURG.traitType[value]
  }

  /* -------------------------------------------- */
  static getRollQuality(result) {
    if (result == "1") {
      return "Non, et..."
    }
    if (result == "2") {
      return "Non"
    }
    if (result == "3") {
      return "Non, mais..."
    }
    if (result == "4") {
      return "Oui, mais..."
    }
    if (result == "5") {
      return "Oui"
    }
    if (result == "6") {
      return "Oui, et..."
    }
    return "ERROR!!"
  }

  /* -------------------------------------------- */
  static getClassQuality(result) {
    if (result == "1") return "fumble"
    if (result == "2" || result == "3") return "failure"
    if (result == "4" || result == "5") return "success"
    if (result == "6") return "critical"
  }

  /* -------------------------------------------- */
  static processRollQuality(rollData, actor) {
    rollData.rollQuality = this.getRollQuality(rollData.roll.total)
    rollData.cssQuality = this.getClassQuality(rollData.roll.total)
    if (rollData.roll.total < 6) {
      rollData.aubainesPerso = actor.system.aubaine.value
      rollData.aubainesDeGroupe = game.settings.get("wastburg", "aubaine-de-groupe")
    }
    if (rollData.roll.total == 1) {
      let oneList = rollData.roll.terms[0].results.filter(res => res.result == 1)
      rollData.nbOne = oneList.length
    }
  }

  /* -------------------------------------------- */
  static getCommonRollData(actor) {
    return {
      rollDataId: randomID(16),
      aubaineButtonId: randomID(16),
      actorId: actor.id,
      tokenId: actor.token?.id,
      actorImg: actor.img,
      actorName: actor.name,
      rerollMode: "none",
      selectedTraitBonus: "none",
      selectedTraitMalus: "none",
      selectedContact: "none",
      selectedBonusMalus: 0,
      applySante: false,
      applyMental: false,
      applySocial: false,
      totalLevel: 0,
      selectRollInput: 3,
      rerollMode: "none"
    }
  }

  /* -------------------------------------------- */
  static async manageWastburgSimpleRoll(actor, value) {

    let diceFormula = WastburgUtility.getRollFormula(value)
    const roll = await new Roll(diceFormula).roll({ async: true })
    await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
    
    let rollData = this.getCommonRollData(actor)
    rollData.mode = "simple"
    rollData.diceFormula = diceFormula
    rollData.roll =  roll
    rollData.result = roll.total
    rollData.totalLevel = value
    
    this.processRollQuality(rollData, actor)    
    this.outputRollMessage(rollData)
  }
  /* -------------------------------------------- */
  static async commandWastburgComplexRoll () {
    let actor = _token?.actor
    if (actor) {
      return this.manageWastburgComplexRoll(actor)       
    }
    ui.notifications.warn("Vous devez sélectionner un token pour lancer cette commande.")
  }

  /* -------------------------------------------- */
  static async manageWastburgComplexRoll(actor, isInit = false) {

    let rollData = this.getCommonRollData(actor)
    rollData.mode = "complex"
    rollData.traits = actor.items.filter(item => item.type == "trait")
    rollData.contacts = actor.items.filter(item => item.type == "contact")
    rollData.santeValue = actor.system.sante.value
    rollData.mentalValue = actor.system.mental.value
    rollData.socialValue = actor.system.social.value
    rollData.isInit = isInit

    let rollDialog = await WastburgRollDialog.create(rollData)
    rollDialog.render(true)
  }

  /* -------------------------------------------- */
  static async performRollComplex(rollData) {
    let diceFormula = WastburgUtility.getRollFormula(rollData.totalLevel)

    const roll = await new Roll(diceFormula).roll({ async: true })
    await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))

    rollData.roll = roll
    rollData.diceFormula = diceFormula
    rollData.roll = roll
    rollData.result = roll.total

    let actor = WastburgUtility.getActorFromRollData(rollData)
    this.processRollQuality(rollData, actor)
    this.outputRollMessage(rollData)
  }

  /* -------------------------------------------- */
  static computeFinalLevel(rollData) {
    let level = 0
    level += Number(rollData.selectedBonusMalus)
    if (rollData.selectedTraitBonus != "none") {
      level++;
    }
    if (rollData.selectedTraitMalus != "none") {
      level--;
    }
    if (rollData.selectedContact != "none") {
      let contact = rollData.contacts.find(c => c.id == rollData.selectedContact)
      level += Number(contact.system.value)
    }
    if (rollData.applySante) {
      level += Number(rollData.santeValue)
    }
    if (rollData.applySocial) {
      level += Number(rollData.socialValue)
    }
    if (rollData.applyMental) {
      level += Number(rollData.mentalValue)
    }
    level = Math.max(level, -2)
    level = Math.min(level, 2)
    rollData.totalLevel = level
  }

  /* -------------------------------------------- */
  static async manageWastburgReroll(rollData) {
    this.cleanupButtons(rollData.rollDataId) // Delete previous buttons
    if (rollData.rerollMode == "aubaine-perso") {
      let actor = WastburgUtility.getActorFromRollData(rollData)
      actor.incDecAubainePerso(-1)
      rollData.result += 1
    } else {
      this.incDecAubaineGroupe(-1)
      const roll = await new Roll(rollData.diceFormula).roll({ async: true })
      await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
      rollData.roll = roll
      rollData.result = roll.total
    }
    rollData.rollQuality = this.getRollQuality(rollData.result)
    rollData.cssQuality = this.getClassQuality(rollData.result)
    rollData.rollDataId = randomID(16)

    this.outputRollMessage(rollData)
  }

  /* -------------------------------------------- */
  static async outputRollMessage(rollData) {
    let msg = await ChatMessage.create({
      alias: rollData.actorName,
      content: await renderTemplate('systems/wastburg/templates/chat/rolls/roll-summary-card.hbs', rollData)
    })
    console.log("Rolldata", rollData)
    // Save rollData in the message 
    msg.setFlag("world", "wastburg-roll-data", rollData)
    // Save init 
    if (rollData.isInit) {
      let actor = WastburgUtility.getActorFromRollData(rollData)
      actor.setInitiative(rollData.result)
    }
  }

  /* -------------------------------------------- */
  static cleanupButtons(id) {
    console.log("Hidinng", id)
    $(`#${id}`).hide() // Hide the options roll buttons
    game.socket.emit("system.wastburg", { name: "msg_cleanup_buttons", data: { id: id } })
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {

    html.on("click", '.apply-aubaine-perso', event => {
      let rollData = this.getRollDataFromMessage(event)
      this.cleanupButtons(rollData.aubaineButtonId)
      rollData.rerollMode = "aubaine-perso"
      this.manageWastburgReroll(rollData)
    })

    html.on("click", '.apply-aubaine-groupe', event => {
      let rollData = this.getRollDataFromMessage(event)
      this.cleanupButtons(rollData.aubaineButtonId)
      rollData.rerollMode = "aubaine-groupe"
      this.manageWastburgReroll(rollData)
    })

    html.on("click", '.receive-aubaine-perso', event => {
      let rollData = this.getRollDataFromMessage(event)
      this.cleanupButtons(rollData.aubaineButtonId)
      let actor = WastburgUtility.getActorFromRollData(rollData)
      actor.incDecAubainePerso(1)
    })

    html.on("click", '.receive-aubaine-groupe', event => {
      let rollData = this.getRollDataFromMessage(event)
      this.cleanupButtons(rollData.aubaineButtonId)
      this.incDecAubaineGroupe(1)
    })

  }
}

