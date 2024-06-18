import tfjs from "@tensorflow/tfjs-node";
import fs from "fs";

import { downloadFiles } from "./cloudStorage.js";
import path from "path";

export default (async () => {
  const bucketName = process.env.GCP_BUCKET_NAME;
  const bucketPath = "ml-model/nlp-classification";

  if (!bucketName) {
    throw new Error("GCP_BUCKET_NAME is not defined.");
  }

  try {
    await downloadFiles(bucketName, bucketPath);
  } catch (e) {
    throw new Error("Failed to download nlp model files: " + e.message);
  }

  return {
    model: await (async () => {
      return await tfjs.loadLayersModel(
        `file://${path.resolve(`./gcs/${bucketPath}/model.json`)}`
      );
    })(),
    vocabulary: (() => {
      const data = fs.readFileSync(
        path.resolve(`./gcs/${bucketPath}/vocabulary.json`),
        "utf8"
      );
      const vocabulary = JSON.parse(data);
      return vocabulary;
    })(),
    label: (() => {
      const data = fs.readFileSync(
        path.resolve(`./gcs/${bucketPath}/label_encoder.json`),
        "utf8"
      );
      const label = JSON.parse(data);
      return label;
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
      console.log(Object.keys(this.vocabulary));

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
