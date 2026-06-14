import os
import sys
import json
import zipfile
import tempfile
from pathlib import Path
from PIL import Image

# Add apps/api to path so we can import services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from app.services.gemini_client import GeminiClient
from app.services.pdf_processor import PDFProcessor
from app.services.rubric_parser import RUBRIC_PARSE_PROMPT
from app.services.roll_extractor import ROLL_EXTRACTION_PROMPT
from app.services.sheet_evaluator import EVALUATION_PROMPT
from app.services.annotator import AnnotationEngine

# Define a mock evaluation class for the annotator
class MockEvaluation:
    def __init__(self, data):
        self.q_no = data.get("q_no")
        self.awarded_marks = float(data.get("awarded_marks", data.get("marks", 0)))
        self.max_marks = float(data.get("max_marks", 0)) 
        self.verdict = data.get("verdict", "skipped")
        
        bbox = data.get("bbox", {})
        if isinstance(bbox, dict):
            self.bbox_x = float(bbox.get("x", 0.05))
            self.bbox_y = float(bbox.get("y", 0.05))
            self.bbox_w = float(bbox.get("w", 0.5))
            self.bbox_h = float(bbox.get("h", 0.1))
        else:
            self.bbox_x, self.bbox_y, self.bbox_w, self.bbox_h = 0.05, 0.05, 0.5, 0.1
            
        self.is_flagged = data.get("ai_confidence", data.get("confidence", 1.0)) < 0.75

def main():
    print("🚀 Starting End-to-End Local Evaluation Flow")
    
    # Paths
    demo_data_dir = Path(__file__).resolve().parent.parent.parent.parent / "demo-data"
    qp_path = demo_data_dir / "class10_physics_question_paper.pdf"
    ms_path = demo_data_dir / "class10_physics_marking_scheme.pdf"
    zip_path = demo_data_dir / "Answer-Sheets.zip"
    
    output_dir = Path(__file__).resolve().parent / "e2e_output"
    output_dir.mkdir(exist_ok=True)
    
    pdf_processor = PDFProcessor()
    gemini = GeminiClient()
    annotator = AnnotationEngine()
    
    print("\n[1/5] Extracting Question Paper & Marking Scheme...")
    with open(qp_path, "rb") as f:
        qp_text, qp_needs_ocr = pdf_processor.extract_text_from_pdf(f.read())
    with open(ms_path, "rb") as f:
        ms_text, ms_needs_ocr = pdf_processor.extract_text_from_pdf(f.read())
        
    print("\n[2/5] Parsing Rubric via Gemini...")
    prompt = RUBRIC_PARSE_PROMPT.format(
        question_paper_text=qp_text,
        marking_scheme_text=ms_text,
        guidelines="No special guidelines."
    )
    # This calls Gemini
    parsed_rubric = gemini.generate_json(prompt)
    print(f"✅ Parsed {len(parsed_rubric)} questions from rubric.")
    with open(output_dir / "parsed_rubric.json", "w") as f:
        json.dump(parsed_rubric, f, indent=2)
        
    # Build max_marks map
    max_marks_map = {str(q["q_no"]): float(q["max_marks"]) for q in parsed_rubric if "q_no" in q and "max_marks" in q}

    print("\n[3/5] Extracting Answer Sheets...")
    temp_dir = tempfile.mkdtemp()
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    
    # Find all PDFs or images
    sheet_paths = []
    for root, _, files in os.walk(temp_dir):
        for file in files:
            if file.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
                sheet_paths.append(os.path.join(root, file))
    
    print(f"📄 Found {len(sheet_paths)} sheet files to process.")
    
    if not sheet_paths:
        print("❌ No sheets found in the zip.")
        return
        
    all_eval_results = []

    for sheet_idx, target_sheet_path in enumerate(sheet_paths):
        sheet_name = os.path.basename(target_sheet_path)
        print(f"\n--- Processing Sheet {sheet_idx+1}/{len(sheet_paths)}: {sheet_name} ---")
        
        if target_sheet_path.lower().endswith('.pdf'):
            with open(target_sheet_path, "rb") as f:
                pdf_bytes = f.read()
            pil_images = pdf_processor.convert_pdf_to_images(pdf_bytes, dpi=200)
            if not pil_images:
                print(f"❌ Failed to convert {sheet_name} to images.")
                continue
        else:
            with open(target_sheet_path, "rb") as f:
                image_bytes = f.read()
            pil_img = pdf_processor.convert_image_to_standard(image_bytes)
            pil_images = [pil_img]
            
        all_evaluated_q_nos = []
        sheet_eval_results = []
        roll_result = None
        
        for page_idx, pil_img in enumerate(pil_images):
            page_number = page_idx + 1
            print(f"\n[Page {page_number}/{len(pil_images)}] Extracting & Evaluating...")
            
            pil_img_prep = pdf_processor.preprocess_for_ai(pil_img)
            image_b64 = pdf_processor.image_to_base64(pil_img_prep)
            
            # Roll Extraction (only on first page)
            if page_number == 1:
                roll_result = gemini.generate_json(ROLL_EXTRACTION_PROMPT, image=image_b64)
                print(f"🧑‍🎓 Roll Details: {roll_result}")
            
            # Evaluation
            eval_prompt = EVALUATION_PROMPT.format(
                rubric_json=json.dumps(parsed_rubric, indent=2),
                already_evaluated=json.dumps(all_evaluated_q_nos),
                page_number=page_number,
                guidelines="No special guidelines."
            )
            eval_result = gemini.generate_json(eval_prompt, image=image_b64)
            print(f"📝 Page {page_number} Results: {json.dumps(eval_result, indent=2)}")
            
            sheet_eval_results.extend(eval_result)
            
            for res in eval_result:
                q_no = str(res.get("q_no", ""))
                if q_no not in all_evaluated_q_nos:
                    all_evaluated_q_nos.append(q_no)
                res["max_marks"] = max_marks_map.get(q_no, 0.0)
                res["sheet"] = sheet_name
                
            # Annotating Image
            eval_objects = [MockEvaluation(res) for res in eval_result]
            annotated_img = annotator.annotate_page(pil_img_prep, eval_objects)
            
            out_img_path = output_dir / f"annotated_{sheet_name}_page_{page_number}.png"
            annotated_img.save(out_img_path)
            print(f"🖼️ Saved annotated page to: {out_img_path}")
            
        all_eval_results.append({
            "sheet_name": sheet_name,
            "roll_result": roll_result,
            "evaluations": sheet_eval_results
        })

    with open(output_dir / "evaluation_results.json", "w") as f:
        json.dump(all_eval_results, f, indent=2)
        
    print("\n🎉 End-to-End Local Flow Completed Successfully!")

if __name__ == "__main__":
    main()
