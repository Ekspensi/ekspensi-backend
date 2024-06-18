import tfjs from "@tensorflow/tfjs-node";

// const bucketName = process.env.GCP_BUCKET_NAME;
const bucketUrl = `https://storage.googleapis.com/ekspensi-capstone-1122`;
// const bucketUrl =
//   process.env.NODE_ENV === "production"
//     ? `https://storage.cloud.google.com/${bucketName}`
//     : `https://storage.googleapis.com/${bucketName}`;

export default (async () => {
  return {
    model: await (() => {
      return tfjs.loadLayersModel(
        `${bucketUrl}/ml-model/nlp-classification/model.json`
      );
    })(),
    vocabulary: await (async () => {
      return await fetch(
        `${bucketUrl}/ml-model/nlp-classification/vocabulary.json`
      ).then((response) => response.json());
    })(),
    label: await (async () => {
      return await fetch(
        `${bucketUrl}/ml-model/nlp-classification/label_encoder.json`
      )
        .then((response) => response.json())
        .then((data) => data.classes);
    })(),
    predict: function (text) {
      let price = text.match(/\d+/g);
      if (!price) {
        return {
          label: "error",
          text: "please provide the nominal in the sentence.",
          price: 0,
        };
      }

      price = price.filter(
        (e) => e.length >= 3 && parseFloat(e) >= 100 && !isNaN(e)
      );

      if (price.length === 0) {
        return {
          label: "error",
          text: "please make sure the nominal is more than 100.",
          price: 0,
        };
      }

      const cleanedText = text.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
      const textSplit = cleanedText.split(" ");
      const vector = new Array(Object.keys(this.vocabulary).length).fill(0);

      textSplit.forEach((e) => {
        const index = this.vocabulary[e];
        if (index !== undefined) {
          vector[index] = 1;
        }
      });

      const tensor = new tfjs.tensor2d([vector]);
      const predict = this.model.predict(tensor);
      const predictedClass = predict.argMax(-1).dataSync()[0];
      const result = this.label[predictedClass];
      return {
        label: result,
        text: cleanedText,
        price: parseFloat(price[price.length - 1]),
      };
    },
  };
})();
