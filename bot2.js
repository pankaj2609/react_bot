// let user_query = "apple"
// let user_query = ""

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
});

// Load the vector store from the same directory
import { FaissStore } from "@langchain/community/vectorstores/faiss";
const directory = "./";

const loadedVectorStore = await FaissStore.load(
  directory,
  embeddings
);

// /*
// Search for the most similar document
// const resultOne = await vectorStore.similaritySearch(user_query, 5);
// let context1 = ""
// if(user_query.length != 0){
//   const resultOne = await loadedVectorStore.similaritySearch(user_query, 5);
//   resultOne.forEach(each_doc => {
//     context1 += (each_doc['pageContent'] + "\n"+"|")
//   })
// }

// console.log(context1)
// console.log("-------------end of context 1-----------")

// --------------------------duck duck go search
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
const tool = new DuckDuckGoSearch({ maxResults: 4 });
// let context2 = ""

// if(user_query.length != 0){
//   const result = await tool.invoke(user_query + " in food and nutrient domain");
//   let result_array = JSON.parse(result)
//   result_array.forEach(obj => {context2 += " " + (obj["snippet"])})
// }

// console.log(context2)
// console.log("-------------end of context 2-----------")

// let context2 = "A full 1-cup serving of <b>guava</b> provides 112 calories and over 23 grams of carbohydrates. Most of the carbs come from naturally occurring sugar (14.7g), but you'll also benefit from almost 9 grams of fiber. There is no starch in <b>guava</b>. The glycemic index of <b>guava</b> is 12-24, which is very low for fruit. The glycemic index indicates how much a ... Sodium: 1 milligram. Carbohydrates: 8 grams. Fiber: 3 grams. Sugar: 5 grams. Protein: 1 gram. Portion sizes. One <b>guava</b> makes up one of the 4-5 recommended servings of fruit per day. Like many ... <b>Guava</b> fruit is a nutritious and healthful <b>food</b> that is rich in several important <b>nutrients</b>. According to the United States Department of Agriculture, 100 grams (g) of raw <b>guava</b> fruit contain: 68 ... Nutrition Facts. Many of the powerful health benefits of <b>guava</b> are attributed to its rich <b>nutrient</b> profile. In fact, <b>guavas</b> are low in calories and loaded with vitamin C, folate, copper, potassium and fiber. 100 grams of <b>guava</b> fruit contains the following <b>nutrients</b>: 68 calories. 14.3 grams carbohydrates. 2.5 grams protein."


// ------------------------gemini model
import {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyBdb1Jwz9j8s8PkOxa0FXkmzN2V7wNCifc";

async function runChat(user_typed) {
    let user_query = user_typed
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    let context1 = ""
    // if(user_query != null){
      const resultOne = await loadedVectorStore.similaritySearch(user_query, 5);
      resultOne.forEach(each_doc => {
        context1 += (each_doc['pageContent'] + "\n"+"|")
      })
    // }
    console.log(context1)
    console.log("-------------end of context 1-----------")
    // -----------------------------------------------------------------------------// 
    let context2 = ""
    // if(user_query != null){
      const result = await tool.invoke(user_query + " in food and nutrient domain");
      let result_array = JSON.parse(result)
      result_array.forEach(obj => {context2 += " " + (obj["snippet"])})
    // }
    console.log(context2)
    console.log("-------------end of context 2-----------")
    // -----------------------------------------------------------------------------// 

    const generationConfig = {
        temperature: 0.1,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
        ],
    });


    let ques = user_typed

    let prompt1 = `Read this thoroughly:- ${context1}.  Now, you are supposed to give nutritional information (if mentioned in context give those values, else give all information you find) of the food mentioned:- ${ques}. When asked to compare food items, search the food items carefully. Assume that this is the only source of info you have. Get me the best possible answer from here.If you are unable to get answer, simply return \"did_not_find_answer\" `

    console.log("response from context1")
    const result1 = await chat.sendMessage(prompt1);
    let ans1 = ""
    try{
      const response1 = result1.response;
      ans1 = response1.text();
      return ans1;
    }
    catch(error){
      ans1 = error.message;
    }
    console.log(ans1)

    console.log("\n")

    if(ans1 == "did_not_find_answer"){ /* or ans1 stores anyother error message */
      console.log("resp from context2")
      let prompt2 = `Read this thoroughly:- ${context2}.  Using this context, you are supposed to give answer for this query:- ${ques}.`
      const result2 = await chat.sendMessage(prompt2);
      let ans2 = ""
      try{
        let response2 = result2.response;
        ans2 = response2.text();
        return ans2;
      }
      catch(error){
        ans2 = error.message;
      }
      console.log(ans2);

    }
  return "could you please elaborate your query"
}

// runChat(user_query);

export default runChat
// */