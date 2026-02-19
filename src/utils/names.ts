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

const maleFirstNamesEn = [
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas',
  'Henry', 'Theodore', 'Jack', 'Levi', 'Alexander', 'Jackson', 'Mateo', 'Daniel',
  'Michael', 'Mason', 'Sebastian', 'Ethan', 'Logan', 'Owen', 'Samuel', 'Jacob',
  'Asher', 'Aiden', 'John', 'Joseph', 'Wyatt', 'David', 'Leo', 'Luke',
  'Julian', 'Hudson', 'Grayson', 'Matthew', 'Ezra', 'Gabriel', 'Carter', 'Isaac',
  'Jayden', 'Luca', 'Anthony', 'Dylan', 'Lincoln', 'Thomas', 'Maverick', 'Elias'
];

const femaleFirstNamesEn = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia',
  'Evelyn', 'Luna', 'Harper', 'Camila', 'Sofia', 'Scarlett', 'Elizabeth', 'Eleanor',
  'Emily', 'Chloe', 'Mila', 'Violet', 'Penelope', 'Gianna', 'Aria', 'Abigail',
  'Ella', 'Avery', 'Hazel', 'Nora', 'Lily', 'Zoe', 'Riley', 'Grace',
  'Hannah', 'Layla', 'Lillian', 'Addison', 'Aubrey', 'Ellie', 'Stella', 'Natalie',
  'Leah', 'Savannah', 'Brooklyn', 'Audrey', 'Lucy', 'Bella', 'Aurora', 'Claire'
];

const lastNamesEn = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
];

type FirstNameInfo = {
  count: number;
  firstIndex: number;
  firstInitial: string;
};

const buildInitialName = (firstName: string, initial: string) => `${firstName} ${initial}.`;

const getUniqueInitialName = (
  firstName: string,
  usedNames: Set<string>,
  preferredInitial?: string,
  avoidName?: string
): string => {
  if (preferredInitial) {
    const preferredName = buildInitialName(firstName, preferredInitial);
    if (!usedNames.has(preferredName) && preferredName !== avoidName) {
      return preferredName;
    }
  }

  while (true) {
    const lastName = lastNamesEn[Math.floor(Math.random() * lastNamesEn.length)];
    const initial = lastName.charAt(0).toUpperCase();
    const displayName = buildInitialName(firstName, initial);
    if (!usedNames.has(displayName) && displayName !== avoidName) {
      return displayName;
    }
  }
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

export const generateRandomNamesWithGender = (
  count: number,
  language: 'no' | 'en' = 'no'
): { name: string; gender: 'male' | 'female' }[] => {
  const results: { name: string; gender: 'male' | 'female' }[] = [];
  const usedNames = new Set<string>();

  if (language === 'en') {
    const firstNameInfo = new Map<string, FirstNameInfo>();

    while (results.length < count) {
      const isMale = Math.random() < 0.5;
      const firstNames = isMale ? maleFirstNamesEn : femaleFirstNamesEn;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNamesEn[Math.floor(Math.random() * lastNamesEn.length)];
      const initial = lastName.charAt(0).toUpperCase();
      const info = firstNameInfo.get(firstName);

      if (!info) {
        const displayName = firstName;
        if (usedNames.has(displayName)) {
          continue;
        }

        results.push({ name: displayName, gender: isMale ? 'male' : 'female' });
        usedNames.add(displayName);
        firstNameInfo.set(firstName, {
          count: 1,
          firstIndex: results.length - 1,
          firstInitial: initial
        });
        continue;
      }

      if (info.count === 1) {
        const previousName = results[info.firstIndex].name;
        usedNames.delete(previousName);

        const updatedPreviousName = getUniqueInitialName(
          firstName,
          usedNames,
          info.firstInitial
        );
        results[info.firstIndex].name = updatedPreviousName;
        usedNames.add(updatedPreviousName);

        const currentName = getUniqueInitialName(
          firstName,
          usedNames,
          initial,
          updatedPreviousName
        );
        results.push({ name: currentName, gender: isMale ? 'male' : 'female' });
        usedNames.add(currentName);
        firstNameInfo.set(firstName, {
          ...info,
          count: 2
        });
        continue;
      }

      const currentName = getUniqueInitialName(firstName, usedNames, initial);
      results.push({ name: currentName, gender: isMale ? 'male' : 'female' });
      usedNames.add(currentName);
      firstNameInfo.set(firstName, {
        ...info,
        count: info.count + 1
      });

      continue;
    }

    return results;
  }

  while (results.length < count) {
    const result = generateRandomNameWithGender();
    if (!usedNames.has(result.name)) {
      results.push(result);
      usedNames.add(result.name);
    }
  }

  return results;
};
