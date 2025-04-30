/* -------------------------------------------- */
import { WastburgRollDialog2 } from "../dialogs/dialog-roll-complex.mjs"

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
  static addWastburgDice(dice3d) {
    if (dice3d) {
      dice3d.addSystem({ id: "wastburg", name: "Wastburg (Set)" });
      dice3d.addDicePreset({
        type: "d6",
        labels: [
          'systems/wastburg/assets/dices/d6-1.png',
          'systems/wastburg/assets/dices/d6-2.png',
          'systems/wastburg/assets/dices/d6-3.png',
          'systems/wastburg/assets/dices/d6-4.png',
          'systems/wastburg/assets/dices/d6-5.png',
          'systems/wastburg/assets/dices/d6-6.png'
        ],
        bumpMaps: [
          'systems/wastburg/assets/dices/d6-1.png',
          'systems/wastburg/assets/dices/d6-2.png',
          'systems/wastburg/assets/dices/d6-3.png',
          'systems/wastburg/assets/dices/d6-4.png',
          'systems/wastburg/assets/dices/d6-5.png',
          'systems/wastburg/assets/dices/d6-6.png'
        ],
        system: "wastburg"
      })
    }
  }

  /* -------------------------------------------- */
  static registerHooks() {
    //Hooks.on('renderChatLog', (log, html, data) => WastburgUtility.chatListeners(html))
    Hooks.on('renderChatMessageHTML', (log, html, data) => WastburgUtility.chatListeners(html))
    Hooks.on('renderChatMessageHTML', (message, html, data) => WastburgUtility.chatMessageHandler(message, html, data))
    Hooks.once('diceSoNiceReady', (dice3d) => { WastburgUtility.addWastburgDice(dice3d) })

    // Game socket
    game.socket.on("system.wastburg", sockmsg => {
      WastburgUtility.onSocketMessage(sockmsg);
    })

  }

  /* -------------------------------------------- */
  static setupBanner() {
    CONFIG.Actor.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
    CONFIG.Item.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
    CONFIG.JournalEntry.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
    CONFIG.RollTable.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
    CONFIG.Scene.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
    CONFIG.Macro.compendiumBanner = "systems/wastburg/assets/illustrations/wastburg_banner.webp"
  }


  /* -------------------------------------------- */
  static onSocketMessage(sockmsg) {
    if (sockmsg.name == "msg_cleanup_buttons") {
      $(`#${sockmsg.data.id}`).hide() // Hide the options roll buttons
    }
    if (sockmsg.name == "msg_incdec_aubaine_groupe") {
      if (game.user.isGM) {
        WastburgUtility.processIncDecAubaineGroupe(sockmsg.data.value)
      }
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
    this.updateAubaineGroupe()
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
    let chatGM = foundry.utils.duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blind message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.wastburg", { name: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  static async chatMessageHandler(message, html, data) {
    html = $(html);
    const chatCard = html.find('.flavor-text')
    if (chatCard.length > 0) {
      // If the user is the message author or the actor owner, proceed
      const actor = game.actors.get(data.message.speaker.actor)
      //console.log("FOUND 1!!! ", actor)
      if (actor?.isOwner) return
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
    if (result >= "6") { // Possible sur aubaine personnelle sur 1 6 !
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
    if (rollData.roll.total < 6 && actor == "personnage") {
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
      rollDataId: foundry.utils.randomID(16),
      aubaineButtonId: foundry.utils.randomID(16),
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
      aubainesPerso: Number(actor.system.aubaine.value),
      aubainesDeGroupe: Number(game.settings.get("wastburg", "aubaine-de-groupe")),
      anciennete: Number(actor.system.anciennetereputation.value),
      rollGM: game.user.isGM,
      config: CONFIG.WASTBURG
    }
  }

  /* -------------------------------------------- */
  static async manageWastburgSimpleRoll(actor, value, rollMode) {

    let diceFormula = WastburgUtility.getRollFormula(value)
    const roll = await new Roll(diceFormula).roll()
    await this.showDiceSoNice(roll, rollMode)

    let rollData = this.getCommonRollData(actor)
    rollData.mode = "simple"
    rollData.diceFormula = diceFormula
    rollData.roll = foundry.utils.duplicate(roll)
    rollData.result = roll.total
    rollData.totalLevel = value
    rollData.rollMode = rollMode

    this.processRollQuality(rollData, actor)
    this.outputRollMessage(rollData)
  }
  /* -------------------------------------------- */
  static async commandWastburgComplexRoll() {
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
    rollData.title = "Jet de " + actor.name
    rollData.traits = actor.items.filter(item => item.type == "trait")
    rollData.contacts = actor.items.filter(item => item.type == "contact")
    rollData.santeValue = actor.system.sante.value
    rollData.mentalValue = actor.system.mental.value
    rollData.socialValue = actor.system.social.value
    rollData.isInit = isInit

    let options = { classes: ["WastburgDialog"], width: 340, height: 'fit-content', 'z-index': 99999 }
    let html = await foundry.applications.handlebars.renderTemplate('systems/wastburg/templates/dialogs/dialog-roll-complex.hbs', rollData)

    let result = await WastburgRollDialog2.wait({
      window: { title: "Jet complet" },
      content: html,
      rollData: rollData,
      buttons: [
        {
          action: "roll",
          icon: 'fas fa-check',
          label: 'Lancer',
          callback: () => { WastburgUtility.performRollComplex(rollData) }
        },
        {
          action: "close",
          icon: 'fas fa-times',
          label: 'Annuler',
          callback: () => { this.close() }
        }
      ],
      render: (event, dialog) => {
        $("#select-trait-bonus").change(changeEvent => {
          rollData.selectedTraitBonus = changeEvent.target.value;
          rollData.traitBonus = rollData.traits.find((it) => it.id == changeEvent.target.value);
          WastburgUtility.computeFinalLevel(rollData);
          $("#total-level").html(WastburgUtility.getLevelFullFromValue(rollData.totalLevel));
        });
        $('#select-trait-malus').change(changeEvent => {
          rollData.selectedTraitMalus = changeEvent.target.value;
          rollData.traitMalus =  rollData.traits.find(it => it.id == changeEvent.target.value);
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue( rollData.totalLevel))
        })
        $('#select-contact').change(changeEvent => {
          rollData.selectedContact = changeEvent.target.value;
          rollData.contact =  rollData.contacts.find(it => it.id == changeEvent.target.value);
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue(rollData.totalLevel))
        })
        $('#select-bonusmalus').change(changeEvent => {
          rollData.selectedBonusMalus = changeEvent.target.value;
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue(rollData.totalLevel))
        })
        $('#applySante').change(changeEvent => {
          rollData.applySante = changeEvent.target.checked;
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue(rollData.totalLevel))
        })
        $('#applyMental').change(changeEvent => {
          rollData.applyMental = changeEvent.target.checked;
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue(rollData.totalLevel))
        })
        $('#applySocial').change(changeEvent => {
          rollData.applySocial = changeEvent.target.checked;
          WastburgUtility.computeFinalLevel(rollData)
          $('#total-level').html( WastburgUtility.getLevelFullFromValue(rollData.totalLevel))
        })

      },
      rejectClose: false,
    })
  }

  /* -------------------------------------------- */
  static async performRollComplex(rollData) {
    let diceFormula = WastburgUtility.getRollFormula(rollData.totalLevel)

    const roll = await new Roll(diceFormula).roll()
    await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))

    rollData.roll = foundry.utils.duplicate(roll)
    rollData.diceFormula = diceFormula
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
      rollData.aubainesPerso -= 1
    } else if (rollData.rerollMode == "anciennete") {
      let actor = WastburgUtility.getActorFromRollData(rollData)
      actor.incDecAnciennete(-1)
      rollData.anciennete -= 1
      const roll = await new Roll(rollData.diceFormula).roll()
      await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
      rollData.roll = foundry.utils.duplicate(roll)
      rollData.result = roll.total
    } else {
      rollData.aubainesDeGroupe -= 1
      this.incDecAubaineGroupe(-1)
      const roll = await new Roll(rollData.diceFormula).roll()
      await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
      rollData.roll = foundry.utils.duplicate(roll)
      rollData.result = roll.total
    }
    rollData.rollQuality = this.getRollQuality(rollData.result)
    rollData.cssQuality = this.getClassQuality(rollData.result)
    rollData.rollDataId = foundry.utils.randomID(16)

    this.outputRollMessage(rollData)
  }

  /* -------------------------------------------- */
  static async outputRollMessage(rollData) {
    let msg = await ChatMessage.create({
      alias: rollData.actorName,
      rollMode: rollData.rollMode,
      content: await foundry.applications.handlebars.renderTemplate('systems/wastburg/templates/chat/rolls/roll-summary-card.hbs', rollData)
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
  static async confirmDelete(actorSheet, li) {
    let itemId = li.data("item-id");
    let msgTxt = "<p>Etes vous certain de vouloir supprimer cet item, vil Wastburgeois ?";
    let buttons = {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: "Oui, écrabouille moi ça",
        callback: () => {
          actorSheet.actor.deleteEmbeddedDocuments("Item", [itemId]);
          li.slideUp(200, () => actorSheet.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Non, sans façons"
      }
    }
    msgTxt += "</p>";
    let d = new Dialog({
      title: "Confirmes ou Fuis",
      content: msgTxt,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {
    html = $(html);

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

    html.on("click", '.apply-anciennete', event => {
      let rollData = this.getRollDataFromMessage(event)
      this.cleanupButtons(rollData.aubaineButtonId)
      rollData.rerollMode = "anciennete"
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
