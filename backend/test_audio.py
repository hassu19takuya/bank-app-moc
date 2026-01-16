import os
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def test_audio():
    text = "こんにちは。これはテスト音声です。"
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Kore'
                        )
                    )
                )
            )
        )
        print("Success!")
        # Check if we got audio
        if response.candidates and response.candidates[0].content.parts:
            print("Received parts:", len(response.candidates[0].content.parts))
            print("Modality:", response.candidates[0].content.parts[0].inline_data and "BINARY" or "TEXT")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_audio())
