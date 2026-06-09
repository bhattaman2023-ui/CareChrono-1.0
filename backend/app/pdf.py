import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_patient_pdf(patient_data: dict, events_list: list) -> io.BytesIO:
    """
    Generates a professional clinical summary PDF for a patient.
    Light theme matching Apple Health style.
    """
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom colors: Healthcare Blue, soft cyan, grey borders
    PRIMARY_COLOR = colors.HexColor("#0284c7")  # Sky 600 (Healthcare Blue)
    SECONDARY_COLOR = colors.HexColor("#0d9488") # Teal 600
    TEXT_COLOR = colors.HexColor("#1e293b")      # Slate 800
    BORDER_COLOR = colors.HexColor("#e2e8f0")    # Slate 200
    ALT_ROW_COLOR = colors.HexColor("#f8fafc")   # Slate 50
    
    # Severity indicators
    RISK_COLORS = {
        "High": colors.HexColor("#ef4444"),    # Red
        "Medium": colors.HexColor("#f59e0b"),  # Amber
        "Low": colors.HexColor("#10b981")      # Emerald
    }
    
    risk_level = patient_data.get('risk_score', 'Low')
    risk_color = RISK_COLORS.get(risk_level, colors.HexColor("#10b981"))
    
    # Custom Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=PRIMARY_COLOR,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748b")
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_COLOR
    )
    
    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#475569")
    )
    
    meta_val_style = ParagraphStyle(
        'MetaValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=TEXT_COLOR
    )
    
    risk_text_style = ParagraphStyle(
        'RiskText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.white
    )
    
    table_hdr_style = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_COLOR
    )

    # Document Header
    story.append(Paragraph("CareChrono Symptom Timeline Report", title_style))
    story.append(Paragraph(f"Clinical AI Intelligence Summary | Compiled: {datetime.now().strftime('%B %d, %Y')}", subtitle_style))
    story.append(Spacer(1, 8))
    
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceBefore=2, spaceAfter=10))
    
    # Patient Metadata Table
    dob_str = patient_data.get('date_of_birth')
    if not isinstance(dob_str, str):
        dob_str = dob_str.strftime('%Y-%m-%d')
        
    meta_data = [
        [
            Paragraph("Patient Name:", meta_label_style),
            Paragraph(patient_data.get('name', ''), meta_val_style),
            Paragraph("MRN:", meta_label_style),
            Paragraph(patient_data.get('medical_record_number', ''), meta_val_style)
        ],
        [
            Paragraph("Date of Birth:", meta_label_style),
            Paragraph(dob_str, meta_val_style),
            Paragraph("Gender:", meta_label_style),
            Paragraph(patient_data.get('gender', ''), meta_val_style)
        ]
    ]
    
    meta_table = Table(meta_data, colWidths=[90, 180, 70, 200])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
    ]))
    
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    # Risk Alert Panel
    risk_data = [[
        Paragraph(f"RISK LEVEL: {risk_level.upper()} RISK ({patient_data.get('progression_trend', 'Stable')} Trend)", risk_text_style)
    ]]
    risk_table = Table(risk_data, colWidths=[540])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), risk_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMMARGIN', (0,0), (-1,-1), 10),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 8))
    
    # AI Clinical Summary
    story.append(Paragraph("AI-Generated Clinical Progression Summary", section_heading))
    summary_text = patient_data.get('summary') or "No clinical summary has been generated yet. Log symptoms daily to build the summary."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 12))
    
    # Timeline Table
    story.append(Paragraph("Symptom Timeline Pathway", section_heading))
    
    if not events_list:
        story.append(Paragraph("No symptoms recorded in the timeline.", body_style))
    else:
        table_data = [[
            Paragraph("Date", table_hdr_style),
            Paragraph("Type", table_hdr_style),
            Paragraph("Symptom Event", table_hdr_style),
            Paragraph("Description", table_hdr_style),
            Paragraph("Severity", table_hdr_style)
        ]]
        
        sorted_events = sorted(events_list, key=lambda x: x.get('date', ''))
        
        for e in sorted_events:
            e_date = e.get('date')
            if not isinstance(e_date, str):
                e_date = e_date.strftime('%Y-%m-%d')
            
            sev = e.get('severity') or "Low"
            
            table_data.append([
                Paragraph(e_date, table_cell_style),
                Paragraph(e.get('event_type', 'Symptom'), table_cell_style),
                Paragraph(e.get('title', ''), table_cell_style),
                Paragraph(e.get('description', '') or '', table_cell_style),
                Paragraph(sev, table_cell_style)
            ])
            
        event_table = Table(table_data, colWidths=[75, 65, 130, 210, 60])
        t_style = [
            ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ]
        
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                t_style.append(('BACKGROUND', (0, i), (-1, i), ALT_ROW_COLOR))
                
        event_table.setStyle(TableStyle(t_style))
        story.append(event_table)

    # Disclaimer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=4, spaceAfter=8))
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1
    )
    story.append(Paragraph("CONFIDENTIAL HEALTH REPORT - COMPILED BY CARECHRONO AI", disclaimer_style))
    story.append(Paragraph("This report highlights symptom changes to prepare clinicians for speedier diagnostic review.", disclaimer_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
