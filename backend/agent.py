import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Constants (Ported from frontend constants.ts - simplified for brevity or can be loaded from file)
MOCK_TRANSACTIONS = [
  { "id": "tx1", "date": "2024-03-01", "description": "スーパーマーケットLIFE", "amount": 5400, "category": "食費" },
  { "id": "tx2", "date": "2024-03-02", "description": "Amazon Prime", "amount": 600, "category": "サブスクリプション" },
  { "id": "tx3", "date": "2024-03-03", "description": "スターバックス", "amount": 1200, "category": "カフェ" },
  { "id": "tx4", "date": "2024-03-05", "description": "家賃振込", "amount": 85000, "category": "住居費" },
  { "id": "tx5", "date": "2024-03-10", "description": "UBER EATS", "amount": 2800, "category": "食費" },
  { "id": "tx6", "date": "2024-03-15", "description": "給与振込", "amount": -320000, "category": "収入" },
  { "id": "tx7", "date": "2024-03-20", "description": "ユニクロ", "amount": 12000, "category": "衣類" },
]

# Initialize GenAI Client (Vertex AI Mode)
# Note: Requires 'gcloud auth application-default login' to be active
client = genai.Client(
    vertexai=True,
    project="bank-moc",
    location="us-central1"
)

def format_profile_context(profile: dict) -> str:
    if not profile:
        return ""
    interests = ", ".join(profile.get("interests", [])) if profile.get("interests") else "未設定"
    return f"""
    [ユーザープロファイル情報]
    - 年齢: {profile.get("ageGroup", "未設定")}
    - 居住地: {profile.get("prefecture", "未設定")}
    - 職業: {profile.get("occupation", "未設定")}
    - 興味・関心: {interests}
    
    回答はこのプロファイル情報を考慮してパーソナライズしてください。
    例えば、年齢層に合わせた言葉遣いや、興味関心に基づいたトピックの選定、職業に関連するアドバイスなどを含めてください。
    """

