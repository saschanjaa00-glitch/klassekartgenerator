const maleFirstNames = [
  'Ole', 'Lars', 'Per', 'Erik', 'Anders', 'Magnus', 'Kristian', 'Jonas',
  'Martin', 'Thomas', 'Daniel', 'Andreas', 'Fredrik', 'Marius', 'Stian', 'Henrik',
  'Sander', 'Mathias', 'Tobias', 'Sebastian', 'Alexander', 'Markus', 'Emil', 'Adrian',
  'Håkon', 'Espen', 'Geir', 'Terje', 'Svein', 'Knut', 'Arne', 'Trond',
  'Jan', 'Bjørn', 'Rune', 'Øyvind', 'Tor', 'Stein', 'Ivar', 'Leif',
  'Olav', 'Gunnar', 'Harald', 'Sigurd', 'Vegard', 'Erlend', 'Sindre', 'Petter',
  'Kristoffer', 'Jakob', 'Nikolai', 'Oskar', 'William', 'Noah', 'Oliver', 'Filip',
  'Aksel', 'Theodor', 'Elias', 'Isak', 'Kasper', 'Even', 'Herman', 'Ludvig',
  'Victor', 'Benjamin', 'Liam', 'Lucas', 'Felix', 'Mikkel', 'Jonathan', 'Leon',
  'Simen', 'Vetle', 'Ola', 'Jens', 'Pål', 'Nils', 'Hans', 'Finn'
];

const femaleFirstNames = [
  'Anne', 'Kari', 'Ingrid', 'Liv', 'Marit', 'Kristin', 'Hilde', 'Silje',
  'Camilla', 'Nina', 'Hege', 'Mette', 'Lene', 'Tone', 'Berit', 'Ellen',
  'Maria', 'Ida', 'Nora', 'Emma', 'Sara', 'Thea', 'Julie', 'Emilie',
  'Sofie', 'Anna', 'Maja', 'Ella', 'Olivia', 'Leah', 'Amalie', 'Ingeborg',
  'Astrid', 'Solveig', 'Grete', 'Randi', 'Wenche', 'Britt', 'Inger', 'Turid',
  'Siri', 'Marte', 'Helene', 'Vilde', 'Frida', 'Aurora', 'Hedda', 'Martine',
  'Victoria', 'Mathilde', 'Andrea', 'Linnea', 'Tuva', 'Selma', 'Eline', 'Mia',
  'Tiril', 'Sigrid', 'Jenny', 'Karoline', 'Stine', 'Line', 'Marianne', 'Elisabeth',
  'Elise', 'Alma', 'Agnes', 'Ylva', 'Ada', 'Eva', 'Oda', 'Hanna',
  'Ane', 'Mari', 'Synne', 'Ragnhild', 'Guro', 'Tonje', 'Katrine', 'Linn'
];

const lastNames = [
  'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen',
  'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen', 'Hagen',
  'Johannessen', 'Andreassen', 'Jacobsen', 'Dahl', 'Jørgensen', 'Halvorsen', 'Henriksen', 'Lund',
  'Sørensen', 'Jakobsen', 'Moen', 'Gundersen', 'Iversen', 'Strand', 'Solberg', 'Svendsen',
  'Eide', 'Knutsen', 'Martinsen', 'Paulsen', 'Bakken', 'Kristoffersen', 'Mathisen', 'Lie',
  'Amundsen', 'Nguyen', 'Rasmussen', 'Ali', 'Lunde', 'Solheim', 'Berge', 'Moe',
  'Fredriksen', 'Holm', 'Knudsen', 'Sæther', 'Aas', 'Hauge', 'Christensen', 'Birkeland',
  'Gulbrandsen', 'Bakke', 'Løken', 'Ødegård', 'Ruud', 'Aasen', 'Bjerke', 'Nygård',
  'Torvik', 'Holmen', 'Hovland', 'Ellingsen', 'Nordseth', 'Sandvik', 'Berntsen', 'Simonsen',
  'Tangen', 'Wold', 'Teigen', 'Rønning', 'Vik', 'Fossum', 'Fjeld', 'Lien'
];

export const generateRandomName = (): string => {
  const isMale = Math.random() < 0.5;
  const firstNames = isMale ? maleFirstNames : femaleFirstNames;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

export const generateRandomNameWithGender = (): { name: string; gender: 'male' | 'female' } => {
  const isMale = Math.random() < 0.5;
  const firstNames = isMale ? maleFirstNames : femaleFirstNames;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    name: `${firstName} ${lastName}`,
    gender: isMale ? 'male' : 'female'
  };
};

export const generateRandomNames = (count: number): string[] => {
  const names: string[] = [];
  const usedNames = new Set<string>();

  while (names.length < count) {
    const name = generateRandomName();
    // Avoid duplicates (though unlikely with this many combinations)
    if (!usedNames.has(name)) {
      names.push(name);
      usedNames.add(name);
    }
  }

  return names;
};

export const generateRandomNamesWithGender = (count: number): { name: string; gender: 'male' | 'female' }[] => {
  const results: { name: string; gender: 'male' | 'female' }[] = [];
  const usedNames = new Set<string>();

  while (results.length < count) {
    const result = generateRandomNameWithGender();
    if (!usedNames.has(result.name)) {
      results.push(result);
      usedNames.add(result.name);
    }
  }

  return results;
};
