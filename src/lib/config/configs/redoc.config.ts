import { RedocOptions } from 'nestjs-redoc';

export const redocOptions: RedocOptions = {
  title: 'iPrep Documentation',
  logo: {
    backgroundColor: '#F0F0F0',
    altText: 'iPrep Logo',
  },
  sortPropsAlphabetically: true,
  hideDownloadButton: false,
  hideHostname: false,
  redocVersion: 'latest',
};
