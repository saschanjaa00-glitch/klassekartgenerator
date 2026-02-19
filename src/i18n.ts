export type Language = 'no' | 'en';

type HelpItem = {
  title: string;
  body: string;
};

export const translations = {
  no: {
    brandSubtitle: 'Helt gratis, uten innlogging',
    languageLabel: 'Språk',
    languageNo: 'NO',
    languageEn: 'EN',
    donateLabel: 'Doner',
    createChartTitle: 'Opprett nytt klassekart',
    chartNamePlaceholder: 'Kartnavn (f.eks. Time 1)',
    rowsLabel: 'Rader:',
    colsLabel: 'Kolonner:',
    usePairsLabel: 'Bruk Makkerpar',
    customLayoutLabel: 'Tilpasset oppsett',
    customLayoutPlaceholder: 'eks.\n2 3 3 2\n2 3 3 2\n2 3 3 2',
    customLayoutHintLine1: 'En linje per rad.',
    customLayoutHintLine2: 'Bruk mellomrom eller bindestrek mellom gruppene.',
    newChartButton: 'Nytt klassekart',
    updateChartButton: 'Oppdater klassekart',
    updateChartTitle: (name: string) => `Oppdater ${name}`,
    selectChartFirstTitle: 'Velg et kart først',
    chartsOverviewTitle: 'Klassekartoversikt',
    noChartsYet: 'Ingen kart ennå',
    renameTitle: 'Endre navn',
    duplicateTitle: 'Dupliser',
    deleteTitle: 'Slett',
    copySuffix: 'kopi',
    exportToFile: 'Eksporter til fil',
    importFromFile: 'Importer fra fil',
    exportHintTitle: 'Eksporter til fil:',
    exportHintBody: 'Lagre dataene dine til en fil på datamaskinen.',
    importHintTitle: 'Importer fra fil:',
    importHintBody: 'Hent tilbake lagrede data eller overfør fra en annen nettleser.',
    showHelp: 'Vis hjelp',
    hideHelp: 'Skjul hjelp',
    helpTitle: 'Hvordan bruke appen',
    helpSteps: [
      {
        title: 'Opprett klassekart:',
        body: 'Skriv inn navn og velg antall rader og kolonner, trykk "Nytt klassekart".'
      },
      {
        title: 'Bruk makkerpar:',
        body: 'Aktiver for å sette pulter i par.'
      },
      {
        title: 'Tilpasset oppsett:',
        body: 'Skriv en linje per rad. Tallene angir antall plasser per gruppe i rekkefølge fra venstre til høyre (f.eks. "2 3 3 2" gir fire grupper med totalt 10 seter). Bruk mellomrom eller bindestrek mellom grupper. Like store grupper kan byttes ved å dra i håndtaket over gruppen.'
      },
      {
        title: 'Oppdater klassekart:',
        body: 'Oppdater antall rader osv. uten å fjerne alle navn fra listen.'
      },
      {
        title: 'Legg til elever:',
        body: 'Skriv inn navn og trykk Enter for å lage ny linje. Skriv inn ett navn per linje. Trykk "Legg til # elever".'
      },
      {
        title: 'Velg kjønn:',
        body: 'Trykk på symbol for mann / dame. Kan brukes for å blande kjønn (se "Alternativer").'
      },
      {
        title: 'Plasser elever:',
        body: 'Bruk "Automatisk plassering" eller gjør det manuelt med å dra de ned på plass.'
      },
      {
        title: 'Bytt plasser:',
        body: 'Dra en elev over en annen for å bytte plass, makkerpar kan også flyttes ved å dra i symbolet med de 6 prikkene.'
      },
      {
        title: 'Bland plasserte:',
        body: 'Blander alle ulåste elever - prøver å unngå å plassere dem ved siden av samme personer som før.'
      },
      {
        title: 'Lås plassering:',
        body: 'Klikk på hengelåsen for å låse en elev på plass.'
      },
      {
        title: 'Fjern fra plass:',
        body: 'I klassekartet, trykk på X-knappen for å flytte eleven tilbake til "Uplasserte elever"-listen.'
      },
      {
        title: 'Fjern elev:',
        body: 'I "Uplasserte elever"-listen, trykk på X-knappen for å slette eleven.'
      },
      {
        title: 'Kopier til utklippstavle:',
        body: 'Tar et skjermbilde av klassekartet og kopierer det, slik at du kan lime det inn i andre programmer.'
      },
      {
        title: 'Lagre PDF/PNG:',
        body: 'Eksporter klassekartet som PDF eller bilde.'
      },
      {
        title: 'Print klassekart:',
        body: 'Lag en utskrift.'
      }
    ] as HelpItem[],
    helpAlternativesTitle: 'Alternativer',
    helpAlternatives: [
      {
        title: 'Bland kjønn:',
        body: 'Huk av for å blande kjønn i klassekartet.'
      },
      {
        title: 'Plasser sammen:',
        body: 'Velg to elever som alltid skal sitte ved siden av hverandre.'
      },
      {
        title: 'Hold fra hverandre:',
        body: 'Velg to elever som IKKE skal sitte ved siden av hverandre.'
      }
    ] as HelpItem[],
    privacyTitle: 'Personvern (GDPR)',
    privacyItems: [
      'Alle data lagres lokalt i nettleseren din (localStorage).',
      'Ingen data sendes til noen server eller tredjepart.',
      'Du kan når som helst slette alle data ved å tømme nettleserdata eller bruke "Fjern alle elever".',
      'Bruk "Eksporter til fil" for å ta sikkerhetskopi av dataene dine.'
    ],
    credits: 'Laget av Sascha Njaa Tjelta',
    controlsAutoPlace: 'Automatisk plassering',
    controlsShuffleSeated: 'Bland plasserte',
    controlsClearPlacements: 'Fjern plasseringer',
    controlsClearAllStudents: 'Fjern alle elever',
    controlsOptions: 'Alternativer',
    controlsCopy: 'Kopier til utklippstavle',
    controlsSavePng: 'Lagre bilde (PNG)',
    controlsSavePdf: 'Lagre PDF',
    controlsPrint: 'Print klassekart',
    optionsTitle: 'Alternativer',
    showGenderColors: 'Vis farge for gutt/jente (kun i forhåndsvisning)',
    mixGenders: 'Bland gutter og jenter',
    placeTogetherTitle: 'Plasser sammen',
    placeTogetherHint: 'Velg 2 elever som skal sitte sammen',
    keepApartTitle: 'Hold fra hverandre',
    keepApartHint: 'Velg 2 elever som IKKE skal sitte sammen',
    addGroup: 'Legg til gruppe',
    reset: 'Nullstill',
    generateRandomNames: 'Generer 30 tilfeldige navn',
    emptyStateTitle: 'Ingen plasseringskart valgt',
    emptyStateBody: 'Opprett et nytt kart for å komme i gang',
    studentFormTitle: 'Legg til elever',
    studentFormErrorEmpty: 'Vennligst skriv inn minst ett elevnavn',
    studentFormLabel: 'Elevnavn',
    studentFormHint: '(én per linje)',
    studentFormPlaceholder: 'Skriv inn elevnavn, én per linje:\nOla Nordmann\nKari Hansen\nPer Olsen',
    studentFormLineCount: (count: number) => `${count} elev${count !== 1 ? 'er' : ''}`,
    studentFormAddButton: (count: number) => `Legg til ${count} elev${count !== 1 ? 'er' : ''}`,
    studentListTitle: (count: number) => `Uplasserte elever (${count})`,
    studentListEmptyMessage: 'Alle elever er plassert! ✓',
    studentListShow: 'Vis elever',
    studentListHide: 'Skjul elever',
    genderMaleTitle: 'Gutt',
    genderFemaleTitle: 'Jente',
    removeStudentTitle: 'Fjern elev',
    studentCardEmpty: 'Tom',
    removeFromSeatTitle: 'Fjern fra plass',
    lockStudentTitle: 'Lås elev på plass',
    unlockStudentTitle: 'Lås opp elev',
    seatingGridBoard: 'TAVLE',
    dragPairTitle: 'Dra for å bytte dette paret',
    dragGroupTitle: 'Dra for å bytte denne gruppen',
    missingChartName: 'Vennligst skriv inn et kartnavn',
    missingCustomLayoutCreate: 'Skriv inn et tilpasset oppsett før du lager et kart',
    invalidCustomLayout: 'Ugyldig oppsett. Bruk tall separert med mellomrom eller bindestrek.',
    deleteChartConfirm: 'Er du sikker på at du vil slette dette kartet?',
    renameChartPrompt: 'Nytt navn for kartet:',
    noChartsToExport: 'Ingen kart å eksportere',
    invalidFileFormat: 'Ugyldig filformat',
    importReplaceConfirm: 'Vil du erstatte alle eksisterende kart? Klikk OK for å erstatte, eller Avbryt for å legge til.',
    importedCharts: (count: number) => `Importerte ${count} kart`,
    importReadError: 'Kunne ikke lese filen. Sørg for at det er en gyldig JSON-fil.',
    selectChartToUpdate: 'Velg et kart å oppdatere',
    missingCustomLayoutUpdate: 'Skriv inn et tilpasset oppsett før du oppdaterer kartet',
    clearPlacementsConfirm: 'Fjerne alle elevplasseringer?',
    noUnlockedToPlace: 'Ingen ulåste elever å plassere',
    randomizeConfirm: (count: number) => `Plassere ${count} ulåste elev${count !== 1 ? 'er' : ''} tilfeldig?`,
    clearAllStudentsConfirm: 'Fjerne alle elever fra dette kartet?',
    needAtLeastTwoToShuffle: 'Trenger minst 2 ulåste plasserte elever for å blande',
    selectAtLeastTwoStudents: 'Velg minst 2 elever',
    copyClipboardError: 'Feil: Kunne ikke kopiere bilde til utklippstavlen',
    copyClipboardSuccess: 'Klassekart kopiert til utklippstavlen!',
    exportFileName: 'klasseromskart.json',
    pdfFileSuffix: 'klassekart',
    pngFileSuffix: 'klassekart'
  },
  en: {
    brandSubtitle: 'Completely free, no login',
    languageLabel: 'Language',
    languageNo: 'NO',
    languageEn: 'EN',
    donateLabel: 'Donate',
    createChartTitle: 'Create new seating chart',
    chartNamePlaceholder: 'Chart name (e.g., Period 1)',
    rowsLabel: 'Rows:',
    colsLabel: 'Columns:',
    usePairsLabel: 'Use desk pairs',
    customLayoutLabel: 'Custom layout',
    customLayoutPlaceholder: 'e.g.\n2 3 3 2\n2 3 3 2\n2 3 3 2',
    customLayoutHintLine1: 'One line per row.',
    customLayoutHintLine2: 'Use spaces or hyphens between groups.',
    newChartButton: 'New seating chart',
    updateChartButton: 'Update seating chart',
    updateChartTitle: (name: string) => `Update ${name}`,
    selectChartFirstTitle: 'Select a chart first',
    chartsOverviewTitle: 'Chart overview',
    noChartsYet: 'No charts yet',
    renameTitle: 'Rename',
    duplicateTitle: 'Duplicate',
    deleteTitle: 'Delete',
    copySuffix: 'copy',
    exportToFile: 'Export to file',
    importFromFile: 'Import from file',
    exportHintTitle: 'Export to file:',
    exportHintBody: 'Save your data to a file on your computer.',
    importHintTitle: 'Import from file:',
    importHintBody: 'Restore saved data or transfer from another browser.',
    showHelp: 'Show help',
    hideHelp: 'Hide help',
    helpTitle: 'How to use the app',
    helpSteps: [
      {
        title: 'Create seating chart:',
        body: 'Enter a name and choose the number of rows and columns, then click "New seating chart".'
      },
      {
        title: 'Use desk pairs:',
        body: 'Enable to pair up desks.'
      },
      {
        title: 'Custom layout:',
        body: 'Write one line per row. Numbers represent seats per group from left to right (e.g., "2 3 3 2" creates four groups with 10 seats). Use spaces or hyphens between groups. Equal-size groups can be swapped by dragging the handle above the group.'
      },
      {
        title: 'Update seating chart:',
        body: 'Update rows and columns without removing all names from the list.'
      },
      {
        title: 'Add students:',
        body: 'Enter names and press Enter for a new line. Use one name per line. Click "Add # students".'
      },
      {
        title: 'Select gender:',
        body: 'Click the male/female symbol. This can be used to mix genders (see "Options").'
      },
      {
        title: 'Place students:',
        body: 'Use "Auto-place" or drag students manually into seats.'
      },
      {
        title: 'Swap seats:',
        body: 'Drag a student onto another to swap. Desk pairs can also be moved by dragging the handle with 6 dots.'
      },
      {
        title: 'Shuffle seated:',
        body: 'Shuffles all unlocked students and tries to avoid repeating neighbor pairs.'
      },
      {
        title: 'Lock seat:',
        body: 'Click the lock icon to lock a student in place.'
      },
      {
        title: 'Remove from seat:',
        body: 'In the chart, click the X button to move a student back to the unplaced list.'
      },
      {
        title: 'Remove student:',
        body: 'In the unplaced list, click the X button to delete a student.'
      },
      {
        title: 'Copy to clipboard:',
        body: 'Takes a screenshot of the chart and copies it so you can paste it into other programs.'
      },
      {
        title: 'Save PDF/PNG:',
        body: 'Export the seating chart as a PDF or image.'
      },
      {
        title: 'Print seating chart:',
        body: 'Create a printout.'
      }
    ] as HelpItem[],
    helpAlternativesTitle: 'Options',
    helpAlternatives: [
      {
        title: 'Mix genders:',
        body: 'Enable to mix genders in the seating chart.'
      },
      {
        title: 'Seat together:',
        body: 'Choose two students who should always sit next to each other.'
      },
      {
        title: 'Keep apart:',
        body: 'Choose two students who should NOT sit next to each other.'
      }
    ] as HelpItem[],
    privacyTitle: 'Privacy (GDPR)',
    privacyItems: [
      'All data is stored locally in your browser (localStorage).',
      'No data is sent to any server or third party.',
      'You can delete all data at any time by clearing browser data or using "Remove all students".',
      'Use "Export to file" to back up your data.'
    ],
    credits: 'Made by Sascha Njaa Tjelta',
    controlsAutoPlace: 'Auto-place',
    controlsShuffleSeated: 'Shuffle seated',
    controlsClearPlacements: 'Clear placements',
    controlsClearAllStudents: 'Remove all students',
    controlsOptions: 'Options',
    controlsCopy: 'Copy to clipboard',
    controlsSavePng: 'Save image (PNG)',
    controlsSavePdf: 'Save PDF',
    controlsPrint: 'Print seating chart',
    optionsTitle: 'Options',
    showGenderColors: 'Show boy/girl colors (preview only)',
    mixGenders: 'Mix genders',
    placeTogetherTitle: 'Seat together',
    placeTogetherHint: 'Choose two students who should sit together',
    keepApartTitle: 'Keep apart',
    keepApartHint: 'Choose two students who should NOT sit together',
    addGroup: 'Add group',
    reset: 'Reset',
    generateRandomNames: 'Generate 30 random names',
    emptyStateTitle: 'No seating chart selected',
    emptyStateBody: 'Create a new chart to get started',
    studentFormTitle: 'Add students',
    studentFormErrorEmpty: 'Please enter at least one student name',
    studentFormLabel: 'Student names',
    studentFormHint: '(one per line)',
    studentFormPlaceholder: 'Enter student names, one per line:\nAlex Johnson\nTaylor Smith\nJordan Lee',
    studentFormLineCount: (count: number) => `${count} student${count !== 1 ? 's' : ''}`,
    studentFormAddButton: (count: number) => `Add ${count} student${count !== 1 ? 's' : ''}`,
    studentListTitle: (count: number) => `Unplaced students (${count})`,
    studentListEmptyMessage: 'All students are placed! ✓',
    studentListShow: 'Show students',
    studentListHide: 'Hide students',
    genderMaleTitle: 'Boy',
    genderFemaleTitle: 'Girl',
    removeStudentTitle: 'Remove student',
    studentCardEmpty: 'Empty',
    removeFromSeatTitle: 'Remove from seat',
    lockStudentTitle: 'Lock student',
    unlockStudentTitle: 'Unlock student',
    seatingGridBoard: 'BOARD',
    dragPairTitle: 'Drag to swap this pair',
    dragGroupTitle: 'Drag to swap this group',
    missingChartName: 'Please enter a chart name',
    missingCustomLayoutCreate: 'Enter a custom layout before creating a chart',
    invalidCustomLayout: 'Invalid layout. Use numbers separated by spaces or hyphens.',
    deleteChartConfirm: 'Are you sure you want to delete this chart?',
    renameChartPrompt: 'New name for the chart:',
    noChartsToExport: 'No charts to export',
    invalidFileFormat: 'Invalid file format',
    importReplaceConfirm: 'Replace all existing charts? Click OK to replace, or Cancel to add.',
    importedCharts: (count: number) => `Imported ${count} chart${count !== 1 ? 's' : ''}`,
    importReadError: 'Could not read the file. Make sure it is a valid JSON file.',
    selectChartToUpdate: 'Select a chart to update',
    missingCustomLayoutUpdate: 'Enter a custom layout before updating the chart',
    clearPlacementsConfirm: 'Remove all student placements?',
    noUnlockedToPlace: 'No unlocked students to place',
    randomizeConfirm: (count: number) => `Place ${count} unlocked student${count !== 1 ? 's' : ''} randomly?`,
    clearAllStudentsConfirm: 'Remove all students from this chart?',
    needAtLeastTwoToShuffle: 'Need at least 2 unlocked seated students to shuffle',
    selectAtLeastTwoStudents: 'Select at least 2 students',
    copyClipboardError: 'Error: Could not copy image to clipboard',
    copyClipboardSuccess: 'Seating chart copied to clipboard!',
    exportFileName: 'classroom-charts.json',
    pdfFileSuffix: 'seating_chart',
    pngFileSuffix: 'seating_chart'
  }
} as const;

export type TranslationKey = keyof typeof translations.no;
export type TFunction = <K extends TranslationKey>(key: K) => (typeof translations.no)[K];

export const createTranslator = (language: Language): TFunction => {
  return ((key) => translations[language][key]) as TFunction;
};

export const isLanguage = (value: string | null): value is Language => {
  return value === 'no' || value === 'en';
};
