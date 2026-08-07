import io
import re
from typing import Dict
from pypdf import PdfReader
from fastapi import HTTPException, status

def clean_extracted_text(text: str) -> str:
    """
    Cleans raw extracted PDF text by removing null bytes, normalizing spaces,
    and handling consecutive blank lines.
    """
    if not text:
        return ""
    # Remove null bytes
    text = text.replace("\x00", "")
    # Replace multiple horizontal spaces with a single space
    text = re.sub(r"[ \t]+", " ", text)
    # Replace more than two consecutive newlines with a double newline
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[int, str]:
    """
    Extracts text page-by-page from raw PDF binary bytes.
    Returns a dictionary mapping 1-based page numbers to cleaned page text.
    """
    if not pdf_bytes or len(pdf_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid or corrupted PDF file: {str(e)}"
        )

    if len(reader.pages) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF file contains no pages."
        )

    pages_text: Dict[int, str] = {}
    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        raw_text = page.extract_text() or ""
        cleaned = clean_extracted_text(raw_text)
        pages_text[page_num] = cleaned

    return pages_text
