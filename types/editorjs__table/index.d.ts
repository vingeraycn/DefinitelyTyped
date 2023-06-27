// Type definitions for @editorjs/table 2.6
// Project: https://github.com/editor-js/table#readme (Does not have to be to GitHub, but prefer linking to a source code repository rather than to a project website.)
// Definitions by: vingeraycn <https://github.com/vingeraycn>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 3.6

interface TableData {
    //Uses the first line as headings
    withHeadings: boolean;

    //two-dimensional array with table contents
    content: string[][];
}

interface TableConfig {
    /**
     * initial number of rows. 2 by default
     */
    rows?: number;

    /**
     * initial number of columns. 2 by default
     */
    cols?: number;

    /**
     * toggle table headings. false by default
     */
    withHeadings?: boolean;
}

declare class Table {
    constructor(config?: { data: TableData; config: TableConfig; api: object; readOnly: boolean });

    normalizeData(data: TableData): TableData;

    setLevel(level: number): void;

    merge(data: TableData): void;

    validate(blockData: TableData): boolean;

    save(toolsContent: HTMLElement): TableData;

    static get conversionConfig(): { export: string; import: string };

    static get sanitize(): { level: boolean; text: object };

    static get isReadOnlySupported(): boolean;

    get data(): TableData;

    set data(data: TableData);

    getTag(): HTMLElement;

    get currentLevel(): Level;

    get defaultLevel(): Level;

    get levels(): Level[];

    static get toolbox(): {
        icon: string;
        title: string;
    };

    /**
     * Notify core that read-only mode is supported
     *
     * @returns {boolean}
     */
    static get isReadOnlySupported() {
        return true;
    }

    /**
     * Allow to press Enter inside the CodeTool textarea
     *
     * @returns {boolean}
     * @public
     */
    static get enableLineBreaks() {
        return true;
    }

    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {TableData} data — previously saved data
     * @param {TableConfig} config - user config for Tool
     * @param {object} api - Editor.js API
     * @param {boolean} readOnly - read-only mode flag
     */
    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.config = config;
        this.data = {
            withHeadings: this.getConfig('withHeadings', false, data),
            content: data && data.content ? data.content : [],
        };
        this.table = null;
    }

    /**
     * Get Tool toolbox settings
     * icon - Tool icon's SVG
     * title - title to show in toolbox
     *
     * @returns {{icon: string, title: string}}
     */
    static get toolbox() {
        return {
            icon: IconTable,
            title: 'Table',
        };
    }

    /**
     * Return Tool's view
     *
     * @returns {HTMLDivElement}
     */
    render() {
        /** creating table */
        this.table = new Table(this.readOnly, this.api, this.data, this.config);

        /** creating container around table */
        this.container = $.make('div', this.api.styles.block);
        this.container.appendChild(this.table.getWrapper());

        this.table.setHeadingsSetting(this.data.withHeadings);

        return this.container;
    }

    /**
     * Returns plugin settings
     *
     * @returns {Array}
     */
    renderSettings() {
        return [
            {
                label: this.api.i18n.t('With headings'),
                icon: IconTableWithHeadings,
                isActive: this.data.withHeadings,
                closeOnActivate: true,
                toggle: true,
                onActivate: () => {
                    this.data.withHeadings = true;
                    this.table.setHeadingsSetting(this.data.withHeadings);
                },
            },
            {
                label: this.api.i18n.t('Without headings'),
                icon: IconTableWithoutHeadings,
                isActive: !this.data.withHeadings,
                closeOnActivate: true,
                toggle: true,
                onActivate: () => {
                    this.data.withHeadings = false;
                    this.table.setHeadingsSetting(this.data.withHeadings);
                },
            },
        ];
    }
    /**
     * Extract table data from the view
     *
     * @returns {TableData} - saved data
     */
    save() {
        const tableContent = this.table.getData();

        const result = {
            withHeadings: this.data.withHeadings,
            content: tableContent,
        };

        return result;
    }

    /**
     * Plugin destroyer
     *
     * @returns {void}
     */
    destroy() {
        this.table.destroy();
    }

    /**
     * A helper to get config value.
     *
     * @param {string} configName - the key to get from the config.
     * @param {any} defaultValue - default value if config doesn't have passed key
     * @param {object} savedData - previously saved data. If passed, the key will be got from there, otherwise from the config
     * @returns {any} - config value.
     */
    getConfig(configName, defaultValue = undefined, savedData = undefined) {
        const data = this.data || savedData;

        if (data) {
            return data[configName] ? data[configName] : defaultValue;
        }

        return this.config && this.config[configName] ? this.config[configName] : defaultValue;
    }

    /**
     * Table onPaste configuration
     *
     * @public
     */
    static get pasteConfig() {
        return { tags: ['TABLE', 'TR', 'TH', 'TD'] };
    }

    /**
     * On paste callback that is fired from Editor
     *
     * @param {PasteEvent} event - event with pasted data
     */
    onPaste(event: PasteEvent): void;
}

export default Table;
