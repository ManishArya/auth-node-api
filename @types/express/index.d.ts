declare namespace Express {
  interface Request extends Awilix {
    currentUserId: string;
    translate: (phraseOrOptions: string | i18n.TranslateOptions, ...replace: string[]) => string;
    translate: (phraseOrOptions: string | i18n.TranslateOptions, replacements: i18n.Replacements) => string;
    translateFormatter: (phraseOrOptions: string | i18n.TranslateOptions, ...replace: string[]) => string;
    translateFormatter: (phraseOrOptions: string | i18n.TranslateOptions, replacements: i18n.Replacements) => string;
  }
  interface Awilix {
    scope: import('awilix').AwilixContainer;
  }
}
