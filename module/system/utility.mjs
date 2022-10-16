/* -------------------------------------------- */
const __wastburgWollFormula = {
  1: "3d6kl", 2: "2d6kl", 3: "1d6", 4: "2d6kh", 5: "3d6kh"
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
      WastburgUtility.processIncDecAubaineGroupe(sockmsg.data.value )
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
  static updateAubaineGroupe( value) {
    // Force refresh of actors
    for( let actor of game.actors) {
      actor.setAubaineGroupe(value)
    }
  }
  /* -------------------------------------------- */
  static processIncDecAubaineGroupe( value) {
    let aubainesDeGroupe = game.settings.get("wastburg", "aubaine-de-groupe")
    aubainesDeGroupe += value
    game.settings.set("wastburg", "aubaine-de-groupe", aubainesDeGroupe)

  }

  /* -------------------------------------------- */
  static incDecAubaineGroupe(value) {
    if (game.user.isGM) {
      this.processIncDecAubaineGroupe(value)
    } else {
      game.socket.emit("system.wastburg", { name: "msg_incdec_aubaine_groupe", data: { value: value} });
    }
  }

  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.data._id);
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
  static getRollFormula(value) {
    return __wastburgWollFormula[value] ?? "1d6"
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
  static async manageWastburgRoll(actor, value, rollDataReroll = false) {

    let rollData = rollDataReroll
    if (!rollData) {
      let diceFormula = WastburgUtility.getRollFormula(value)
      const roll = await new Roll(diceFormula).roll({ async: true })
      await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
      rollData = {
        rollDataID: randomID(16),
        diceFormula: diceFormula,
        roll: roll,
        result: roll.total,
        actorId: actor.id,
        actorImg: actor.img,
        actorName: actor.name,
        aubainesPerso: actor.system.aubaine.value,
        aubainesDeGroupe: game.settings.get("wastburg", "aubaine-de-groupe"),
        rollQuality: this.getRollQuality(roll.total),
        cssQuality: this.getClassQuality(roll.total),
        rerollMode: "none"
      }
    } else {
      this.cleanupButtons(rollData.rollDataID) // Delete previous buttons
      if (rollData.rerollMode == "aubaine-perso") {
        rollData.result += 1
      } else {
        const roll = await new Roll(rollData.diceFormula).roll({ async: true })
        await this.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
        rollData.roll = roll
        rollData.result = roll.total
      }
      rollData.rollQuality = this.getRollQuality(rollData.result)
      rollData.cssQuality = this.getClassQuality(rollData.result)
      rollData.rollDataID = randomID(16)
    }

    let msg = await ChatMessage.create({
      alias: actor.name,
      content: await renderTemplate('systems/wastburg/templates/chat/rolls/roll-summary-card.hbs', rollData)
    })
    msg.setFlag("world", "wastburg-roll-data", rollData)
  }


  /* -------------------------------------------- */
  static async chatListeners(html) {

    // Damage handling
    html.on("click", '.apply-aubaine-perso', event => {
      let rollData = this.getRollDataFromMessage(event)
      let actor = game.actors.get(rollData.actorId)
      actor.incDecAubainePerso(-1)
      rollData.rerollMode = "aubaine-perso"
      this.manageWastburgRoll(actor, 0, rollData)
    })

    // Damage handling
    html.on("click", '.apply-aubaine-groupe', event => {
      let rollData = this.getRollDataFromMessage(event)
      let actor = game.actors.get(rollData.actorId)
      this.incDecAubaineGroupe(-1)
      rollData.rerollMode = "aubaine-groupe"
      this.manageWastburgRoll(actor, 0, rollData)
    })

  }
}

