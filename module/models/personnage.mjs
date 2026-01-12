/**
 * Data model pour les personnages
 */
export default class PersonnageDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      biography: new fields.HTMLField({ initial: "" }),
      lieunaissance: new fields.StringField({ initial: "" }),
      age: new fields.StringField({ initial: "" }),
      residence: new fields.StringField({ initial: "" }),
      signes: new fields.HTMLField({ initial: "" }),
      persotype: new fields.StringField({ initial: "gardoche" }),
      note: new fields.HTMLField({ initial: "" }),
      arme: new fields.HTMLField({ initial: "" }),
      protection: new fields.HTMLField({ initial: "" }),
      materiel: new fields.HTMLField({ initial: "" }),
      fortune: new fields.HTMLField({ initial: "" }),
      dettes: new fields.HTMLField({ initial: "" }),
      anciennete: new fields.StringField({ initial: "" }),
      role: new fields.SchemaField({
        gardoche: new fields.SchemaField({
          label: new fields.StringField({ initial: "Gardoche" }),
          checkGardoche: new fields.BooleanField({ initial: false })
        }),
        malfrat: new fields.SchemaField({
          label: new fields.StringField({ initial: "Malfrat" }),
          checkMalfrat: new fields.BooleanField({ initial: false })
        })
      }),
      anciennetereputation: new fields.SchemaField({
        value: new fields.StringField({ initial: "0" })
      }),
      aubaine: new fields.SchemaField({
        value: new fields.StringField({ initial: "0" })
      }),
      aubainegroupe: new fields.SchemaField({
        value: new fields.StringField({ initial: "0" })
      }),
      reputation: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      sante: new fields.SchemaField({
        santeText: new fields.StringField({ initial: "" }),
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      mental: new fields.SchemaField({
        mentalText: new fields.StringField({ initial: "" }),
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      social: new fields.SchemaField({
        socialText: new fields.StringField({ initial: "" }),
        value: new fields.NumberField({ initial: 0, integer: true })
      }),
      combat: new fields.SchemaField({
        santemax: new fields.NumberField({ initial: 8, integer: true }),
        santecurrent: new fields.NumberField({ initial: 8, integer: true }),
        initiative: new fields.NumberField({ initial: 0, integer: true })
      }),
      gelder: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true })
      })
    };
  }
}
