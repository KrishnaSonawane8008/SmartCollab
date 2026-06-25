import { FetchRequest } from "../api/client"

const BASE_URL=import.meta.env.VITE_TRANSLATION_API_BASE

const LatinTexts=['en', 'fr', 'nl', 'sat-Latn']

export async function translate(text_string, target) {

    if(isLanguageDominant(text_string, target)){
        return {translated: text_string}
    }

    return await FetchRequest(
            BASE_URL, `/translate`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text:text_string, target:`${target}` })
            }
        )
}

export async function translate_array(text_array, target) {


    return await FetchRequest(
            BASE_URL, `/translate`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text:text_array, target:`${target}` })
            }
        )
}


export async function MessageArray_translate(messages_Array, target) {
    
    if(!messages_Array || !target || !Array.isArray(messages_Array)){
        return null
    }

    // if(target==="en"){
    //     return messages_Array
    // }

    // const Combined_MessagesString=messages_Array.map((obj, i) => obj.message).join(" <<>> ")
    // const translated_str=await translate(Combined_MessagesString, target)

    // const translated_arr=translated_str.translated.split(" <<>> ")
    

    const msg_array=messages_Array.map(obj=>obj.message)
    const translation_response=await translate_array(msg_array, target)
    const translated_array=translation_response.translated
    // console.log(translated_array)

    const TranslatedArr=messages_Array.map((obj, indx)=>{
        obj.message=translated_array[indx]

        return obj
    })


    return TranslatedArr
}


function isLanguageDominant(text, targetCode) {
  if (!text || typeof text !== 'string') return false;

  // 1. Map your language codes to their specific Unicode Script Regex
  const scriptMap = {
    'ja': /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu,
    'ur': /\p{Script=Arabic}/gu,
    'mni-Mtei': /[\uABC0-\uABFF\uAAE0-\uAAFF]/gu,
    'ta': /\p{Script=Tamil}/gu,
    'te': /\p{Script=Telugu}/gu,
    'kn': /\p{Script=Kannada}/gu,
    'ml': /\p{Script=Malayalam}/gu,
    'gu': /\p{Script=Gujarati}/gu,
    'or': /\p{Script=Oriya}/gu,
    
    // Bengali and Assamese share the same script block
    'bn': /\p{Script=Bengali}/gu,
    'as': /\p{Script=Bengali}/gu,
    
    // All 8 of these languages share the Devanagari script block
    'hi': /\p{Script=Devanagari}/gu,
    'mr': /\p{Script=Devanagari}/gu,
    'sa': /\p{Script=Devanagari}/gu,
    'gom': /\p{Script=Devanagari}/gu,
    'doi': /\p{Script=Devanagari}/gu,
    'mai': /\p{Script=Devanagari}/gu,
    'ne': /\p{Script=Devanagari}/gu,
    'sd': /\p{Script=Devanagari}/gu,
    
    // All 5 of these languages share the Latin script block
    'en': /\p{Script=Latin}/gu,
    'es': /\p{Script=Latin}/gu,
    'fr': /\p{Script=Latin}/gu,
    'nl': /\p{Script=Latin}/gu,
    'sat-Latn': /\p{Script=Latin}/gu
  };

  const targetRegex = scriptMap[targetCode];
  if (!targetRegex) return false; // Return false if an unsupported code is passed

  // 2. Count the target script characters
  const targetMatches = text.match(targetRegex);
  const targetCount = targetMatches ? targetMatches.length : 0;

  // Rule 2: If no characters of that script are present, return false
  if (targetCount === 0) return false;

  // 3. Count ALL language script characters in the text to get the total linguistic payload
  // We combine all individual regexes into one master global matcher to filter out spaces, numbers, and symbols.
  const allScriptsRegex = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Script=Arabic}\uABC0-\uABFF\uAAE0-\uAAFF\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Bengali}\p{Script=Devanagari}\p{Script=Latin}]/gu;
  
  const allMatches = text.match(allScriptsRegex);
  const totalLinguisticChars = allMatches ? allMatches.length : 0;

  // Calculate the remaining characters belonging to other languages
  const remainingCount = totalLinguisticChars - targetCount;

  // Rule 1: Must be strictly greater than the remaining linguistic characters
  return targetCount > remainingCount;
}


