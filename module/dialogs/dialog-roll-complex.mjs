import { WastburgUtility } from "../system/utility.mjs";

export class WastburgRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(rollData ) {

    let options = { classes: ["WastburgDialog"], width: 340, height: 320, 'z-index': 99999 }
    let html = await renderTemplate('systems/wastburg/templates/dialogs/dialog-roll-complex.hbs', rollData)

    return new WastburgRollDialog(rollData, html, options )
  }

  /* -------------------------------------------- */
  constructor(rollData, html, options, close = undefined) {
    let conf = {
      title: "Jet avancé",
      content: html,
      buttons: { 
        roll: {
            icon: '<i class="fas fa-check"></i>',
            label: "Lancer",
            callback: () => { this.performRoll() }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Annuler",
            callback: () => { this.close() }
        } },
      close: close
    }

    super(conf, options);

    this.rollData = rollData
  }

  /* -------------------------------------------- */
  performRoll( ) {
    WastburgUtility.performRollComplex( this.rollData )
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });
    
    html.find('#select-trait').change(async (event) =>  {
      this.rollData.selectedTrait = event.currentTarget.value
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })
    html.find('#select-contact').change(async (event) =>  {
      this.rollData.selectedContact = event.currentTarget.value
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })
    html.find('#select-bonusmalus').change(async (event) =>  {
      this.rollData.selectedBonusMalus = event.currentTarget.value
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })  
    html.find('#applySante').change(async (event) =>  {
      this.rollData.applySante = event.currentTarget.checked
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })         
    html.find('#applyMental').change(async (event) =>  {
      this.rollData.applyMental = event.currentTarget.checked
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })         
    html.find('#applySocial').change(async (event) =>  {
      this.rollData.applySocial = event.currentTarget.checked
      WastburgUtility.computeFinalLevel(this.rollData)
      $('#total-level').html( WastburgUtility.getLevelFromValue(this.rollData.totalLevel))
    })         

  }
}