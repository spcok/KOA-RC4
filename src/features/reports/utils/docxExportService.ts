import { db } from '../../../lib/db';
import { saveAs } from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  HeadingLevel, 
  AlignmentType 
} from 'docx';

/**
 * Helper to create a professional report header
 */
const createReportHeader = (title: string, subtitle: string): Paragraph[] => {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subtitle,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated on: ${new Date().toLocaleString()}`,
          italics: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: "" }), // Spacer
  ];
};

/**
 * Helper to create a data table
 */
const createDataTable = (headers: string[], rows: string[][]): Table => {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(header => new TableCell({
          shading: { fill: "F3F4F6" },
          children: [new Paragraph({
            children: [new TextRun({ text: header, bold: true })],
            alignment: AlignmentType.CENTER,
          })],
        })),
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ text: cell || "" })],
        })),
      })),
    ],
  });
};

/**
 * Generic function to compile and save the docx
 */
const saveReportDocx = async (title: string, subtitle: string, headers: string[], rows: string[][], filename: string) => {
  const table = createDataTable(headers, rows);
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...createReportHeader(title, subtitle),
        table
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.docx`);
  return true;
};

export const exportHusbandryDocx = async () => {
  const logs = await db.daily_logs.toArray();
  const headers = ['Date', 'Animal ID', 'Log Type', 'Notes', 'Recorded By'];
  const rows = logs.map(log => [
    log.log_date,
    log.animal_id,
    log.log_type,
    log.notes || '',
    log.user_initials || log.created_by || ''
  ]);
  
  return saveReportDocx("Daily Husbandry Log", "Kent Owl Academy Compliance Report", headers, rows, "Husbandry_Report");
};

export const exportCensusDocx = async () => {
  const animals = await db.animals.filter(a => !a.archived).toArray();
  const headers = ['Name', 'Species', 'Category', 'Sex', 'Location'];
  const rows = animals.map(a => [
    a.name,
    a.species,
    a.category,
    a.sex || 'Unknown',
    a.location
  ]);

  return saveReportDocx("Annual Census", "Kent Owl Academy Compliance Report", headers, rows, "Census_Report");
};

export const exportRoundsDocx = async () => {
  const rounds = await db.daily_rounds.toArray();
  const headers = ['Date', 'Shift', 'Status', 'Completed By', 'Notes'];
  const rows = rounds.map(r => [
    r.date,
    r.shift,
    r.status,
    r.completedBy,
    r.notes || ''
  ]);

  return saveReportDocx("Rounds Checklist", "Kent Owl Academy Compliance Report", headers, rows, "Rounds_Report");
};

export const exportIncidentsDocx = async () => {
  const incidents = await db.incidents.toArray();
  const headers = ['Date', 'Type', 'Severity', 'Description', 'Reported By'];
  const rows = incidents.map(inc => [
    new Date(inc.date).toLocaleDateString(),
    inc.type,
    inc.severity,
    inc.description,
    inc.reported_by
  ]);

  return saveReportDocx("Incident Log", "Kent Owl Academy Compliance Report", headers, rows, "Incident_Log");
};

export const exportSafetyDrillsDocx = async () => {
  const drills = await db.safety_drills.toArray();
  const headers = ['Date', 'Drill Type', 'Conductor', 'Participants', 'Notes'];
  const rows = drills.map(drill => [
    drill.date,
    drill.title,
    drill.status,
    drill.location,
    drill.description
  ]);

  return saveReportDocx("Safety Drills Report", "Kent Owl Academy Compliance Report", headers, rows, "Safety_Drills");
};

export const exportMovementsDocx = async () => {
  const movements = await db.internal_movements.toArray();
  const headers = ['Date', 'Animal', 'Type', 'Source', 'Destination', 'Notes'];
  const rows = movements.map(mov => [
    mov.log_date,
    mov.animal_name,
    mov.movement_type,
    mov.source_location,
    mov.destination_location,
    mov.notes || ''
  ]);

  return saveReportDocx("Stock Movement Report", "Kent Owl Academy Compliance Report", headers, rows, "Stock_Movements");
};

export const exportMaintenanceDocx = async () => {
  const logs = await db.maintenance_logs.toArray();
  const headers = ['Date', 'Item', 'Priority', 'Status', 'Assigned To'];
  const rows = logs.map(m => [
    new Date(m.log_date).toLocaleDateString(),
    m.title,
    m.priority,
    m.status,
    m.user_initials
  ]);

  return saveReportDocx("Site Maintenance Report", "Kent Owl Academy Compliance Report", headers, rows, "Maintenance_Report");
};

export const exportFirstAidDocx = async () => {
  const logs = await db.first_aid_logs.toArray();
  const headers = ['Date', 'Patient', 'Injury', 'Treatment', 'Administered By'];
  const rows = logs.map(log => [
    log.date,
    log.personName,
    log.type,
    log.treatment,
    log.outcome
  ]);

  return saveReportDocx("First Aid Report", "Kent Owl Academy Compliance Report", headers, rows, "First_Aid_Report");
};
