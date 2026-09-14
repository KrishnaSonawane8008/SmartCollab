import { FetchRequest } from "../api/client"

const BASE_URL=import.meta.env.VITE_TRANSLATION_API_BASE


export async function translate(message, target) {

    if(isLanguageDominant(message.text, target)){
        return {translated: message.text}
    }

    // class Message(BaseModel):
    // text:str
    // source_lang:str

    // class TranslationRequest(BaseModel):
    // message: Message 
    // target: str

    return await FetchRequest(
            BASE_URL, `/translate`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message:message, target:`${target}` })
            }
        )
}

export async function translate_array(text_array, target) {


    return await FetchRequest(
            BASE_URL, `/batchtranslate`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages:text_array, target:`${target}` })
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
    
    // class Message(BaseModel):
    // text:str
    // source_lang:str

    // class TranslationRequest(BaseModel):
    // message: Message 
    // target: str

    const msg_array=messages_Array.map(obj=>({text: obj.message, source_lang: obj.message_language}))
    
    const translation_response=await translate_array(msg_array, target)
    const translated_array=translation_response.translated

    const TranslatedArr=messages_Array.map((obj, indx)=>{
        obj.message=translated_array[indx]

        return obj
    })


    return TranslatedArr
}


export function isLanguageDominant(text, targetCode) {
  if (!text || typeof text !== 'string') return false;

  // 1. Map your language codes to their specific Unicode Script Regex
  const scriptMap = {
    'ur': /\p{Script=Arabic}/gu,
    'sd': /\p{Script=Arabic}/gu,
    'mni-Mtei': /[\uABC0-\uABFF\uAAE0-\uAAFF]/gu,
    'ta': /\p{Script=Tamil}/gu,
    'te': /\p{Script=Telugu}/gu,
    'ka': /[\u0600-\u06FF\u0750-\u077F]/gu,
    'kn': /\p{Script=Kannada}/gu,
    'ml': /\p{Script=Malayalam}/gu,
    'gu': /\p{Script=Gujarati}/gu,
    'or': /\p{Script=Oriya}/gu,
    'pu': /[\u0A00-\u0A7F]/gu,
    
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
    'bd': /\p{Script=Devanagari}/gu,
    
    // All 5 of these languages share the Latin script block
    'en': /\p{Script=Latin}/gu,
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

export function getDominantLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  // 1. Map language codes to their specific Unicode Script Regex
  // Fixed broken syntax for 'ka' and 'pu' to use standard character classes
  const scriptMap = {
    'ur': /\p{Script=Arabic}/gu,
    'sd': /\p{Script=Arabic}/gu,
    'mni-Mtei': /[\uABC0-\uABFF\uAAE0-\uAAFF]/gu,
    'ta': /\p{Script=Tamil}/gu,
    'te': /\p{Script=Telugu}/gu,
    'ka': /[\u0600-\u06FF\u0750-\u077F]/gu, // Kashmiri (Arabic block script)
    'kn': /\p{Script=Kannada}/gu,
    'ml': /\p{Script=Malayalam}/gu,
    'gu': /\p{Script=Gujarati}/gu,
    'or': /\p{Script=Oriya}/gu,
    'pu': /[\u0A00-\u0A7F]/gu,               // Punjabi (Gurmukhi block script)
    'bn': /\p{Script=Bengali}/gu,
    'as': /\p{Script=Bengali}/gu,
    'hi': /\p{Script=Devanagari}/gu,
    'mr': /\p{Script=Devanagari}/gu,
    'sa': /\p{Script=Devanagari}/gu,
    'gom': /\p{Script=Devanagari}/gu,
    'doi': /\p{Script=Devanagari}/gu,
    'mai': /\p{Script=Devanagari}/gu,
    'ne': /\p{Script=Devanagari}/gu,
    'bd': /\p{Script=Devanagari}/gu,
    'en': /\p{Script=Latin}/gu,
  };

  // Track the highest count and the winning code
  let maxCount = 0;
  let dominantCode = 'en'; 

  // 2. Iterate through each language configuration to tally character counts
  for (const [langCode, regex] of Object.entries(scriptMap)) {
    // Reset regex state execution for safety
    regex.lastIndex = 0; 
    
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;

    // Check if this script configuration beats our current leader
    if (count > maxCount) {
      maxCount = count;
      dominantCode = langCode;
    }
  }

  // 3. Fallback resolution logic
  // If there's an absolute zero match layout across all scripts, default back to English.
  if (maxCount === 0) {
    return 'en';
  }

  return dominantCode;
}