async def generate_response(agent_type: str, user_message: str, user_profile: dict = None):
    profile_context = format_profile_context(user_profile)
    
    try:
        if agent_type == 'GENERAL':
            # AGENT 1: General Purpose
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=user_message,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    system_instruction=f"You are a helpful general concierge for a banking app. You can answer any questions using Google Search. Always answer in Japanese.\n{profile_context}"
                )
            )
            
            grounding_urls = []
            if response.candidates and response.candidates[0].grounding_metadata:
                 chunks = response.candidates[0].grounding_metadata.grounding_chunks
                 if chunks:
                     for chunk in chunks:
                         if chunk.web and chunk.web.uri:
                             grounding_urls.append({"title": chunk.web.title or "参照元", "uri": chunk.web.uri})

            return {"text": response.text, "groundingUrls": grounding_urls}

        elif agent_type == 'SUPPORT':
            # AGENT 2: Customer Support (Vertex AI Search)
            # Data Store ID: bank-moc-faq_1765851574533
            data_store_id = "projects/bank-moc/locations/global/collections/default_collection/dataStores/bank-moc-faq_1765851574533"
            
            # Note: For Vertex AI Search tool, we need Project ID based auth implicitly or correctly configured environment
            # This might still require 'gcloud auth application-default login' on the server.
            
            tool = types.Tool(
                retrieval=types.Retrieval(
                    vertex_ai_search=types.VertexAISearch(
                        datastore=data_store_id
                    )
                )
            )

            system_prompt = f"""
            あなたはGENESIS APPの厳格なカスタマーサポートエージェントです。
            提供されたツール（Vertex AI Search）を使用して情報を検索し、その情報に基づいて質問に答えてください。
            
            ${profile_context}
            
            ルール:
            1. 検索結果に基づいて、丁寧な日本語で答えてください。
            2. 検索結果に関連情報がない場合は、「申し訳ありませんが、その件に関する情報は持ち合わせておりません。」と答えてください。
            3. 検索結果以外の一般知識や幻覚を含めないでください。
            """

            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=user_message,
                config=types.GenerateContentConfig(
                    tools=[tool],
                    system_instruction=system_prompt,
                    temperature=0.1
                )
            )
            
            grounding_urls = []
            if response.candidates and response.candidates[0].grounding_metadata:
                 chunks = response.candidates[0].grounding_metadata.grounding_chunks
                 if chunks:
                     for chunk in chunks:
                         if chunk.retrieved_context and chunk.retrieved_context.uri:
                             grounding_urls.append({"title": chunk.retrieved_context.title or "サポート文書", "uri": chunk.retrieved_context.uri})

            return {"text": response.text, "groundingUrls": grounding_urls}

        elif agent_type == 'NEWS':
            # AGENT 3: News Analyst
            search_prompt = f"""
            今日の株、債券、不動産、経済指標に関する最新の金融ニュースを探してください。
            これに基づき、包括的な記事（読むのに15分程度かかるボリューム感で、このデモ出力用には500〜800文字程度に要約）を日本語で作成してください。
            明確な見出しを付けて構成してください。

            ユーザーの興味関心: {user_profile.get('interests', []) if user_profile else '一般'}
            {profile_context}
            
            ユーザーのクエリ: {user_message}
            """

            text_response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=search_prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            
            article_text = text_response.text
            grounding_urls = []
            if text_response.candidates and text_response.candidates[0].grounding_metadata:
                 chunks = text_response.candidates[0].grounding_metadata.grounding_chunks
                 if chunks:
                     for chunk in chunks:
                         if chunk.web and chunk.web.uri:
                             grounding_urls.append({"title": chunk.web.title or "ニュースソース", "uri": chunk.web.uri})

            # TTS Generation
            audio_base64 = None
            try:
                summary_prompt = f"以下の記事をリスナー向けに1分程度の短い音声スクリプトとして日本語で要約してください:\n\n{article_text}"
                summary_response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=summary_prompt
                )
                summary_text = summary_response.text

                tts_response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=summary_text,
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
                
                # Handling Audio Blob
                if tts_response.candidates and tts_response.candidates[0].content.parts:
                    part = tts_response.candidates[0].content.parts[0]
                    if part.inline_data:
                        import base64
                        # Encode bytes to base64 string for JSON transport
                        audio_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
            except Exception as e:
                print(f"TTS Generation failed: {e}")
                # Fallback: Continue without audio

            return {"text": article_text, "groundingUrls": grounding_urls, "audioBase64": audio_base64}

        elif agent_type == 'ANALYST':
            # AGENT 4: Analyst (BigQuery)
            try:
                from google.cloud import bigquery
                bq_client_inst = bigquery.Client(project="bank-moc", location="US")
                
                query = """
                    SELECT transaction_date as date, amount, category, description
                    FROM `bank-moc.bank_demo.transaction_records`
                    ORDER BY date DESC
                    LIMIT 50
                """
                query_job = bq_client_inst.query(query)
                rows = query_job.result()
                transactions = []
                for row in rows:
                    # Convert row to dict and handle date serialization
                    d = dict(row)
                    if 'date' in d:
                        d['date'] = str(d['date'])
                    transactions.append(d)
                
                transactions_str = json.dumps(transactions, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f"BigQuery Error: {e}")
                transactions_str = "Error fetching data from BigQuery. using mock data."
                # Fallback to mock if BQ fails (optional, or just raise)
                transactions_str = json.dumps(MOCK_TRANSACTIONS, ensure_ascii=False, indent=2)

            system_prompt = f"""
            You are a financial analyst. Analyze the following transaction data.
            
            Output MUST be valid JSON with the following structure:
            {{
                "analysis": "Your detailed analysis text in Japanese...",
                "chart_data": [
                    {{"category": "Food", "amount": 1000}},
                    {{"category": "Transport", "amount": 2000}}
                ]
            }}
            
            Chart Guidelines:
            - Aggregate amounts by category (e.g., total 'Food' expense).
            - Exclude income (positive amounts) if focusing on expenses, or separate them. 
              (Typically for spending analysis, filter out 'Income').
            - Use the 'category' field for grouping.
            
            User Profile: {profile_context}
            Transactions: {transactions_str}
            """
            
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json"
                )
            )
            
            
            try:
                print(f"Model Response Text: {response.text}") # DEBUG LOG
                response_json = json.loads(response.text)
                return {
                    "text": response_json.get("analysis", "解析できませんでした"),
                    "chartData": response_json.get("chart_data", [])
                }
            except json.JSONDecodeError:
                 return {"text": response.text} # Fallback if JSON fails

        else:
            return {"text": "不明なエージェントタイプです。"}

    except Exception as e:
        print(f"Error: {e}")
        return {"text": "申し訳ありません。エラーが発生しました。"}
