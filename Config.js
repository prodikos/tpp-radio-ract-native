const Config = {

  /**
   * The base directory where the BoomChat is hosted
   */
  chatBaseUrl: "https://www.thepressproject.gr/boomchat",

  /**
   * The link to the audio stream
   */
  stream: "http://stream.radiojar.com/qgra821mrtwtv",

  /**
   * The program of the broadcasts
   */
  schedule: {
    timezone: "+2",
    broadcasts: [
      {
        title: "Η Φάρμα των Ζώων",
        desc: "Φάρμα των ζώων, με τον Θάνο Καμήλαλη και τον Κωνσταντίνο Πουλή",
        image:
          "https://www.thepressproject.gr/photos/600x350/%CF%86%CE%B1%CF%81%CE%BC%CE%B11515687210.jpg",
        days: [1, 2, 3, 4, 5],
        start: [17, 0],
        end: [18, 0]
      },
      {
        title: "Το ΜηνΌρε του TPP",
        desc:
          "«Το ΜηνΌρε του TPP» με τον Ορέστη Βέλμαχο και τον Μηνά Κωνσταντίνου",
        image:
          "https://www.thepressproject.gr/photos/600x350/%CE%BC%CE%BC%CE%B9%CE%BD%CE%BF%CF%81%CE%B51515651143.jpg",
        days: [1, 3, 5],
        start: [16, 0],
        end: [17, 0]
      },
      {
        title: "Γνωστοί άγνωστοι",
        desc:
          "«Γνωστοί άγνωστοι» με τη Νάντια Ρούμπου και την Τζένη Τσιροπούλου",
        image:
          "https://www.thepressproject.gr/photos/600x350/%CE%B3%CE%BD%CF%89%CF%83%CF%8415047980681513862217.jpg",
        days: [4],
        start: [16, 0],
        end: [17, 0]
      },
      {
        title: "Ladies' thirst",
        desc: "«Ladies' thirst» με τη Χριστίνα Σβανά και τη Ντίνα Σωτηριάδη",
        image:
          "https://www.thepressproject.gr/photos/600x350/%CE%BC%CE%BC%CE%B9%CE%BD%CE%BF%CF%81%CE%B51515651143.jpg",
        days: [2],
        start: [18, 0],
        end: [19, 0]
      },
      {
        title: "Βαβυλωνία",
        desc:
          "Βαβυλωνία, Το πολιτικό περιοδικό Βαβυλωνία στο ραδιόφωνο του ThePressProject",
        image:
          "https://www.thepressproject.gr/photos/600x350/vavv1516381776.jpg",
        days: [5],
        start: [15, 0],
        end: [16, 0]
      }

    ]
  }
};

export default Config;
