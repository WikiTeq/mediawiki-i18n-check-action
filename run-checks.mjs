import * as fs from 'fs';
import grep from 'grep1';

if ( process.argv.length !== 3 ) {
    console.error( 'To be called with 1 argument - extension name' );
    process.exit( 1 );
}

const extName = process.argv[2];
const i18nPathBase = extName + '/i18n';

const checkKey = ( key ) => {
    return new Promise(
        ( resolve, reject ) => {
            const keyRegex = '(\\s|^|\'|\\")' + key + '(\s|$|,|\'|\\")';
            grep(
                [ '-r', '--exclude=*.json', '-E', keyRegex, extName + '/' ],
                ( err, stdout, stderr ) => {
                    if ( err !== null || !stdout.includes( key ) ) {
                        reject();
                    } else {
                        resolve();
                    }
                }
            );
        }
    );
};

const extractKnownKeys = ( extensionData ) => {
    // Some keys are used automatically based on extension.json:
    // - the action-* and right-* messages for any permissions declared in
    //   `AvailableRights`
    // - the message declared in `descriptionmsg`
    const extensionJSON = JSON.parse( extensionData );
    const knownKeys = [];

    if ( extensionJSON.descriptionmsg !== undefined ) {
        knownKeys.push( extensionJSON.descriptionmsg );
    }
    if ( extensionJSON.namemsg !== undefined ) {
        knownKeys.push( extensionJSON.namemsg );
    }
    if ( extensionJSON.AvailableRights !== undefined ) {
        extensionJSON.AvailableRights.forEach(
            ( right ) => {
                knownKeys.push( 'action-' + right );
                knownKeys.push( 'right-' + right );
            }
        );
    }
    return knownKeys;
};
const getI18nKeys = ( i18nData ) => {
    const i18nJSON = JSON.parse( i18nData );
    delete i18nJSON['@metadata'];
    return Object.keys( i18nJSON );
};

const runWithData = ( knownKeys, i18nData ) => {
    const keys = getI18nKeys( i18nData );
    // console.log( keys );
    const unfoundKeys = [];
    const keyPromises = keys.map(
        ( k ) => { return new Promise( ( resolve ) => {
            if ( knownKeys.includes( k ) ) {
                // No need to `grep` for a key that gets used via extension.json
                resolve();
                return;
            }
            checkKey( k ).then(
                resolve,
                () => {
                    unfoundKeys.push( k );
                    resolve();
                }
            )
        } ); }
    );

    const undefinedKeys = knownKeys.filter( ( k ) => !keys.includes( k ) );
    let hasError = false;
    if ( undefinedKeys.length ) {
        console.log( 'The following keys used by extension.json are undefined:' );
        console.log( undefinedKeys );
        hasError = true;
    }
    Promise.allSettled( keyPromises ).then( () => {
        if ( unfoundKeys.length !== 0 ) {
            console.log( 'Could not find uses of the following keys:' );
            console.log( unfoundKeys );
            hasError = true;
        } else {
            console.log( 'All keys found successfully!' );
        }
        process.exit( hasError ? 1 : 0 );
    } );
};

console.log( 'Starting i18n key check for: ' + extName );
fs.readFile(
    extName + '/extension.json',
    'utf8',
    ( err, extData ) => {
        if ( err ) {
            console.error( err );
            process.exit( 1 );
        }
        fs.readFile(
            i18nPathBase + '/en.json',
            'utf8',
            ( err2, i18nData ) => {
                if ( err2 ) {
                    console.error( err2 );
                    process.exit( 1 );
                }
                runWithData( extractKnownKeys( extData ), i18nData );
            }
        )
    }
);
