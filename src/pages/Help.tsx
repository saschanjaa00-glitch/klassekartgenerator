import { Link } from 'react-router-dom';
import type { Language } from '../i18n';
import '../App.css';

type HelpProps = {
  language: Language;
};

export function Help({ language }: HelpProps) {

  const sections = language === 'no' ? {
    title: 'Hjelp & Veiledning',
    gettingStarted: {
      title: 'Kom i gang',
      content: 'For å starte, lag et nytt klassekart ved å skrive inn et navn og velge antall rader og kolonner.',
      steps: [
        'Skriv inn et navn for klassekartet i tekstfeltet',
        'Angi antall rader og kolonner',
        'Velg om du vil bruke makkerpar (doble seter) eller enkelseter, alternativt velg <strong>Tilpasset oppsett</strong>',
        'Trykk <strong>Nytt klassekart</strong> for å opprette'
      ]
    },
    customLayoutSetup: {
      title: 'Tilpasset oppsett',
      content: 'Opprett klassekart med egendefinert seteoppsett',
      steps: [
        'Velg <strong>Tilpasset oppsett</strong> når du oppretter et nytt klassekart',
        'Skriv inn antall seter per gruppe på hver rad (for eksempel "2 3 2" for ett par, en tre-seter og ett til par)',
        'Hver rad må være på sin egen linje',
        'Trykk <strong>Nytt klassekart</strong> for å opprette klassekartet med ditt egendefinerte oppsett'
      ]
    },
    addingStudents: {
      title: 'Legge til elever',
      content: 'Du kan legge til elever ved å skrive inn navn i tekstfeltet.',
      steps: [
        'Skriv inn elevens navn i tekstfeltet',
        'Skriv in ett navn per linje, trykk <strong>Enter</strong> for ny linje',
        'Trykk <strong>Legg til # elever</strong>, disse vil nå legges til i listen over uplasserte elever'
      ]
    },
    autoPlacement: {
      title: 'Automatisk plassering',
      content: 'Programmet kan plassere elevers automatisk for deg.',
      steps: [
        'Trykk <strong>Automatisk plassering</strong> knappen',
        'Systemet vil plassere uplasserte elever tilfeldig',
        'Hvis du har satt begrensninger under <strong>Alternativer</strong>, vil disse forsøkes respektert',
        'Du kan trykke <strong>Bland plasserte</strong> for å få en ny tilfeldlig plassering'
      ]
    },
    manualPlacement: {
      title: 'Manuell plassering',
      content: 'Du kan dra og slippe elever direkte på klassekartet eller klikke på et tomt sete.',
      steps: [
        'Klikk på en elev i <strong>Uplasserte elever</strong> listen',
        'Klikk på et tomt sete eller drag eleven direkte til ønsket sete',
        'Klikk på låse-ikonet for å låse en elevs posisjon'
      ]
    },
    constraints: {
      title: 'Alternativer',
      content: 'Du kan definere at visse elever skal sitte sammen eller fra hverandre.',
      sections: [
        {
          name: 'Plasser sammen',
          description: 'Velg to eller flere elever som må sitte ved siden av hverandre',
          steps: ['Åpne <strong>Alternativer</strong>', 'Velg elever du vil gruppere', 'Klikk <strong>Legg til gruppe</strong>']
        },
        {
          name: 'Hold fra hverandre',
          description: 'Velg to elever som ikke skal sitte ved siden av hverandre',
          steps: ['Åpne <strong>Alternativer</strong>', 'Velg to elever', 'Klikk <strong>Legg til gruppe</strong>']
        },
        {
          name: 'Fargekoding',
          description: 'Aktivér fargekoding for å visuelt skille mellom gutter og jenter.',
          steps: ['Åpne <strong>Alternativer</strong>', 'Skru på <strong>Vis farge for gutt/jente</strong>', 'Gutter vises i blå, jenter i rosa', 'Disse fargene er kun for visuell hjelp i arbeidet, kommer ikke med på lagret pdf, png eller utskrift.']
        },
        {
          name: 'Blande kjønn',
          description: 'Tillat automatisk plassering å blande gutter og jenter sammen.',
          steps: ['Åpne <strong>Alternativer</strong>', 'Skru på <strong>Blande kjønn</strong>', 'Dette aktiveres når du bruker automatisk plassering']
        }
      ]
    },
    exportImport: {
      title: 'Eksporter/importer arbeidsfil',
      content: 'Du kan lagre dine klassekart til fil og laste dem inn igjen senere.',
      steps: [
        'Klikk <strong>Eksporter til fil</strong> for å laste ned en JSON-fil',
        'Klikk <strong>Importer fra fil</strong> for å laste inn tidligere eksporterte klassekart'
      ]
    },
    exportFormats: {
      title: 'Eksporter klassekart',
      content: 'Du kan eksportere klassekartet i flere formater.',
      formats: [
        { name: 'Kopier til utklippstavle', description: 'Kopier som bilde som du kan lime inn hvor som helst' },
        { name: 'Lagre som PNG', description: 'Lagre som PNG-bildefil' },
        { name: 'Lagre som PDF', description: 'Lagre som PDF-rapport (A4 landskap)' },
        { name: 'Skriv ut', description: 'Åpne utskriftsdialog for direkteutskrift' }
      ]
    }
  } : {
    title: 'Help & Guide',
    gettingStarted: {
      title: 'Getting Started',
      content: 'To start, create a new seating chart by entering a name and choosing the number of rows and columns.',
      steps: [
        'Enter a name for the seating chart in the text field',
        'Specify the number of rows and columns',
        'Choose whether to use pairs (double seats) or individual seats, or alternatively select <strong>Custom Layout</strong>',
        'Click <strong>New seating chart</strong> to create it'
      ]
    },
    customLayoutSetup: {
      title: 'Custom Layout',
      content: 'Create a seating chart with a custom layout.',
      steps: [
        'Select <strong>Custom Layout</strong> when creating a new seating chart',
        'Enter the number of seats per group on each row (for example "2 3 2" for two pairs and three seats)',
        'Each row must be on its own line',
        'Click <strong>New seating chart</strong> to create the chart with your custom layout'
      ]
    },
    addingStudents: {
      title: 'Adding Students',
      content: 'You can add students by entering their names in the text field.',
      steps: [
        'Enter the student\'s name in the text field',
        'Enter one name per line, press <strong>Enter</strong> for a new line',
        'Click <strong>Add # students</strong>, these will now be added to the list of unplaced students'
      ]
    },
    autoPlacement: {
      title: 'Auto-place',
      content: 'The program can place students automatically for you.',
      steps: [
        'Press the <strong>Auto-place</strong> button',
        'The system will randomly place unplaced students',
        'If you have set constraints under <strong>Options</strong>, these will be attempted to be respected',
        'You can press <strong>Shuffle seated</strong> to get a new random placement'
      ]
    },
    manualPlacement: {
      title: 'Manual Placement',
      content: 'You can drag and drop students directly onto the seating chart or click on an empty seat.',
      steps: [
        'Click on a student in the <strong>Unplaced Students</strong> list',
        'Click on an empty seat or drag the student directly to the desired seat',
        'Click the lock icon to lock a student\'s position'
      ]
    },
    constraints: {
      title: 'Options',
      content: 'You can define that certain students must sit together or apart from each other.',
      sections: [
        {
          name: 'Place Together',
          description: 'Select two or more students who must sit next to each other',
          steps: ['Open <strong>Options</strong>', 'Select students you want to group', 'Click <strong>Add Group</strong>']
        },
        {
          name: 'Keep Apart',
          description: 'Select two students who should not sit next to each other',
          steps: ['Open <strong>Options</strong>', 'Select two students', 'Click <strong>Add Group</strong>']
        },
        {
          name: 'Gender Color Coding',
          description: 'Enable color coding to visually distinguish between boys and girls.',
          steps: ['Open <strong>Options</strong>', 'Turn on <strong>Show boy/girl colors</strong>', 'Boys are displayed in blue, girls in pink']
        },
        {
          name: 'Mix Genders',
          description: 'Allow the automatic placement to mix boys and girls together.',
          steps: ['Open <strong>Options</strong>', 'Turn on <strong>Mix Genders</strong>', 'This becomes active when you use automatic placement']
        }
      ]
    },
    exportImport: {
      title: 'Export/Import Working File',
      content: 'You can save your seating charts to a file and load them again later.',
      steps: [
        'Click <strong>Export to File</strong> to download a JSON file',
        'Click <strong>Import from File</strong> to load previously exported seating charts'
      ]
    },
    exportFormats: {
      title: 'Export Formats',
      content: 'You can export the seating chart in several formats.',
      formats: [
        { name: 'Copy to Clipboard', description: 'Copy as an image that you can paste anywhere' },
        { name: 'Save as PNG', description: 'Save as a PNG image file' },
        { name: 'Save as PDF', description: 'Save as a PDF report (A4 landscape)' },
        { name: 'Print', description: 'Open print dialog for direct printing' }
      ]
    }
  };

  const tocItems = [
    { id: 'getting-started', title: sections.gettingStarted.title },
    { id: 'custom-layout', title: sections.customLayoutSetup.title },
    { id: 'adding-students', title: sections.addingStudents.title },
    { id: 'auto-placement', title: sections.autoPlacement.title },
    { id: 'manual-placement', title: sections.manualPlacement.title },
    { id: 'options', title: sections.constraints.title },
    { id: 'export-formats', title: sections.exportFormats.title },
    { id: 'export-import', title: sections.exportImport.title }
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
      </aside>

      <main className="main-content help-content">
        <Link to="/" className="back-link">← {language === 'no' ? 'Tilbake' : 'Back'}</Link>
        <div className="help-section">
          <h1>{sections.title}</h1>

          <nav className="help-toc" aria-label={language === 'no' ? 'Innholdsfortegnelse' : 'Table of Contents'}>
            <h2>{language === 'no' ? 'Innholdsfortegnelse' : 'Table of Contents'}</h2>
            <ul>
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Getting Started */}
          <section id="getting-started">
            <h2>{sections.gettingStarted.title}</h2>
            <p>{sections.gettingStarted.content}</p>
            <ol>
              {sections.gettingStarted.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
            {language === 'no' && (
              <div className="screenshot-placeholder">
                <img src="/screenshots/getting-started.png.png" alt={language === 'no' ? 'Opprett ny klassekart' : 'Create New Chart'} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
          </section>

          {/* Custom Layout Setup */}
          <section id="custom-layout">
            <h2>{sections.customLayoutSetup.title}</h2>
            <p>{sections.customLayoutSetup.content}</p>
            <ol>
              {sections.customLayoutSetup.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
            {language === 'no' && (
              <div className="screenshot-placeholder">
                <img src="/screenshots/tilpasset.png" alt={language === 'no' ? 'Tilpasset oppsett' : 'Custom Layout'} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
          </section>

          {/* Adding Students */}
          <section id="adding-students">
            <h2>{sections.addingStudents.title}</h2>
            <p>{sections.addingStudents.content}</p>
            <ol>
              {sections.addingStudents.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
            {language === 'no' && (
              <div className="screenshot-placeholder">
                <img src="/screenshots/leggtilelever.png" alt={language === 'no' ? 'Legg til elever' : 'Add Students'} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
          </section>

          {/* Auto Placement */}
          <section id="auto-placement">
            <h2>{sections.autoPlacement.title}</h2>
            <p>{sections.autoPlacement.content}</p>
            <ol>
              {sections.autoPlacement.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
          </section>

          {/* Manual Placement */}
          <section id="manual-placement">
            <h2>{sections.manualPlacement.title}</h2>
            <p>{sections.manualPlacement.content}</p>
            <ol>
              {sections.manualPlacement.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
          </section>

          {/* Constraints */}
          <section id="options">
            <h2>{sections.constraints.title}</h2>
            <p>{sections.constraints.content}</p>
            {language === 'no' && (
              <div className="screenshot-placeholder">
                <img src="/screenshots/alternativer.png" alt={language === 'no' ? 'Alternativer' : 'Options'} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
            {sections.constraints.sections.map((constraint, idx) => (
              <div key={idx} style={{ marginLeft: '20px', marginBottom: '20px' }}>
                <h4>{constraint.name}</h4>
                <p>{constraint.description}</p>
                <ol>
                  {constraint.steps.map((step, stepIdx) => (
                    <li key={stepIdx} dangerouslySetInnerHTML={{__html: step}} />
                  ))}
                </ol>
              </div>
            ))}
          </section>

          {/* Export Formats */}
          <section id="export-formats">
            <h2>{sections.exportFormats.title}</h2>
            <p>{sections.exportFormats.content}</p>
            <ul>
              {sections.exportFormats.formats.map((format, idx) => (
                <li key={idx}>
                  <strong>{format.name}:</strong> {format.description}
                </li>
              ))}
            </ul>
          </section>

          {/* Export/Import */}
          <section id="export-import">
            <h2>{sections.exportImport.title}</h2>
            <p>{sections.exportImport.content}</p>
            <ol>
              {sections.exportImport.steps.map((step, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{__html: step}} />
              ))}
            </ol>
          </section>


        </div>
      </main>
    </div>
  );
}
