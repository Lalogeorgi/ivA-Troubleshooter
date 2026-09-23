import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function generateManual() {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  const primaryColor = rgb(0.08, 0.2, 0.45); // Deep clinical blue
  const textColor = rgb(0.15, 0.15, 0.15);
  const accentRed = rgb(0.8, 0.15, 0.15);
  const accentAmber = rgb(0.85, 0.55, 0.05);
  const lightGray = rgb(0.94, 0.95, 0.96);
  const borderColor = rgb(0.8, 0.82, 0.85);

  // ---------------- PAGE 1: COVER & OVERVIEW ----------------
  const page1 = pdfDoc.addPage([612, 792]); // Standard US Letter
  const { width, height } = page1.getSize();

  // Top banner
  page1.drawRectangle({
    x: 40,
    y: height - 120,
    width: width - 80,
    height: 70,
    color: primaryColor,
  });

  page1.drawText('BIOMED DIAGNOSTICS INC.', {
    x: 55,
    y: height - 75,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.8, 0.9, 1.0),
  });

  page1.drawText('Analyzer X200 Technical Service & Troubleshooting Manual', {
    x: 55,
    y: height - 105,
    size: 15,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('Document ID: MNL-X200-SVC-01  |  Firmware Baseline: v4.2.1  |  Rev: 4.2', {
    x: 40,
    y: height - 145,
    size: 9,
    font: fontCourier,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Section 1: Executive Summary
  page1.drawText('1. System Description & Analytical Architecture', {
    x: 40,
    y: height - 180,
    size: 13,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  const p1Text = [
    'The BioMed Analyzer X200 is a fully automated, random-access clinical chemistry analyzer',
    'capable of executing up to 800 photometric tests per hour. Analytical precision relies on synchronous',
    'closed-loop coordination between the Fluidics Aspiration/Dispense manifold, the 12-wavelength',
    'diffraction grating photometer, and dual robotic pipetting arms with capacitive liquid level detection.',
    '',
    'This technical manual provides authorized Field Service Engineers (FSE) with factory diagnostic',
    'thresholds, calibration procedures, alarm code resolution trees, and safety compliance directives.',
  ];

  let textY = height - 205;
  for (const line of p1Text) {
    page1.drawText(line, { x: 40, y: textY, size: 10, font: fontHelvetica, color: textColor });
    textY -= 15;
  }

  // Safety Callout Box
  page1.drawRectangle({
    x: 40,
    y: textY - 75,
    width: width - 80,
    height: 65,
    color: rgb(0.99, 0.94, 0.94),
    borderColor: accentRed,
    borderWidth: 1.5,
  });

  page1.drawText('BIOHAZARD & HIGH VOLTAGE MANDATORY WARNING', {
    x: 55,
    y: textY - 28,
    size: 10,
    font: fontHelveticaBold,
    color: accentRed,
  });

  page1.drawText(
    'All patient sera and fluidic waste lines must be treated as potentially infectious. Wear PPE (gloves, eye protection).',
    { x: 55, y: textY - 45, size: 8.5, font: fontHelvetica, color: textColor }
  );
  page1.drawText(
    'Mains AC line voltages (100-240V) exist within the rear power distribution bay. Adhere strictly to LOTO protocols.',
    { x: 55, y: textY - 60, size: 8.5, font: fontHelvetica, color: textColor }
  );

  page1.drawText('Page 1 of 4  —  BioMed Confidential Service Documentation', {
    x: 40,
    y: 40,
    size: 8,
    font: fontCourier,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ---------------- PAGE 2: HYDRAULIC & FLUIDICS ARCHITECTURE ----------------
  const page2 = pdfDoc.addPage([612, 792]);

  page2.drawText('2. Fluidics & Hydraulic Subsystem Specifications', {
    x: 40,
    y: height - 60,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  page2.drawText('2.1 Hydraulic Operating Parameter Limits', {
    x: 40,
    y: height - 90,
    size: 11,
    font: fontHelveticaBold,
    color: textColor,
  });

  // Table Header
  const tableTop = height - 120;
  page2.drawRectangle({
    x: 40,
    y: tableTop - 20,
    width: width - 80,
    height: 22,
    color: lightGray,
    borderColor: borderColor,
    borderWidth: 1,
  });

  page2.drawText('Operating Parameter', { x: 50, y: tableTop - 14, size: 9, font: fontHelveticaBold });
  page2.drawText('Nominal Target', { x: 220, y: tableTop - 14, size: 9, font: fontHelveticaBold });
  page2.drawText('Min Allowable', { x: 320, y: tableTop - 14, size: 9, font: fontHelveticaBold });
  page2.drawText('Max Allowable', { x: 420, y: tableTop - 14, size: 9, font: fontHelveticaBold });
  page2.drawText('Unit', { x: 520, y: tableTop - 14, size: 9, font: fontHelveticaBold });

  const tableRows = [
    ['Manifold Baseline Pressure', '120.0', '114.0', '126.0', 'kPa'],
    ['Degasser Vacuum Level', '-80.0', '-85.0', '-75.0', 'kPa'],
    ['Dispense Syringe Stroke', '250.0', '249.5', '250.5', 'uL'],
    ['De-bubble Purge Velocity', '50.0', '45.0', '55.0', 'uL/s'],
    ['Sensor Zero Offset Limit', '0.0', '-1.2', '+1.2', 'kPa'],
  ];

  let rowY = tableTop - 42;
  for (const row of tableRows) {
    page2.drawText(row[0], { x: 50, y: rowY, size: 8.5, font: fontHelvetica });
    page2.drawText(row[1], { x: 220, y: rowY, size: 8.5, font: fontCourier });
    page2.drawText(row[2], { x: 320, y: rowY, size: 8.5, font: fontCourier });
    page2.drawText(row[3], { x: 420, y: rowY, size: 8.5, font: fontCourier });
    page2.drawText(row[4], { x: 520, y: rowY, size: 8.5, font: fontHelvetica });
    page2.drawLine({
      start: { x: 40, y: rowY - 6 },
      end: { x: width - 40, y: rowY - 6 },
      color: borderColor,
      thickness: 0.5,
    });
    rowY -= 20;
  }

  // Section 2.2 Component Roles
  page2.drawText('2.2 Critical Fluidic Components & Part Numbers', {
    x: 40,
    y: rowY - 20,
    size: 11,
    font: fontHelveticaBold,
    color: textColor,
  });

  const compList = [
    '• Syringe Dispense Pump P-102 (P/N 948-230-01): 250 uL ceramic piston displacement mechanism.',
    '• Manifold Pressure Transducer PS-23 (P/N 948-510-23): Piezo-resistive stainless sensor on central block.',
    '• Solenoid Pinch Valve V-04 (P/N 948-310-04): 3-way high-velocity PTFE isolate valve.',
    '• Replacement Plunger Seal Upgrade Kit (P/N SP-948-230-01): Mandated by Service Bulletin SB-2026-014.',
  ];

  let compY = rowY - 40;
  for (const c of compList) {
    page2.drawText(c, { x: 45, y: compY, size: 8.5, font: fontHelvetica, color: textColor });
    compY -= 16;
  }

  page2.drawText('Page 2 of 4  —  BioMed Confidential Service Documentation', {
    x: 40,
    y: 40,
    size: 8,
    font: fontCourier,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ---------------- PAGE 3: ERROR CODE E1045 RESOLUTION ----------------
  const page3 = pdfDoc.addPage([612, 792]);

  page3.drawText('3. Diagnostic Tree: Alarm Code E1045', {
    x: 40,
    y: height - 60,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  page3.drawText('Alarm Description: Fluidics Pressure Instability (Threshold < 114.0 kPa)', {
    x: 40,
    y: height - 85,
    size: 10,
    font: fontHelveticaBold,
    color: accentAmber,
  });

  const e1045Steps = [
    'STEP 1: Line Depressurization & Safety Verification',
    'Open Service Utilities > Fluidics Diagnostics > Depressurize Manifold. Verify digital readout drops to 0.0 kPa.',
    '',
    'STEP 2: Physical Pressure Transducer Calibration Check',
    'Connect NIST-traceable Digital Manometer 948-CAL-01 to Quick-Disconnect test port TP-FL-01 on the central manifold.',
    'Execute 3-minute continuous DI water prime sequence at 50 uL/s.',
    '',
    'DECISION BRANCH A: Physical Manometer vs Telemetry Divergence',
    '• If physical manometer reads within 114.0 - 126.0 kPa, but software telemetry reports < 114.0 kPa:',
    '  Cause: Transducer drift or zero-offset error in Pressure Sensor PS-23 (P/N 948-510-23).',
    '  Corrective Action: Recalibrate zero offset via PROC-PUMP-CALIBRATION. If offset exceeds +/- 1.2 kPa,',
    '  replace sensor with assembly SP-948-510-23.',
    '',
    'DECISION BRANCH B: True Physical Pressure Decay',
    '• If physical manometer ALSO reads < 114.0 kPa or exhibits decay > 1.5 kPa over 60 seconds:',
    '  Cause: Mechanical seal bypass in Syringe Pump P-102 or internal micro-tearing in Solenoid Valve V-04.',
    '  Corrective Action: Replace P-102 ceramic plunger wash seals using Upgraded Kit SP-948-230-01.',
    '  Refer to Service Bulletin SB-2026-014 for proper torque specifications (1.2 Nm).',
  ];

  let stepY = height - 115;
  for (const step of e1045Steps) {
    const isHeader = step.startsWith('STEP') || step.startsWith('DECISION');
    page3.drawText(step, {
      x: 40,
      y: stepY,
      size: isHeader ? 9.5 : 8.5,
      font: isHeader ? fontHelveticaBold : fontHelvetica,
      color: isHeader ? primaryColor : textColor,
    });
    stepY -= 15;
  }

  page3.drawText('Page 3 of 4  —  BioMed Confidential Service Documentation', {
    x: 40,
    y: 40,
    size: 8,
    font: fontCourier,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ---------------- PAGE 4: SERVICE BULLETIN SB-2026-014 & FMEA ----------------
  const page4 = pdfDoc.addPage([612, 792]);

  page4.drawText('4. Service Bulletin SB-2026-014 Compliance & FMEA', {
    x: 40,
    y: height - 60,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  page4.drawText('Subject: Manifold Pressure Calibration Standards & Seal Replacement for FW 4.2+', {
    x: 40,
    y: height - 85,
    size: 9.5,
    font: fontHelveticaBold,
    color: textColor,
  });

  // FMEA Table
  const fmeaTop = height - 120;
  page4.drawRectangle({
    x: 40,
    y: fmeaTop - 20,
    width: width - 80,
    height: 22,
    color: lightGray,
    borderColor: borderColor,
    borderWidth: 1,
  });

  page4.drawText('Failure Mode Code', { x: 50, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });
  page4.drawText('Severity', { x: 190, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });
  page4.drawText('Occur', { x: 245, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });
  page4.drawText('Detect', { x: 290, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });
  page4.drawText('RPN', { x: 335, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });
  page4.drawText('Mandatory Action Protocol', { x: 375, y: fmeaTop - 14, size: 8.5, font: fontHelveticaBold });

  const fmeaRows = [
    ['FM-FLUIDICS-PRESSURE-DROP', '7', '4', '2', '56', 'Install Seal Kit SP-948-230-01'],
    ['FM-SENSOR-ZERO-DRIFT', '6', '3', '2', '36', 'Zero calibration via PROC-PUMP-CALIBRATION'],
    ['FM-VALVE-SEAT-LEAK', '6', '2', '3', '36', 'Flush lines with bleach; replace V-04'],
    ['FM-OPTICS-LAMP-DEGRADATION', '5', '3', '1', '15', 'Replace lamp L-01 every 2000 hours'],
  ];

  let fRowY = fmeaTop - 42;
  for (const r of fmeaRows) {
    page4.drawText(r[0], { x: 50, y: fRowY, size: 8, font: fontCourier });
    page4.drawText(r[1], { x: 200, y: fRowY, size: 8, font: fontHelvetica });
    page4.drawText(r[2], { x: 255, y: fRowY, size: 8, font: fontHelvetica });
    page4.drawText(r[3], { x: 300, y: fRowY, size: 8, font: fontHelvetica });
    page4.drawText(r[4], { x: 340, y: fRowY, size: 8, font: fontHelveticaBold });
    page4.drawText(r[5], { x: 375, y: fRowY, size: 8, font: fontHelvetica });
    page4.drawLine({
      start: { x: 40, y: fRowY - 6 },
      end: { x: width - 40, y: fRowY - 6 },
      color: borderColor,
      thickness: 0.5,
    });
    fRowY -= 22;
  }

  // Warranty & Signoff
  page4.drawText('Quality Assurance & Field Authorization Sign-Off', {
    x: 40,
    y: fRowY - 30,
    size: 11,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  page4.drawText(
    'All field interventions performed under Service Bulletin SB-2026-014 must be validated with digital NIST manometer',
    { x: 40, y: fRowY - 50, size: 8.5, font: fontHelvetica, color: textColor }
  );
  page4.drawText(
    'records logged directly into the Field Service Platform before clearing machine status to OPERATIONAL.',
    { x: 40, y: fRowY - 65, size: 8.5, font: fontHelvetica, color: textColor }
  );

  page4.drawText('Page 4 of 4  —  BioMed Confidential Service Documentation', {
    x: 40,
    y: 40,
    size: 8,
    font: fontCourier,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();

  const targetDir = path.resolve(__dirname, '../../../documents/instruments/Analyzer_X200');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, 'Analyzer_X200_Service_Manual.pdf');
  fs.writeFileSync(targetFile, pdfBytes);
  console.log(`Successfully generated synthetic manual: ${targetFile} (${pdfBytes.length} bytes)`);
}

generateManual().catch(console.error);
