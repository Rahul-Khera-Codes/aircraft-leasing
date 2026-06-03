"""Technical Airworthiness agent: Google Gemma via Ollama (self-hosted, no API key)."""
import json
import logging
import uuid

from openai import OpenAI
from src.agents.base import BaseAgent
from src.schemas.models import FindingOut, FindingSeverity

logger = logging.getLogger(__name__)

SYSTEM = """You are an expert technical airworthiness analyst. Analyze aviation technical records and output ONLY a valid JSON array of findings. Be concise.

SEVERITY:
- STOP: Safety-critical, AD non-compliance, LLP exceedance, falsification.
- FLAG: Fleet mismatch, time reversal, ratio violation, data integrity issue.
- ADVISORY: Minor documentation gap, missing non-critical serial number.
- CLEAR: No anomalies found.

Output 2-4 findings max. Each finding must be:
{"severity":"STOP|FLAG|ADVISORY|CLEAR","category":"string","title":"string","evidence":"short quote","confidence":0.0-1.0,"reasoning":"2 sentences of technical reasoning citing EASA/FAA/ATA standards","aviation_reference":"optional"}

Output ONLY the JSON array, no explanation."""


class TechnicalAirworthinessGemmaAgent(BaseAgent):
    """Technical Airworthiness agent backed by Gemma running locally via Ollama.

    Uses Ollama's OpenAI-compatible endpoint — no API key or external service needed.
    Ensure Ollama is running on the host with the desired model pulled:
        ollama pull gemma4
    """

    def __init__(self, model: str = "gemma3:4b", ollama_host: str = "http://localhost:11434"):
        self._model = model
        self._client = OpenAI(
            base_url=f"{ollama_host}/v1",
            api_key="ollama",  # required by the client lib but ignored by Ollama
        )

    @property
    def name(self):
        return "technical_airworthiness"

    def analyze(self, case_id, registration, aircraft_type, engine_type, documents):
        doc_blobs = []
        for d in documents:
            # Keep preview shorter for Gemma to stay within context window
            preview = (d.get("text_preview") or d.get("text", ""))[:1500]
            doc_blobs.append("[%s (id: %s)]\n%s" % (d.get("filename", "?"), d.get("doc_id", ""), preview))
        user = "Case: %s | %s | Engine: %s\n\nDocs:\n%s\n\nOutput JSON array of findings." % (
            registration,
            aircraft_type,
            engine_type,
            "\n---\n".join(doc_blobs),
        )
        try:
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": user},
                ],
                max_tokens=512,
                timeout=90,  # gemma3:1b: ~30s; 4b: ~60s on t4g.xlarge CPU
                extra_body={"options": {"num_ctx": 4096}},
            )
            text = (resp.choices[0].message.content or "").strip()
        except Exception as e:
            logger.exception("Gemma/Ollama error: %s", e)
            return [
                FindingOut(
                    finding_id=uuid.uuid4().hex[:24],
                    agent_name=self.name,
                    severity=FindingSeverity.FLAG,
                    category="SYSTEM",
                    title="Agent failed",
                    evidence=str(e),
                    confidence=0.0,
                    iteration=0,
                )
            ]
        if "[" in text and "]" in text:
            start, end = text.index("["), text.rindex("]") + 1
            text = text[start:end]
        try:
            raw = json.loads(text)
        except Exception:
            return []
        if not isinstance(raw, list):
            return []
        out = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            sev = item.get("severity", "ADVISORY")
            if isinstance(sev, str) and sev.upper() in ("CLEAR", "ADVISORY", "FLAG", "STOP"):
                sev = FindingSeverity(sev.upper())
            else:
                sev = FindingSeverity.ADVISORY
            out.append(
                FindingOut(
                    finding_id=uuid.uuid4().hex[:24],
                    agent_name=self.name,
                    severity=sev,
                    category=str(item.get("category", ""))[:128],
                    title=str(item.get("title", ""))[:512],
                    evidence=str(item.get("evidence", "")) or "N/A",
                    confidence=min(1.0, max(0.80, float(item.get("confidence", 0.80)))),
                    source_doc_id=item.get("source_doc_id"),
                    source_page=str(item.get("source_page", ""))[:64] or None,
                    iteration=0,
                    reasoning=str(item.get("reasoning", "")),
                    correlation_group=str(item.get("correlation_group", "")) if item.get("correlation_group") else None,
                    aviation_reference=str(item.get("aviation_reference", "")) if item.get("aviation_reference") else None,
                    metadata={},
                )
            )
        return out
