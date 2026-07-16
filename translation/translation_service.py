import ctranslate2
from transformers import AutoTokenizer
from models import Message
import re

MODEL_DIR = "D:/models/nllb-ct2-q_i8-f32"
TOKENIZER_DIR = "D:/models/facebook-nllb-200-distilled-600M"

print("Loading model...")

translator = ctranslate2.Translator(
    MODEL_DIR,
    device="cpu"
)

tokenizer = AutoTokenizer.from_pretrained(
    TOKENIZER_DIR,
    local_files_only=True
)

print("Model loaded on CPU")

LANGUAGE_CODES = {
    "en": "eng_Latn",
    "as": "asm_Beng",
    "bn": "ben_Beng",
    "bd": "brx_Deva",
    "doi": "doi_Deva",
    "gu": "guj_Gujr",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "ka": "kas_Arab",
    "gom": "gom_Deva",
    "mai": "mai_Deva",
    "ml": "mal_Mlym",
    "mni-Mtei": "mni_Beng",
    "mr": "mar_Deva",
    "ne": "npi_Deva",
    "or": "ory_Orya",
    "pu": "pan_Guru",
    "sa": "san_Deva",
    "sat-Olck": "sat_Olck",
    "sd": "snd_Arab",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "ur": "urd_Arab"
}


def translate(text: str, source: str, target: str):

    if source == target:
        return text

    tokenizer.src_lang = source

    input_ids = tokenizer(
        text,
        add_special_tokens=True
    ).input_ids

    tokens = tokenizer.convert_ids_to_tokens(input_ids)

    result = translator.translate_batch(
        [tokens],
        target_prefix=[[target]]
    )[0]

    output_ids = tokenizer.convert_tokens_to_ids(result.hypotheses[0])

    return tokenizer.decode(
        output_ids,
        skip_special_tokens=True
    )


def batch_translate(texts: list[Message], target: str):

    translated_messages = [None] * len(texts)

    message_sets = {}
    index_sets = {}

    for i, message in enumerate(texts):

        source = LANGUAGE_CODES[message.source_lang]

        message_sets.setdefault(source, []).append(message.text)
        index_sets.setdefault(source, []).append(i)

    for source, messages in message_sets.items():

        indices = index_sets[source]

        if source == target:
            for idx, message in zip(indices, messages):
                translated_messages[idx] = message
            continue

        tokenizer.src_lang = source

        batch_tokens = []

        for message in messages:
            ids = tokenizer(
                message,
                add_special_tokens=True
            ).input_ids

            batch_tokens.append(
                tokenizer.convert_ids_to_tokens(ids)
            )

        results = translator.translate_batch(
            batch_tokens,
            target_prefix=[[target]] * len(batch_tokens)
        )

        for idx, result in zip(indices, results):

            output_ids = tokenizer.convert_tokens_to_ids(
                result.hypotheses[0]
            )

            translated_messages[idx] = tokenizer.decode(
                output_ids,
                skip_special_tokens=True
            )

    return translated_messages


def is_language_dominant(text: str, target_code: str) -> bool:
    if not text or not isinstance(text, str):
        return False

    script_map = {
        "ur": r"[\u0600-\u06FF\u0750-\u077F]",
        "sd": r"[\u0600-\u06FF\u0750-\u077F]",
        "ka": r"[\u0600-\u06FF\u0750-\u077F]",

        "mni-Mtei": r"[\uABC0-\uABFF\uAAE0-\uAAFF]",

        "ta": r"[\u0B80-\u0BFF]",
        "te": r"[\u0C00-\u0C7F]",
        "kn": r"[\u0C80-\u0CFF]",
        "ml": r"[\u0D00-\u0D7F]",
        "gu": r"[\u0A80-\u0AFF]",
        "or": r"[\u0B00-\u0B7F]",
        "pu": r"[\u0A00-\u0A7F]",

        "bn": r"[\u0980-\u09FF]",
        "as": r"[\u0980-\u09FF]",

        "hi": r"[\u0900-\u097F]",
        "mr": r"[\u0900-\u097F]",
        "sa": r"[\u0900-\u097F]",
        "gom": r"[\u0900-\u097F]",
        "doi": r"[\u0900-\u097F]",
        "mai": r"[\u0900-\u097F]",
        "ne": r"[\u0900-\u097F]",
        "bd": r"[\u0900-\u097F]",

        "sat-Olck": r"[\u1C50-\u1C7F]",

        "en": r"[A-Za-z]",
    }

    target_pattern = script_map.get(target_code)
    if target_pattern is None:
        return False

    target_count = len(re.findall(target_pattern, text))

    if target_count == 0:
        return False

    all_scripts_pattern = (
        r"[\u0600-\u06FF\u0750-\u077F"
        r"\uABC0-\uABFF\uAAE0-\uAAFF"
        r"\u0B80-\u0BFF"
        r"\u0C00-\u0C7F"
        r"\u0C80-\u0CFF"
        r"\u0D00-\u0D7F"
        r"\u0A80-\u0AFF"
        r"\u0B00-\u0B7F"
        r"\u0980-\u09FF"
        r"\u0900-\u097F"
        r"\u1C50-\u1C7F"
        r"A-Za-z]"
    )

    total_linguistic = len(re.findall(all_scripts_pattern, text))

    return target_count > (total_linguistic - target_count)