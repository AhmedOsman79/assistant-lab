import { convertFromDirectory } from 'joi-to-typescript';

async function types(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Running joi-to-typescript...');

  // Configure your settings here
  const result = await convertFromDirectory({
    // The directory to search for Joi schema files in any file ending in .schema.ts
    rootDirectoryOnly: false,
    schemaDirectory: 'dist',
    inputFileFilter: /\.schema\.js$/i,
    flattenTree: true,
    defaultInterfaceSuffix: "DTO",
    typeOutputDirectory: 'src/interfaces',
    debug: true,
  });

  if (result) {
    // eslint-disable-next-line no-console
    console.log('Completed joi-to-typescript');
  } else {
    // eslint-disable-next-line no-console
    console.log('Failed to run joi-to-typescrip');
  }
}

types();
