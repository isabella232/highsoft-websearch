/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as CLI from './index';
import * as L from '../index';


export class Application {

    /* *
     *
     *  Static Functions
     *
     * */

    private static error (message?: string, exitCode: number = 1): never {

        if (typeof message !== 'undefined') {

            let writeStream = process.stderr;

            if (!writeStream.writable) {
                writeStream = process.stdout;
            }

            writeStream.write(message);
            writeStream.write('\n');
        }

        return process.exit(exitCode);
    }

    public static main (): void {

        const argv = process.argv.map(CLI.Arguments.argumentMapper);

        if (argv.includes('--help') || argv.length === 0) {
            Application.success(CLI.HELP);
            return;
        }

        if (argv.includes('--version')) {
            Application.success(CLI.VERSION);
            return;
        }

        const url = L.URLUtilities.getURL(argv[argv.length-1]);

        if (typeof url === 'undefined') {
            Application.error('URL is invalid.');
            return;
        }

        let options = CLI.Options.getOptionsFromFile('highsoft-search.json');

        if (options === null) {
            Application.error('Options file "highsoft-search.json" is invalid.');
            return;
        }

        options = CLI.Options.getOptionsFromArguments(argv, options);

        if (options === null) {
            Application.error('Option arguments are invalid.');
            return;
        }

        const application = new Application(url, options);

        application.run();
    }

    private static success (message?: string): never {

        if (typeof message !== 'undefined') {

            const writeStream = process.stdout;

            writeStream.write(message);
            writeStream.write('\n');
        }

        return process.exit();
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (url: URL, options: CLI.Options) {
        this._options = options;
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _options: CLI.Options;
    private _url: URL;

    /* *
     *
     *  Functions
     *
     * */

    private run(): void {

        const options = this._options;
        const depth = options.depth;
        const timeout = options.timeout;

        CLI.Download
            .fromURL(this._url, depth, timeout)
            .then(download => download.getInspectors())
            .then(inspectors => console.log(inspectors));
    }

}

export default Application;